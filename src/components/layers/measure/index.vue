<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import { Circle as CircleStyle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import { getArea, getLength } from "ol/sphere";
import { Modify } from "ol/interaction";
import { LineString, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import Draw from "ol/interaction/Draw";
import { addVectorSource, setFeatures, setStyle } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";

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
  render(createElement, context) {
    return null;
  },
  props: {
    layerId: {
      type: String,
      default: "",
    },
    features: {
      type: Array,
      default() {
        return [];
      },
    },
    source: {
      type: Object,
      default() {
        return { features: [] };
      },
    },
    featureStyle: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
    type: {
      type: String,
      default: "", // 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Circle'
    },
    clear: {
      type: Boolean,
      default: false,
    },
    segments: {
      type: Boolean,
      default: false,
    },
    endRight: {
      type: Boolean,
      default: false,
    },
    modifiable: {
      type: Boolean,
      default: true,
    },
    labelStyle: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
    tipStyle: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
    modifyStyle: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      draw: null,
      modify: null,
      select: null,
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
        this.map.removeInteraction(this.draw);
        this.map.removeInteraction(this.select);
        this.map.removeInteraction(this.modify);
        this.layer?.getSource().clear();
        if (value) {
          this.init();
        } else {
          this.dispose();
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
    // this.map.removeLayer(this.layer);
    this.dispose();
  },
  methods: {
    init() {
      const source = addVectorSource(this.source, this.map);
      if (this.source.features.length <= 0 && this.features.length > 0) {
        const features = setFeatures(this.features, this.map);
        source.addFeatures(features);
      }
      const style = new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 0.5)",
          lineDash: [10, 10],
          width: 2,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
        }),
      });
      const labelStyle = this.labelStyle ? setStyle(this.labelStyle) : this.labelDefaultStyle();
      const tipStyle = this.tipStyle ? setStyle(this.tipStyle) : this.tipDefaultStyle();
      const modifyStyle = this.modifyStyle ? setStyle(this.modifyStyle) : this.modifyDefaultStyle();
      const segmentStyle = new Style({
        text: new Text({
          font: "12px Calibri,sans-serif",
          fill: new Fill({
            color: "rgba(255, 255, 255, 1)",
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
      });
      const segmentStyles = [segmentStyle];
      const formatLength = function (line) {
        const length = getLength(line, {
          projection: "EPSG:4326",
        });
        let output;
        if (length > 100) {
          output = Math.round((length / 1000) * 100) / 100 + " km";
        } else {
          output = Math.round(length * 100) / 100 + " m";
        }
        return output;
      };
      const formatArea = function (polygon) {
        const area = getArea(polygon, {
          projection: "EPSG:4326",
        });
        let output;
        if (area > 10000) {
          output = Math.round((area / 1000000) * 100) / 100 + " km\xB2";
        } else {
          output = Math.round(area * 100) / 100 + " m\xB2";
        }
        return output;
      };
      this.modify = new Modify({ source, style: modifyStyle });
      let tipPoint;
      const styleFunction = (feature, segments, drawType, tip) => {
        const styles = [this.featureStyle ? setStyle(this.featureStyle) : style];
        const geometry = feature.getGeometry();
        const type = geometry.getType();
        let point, label, line;
        if (!drawType || drawType === type) {
          if (type === "Polygon") {
            point = geometry.getInteriorPoint();
            label = formatArea(geometry);
            line = new LineString(geometry.getCoordinates()[0]);
          } else if (type === "LineString") {
            point = new Point(geometry.getLastCoordinate());
            label = formatLength(geometry);
            line = geometry;
          }
        }
        if (segments && line) {
          let count = 0;
          line.forEachSegment(function (a, b) {
            const segment = new LineString([a, b]);
            const label = formatLength(segment);
            if (segmentStyles.length - 1 < count) {
              segmentStyles.push(segmentStyle.clone());
            }
            const segmentPoint = new Point(segment.getCoordinateAt(0.5));
            segmentStyles[count].setGeometry(segmentPoint);
            segmentStyles[count].getText().setText(label);
            styles.push(segmentStyles[count]);
            count++;
          });
        }
        if (label) {
          labelStyle.setGeometry(point);
          labelStyle.getText().setText(label);
          styles.push(labelStyle);
        }
        if (tip && type === "Point" && !this.modify.getOverlay().getSource().getFeatures().length) {
          tipPoint = geometry;
          tipStyle.getText().setText(tip);
          styles.push(tipStyle);
        }
        return styles;
      };
      const layerOpt = { ...this.$props, ...{ source } };
      this.layer = new VectorLayer(layerOpt);
      this.layer.setStyle((feature) => {
        return styleFunction(feature, this.segments);
      });
      const layerId = this.layerId || `measure-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "measure");
      this.layer.set("users", true);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      // this.map.addLayer(this.layer);
      addLayerToParentComp({
        type: this.$parent.$options.name,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });
      this.modify.set("type", "measure");
      if (this.modifiable) {
        this.map.addInteraction(this.modify);
      }
      const drawType = this.type;
      const activeTip = "点击继续测量" + (drawType === "Polygon" ? "面积" : "长度");
      const idleTip = "点击开始测量";
      let tip = idleTip;
      this.draw = new Draw({
        source: this.layer.getSource(),
        type: drawType,
        style: (feature) => {
          return styleFunction(feature, this.segments, drawType, tip);
        },
      });
      this.draw.set("type", "measure");
      this.draw.set("measureDraw", true);
      this.draw.on("drawstart", (evt) => {
        if (this.clear) {
          source.clear();
        }
        this.modify.setActive(false);
        tip = activeTip;
        this.$emit("measurestart", evt, this.map);
      });
      this.draw.on("drawend", (evt) => {
        modifyStyle.setGeometry(tipPoint);
        this.modify.setActive(true);
        this.map.once("pointermove", () => {
          modifyStyle.setGeometry();
        });
        tip = idleTip;
        if (this.endRight) {
          this.draw.setActive(false);
        }
        this.$emit("measureend", evt, this.map);
      });
      this.modify.setActive(true);
      this.map.addInteraction(this.draw);
    },
    dispose() {
      // this.layer.getSource().clear()
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.select);
      this.map.removeInteraction(this.modify);
      this.map.removeLayer(this.layer);
    },
    finish() {
      this.draw.finishDrawing();
    },
    remove() {
      this.map.removeInteraction(this.draw);
    },
    setActive(value) {
      this.draw.setActive(value);
    },
    labelDefaultStyle() {
      return new Style({
        text: new Text({
          font: "14px Calibri,sans-serif",
          fill: new Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new Fill({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          padding: [3, 3, 3, 3],
          textBaseline: "bottom",
          offsetY: -15,
        }),
        image: new RegularShape({
          radius: 8,
          points: 3,
          angle: Math.PI,
          displacement: [0, 10],
          fill: new Fill({
            color: "rgba(0, 0, 0, 0.7)",
          }),
        }),
      });
    },
    tipDefaultStyle() {
      return new Style({
        text: new Text({
          font: "12px Calibri,sans-serif",
          fill: new Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        }),
      });
    },
    modifyDefaultStyle() {
      return new Style({
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new Fill({
            color: "rgba(0, 0, 0, 0.4)",
          }),
        }),
        text: new Text({
          text: "编辑测量",
          font: "12px Calibri,sans-serif",
          fill: new Fill({
            color: "rgba(255, 255, 255, 1)",
          }),
          backgroundFill: new Fill({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        }),
      });
    },
  },
};
</script>

<style scoped></style>
