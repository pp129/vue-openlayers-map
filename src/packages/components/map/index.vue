<template>
  <div :id="mapId" :style="{ width: mapWidth, height: mapHeight }">
    <a :id="'download-' + mapId" :download="downloadName"></a>
    <slot v-if="load"></slot>
  </div>
</template>

<script>
import { nanoid } from "nanoid";
import * as VOlMap from "@/utils/index.js";
import { getCenter, boundingExtent } from "ol/extent";
import * as olEasing from "ol/easing";
import { throttle } from "@/packages/utils/performance";
import EventManager from "@/packages/utils/eventManager";

export default {
  name: "v-map",
  provide() {
    return {
      VMap: this,
    };
  },
  props: {
    /** 地图容器宽度 */
    width: {
      type: [String, Number],
      default: "100%",
    },
    /** 地图容器高度 */
    height: {
      type: [String, Number],
      default: "100%",
    },
    /** 地图容器ID */
    target: {
      type: String,
      default: "",
    },
    /** 视窗属性 */
    view: {
      type: Object,
      default: undefined,
    },
    /** 控制属性 */
    controls: {
      type: Object,
      default: undefined,
    },
    /** 交互属性 */
    interactions: {
      type: Object,
      default: undefined,
    },
    /** 是否启用性能监控 (开发环境) */
    enablePerformanceMonitor: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mapId: "",
      vMap: null,
      load: false,
      downloadName: "map.png",
      // 事件管理器
      eventManager: null,
      // 节流函数
      throttledPointerMove: null,
      // zoom 变化标志,防止重复触发
      _isZoomChanging: false,
      // moveend 处理器引用
      moveEndHandler: null,
    };
  },
  computed: {
    mapOption() {
      return {
        view: this.view,
        controls: this.controls,
        interactions: this.interactions,
      };
    },
    map() {
      return this.vMap;
    },
    mapWidth() {
      return typeof this.width === "string" ? this.width : this.width.toString() + "px";
    },
    mapHeight() {
      return typeof this.height === "string" ? this.height : this.height.toString() + "px";
    },
  },
  watch: {
    "view.center": {
      handler(value) {
        if (value && this.map) {
          this.setCenter(value);
        }
      },
      immediate: false,
      deep: true,
    },
    "view.zoom": {
      handler(value) {
        if (value && this.map) {
          this.setZoom(value);
        }
      },
      immediate: false,
    },
    "view.constrainRotation": {
      handler(value) {
        if (value && this.map) {
          this.setConstrainResolution(value);
        }
      },
      immediate: false,
    },
    "view.maxZoom": {
      handler(value) {
        if (value && this.map) {
          this.setMaxZoom(value);
        }
      },
      immediate: false,
    },
    "view.minZoom": {
      handler(value) {
        if (value && this.map) {
          this.setMinZoom(value);
        }
      },
      immediate: false,
    },
  },
  created() {
    this.mapId = this.target || nanoid();
    // 初始化事件管理器
    this.eventManager = new EventManager();
  },
  mounted() {
    this.initMap();
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    async initMap() {
      try {
        const res = await this.init();
        if (res !== "failed" && res.map) {
          this.vMap = res.map;

          // 开发环境日志
          if (process.env.NODE_ENV === "development") {
            console.log("[v-map-optimized] Map loaded successfully");
          }

          // 绑定事件
          this.bindMapEvents();

          /**
           * Triggers when the map loaded
           * @property {object} map - Map Object
           */
          this.$emit("load", this.map);
          this.load = true;
        }
      } catch (error) {
        console.error("[v-map-optimized] Failed to initialize map:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 绑定地图事件
     * 优化: 使用事件管理器统一管理,避免泄漏
     */
    bindMapEvents() {
      // 标准事件列表
      const events = [
        "singleclick",
        "click",
        "dblclick",
        "pointerdrag",
        "contextmenu",
        "precompose",
        "postrender",
        "loadend",
        "loadstart",
        "moveend",
        "movestart",
      ];

      // 绑定标准事件
      events.forEach((event) => {
        const listener = this.map.on(event, (evt) => {
          this.$emit(event, evt, this.map);
        });
        this.eventManager.add(listener, `event-${event}`);
      });

      // 绑定 zoom 变化监听
      const resolutionListener = this.map.getView().once("change:resolution", () => {
        const moveendListener = this.map.once("moveend", (evt) => {
          this.zoomEnd(evt);
        });
        this.eventManager.add(moveendListener, "zoom-moveend");
      });
      this.eventManager.add(resolutionListener, "resolution-change");

      // 绑定优化后的 pointermove 事件
      this.bindPointerMoveEvent();
    },

    /**
     * 绑定优化后的 pointermove 事件
     * 优化:
     * 1. 使用节流减少触发频率 (50ms)
     * 2. 只检查可见图层
     * 3. 添加 hitTolerance 提高精度
     */
    bindPointerMoveEvent() {
      // 创建节流函数
      this.throttledPointerMove = throttle(50, (evt) => {
        const pixel = this.map.getEventPixel(evt.originalEvent);

        // 检测是否命中要素 (添加5像素容差)
        const hit = this.map.hasFeatureAtPixel(pixel, {
          hitTolerance: 5,
        });

        let cursorStyle = hit ? "pointer" : "";

        // 只检查可见的 graphic 和 wms 图层
        const visibleSpecialLayers = this.map
          .getLayers()
          .getArray()
          .filter(
            (layer) =>
              layer.getVisible() &&
              (layer.get("type") === "graphic" || layer.get("type") === "wms") &&
              typeof layer.getData === "function"
          );

        // 检查特殊图层
        for (const layer of visibleSpecialLayers) {
          try {
            const data = layer.getData(pixel);
            const hitImage = data && data[3] > 0; // 透明像素的 data[3] 为 0
            if (hitImage) {
              cursorStyle = "pointer";
              break; // 找到一个命中就可以停止
            }
          } catch (error) {
            // 忽略 getData 错误
            if (process.env.NODE_ENV === "development") {
              console.warn("[v-map-optimized] Failed to get layer data:", error);
            }
          }
        }

        // 设置光标样式
        const targetElement = this.map.getTargetElement();
        if (targetElement) {
          targetElement.style.cursor = cursorStyle;
        }

        /**
         * Triggers when the mouse pointermove
         * @property {object} evt - The event
         * @property {object} map - Map Object
         */
        this.$emit("pointermove", evt, this.map);
      });

      // 绑定节流后的事件
      const pointerMoveListener = this.map.on("pointermove", this.throttledPointerMove);
      this.eventManager.add(pointerMoveListener, "pointermove");
    },

    init() {
      return new Promise((resolve, reject) => {
        try {
          const map = new VOlMap.OlMap({
            ...this.mapOption,
            target: this.mapId,
          });

          if (map.map) {
            resolve(map);
          } else {
            reject(new Error("Map initialization failed"));
          }
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * 优化后的 dispose 方法
     * 优化: 完善清理逻辑,避免内存泄漏
     */
    dispose() {
      if (!this.map) return;

      // 清理事件管理器
      if (this.eventManager) {
        this.eventManager.dispose();
        this.eventManager = null;
      }

      // 清理节流函数
      this.throttledPointerMove = null;
      this.moveEndHandler = null;

      // 清理图层
      const layers = [...this.map.getLayers().getArray()];
      layers.forEach((layer) => {
        if (layer) {
          const layerTitle = layer.get("users");
          if (layerTitle) {
            const source = layer.getSource();
            if (source) {
              if (typeof source.clear === "function") {
                source.clear();
              }
              if (typeof source.dispose === "function") {
                source.dispose();
              }
            }

            const renderer = layer.getRenderer();
            if (renderer && typeof renderer.dispose === "function") {
              renderer.dispose();
            }

            layer.setSource(undefined);
            this.map.removeLayer(layer);
          }
        }
      });

      // 清理地图对象
      if (typeof this.map.disposeInternal === "function") {
        this.map.disposeInternal();
      }

      this.vMap = null;
      this.load = false;
    },

    /**
     * 优化后的 zoomEnd 方法
     * 优化: 避免递归创建新的监听器引用
     */
    zoomEnd(evt) {
      /**
       * Triggers when the mapview zoom changed
       * @property {object} evt - The Event
       * @property {object} map - Map Object
       */
      this.$emit("changeZoom", evt, this.map);

      // 防止重复触发
      if (this._isZoomChanging) return;
      this._isZoomChanging = true;

      setTimeout(() => {
        this._isZoomChanging = false;
      }, 100);

      // 使用固定的处理器引用避免创建新函数
      if (!this.moveEndHandler) {
        this.moveEndHandler = (evt) => {
          this.zoomEnd(evt);
        };
      }

      const listener = evt.map.once("moveend", this.moveEndHandler);
      // 将监听器添加到事件管理器
      if (this.eventManager) {
        this.eventManager.add(listener, "zoom-recursive-moveend");
      }
    },

    // ========== 地图操作方法 ==========

    setCenter(center) {
      VOlMap.setCenter(this.map, center);
    },

    setZoom(zoom) {
      VOlMap.setZoom(this.map, zoom);
    },

    setConstrainResolution(enabled) {
      VOlMap.setConstrainResolution(this.map, enabled);
    },

    setMaxZoom(zoom) {
      VOlMap.setMaxZoom(this.map, zoom);
    },

    setMinZoom(zoom) {
      VOlMap.setMinZoom(this.map, zoom);
    },

    setControl(controls, options) {
      VOlMap.setControl(this.map, controls, options);
    },

    writeFeaturesObject(features) {
      return VOlMap.writeFeaturesObject(features);
    },

    writeFeatureObject(feature) {
      return VOlMap.writeFeatureObject(feature);
    },

    panTo(param) {
      VOlMap.panTo(this.map, param);
    },

    flyTo(param) {
      VOlMap.flyTo(this.map, param);
    },

    fit(geometryOrExtent, options = {}) {
      let easing = olEasing.inAndOut;
      if (Object.prototype.hasOwnProperty.call(options, "easing")) {
        if (olEasing[options.easing] && typeof olEasing[options.easing] === "function") {
          easing = olEasing[options.easing];
        }
      }
      this.map.getView().fit(geometryOrExtent, { ...options, easing });
    },

    getCenterByExtent(extent) {
      return getCenter(extent);
    },

    boundingExtent(coordinates) {
      return boundingExtent(coordinates);
    },

    calculateCenter(geometry) {
      return VOlMap.calculateCenter(geometry);
    },

    exportPNG(downloadName) {
      if (downloadName) {
        if (downloadName.indexOf(".png") > -1) {
          this.downloadName = downloadName;
        } else {
          this.downloadName = downloadName + ".png";
        }
      } else {
        this.downloadName = `map-export-${this.mapId}.png`;
      }
      VOlMap.exportPNG(this.map, `download-${this.mapId}`);
    },

    getDistancePoint(from, to, units) {
      return VOlMap.getDistancePoint(from, to, units);
    },

    closeOverlays() {
      this.map.getOverlays().forEach((overlay) => {
        overlay.setPosition(undefined);
        const onClose = overlay.get("close");
        if (onClose) onClose();
      });
    },

    updateFeature(feature, type, param) {
      if (type === "style") {
        feature.setStyle(VOlMap.setStyle(param));
      }
    },
  },
};
</script>

<style scoped></style>
