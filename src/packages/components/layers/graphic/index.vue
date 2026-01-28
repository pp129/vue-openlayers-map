<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import ImageCanvasSource from "ol/source/ImageCanvas";
import { toContext } from "ol/render";
import { Point } from "ol/geom";
import ImageLayer from "ol/layer/Image";
import Feature from "ol/Feature";
import { Style, Icon, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";

export default {
  name: "v-graphic",
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
    features: {
      type: Array,
      default: () => [],
    },
    featureStyle: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      canvasSource: null,
      graphics: [],
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
    features: {
      handler() {
        if (this.canvasSource) {
          this.canvasSource.refresh();
        }
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    /**
     * 初始化图形图层
     */
    async init() {
      try {
        let defaultStyle = null;

        // 如果有默认样式配置，先加载
        if (this.featureStyle) {
          defaultStyle = await this.createStyle(this.featureStyle);
        }

        this.canvasSource = this.createCanvasSource(defaultStyle);
        this.createLayer();

        this.$emit("load", this.layer, this.map);
      } catch (error) {
        console.error("[v-graphic] Failed to initialize:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 创建 Canvas 数据源
     */
    createCanvasSource(defaultStyle) {
      const self = this;

      return new ImageCanvasSource({
        canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
          self.graphics = [];
          const canvas = document.createElement("canvas");
          const width = size[0] / pixelRatio;
          const height = size[1] / pixelRatio;
          canvas.width = width;
          canvas.height = height;

          const vectorContext = toContext(canvas.getContext("2d"), {
            size: [width, height],
          });

          if (defaultStyle) {
            vectorContext.setStyle(defaultStyle);
          }

          const mapSize = self.map.getSize();
          const offset = [(width - mapSize[0]) / 2, (height - mapSize[1]) / 2];
          const rotation = -self.map.getView().getRotation();
          const center = self.map.getPixelFromCoordinate(self.map.getView().getCenter());

          if (self.features.length > 0) {
            self.features.forEach((featureData) => {
              const coordinates = featureData.coordinates;
              const pixel = self.map.getPixelFromCoordinate(coordinates);

              // 应用旋转变换
              const rotatedPixel = self.rotatePoint(pixel, rotation, center);
              const canvasPixel = [rotatedPixel[0] + offset[0], rotatedPixel[1] + offset[1]];

              const point = new Point(canvasPixel, "XY");
              const feature = new Feature(point);

              // 保存原始坐标
              feature._coordinates = coordinates;

              // 复制属性
              Object.keys(featureData).forEach((key) => {
                if (key !== "coordinates" && key !== "style") {
                  feature.set(key, featureData[key]);
                }
              });

              // 绘制要素
              if (featureData.style) {
                const style = self.createStyleSync(featureData.style);
                if (style) {
                  vectorContext.drawFeature(feature, style);
                  feature._style = style;
                }
              } else if (defaultStyle) {
                vectorContext.drawFeature(feature, defaultStyle);
                feature._style = defaultStyle;
              } else {
                vectorContext.drawGeometry(point);
              }

              self.graphics.push(feature);
            });
          }

          return canvas;
        },
      });
    },

    /**
     * 旋转点位
     */
    rotatePoint(point, angle, center) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = point[0] - center[0];
      const dy = point[1] - center[1];
      return [cos * dx - sin * dy + center[0], sin * dx + cos * dy + center[1]];
    },

    /**
     * 创建图层
     */
    createLayer() {
      this.layer = new ImageLayer({
        source: this.canvasSource,
        opacity: this.opacity,
        visible: this.visible,
        extent: this.extent,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        minResolution: this.minResolution,
        maxResolution: this.maxResolution,
      });

      const layerId = this.layerId || `graphic-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "graphic");
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
     * 异步创建样式
     */
    async createStyle(styleConfig) {
      if (!styleConfig) return null;

      const style = new Style();

      // 图标样式
      if (styleConfig.icon) {
        const iconOptions = { ...styleConfig.icon };
        if (iconOptions.src) {
          // 预加载图片
          await this.loadImage(iconOptions.src);
        }
        style.setImage(new Icon(iconOptions));
      }
      // 圆形样式
      else if (styleConfig.circle) {
        style.setImage(
          new CircleStyle({
            radius: styleConfig.circle.radius || 5,
            fill: styleConfig.circle.fill ? new Fill(styleConfig.circle.fill) : undefined,
            stroke: styleConfig.circle.stroke ? new Stroke(styleConfig.circle.stroke) : undefined,
          })
        );
      }

      // 文本样式
      if (styleConfig.text) {
        style.setText(
          new Text({
            text: styleConfig.text.text || "",
            font: styleConfig.text.font || "14px sans-serif",
            fill: styleConfig.text.fill ? new Fill(styleConfig.text.fill) : undefined,
            stroke: styleConfig.text.stroke ? new Stroke(styleConfig.text.stroke) : undefined,
            offsetX: styleConfig.text.offsetX || 0,
            offsetY: styleConfig.text.offsetY || 0,
          })
        );
      }

      return style;
    },

    /**
     * 同步创建样式（简化版）
     */
    createStyleSync(styleConfig) {
      if (!styleConfig) return null;

      const style = new Style();

      if (styleConfig.circle) {
        style.setImage(
          new CircleStyle({
            radius: styleConfig.circle.radius || 5,
            fill: styleConfig.circle.fill ? new Fill(styleConfig.circle.fill) : undefined,
            stroke: styleConfig.circle.stroke ? new Stroke(styleConfig.circle.stroke) : undefined,
          })
        );
      }

      if (styleConfig.icon) {
        style.setImage(new Icon(styleConfig.icon));
      }

      if (styleConfig.text) {
        style.setText(
          new Text({
            text: styleConfig.text.text || "",
            font: styleConfig.text.font || "14px sans-serif",
            fill: styleConfig.text.fill ? new Fill(styleConfig.text.fill) : undefined,
            stroke: styleConfig.text.stroke ? new Stroke(styleConfig.text.stroke) : undefined,
            offsetX: styleConfig.text.offsetX || 0,
            offsetY: styleConfig.text.offsetY || 0,
          })
        );
      }

      return style;
    },

    /**
     * 预加载图片
     */
    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    },

    /**
     * 刷新图层
     */
    refresh() {
      if (this.canvasSource) {
        this.canvasSource.refresh();
      }
    },

    /**
     * 获取所有图形要素
     */
    getGraphics() {
      return this.graphics;
    },

    /**
     * 根据像素获取要素
     */
    getGraphicAtPixel(pixel) {
      // 由于是 Canvas 渲染，需要自定义命中检测
      const coordinate = this.map.getCoordinateFromPixel(pixel);
      const tolerance = this.map.getView().getResolution() * 10;

      for (const graphic of this.graphics) {
        const coords = graphic._coordinates;
        if (coords) {
          const dx = coordinate[0] - coords[0];
          const dy = coordinate[1] - coords[1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= tolerance) {
            return graphic;
          }
        }
      }
      return null;
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

      // 释放图层资源
      if (this.layer.dispose) {
        this.layer.dispose();
      }

      // 调用基类清理
      this.baseDispose();

      this.canvasSource = null;
      this.graphics = [];
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
