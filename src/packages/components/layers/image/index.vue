<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import Projection from "ol/proj/Projection";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import Static from "ol/source/ImageStatic";
// GeoImage 支持 (ol-ext)
import GeoImageLayer from "ol-ext/layer/GeoImage";
import GeoImageSource from "ol-ext/source/GeoImage";

/**
 * 优化的图片图层组件
 *
 * 优化内容:
 * 1. 继承 BaseLayer，使用统一的资源管理
 * 2. 支持多种图片数据源（Static、GeoImage、WMS）
 * 3. 完善的 dispose 清理逻辑
 * 4. 移除不必要的 console.log
 * 5. 优化数据源切换逻辑
 * 6. 支持 ol-ext 的 GeoImage 功能
 */
export default {
  name: "v-image",
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
    sourceType: {
      type: String,
      default: "Static",
      validator(value) {
        return ["Static", "GeoImage", "WMS"].map((item) => item.toLowerCase()).includes(value.toLowerCase());
      },
    },
    wms: {
      type: Object,
      default: () => ({}),
    },
    imageExtent: {
      type: Array,
      default: null,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imageSize: {
      type: Array,
      default: null,
    },
    crossOrigin: {
      type: String,
      default: "anonymous",
    },
    // GeoImage 特有属性
    geoImage: {
      type: Boolean,
      default: false,
    },
    // 图片旋转角度 (GeoImage)
    imageRotation: {
      type: Number,
      default: 0,
    },
    // 图片中心点 (GeoImage)
    imageCenter: {
      type: Array,
      default: null,
    },
    // 图片缩放比例 (GeoImage)
    imageScale: {
      type: [Number, Array],
      default: 1,
    },
  },
  data() {
    return {
      imageSource: null,
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
    source: {
      handler(newValue) {
        if (this.layer && newValue) {
          this.updateSource();
        }
      },
      immediate: false,
      deep: true,
    },
    sourceType: {
      handler() {
        if (this.layer) {
          this.updateSource();
        }
      },
      immediate: false,
    },
    imageUrl: {
      handler(newValue) {
        if (this.layer && this.sourceType.toLowerCase() === "static" && newValue) {
          this.updateSource();
        }
      },
      immediate: false,
    },
  },
  methods: {
    /**
     * 初始化图片图层
     */
    init() {
      try {
        const type = this.sourceType.toLowerCase();

        if (type === "geoimage") {
          // GeoImage 使用 ol-ext 的特殊图层
          this.createGeoImageLayer();
        } else {
          // Static 和 WMS 使用标准 ImageLayer
          this.createSource();
          this.layer = new ImageLayer({
            source: this.imageSource,
            opacity: this.opacity,
            visible: this.visible,
            extent: this.extent,
            minZoom: this.minZoom,
            maxZoom: this.maxZoom,
            minResolution: this.minResolution,
            maxResolution: this.maxResolution,
          });
          if (this.sourceType.toLowerCase() === "static") {
            this.layer.set("type", "image");
          } else if (this.sourceType.toLowerCase() === "wms") {
            this.layer.set("type", "wms");
          }
        }

        const layerId = this.layerId || `image-layer-${nanoid()}`;
        this.layer.set("id", layerId);
        this.layer.set("users", true);

        if (this.zIndex !== undefined) {
          this.layer.setZIndex(this.zIndex);
        }

        // 添加到地图或图层组
        this.addToMap();

        /**
         * Triggers when image layer is loaded
         * @property {ImageLayer} layer - Image layer instance
         * @property {Map} map - Map instance
         */
        this.$emit("load", this.layer, this.map);
      } catch (error) {
        console.error("[v-image] Failed to initialize:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 创建 GeoImage 图层 (ol-ext)
     * GeoImage 支持图片的旋转、缩放、定位等高级功能
     */
    createGeoImageLayer() {
      const sourceOptions = {
        url: this.imageUrl || this.source.url,
        imageCenter: this.imageCenter || this.source.imageCenter,
        imageRotate: this.imageRotation || this.source.imageRotate || 0,
        imageScale: this.imageScale || this.source.imageScale || 1,
        ...this.source,
      };

      this.imageSource = new GeoImageSource(sourceOptions);

      this.layer = new GeoImageLayer({
        source: this.imageSource,
        opacity: this.opacity,
        visible: this.visible,
        extent: this.extent,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
      });
      this.layer.set("type", "geoimage");
    },

    /**
     * 创建数据源
     */
    createSource() {
      const type = this.sourceType.toLowerCase();

      if (type === "static") {
        this.createStaticSource();
      } else if (type === "wms") {
        this.createWMSSource();
      } else if (type === "geoimage") {
        this.createGeoImageSource();
      }
    },

    /**
     * 创建静态图片数据源
     */
    createStaticSource() {
      let extent = this.imageExtent || [0, 0, 180, 90];
      let url = this.imageUrl || this.source.url;
      let imageSize = this.imageSize || this.source.imageSize;

      // 如果提供了 source 对象，优先使用其配置
      if (this.source.extent) {
        extent = this.source.extent;
      }

      // 创建投影（如果需要）
      let projection = this.map.getView().getProjection();

      if (this.source.projection) {
        projection = new Projection({
          code: this.source.projection.code || "EPSG:4326",
          units: this.source.projection.units || "pixels",
          extent: extent,
        });
      }

      const sourceOptions = {
        url: url,
        imageExtent: extent,
        projection: projection,
        crossOrigin: this.crossOrigin,
        ...this.source,
      };

      if (imageSize) {
        sourceOptions.imageSize = imageSize;
      }

      this.imageSource = new Static(sourceOptions);
    },

    /**
     * 创建 GeoImage 数据源 (ol-ext)
     */
    createGeoImageSource() {
      const sourceOptions = {
        url: this.imageUrl || this.source.url,
        imageCenter: this.imageCenter || this.source.imageCenter,
        imageRotate: this.imageRotation || this.source.imageRotate || 0,
        imageScale: this.imageScale || this.source.imageScale || 1,
        ...this.source,
      };

      this.imageSource = new GeoImageSource(sourceOptions);
    },

    /**
     * 创建 WMS 数据源
     */
    createWMSSource() {
      const wmsOptions = {
        url: this.wms.url || this.source.url,
        params: this.wms.params || this.source.params || {},
        serverType: this.wms.serverType || this.source.serverType,
        crossOrigin: this.crossOrigin,
        ...this.wms,
      };

      this.imageSource = new ImageWMS(wmsOptions);
    },

    /**
     * 更新数据源
     */
    updateSource() {
      if (!this.layer) return;

      const type = this.sourceType.toLowerCase();

      if (type === "geoimage") {
        this.imageSource = new GeoImageSource(this.source);
      } else if (type === "static") {
        this.createStaticSource();
      } else if (type === "wms") {
        this.createWMSSource();
      }

      this.layer.setSource(this.imageSource);
      this.$emit("sourceupdated", this.imageSource);
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
     * 刷新图片
     */
    refresh() {
      if (this.imageSource && typeof this.imageSource.refresh === "function") {
        this.imageSource.refresh();
      }
    },

    /**
     * 更新 WMS 参数
     */
    updateWMSParams(params) {
      if (this.imageSource && typeof this.imageSource.updateParams === "function") {
        this.imageSource.updateParams(params);
      }
    },

    /**
     * 设置 GeoImage 图片中心点
     * @param {Array} center - [x, y] 坐标
     */
    setImageCenter(center) {
      if (this.imageSource && typeof this.imageSource.setCenter === "function") {
        this.imageSource.setCenter(center);
      }
    },

    /**
     * 设置 GeoImage 图片旋转角度
     * @param {Number} rotation - 旋转角度（弧度）
     */
    setImageRotation(rotation) {
      if (this.imageSource && typeof this.imageSource.setRotation === "function") {
        this.imageSource.setRotation(rotation);
      }
    },

    /**
     * 设置 GeoImage 图片缩放比例
     * @param {Number|Array} scale - 缩放比例
     */
    setImageScale(scale) {
      if (this.imageSource && typeof this.imageSource.setScale === "function") {
        this.imageSource.setScale(scale);
      }
    },

    /**
     * 获取数据源
     */
    getSource() {
      return this.imageSource;
    },

    /**
     * 优化的 dispose 方法
     */
    dispose() {
      if (!this.layer || !this.map) return;

      // 从地图或图层组移除
      if (this.groupLayer) {
        this.groupLayer.getLayers().remove(this.layer);
      } else {
        this.map.removeLayer(this.layer);
      }

      // 调用基类清理
      this.baseDispose();

      this.imageSource = null;
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
