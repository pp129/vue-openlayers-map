<template>
  <div><slot></slot></div>
</template>

<script>
import BaseLayer from "@/packages/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import {
  addClusterLayer,
  addVectorSource,
  FeatureExt,
  formatArea,
  formatLength,
  setFeatures,
  setFeatureStyle,
  setStyle,
  validObjKey,
} from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";
import VectorLayer from "ol/layer/Vector";
import { Modify, Select } from "ol/interaction";
import Collection from "ol/Collection";
import { getVectorContext } from "ol/render";
import { easeOut } from "ol/easing";
import { Stroke, Style, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { asArray } from "ol/color";
import { Cluster } from "ol/source";
import { arrowLine } from "@/utils/arrowLine";
import { Point } from "ol/geom";
import Zoom from "ol-ext/featureanimation/Zoom";
import Gyeonghwon from "gyeonghwon";
import StyleCache from "@/packages/utils/styleCache";
import { shallowArrayEqual, rafThrottle } from "@/packages/utils/performance";

/**
 * 矢量图层组件 (优化版)
 *
 * 优化内容:
 * 1. 使用 StyleCache 管理样式缓存
 * 2. 使用 BaseLayer 的事件管理
 * 3. 完善 dispose 清理 Gyeonghwon 对象
 * 4. 优化 features watch 使用浅比较
 * 5. 清理定时器引用
 */
export default {
  name: "v-vector",
  extends: BaseLayer,
  inject: {
    VMap: {
      value: "VMap",
      default: null,
    },
    VGroupLayer: {
      value: "VGroupLayer",
      default: null,
    },
  },
  props: {
    layerId: {
      type: String,
      default: "",
    },
    source: {
      type: Object,
      default() {
        return { features: [] };
      },
    },
    features: {
      type: Array,
      default() {
        return [];
      },
    },
    layerStyle: {
      type: [Object, undefined],
      default: undefined,
    },
    FeatureStyle: {
      type: [Object, Boolean],
      default: false,
    },
    modify: {
      type: [Object, Boolean],
      default: false,
    },
    select: {
      type: [Object, Boolean],
      default: false,
    },
    cluster: {
      type: [Object, Boolean],
      default: false,
    },
    featureFlash: {
      type: Boolean,
      default: false,
    },
    flashTime: {
      type: Number,
      default: undefined,
    },
    overlay: {
      type: Object,
      default: undefined,
    },
    declutter: {
      type: [Boolean, Number, String],
      default: false,
    },
    updateWhileInteracting: {
      type: Boolean,
      default: false,
    },
    // 是否开启浅监听模式
    shallowWatch: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ani: null,
      layerOpt: {},
      selectObj: null,
      modifyObj: null,
      clusterObj: null,
      clusterDefault: {
        distance: 20,
        minDistance: 0,
      },
      // 使用 StyleCache 替代普通对象
      styleCache: null,
      gh: null, // Gyeonghwon 动画对象
      previousFeatures: [], // 用于浅比较
      lastHoveredId: null, // 记录上次 hover 的要素ID
      throttledEventHandlers: {}, // 节流后的事件处理器
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
    groupLayer() {
      return this.VGroupLayer?.layer;
    },
  },
  watch: {
    cluster: {
      handler(value) {
        if (value === null || value === false) {
          this.dispose();
          this.init(true);
        } else {
          if (this.clusterObj) {
            const { distance } = value;
            if (distance || distance === 0) this.clusterObj.setDistance(distance);
          } else {
            this.dispose();
            this.init(true);
          }
        }
      },
      immediate: false,
      deep: true,
    },
    features: {
      handler(value, oldValue) {
        // 优化: 使用浅比较避免不必要的更新
        if (this.shallowWatch && shallowArrayEqual(value, oldValue)) {
          return;
        }

        this.updateFeatures(value);
      },
      immediate: false,
      deep: true,
    },
    modify: {
      handler(value) {
        if (value) {
          this.setModify();
        } else {
          if (this.selectObj) {
            this.map.removeInteraction(this.selectObj);
            this.selectObj = null;
          }
          if (this.modifyObj) {
            this.map.removeInteraction(this.modifyObj);
            this.modifyObj = null;
          }
        }
      },
      immediate: false,
    },
  },
  created() {
    // 初始化样式缓存 (最多1000条)
    this.styleCache = new StyleCache(1000);
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    init(change) {
      const source = addVectorSource(this.source, this.map);

      if (this.features.length > 0) {
        source.clear();
        const features = setFeatures(this.features, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0);
        source.addFeatures(features);
      }

      // 聚合图层
      if (this.cluster) {
        let defaultOptions = {};
        if (typeof this.cluster === "boolean" && this.cluster) {
          defaultOptions = { ...defaultOptions, ...this.clusterDefault };
        } else {
          defaultOptions = this.cluster;
        }
        const clusterOption = { ...defaultOptions, source };
        this.clusterObj = new Cluster(clusterOption);
        this.layerOpt = {
          ...this.$props,
          source: this.clusterObj,
          style: clusterOption.style,
        };
        this.layer = addClusterLayer(this.layerOpt, this.map);
        this.layer.set("cluster", true);
        this.layer.set("overlay", this.overlay);
      } else {
        // 普通矢量图层
        if (this.layerStyle && Object.keys(this.layerStyle).length > 0) {
          this.layerOpt = {
            ...this.$props,
            source,
            style: (feature) => {
              return setFeatureStyle(feature, this.layerStyle, this.map);
            },
          };
          this.layer = new VectorLayer(this.layerOpt);
        } else {
          this.layerOpt = { ...this.$props, source };
          this.layer = new VectorLayer(this.layerOpt);
          this.layer.setStyle((feature) => {
            if (feature.get("style")) {
              return setFeatureStyle(feature, feature.get("style"), this.map);
            } else {
              if (this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0) {
                return setStyle(this.FeatureStyle);
              } else {
                return setStyle({
                  fill: { color: "rgba(67,126,255,0.15)" },
                  stroke: { color: "rgba(67,126,255,1)", width: 1 },
                });
              }
            }
          });
        }
      }

      const layerId = this.layerId || `vector-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "vector");
      this.layer.set("users", true);

      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }

      // 添加到地图
      let parentType = this.$parent.$options.name;
      if (this.$parent.$options.name === "v-gd-route") {
        parentType = this.$parent.$parent.$options.name;
      }

      addLayerToParentComp({
        type: parentType,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });

      // 处理箭头线
      this.features.forEach((feature) => {
        if (
          (feature.type === "polyline" || feature.type === "Polyline" || feature.type === "LineString") &&
          validObjKey(feature, "arrow")
        ) {
          arrowLine({
            coordinates: feature.coordinates,
            map: this.map,
            source,
            ...feature.arrow,
          });
        }
      });

      // 线加箭头 - 使用 BaseLayer 的事件管理
      const resolutionListener = this.map.getView().on("change:resolution", () => {
        const zoom = this.map.getView().getZoom();
        source.getFeatures().forEach((feature) => {
          if (feature.get("isArrow")) {
            this.layer.getSource().removeFeature(feature);
          }
        });
        if (Math.round(zoom) === zoom) {
          this.features.forEach((feature) => {
            if (feature.type === "polyline" && validObjKey(feature, "arrow")) {
              arrowLine({
                coordinates: feature.coordinates,
                map: this.map,
                source,
                ...feature.arrow,
              });
            }
          });
        }
      });
      this.addListener(resolutionListener, "resolution-change");

      // 闪光点动画
      if (this.featureFlash) {
        this.setFlashAnimate();
        if (this.flashTime) {
          const timer = setInterval(() => {
            this.setFlashAnimate();
          }, this.flashTime);
          this.addTimer(timer); // 使用 BaseLayer 的定时器管理
        }
      }

      this.$emit("load", this.layer, this.map);

      if (this.modify) {
        this.setModify();
      }

      if (change) {
        this.$emit("change", source.getFeatures());
      }

      // 绑定事件 - 使用 BaseLayer 的事件管理
      const eventList = ["singleclick", "pointermove", "dblclick"];
      eventList.forEach((listenerKey) => {
        // 为 pointermove 事件添加 RAF 节流
        const handler =
          listenerKey === "pointermove"
            ? rafThrottle((evt) => this.eventHandler(listenerKey, evt))
            : (evt) => this.eventHandler(listenerKey, evt);

        const listener = this.map.on(listenerKey, handler);
        this.addListener(listener, `event-${listenerKey}`);

        // 保存节流后的处理器以便清理
        if (listenerKey === "pointermove") {
          this.throttledEventHandlers[listenerKey] = handler;
        }
      });
    },

    /**
     * 更新要素 (优化后的方法)
     */
    async updateFeatures(value) {
      if (this.cluster) {
        this.clusterObj.getSource().clear();
        const features = setFeatures(value, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle)?.length > 0);
        this.clusterObj.getSource().addFeatures(features);
        this.$emit("change", features);
      } else {
        const source = this.layer.getSource();
        source.clear();
        const features = setFeatures(value, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle)?.length > 0);

        // 处理动画要素
        for (const feature of features) {
          const prop = feature.getProperties();
          if (feature.type === "polyline" && validObjKey(feature, "arrow")) {
            arrowLine({
              coordinates: feature.coordinates,
              map: this.map,
              source,
              ...feature.arrow,
            });
          } else if (feature.getGeometry().getType() === "Point" && prop.style?.icon) {
            if (prop.style.icon.animate !== undefined && prop.style.icon.animate) {
              const oldStyle = feature.getStyle();
              // 初始化 Gyeonghwon
              if (this.gh === null) {
                this.gh = new Gyeonghwon({
                  ignoreSingle: false,
                  forceLoop: false,
                  waitingMilliSec: 10000,
                });

                this.gh.addEventListener("need_render", () => {
                  this.map.render();
                  return false;
                });
              }
              const anim = await this.gh.animateNewContext(oldStyle.getImage().getSrc());
              oldStyle.setImage(
                new Icon({
                  anchor: [0.5, 1],
                  anchorXUnits: "fraction",
                  anchorYUnits: "fraction",
                  img: anim.latestContext().canvas,
                  imgSize: [anim.width, anim.height],
                })
              );
            }
          }
        }

        source.addFeatures(features);
        this.$emit("change", features);
      }

      if (this.modify) {
        this.setModify();
      }

      // 闪光点
      if (this.featureFlash) {
        this.setFlashAnimate();
      }
    },

    getFeatureAtPixel(pixel) {
      return this.map.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          if (layer?.get("id") === this.layer?.get("id")) return feature;
        },
        {}
      );
    },

    eventHandler(listenerKey, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);
      this.$emit(listenerKey, evt, feature);
    },

    setFlashAnimate() {
      if (this.cluster) {
        const features = this.clusterObj?.getFeatures() || [];
        if (features.length > 0) {
          features.forEach((cluster) => {
            const clusters = cluster.get("features");
            if (clusters.length === 1) {
              clusters.forEach((feature) => {
                if (feature.get("flash")) {
                  this.pulseFeature(feature);
                }
              });
            }
          });
        }
      } else {
        const source = this.layer.getSource();
        if (source) {
          source.getFeatures().forEach((feature) => {
            if (feature.get("flash")) {
              this.pulseFeature(feature);
            }
          });
        }
      }
    },

    /**
     * 优化后的 dispose 方法
     */
    dispose() {
      // 清理节流后的事件处理器
      Object.values(this.throttledEventHandlers).forEach((handler) => {
        if (handler && typeof handler.cancel === "function") {
          handler.cancel();
        }
      });
      this.throttledEventHandlers = {};

      // 清理 Gyeonghwon 动画对象
      if (this.gh) {
        if (typeof this.gh.removeAllEventListeners === "function") {
          this.gh.removeAllEventListeners();
        }
        if (typeof this.gh.dispose === "function") {
          this.gh.dispose();
        }
        this.gh = null;
      }

      // 清理聚合对象
      if (this.clusterObj) {
        this.clusterObj.getSource().clear();
        if (typeof this.clusterObj.dispose === "function") {
          this.clusterObj.dispose();
        }
        this.clusterObj = null;
      }

      // 清理交互对象
      if (this.selectObj) {
        this.map.removeInteraction(this.selectObj);
        this.selectObj = null;
      }
      if (this.modifyObj) {
        this.map.removeInteraction(this.modifyObj);
        this.modifyObj = null;
      }

      // 清理样式缓存
      if (this.styleCache) {
        this.styleCache.clear();
      }

      // 从地图移除图层
      if (this.layer && this.map) {
        this.map.removeLayer(this.layer);
      }

      // 调用基类清理 (清理事件监听器和定时器)
      this.baseDispose();
    },

    getFeatureById(id) {
      const features = this.layer.getSource().getFeatures();
      let target;
      features.forEach((feature) => {
        if (feature.get("id") === id || feature.getId() === id) {
          target = feature;
        }
      });
      return target;
    },

    updateFeatureById(featureId, update) {
      const features = this.layer.getSource().getFeatures();
      features.forEach((feature) => {
        if (feature.get("id") === featureId) {
          if (typeof update === "object") {
            for (const i in update) {
              if (Object.prototype.hasOwnProperty.call(update, i)) {
                feature.update(i, update[i]);
              }
            }
          }
        }
      });
    },

    getFeatures() {
      return this.layer.getSource().getFeatures();
    },

    setModify() {
      let features = [];
      if (this.select) {
        let selectStyle;
        if (validObjKey(this.select, "style")) {
          selectStyle = setStyle(this.select.style);
        }
        this.selectObj = new Select({
          style: selectStyle,
          layers: [this.layer],
        });
        this.map.addInteraction(this.selectObj);
        this.selectObj.on("select", (evt) => {
          this.$emit("select", evt, this.map);
        });
        features = this.selectObj.getFeatures();
      } else {
        features = new Collection(this.layer.getSource().getFeatures());
      }

      let modifyStyle;
      if (validObjKey(this.modify, "style")) {
        modifyStyle = setStyle(this.modify.style);
      }

      this.modifyObj = new Modify({
        features,
        style: modifyStyle,
      });
      this.map.addInteraction(this.modifyObj);

      this.modifyObj.on("modifystart", (evt) => {
        this.$emit("modifystart", evt, this.map);
        features.getArray().forEach((feature) => {
          feature.getGeometry().on("change", (evt) => {
            this.$emit("modifychange", evt, this.map, feature);
          });
        });
      });

      this.modifyObj.on("modifyend", (evt) => {
        const feature = evt.features.getArray()[0];
        const geometry = feature.getGeometry();
        const type = feature.get("type")?.toLowerCase();
        if (type === "linestring" || type === "polyline") {
          evt.measure = formatLength(geometry);
        } else if (type === "polygon") {
          evt.measure = formatArea(geometry);
        }
        const params = { ...evt, select: this.selectObj };
        this.$emit("modifyend", params, this.map);
      });
    },

    pulseFeature(feature) {
      const coordinates = feature.get("coordinates");
      const f = new FeatureExt(new Point(coordinates));
      const flash = feature.get("flash");
      const { radius, color, duration, width } = flash;
      f.setStyle(
        new Style({
          image: new CircleStyle({
            radius: radius || 30,
            stroke: new Stroke({ color, width }),
          }),
        })
      );
      this.layer.animateFeature(
        f,
        new Zoom({
          fade: easeOut,
          duration,
          easing: easeOut,
        })
      );
    },

    overlayClose() {
      if (this.overlay && typeof this.overlay.close === "function") {
        this.overlay.close();
      }
    },

    getClosestFeatureToCoordinate(coordinates, filter) {
      return this.layer.getSource().getClosestFeatureToCoordinate(coordinates, filter);
    },

    /**
     * 高性能样式更新方法
     * 直接修改 OpenLayers Feature 的样式，避免触发 Vue 响应式
     * @param {string} featureId - 要素ID
     * @param {Object} styleConfig - 样式配置对象
     */
    updateFeatureStyle(featureId, styleConfig) {
      const feature = this.getFeatureById(featureId);
      if (!feature) {
        console.warn(`Feature with id "${featureId}" not found`);
        return;
      }

      // 使用缓存键
      const cacheKey = `${featureId}-${JSON.stringify(styleConfig)}`;

      // 尝试从缓存获取样式
      let style = this.styleCache.get(cacheKey);

      if (!style) {
        // 缓存未命中，创建新样式
        style = setStyle(styleConfig);
        this.styleCache.set(cacheKey, style);
      }

      // 直接设置 Feature 样式，不触发 Vue 响应式
      feature.setStyle(style);
    },

    /**
     * 批量更新要素样式（性能更优）
     * @param {Array<{id: string, style: Object}>} updates - 更新配置数组
     */
    batchUpdateFeatureStyles(updates) {
      const features = this.layer.getSource().getFeatures();
      const featureMap = new Map();

      // 建立 ID 索引（只遍历一次）
      features.forEach((feature) => {
        const id = feature.get("id") || feature.getId();
        if (id) {
          featureMap.set(id, feature);
        }
      });

      // 批量更新
      updates.forEach(({ id, style }) => {
        const feature = featureMap.get(id);
        if (feature) {
          const cacheKey = `${id}-${JSON.stringify(style)}`;
          let styleObj = this.styleCache.get(cacheKey);

          if (!styleObj) {
            styleObj = setStyle(style);
            this.styleCache.set(cacheKey, styleObj);
          }

          feature.setStyle(styleObj);
        }
      });
    },

    /**
     * 重置要素样式为默认样式
     * @param {string} featureId - 要素ID
     */
    resetFeatureStyle(featureId) {
      const feature = this.getFeatureById(featureId);
      if (!feature) return;

      // 获取要素原始样式配置
      const originalStyle = feature.get("style");
      if (originalStyle) {
        this.updateFeatureStyle(featureId, originalStyle);
      } else {
        // 使用图层默认样式
        feature.setStyle(undefined);
      }
    },

    /**
     * 高性能 hover 效果（推荐用法）
     * @param {string|null} hoveredId - 当前 hover 的要素ID，null 表示无 hover
     * @param {Object} hoverStyle - hover 样式配置
     * @param {Object} normalStyle - 正常样式配置
     */
    setHoverEffect(hoveredId, hoverStyle, normalStyle) {
      const features = this.layer.getSource().getFeatures();

      features.forEach((feature) => {
        const id = feature.get("id") || feature.getId();
        if (!id) return;

        const isHovered = id === hoveredId;
        const styleConfig = isHovered ? hoverStyle : normalStyle;
        const cacheKey = `${id}-${isHovered ? "hover" : "normal"}`;

        let style = this.styleCache.get(cacheKey);
        if (!style) {
          style = setStyle(styleConfig);
          this.styleCache.set(cacheKey, style);
        }

        feature.setStyle(style);
      });
    },
  },
};
</script>

<style scoped></style>
