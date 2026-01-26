<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import { Circle as CircleStyle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import { getArea, getLength } from "ol/sphere";
import { Modify } from "ol/interaction";
import { LineString, Point, Polygon } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Draw from "ol/interaction/Draw";
import { unByKey } from "ol/Observable";

/**
 * 优化的测量工具组件
 *
 * 优化内容:
 * 1. 使用 EventManager 统一管理交互事件
 * 2. 优化样式配置，支持自定义
 * 3. 完善的 dispose 清理逻辑
 * 4. 移除不必要的 console.log
 * 5. 改进测量结果显示
 */
export default {
  name: "v-measure",
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
  render() {
    return null;
  },
  props: {
    layerId: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
      validator: (value) => ["", "LineString", "Polygon"].includes(value),
    },
    modifiable: {
      type: Boolean,
      default: true,
    },
    segments: {
      type: Boolean,
      default: true,
    },
    labelStyle: {
      type: [Object, Boolean],
      default: false,
    },
    tipStyle: {
      type: [Object, Boolean],
      default: false,
    },
    modifyStyle: {
      type: [Object, Boolean],
      default: false,
    },
  },
  data() {
    return {
      draw: null,
      modify: null,
      sketch: null,
      helpTooltipElement: null,
      measureTooltipElement: null,
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
    type: {
      handler(value) {
        this.removeInteractions();
        this.clearLayer();
        if (value) {
          this.init();
        }
      },
      immediate: false,
    },
  },
  mounted() {
    if (this.type) {
      this.init();
    }
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    /**
     * 初始化测量工具
     */
    init() {
      try {
        const source = new VectorSource();

        const style = new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#ffcc33",
            }),
          }),
        });

        this.layer = new VectorLayer({
          source: source,
          style: (feature) => {
            return this.getFeatureStyle(feature);
          },
        });

        const layerId = this.layerId || `measure-layer-${nanoid()}`;
        this.layer.set("id", layerId);
        this.layer.set("type", "measure");
        this.layer.set("users", true);

        if (this.zIndex !== undefined) {
          this.layer.setZIndex(this.zIndex);
        }

        this.map.addLayer(this.layer);

        // 添加绘制交互
        this.addDrawInteraction();

        // 添加修改交互
        if (this.modifiable) {
          this.addModifyInteraction();
        }

        this.$emit("load", this.layer, this.map);
      } catch (error) {
        console.error("[v-measure] Failed to initialize:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 添加绘制交互
     */
    addDrawInteraction() {
      const source = this.layer.getSource();

      this.draw = new Draw({
        source: source,
        type: this.type,
        style: (feature) => {
          return this.getDrawStyle(feature);
        },
      });

      this.map.addInteraction(this.draw);

      // 使用 BaseLayer 的事件管理
      const drawStartListener = this.draw.on("drawstart", (evt) => {
        this.sketch = evt.feature;

        /**
         * Triggers when draw starts
         * @property {Feature} feature - The feature being drawn
         */
        this.$emit("drawstart", evt.feature);

        let tooltipCoord = evt.coordinate;

        const listener = this.sketch.getGeometry().on("change", (evt) => {
          const geom = evt.target;
          let output;

          if (geom instanceof Polygon) {
            output = this.formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = this.formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }

          this.$emit("measuring", { output, coordinate: tooltipCoord });
        });

        this.addListener(listener, "measure-change");
      });

      const drawEndListener = this.draw.on("drawend", (evt) => {
        const feature = evt.feature;
        const geom = feature.getGeometry();

        let output;
        let coordinate;

        if (geom instanceof Polygon) {
          output = this.formatArea(geom);
          coordinate = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = this.formatLength(geom);
          coordinate = geom.getLastCoordinate();
        }

        // 保存测量结果到要素
        feature.set("measurement", output);

        /**
         * Triggers when draw ends
         * @property {Feature} feature - The drawn feature
         * @property {string} measurement - Measurement result
         * @property {Array} coordinate - Label coordinate
         */
        this.$emit("drawend", { feature, measurement: output, coordinate });

        this.sketch = null;
      });

      this.addListener(drawStartListener, "draw-start");
      this.addListener(drawEndListener, "draw-end");
    },

    /**
     * 添加修改交互
     */
    addModifyInteraction() {
      const source = this.layer.getSource();

      this.modify = new Modify({
        source: source,
        style: this.modifyStyle || this.getModifyStyle(),
      });

      this.map.addInteraction(this.modify);

      const modifyStartListener = this.modify.on("modifystart", (evt) => {
        this.$emit("modifystart", evt.features.getArray());
      });

      const modifyEndListener = this.modify.on("modifyend", (evt) => {
        const features = evt.features.getArray();

        // 更新测量结果
        features.forEach((feature) => {
          const geom = feature.getGeometry();
          let output;

          if (geom instanceof Polygon) {
            output = this.formatArea(geom);
          } else if (geom instanceof LineString) {
            output = this.formatLength(geom);
          }

          feature.set("measurement", output);
        });

        this.$emit("modifyend", features);
      });

      this.addListener(modifyStartListener, "modify-start");
      this.addListener(modifyEndListener, "modify-end");
    },

    /**
     * 格式化长度
     */
    formatLength(line) {
      const length = getLength(line, { projection: "EPSG:4326" });
      let output;

      if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + " km";
      } else {
        output = Math.round(length * 100) / 100 + " m";
      }

      return output;
    },

    /**
     * 格式化面积
     */
    formatArea(polygon) {
      const area = getArea(polygon, { projection: "EPSG:4326" });
      let output;

      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + " km²";
      } else {
        output = Math.round(area * 100) / 100 + " m²";
      }

      return output;
    },

    /**
     * 获取要素样式
     */
    getFeatureStyle(feature) {
      const geometry = feature.getGeometry();
      const type = geometry.getType();
      const styles = [
        new Style({
          stroke: new Stroke({
            color: "rgba(255, 204, 51, 0.8)",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(255, 204, 51, 0.2)",
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: "rgba(255, 204, 51, 1)",
            }),
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
          }),
        }),
      ];

      // 添加测量标签
      const measurement = feature.get("measurement");
      if (measurement) {
        let coordinate;
        if (type === "Polygon") {
          coordinate = geometry.getInteriorPoint().getCoordinates();
        } else if (type === "LineString") {
          coordinate = geometry.getLastCoordinate();
        }

        if (coordinate) {
          styles.push(
            new Style({
              geometry: new Point(coordinate),
              text: new Text({
                text: measurement,
                font: "14px Calibri,sans-serif",
                fill: new Fill({
                  color: "#fff",
                }),
                backgroundFill: new Fill({
                  color: "rgba(0, 0, 0, 0.7)",
                }),
                padding: [3, 3, 3, 3],
                textBaseline: "bottom",
                offsetY: -15,
              }),
            })
          );
        }
      }

      // 添加分段标签
      if (this.segments && type === "LineString") {
        const segmentStyles = this.getSegmentStyles(geometry);
        styles.push(...segmentStyles);
      }

      return styles;
    },

    /**
     * 获取绘制样式
     */
    getDrawStyle(feature) {
      const geometry = feature.getGeometry();
      const type = geometry.getType();
      const styles = [];

      if (type === "Polygon" || type === "LineString") {
        styles.push(
          new Style({
            stroke: new Stroke({
              color: "rgba(0, 0, 0, 0.5)",
              lineDash: [10, 10],
              width: 2,
            }),
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
          })
        );
      }

      return styles;
    },

    /**
     * 获取修改样式
     */
    getModifyStyle() {
      return new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "rgba(255, 204, 51, 0.9)",
          }),
          stroke: new Stroke({
            color: "rgba(255, 255, 255, 1)",
            width: 2,
          }),
        }),
      });
    },

    /**
     * 获取分段样式
     */
    getSegmentStyles(geometry) {
      const styles = [];
      const coordinates = geometry.getCoordinates();

      for (let i = 0; i < coordinates.length - 1; i++) {
        const segment = new LineString([coordinates[i], coordinates[i + 1]]);
        const segmentLength = this.formatLength(segment);

        const segmentPoint = new Point(segment.getCoordinateAt(0.5));

        styles.push(
          new Style({
            geometry: segmentPoint,
            text: new Text({
              text: segmentLength,
              font: "12px Calibri,sans-serif",
              fill: new Fill({
                color: "#fff",
              }),
              backgroundFill: new Fill({
                color: "rgba(0, 0, 0, 0.4)",
              }),
              padding: [2, 2, 2, 2],
              textBaseline: "bottom",
              offsetY: -12,
            }),
            image: new RegularShape({
              radius: 6,
              points: 3,
              angle: Math.PI,
              displacement: [0, 8],
              fill: new Fill({
                color: "rgba(0, 0, 0, 0.4)",
              }),
            }),
          })
        );
      }

      return styles;
    },

    /**
     * 清除图层
     */
    clearLayer() {
      if (this.layer) {
        this.layer.getSource().clear();
      }
    },

    /**
     * 移除交互
     */
    removeInteractions() {
      if (this.draw) {
        this.map.removeInteraction(this.draw);
        this.draw = null;
      }

      if (this.modify) {
        this.map.removeInteraction(this.modify);
        this.modify = null;
      }
    },

    /**
     * 优化的 dispose 方法
     */
    dispose() {
      if (!this.map) return;

      this.removeInteractions();

      if (this.layer) {
        this.clearLayer();
        this.map.removeLayer(this.layer);
      }

      // 调用基类清理
      this.baseDispose();

      this.sketch = null;
    },
  },
};
</script>

<style scoped></style>
