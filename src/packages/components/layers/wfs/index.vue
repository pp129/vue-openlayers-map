<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { WFS, GeoJSON } from "ol/format";
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";
import { unByKey } from "ol/Observable";

/**
 * 优化的 WFS 服务图层组件
 *
 * 优化内容:
 * 1. 继承 BaseLayer，使用统一的资源管理
 * 2. 使用 EventManager 统一事件管理
 * 3. 完善的 dispose 清理逻辑
 * 4. 支持更多 WFS 配置选项
 * 5. 增强的错误处理
 */
export default {
  name: "v-wfs",
  render() {
    return null;
  },
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
    /**
     * WFS 请求配置
     * @property {string} featureNS - 服务命名空间 (必填)
     * @property {string} featurePrefix - 要素前缀
     * @property {string[]} featureTypes - 要素类型
     * @property {string} srsName - 空间参考系统
     * @property {Object} filter - WFS 过滤条件
     * @property {number} maxFeatures - 最大要素数
     * @property {string} geometryName - 几何字段名
     * @property {string} propertyNames - 属性名列表
     */
    options: {
      type: Object,
      required: true,
      validator(value) {
        return value && value.featureNS;
      },
    },
    /**
     * 图层样式配置
     */
    layerStyle: {
      type: [Object, Function],
      default: () => ({}),
    },
    /**
     * 是否自动加载要素
     */
    autoLoad: {
      type: Boolean,
      default: true,
    },
    /**
     * 请求超时时间(ms)
     */
    timeout: {
      type: Number,
      default: 30000,
    },
    /**
     * 启用的事件类型
     */
    enabledEvents: {
      type: Array,
      default: () => ["singleclick", "pointermove"],
    },
  },
  data() {
    return {
      vectorSource: null,
      eventListeners: [],
      loading: false,
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
  methods: {
    /**
     * 初始化 WFS 图层
     */
    async init() {
      this.vectorSource = new VectorSource();
      this.createLayer();
      this.bindEvents();

      if (this.autoLoad) {
        await this.loadFeatures();
      }

      this.$emit("load", this.layer, this.map);
    },

    /**
     * 创建矢量图层
     */
    createLayer() {
      const layerOptions = {
        source: this.vectorSource,
        style: this.getStyleFunction(),
        opacity: this.opacity,
        visible: this.visible,
        extent: this.extent,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
      };

      this.layer = new VectorLayer(layerOptions);

      const layerId = this.layerId || `wfs-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "wfs");
      this.layer.set("users", true);

      if (this.zIndex !== undefined) {
        this.layer.setZIndex(this.zIndex);
      }

      // 添加到地图或图层组
      this.addToMap();
    },

    /**
     * 添加到地图或图层组
     */
    addToMap() {
      if (this.groupLayer) {
        this.groupLayer.getLayers().push(this.layer);
      } else {
        this.map.addLayer(this.layer);
      }
    },

    /**
     * 获取样式函数
     */
    getStyleFunction() {
      if (typeof this.layerStyle === "function") {
        return this.layerStyle;
      }

      return (feature) => this.createFeatureStyle(feature, this.layerStyle);
    },

    /**
     * 创建要素样式
     */
    createFeatureStyle(feature, styleConfig) {
      if (!styleConfig || Object.keys(styleConfig).length === 0) {
        return this.getDefaultStyle();
      }

      const style = new Style();

      // 填充
      if (styleConfig.fill) {
        style.setFill(
          new Fill({
            color: styleConfig.fill.color || "rgba(255,255,255,0.4)",
          })
        );
      }

      // 边框
      if (styleConfig.stroke) {
        style.setStroke(
          new Stroke({
            color: styleConfig.stroke.color || "#3399CC",
            width: styleConfig.stroke.width || 1.25,
            lineDash: styleConfig.stroke.lineDash,
          })
        );
      }

      // 点样式
      if (styleConfig.circle) {
        style.setImage(
          new CircleStyle({
            radius: styleConfig.circle.radius || 5,
            fill: styleConfig.circle.fill ? new Fill(styleConfig.circle.fill) : undefined,
            stroke: styleConfig.circle.stroke ? new Stroke(styleConfig.circle.stroke) : undefined,
          })
        );
      }

      // 文本
      if (styleConfig.text) {
        const textConfig = styleConfig.text;
        let textValue = textConfig.text || "";

        // 支持从要素属性获取文本
        if (textConfig.property && feature) {
          textValue = feature.get(textConfig.property) || textValue;
        }

        style.setText(
          new Text({
            text: String(textValue),
            font: textConfig.font || "14px sans-serif",
            fill: textConfig.fill ? new Fill(textConfig.fill) : new Fill({ color: "#000" }),
            stroke: textConfig.stroke ? new Stroke(textConfig.stroke) : undefined,
            offsetX: textConfig.offsetX || 0,
            offsetY: textConfig.offsetY || 0,
          })
        );
      }

      return style;
    },

    /**
     * 获取默认样式
     */
    getDefaultStyle() {
      return new Style({
        fill: new Fill({ color: "rgba(255,255,255,0.4)" }),
        stroke: new Stroke({ color: "#3399CC", width: 1.25 }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: "#3399CC" }),
        }),
      });
    },

    /**
     * 加载 WFS 要素
     */
    async loadFeatures() {
      if (!this.options.featureNS) {
        console.error("[v-wfs] featureNS is required");
        this.$emit("error", new Error("featureNS is required"));
        return;
      }

      this.loading = true;
      this.$emit("loading", true);

      try {
        // 构建 WFS GetFeature 请求
        const featureRequest = new WFS().writeGetFeature({
          ...this.options,
          outputFormat: "application/json",
        });

        // 创建 AbortController 用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(this.options.featureNS, {
          method: "POST",
          body: new XMLSerializer().serializeToString(featureRequest),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const features = new GeoJSON().readFeatures(json);

        this.vectorSource.clear();
        this.vectorSource.addFeatures(features);

        this.$emit("features-loaded", features);
      } catch (error) {
        if (error.name === "AbortError") {
          console.error("[v-wfs] Request timeout");
        } else {
          console.error("[v-wfs] Failed to load features:", error);
        }
        this.$emit("error", error);
      } finally {
        this.loading = false;
        this.$emit("loading", false);
      }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
      this.enabledEvents.forEach((eventType) => {
        const listener = this.map.on(eventType, (evt) => {
          this.handleMapEvent(eventType, evt);
        });
        this.eventListeners.push(listener);
      });
    },

    /**
     * 处理地图事件
     */
    handleMapEvent(eventType, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);
      this.$emit(eventType, evt, feature);
    },

    /**
     * 根据像素获取要素
     */
    getFeatureAtPixel(pixel) {
      const layerId = this.layer?.get("id");
      return this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer?.get("id") === layerId) {
          return feature;
        }
      });
    },

    /**
     * 清除所有要素
     */
    clearFeatures() {
      this.vectorSource?.clear();
    },

    /**
     * 手动添加要素
     */
    addFeatures(features) {
      this.vectorSource?.addFeatures(features);
    },

    /**
     * 获取所有要素
     */
    getFeatures() {
      return this.vectorSource?.getFeatures() || [];
    },

    /**
     * 获取数据源
     */
    getSource() {
      return this.vectorSource;
    },

    /**
     * 重新加载
     */
    async reload() {
      await this.loadFeatures();
    },

    /**
     * 缩放到图层范围
     */
    fitToExtent(options = {}) {
      const extent = this.vectorSource?.getExtent();
      if (extent && !extent.every((v) => !isFinite(v))) {
        this.map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 500,
          ...options,
        });
      }
    },

    /**
     * 优化的 dispose 方法
     */
    dispose() {
      if (!this.layer || !this.map) return;

      // 移除事件监听
      this.eventListeners.forEach((listener) => {
        unByKey(listener);
      });
      this.eventListeners = [];

      // 从地图或图层组移除
      if (this.groupLayer) {
        this.groupLayer.getLayers().remove(this.layer);
      } else {
        this.map.removeLayer(this.layer);
      }

      // 清除数据源
      this.vectorSource?.clear();
      this.vectorSource = null;

      // 释放图层资源
      if (this.layer.dispose) {
        this.layer.dispose();
      }

      // 调用基类清理
      this.baseDispose();
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>

<style scoped></style>
