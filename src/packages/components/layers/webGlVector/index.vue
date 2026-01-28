<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { createDefaultStyle } from "ol/style/flat";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";

export default {
  name: "v-webgl-vector",
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
    source: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Object,
      default: null,
    },
    layerStyle: {
      type: [Object, Array],
      default: () => createDefaultStyle(),
    },
    declutter: {
      type: [Boolean, Number, String],
      default: false,
    },
    updateWhileAnimating: {
      type: Boolean,
      default: false,
    },
    updateWhileInteracting: {
      type: Boolean,
      default: false,
    },
    disableHitDetection: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      vectorSource: null,
      eventList: ["singleclick", "pointermove", "dblclick"],
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
    data: {
      handler(newValue) {
        if (this.vectorSource) {
          this.updateData(newValue);
        }
      },
      deep: true,
    },
    layerStyle: {
      handler(newValue) {
        if (this.layer && newValue) {
          this.layer.setStyle(newValue);
        }
      },
      deep: true,
    },
  },
  methods: {
    /**
     * 初始化 WebGL 矢量图层
     */
    init() {
      try {
        this.vectorSource = new VectorSource({
          ...this.source,
        });

        // 加载初始数据
        if (this.data) {
          this.loadGeoJSONData(this.data);
        }

        this.layer = new WebGLVectorLayer({
          source: this.vectorSource,
          style: this.layerStyle,
          declutter: this.declutter,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          disableHitDetection: this.disableHitDetection,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
        });

        const layerId = this.layerId || `webglVector-layer-${nanoid()}`;
        this.layer.set("id", layerId);
        this.layer.set("type", "webglVector");
        this.layer.set("users", true);

        if (this.zIndex !== undefined) {
          this.layer.setZIndex(this.zIndex);
        }

        // 添加到地图或图层组
        this.addToMap();

        // 绑定事件
        this.bindEvents();

        /**
         * Triggers when WebGL vector layer is loaded
         * @property {WebGLVectorLayer} layer - WebGL vector layer instance
         * @property {Map} map - Map instance
         */
        this.$emit("load", this.layer, this.map);
      } catch (error) {
        console.error("[v-webgl-vector] Failed to initialize:", error);
        this.$emit("error", error);
      }
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
     * 绑定事件监听器
     * 优化: 使用 EventManager 统一管理
     */
    bindEvents() {
      this.eventList.forEach((eventName) => {
        const listener = this.map.on(eventName, (evt) => {
          this.eventHandler(eventName, evt);
        });
        // 使用 BaseLayer 的 addListener 方法自动管理
        this.addListener(listener, `map-${eventName}`);
      });
    },

    /**
     * 事件处理器
     */
    eventHandler(eventName, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);

      /**
       * Triggers map events with feature detection
       * @property {Event} evt - Original event
       * @property {Feature} feature - Feature at pixel (if any)
       */
      this.$emit(eventName, evt, feature);
    },

    /**
     * 获取指定像素位置的要素
     */
    getFeatureAtPixel(pixel) {
      return this.map.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          if (layer?.get("id") === this.layer?.get("id")) {
            return feature;
          }
        },
        {
          hitTolerance: 2,
        }
      );
    },

    /**
     * 加载 GeoJSON 数据
     */
    loadGeoJSONData(data) {
      if (!data) return;

      try {
        const features = new GeoJSON().readFeatures(data, {
          dataProjection: data.crs?.properties?.name || "EPSG:4326",
          featureProjection: this.map.getView().getProjection(),
        });
        this.vectorSource.addFeatures(features);
      } catch (error) {
        console.error("[v-webgl-vector] Failed to load GeoJSON:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 更新数据
     */
    updateData(newData) {
      this.vectorSource.clear();
      if (newData) {
        this.loadGeoJSONData(newData);
      }
    },

    /**
     * 添加要素
     */
    addFeatures(features) {
      if (this.vectorSource) {
        this.vectorSource.addFeatures(features);
      }
    },

    /**
     * 清空图层
     */
    clear() {
      if (this.vectorSource) {
        this.vectorSource.clear();
      }
    },

    /**
     * 获取所有要素
     */
    getFeatures() {
      return this.vectorSource ? this.vectorSource.getFeatures() : [];
    },

    /**
     * 获取数据源
     */
    getSource() {
      return this.vectorSource;
    },

    /**
     * 优化的 dispose 方法
     */
    dispose() {
      if (!this.layer || !this.map) return;

      // 清空数据源
      this.clear();

      // 从地图或图层组移除
      if (this.groupLayer) {
        this.groupLayer.getLayers().remove(this.layer);
      } else {
        this.map.removeLayer(this.layer);
      }

      // 调用基类清理 (会自动清理事件监听器)
      this.baseDispose();

      this.vectorSource = null;
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
