<script>
import BaseLayer from "@/packages/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import VectorLayer from "ol/layer/Vector";
import Draw, { createBox, createRegularPolygon } from "ol/interaction/Draw";
import { Polygon } from "ol/geom";
import { Modify, Snap } from "ol/interaction";
import { arrowLine } from "@/utils/arrowLine";
import { addVectorSource, formatArea, formatLength, setFeatures, setStyle } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-draw",
  extends: BaseLayer,
  inject: {
    VMap: { value: "VMap", default: null },
    VGroupLayer: { value: "VGroupLayer", default: null },
  },
  render() {
    return null;
  },
  props: {
    layerId: { type: String, default: "" },
    features: { type: Array, default: () => [] },
    source: { type: Object, default: () => ({ features: [] }) },
    featureStyle: { type: [Object, Boolean], default: false },
    type: { type: String, default: "" },
    clickTolerance: { type: Number, default: 6 },
    dragVertexDelay: { type: Number, default: 500 },
    snapTolerance: { type: Number, default: 12 },
    stopClick: { type: Boolean, default: false },
    maxPoints: { type: Number, default: undefined },
    minPoints: { type: Number, default: undefined },
    drawOnce: { type: Boolean, default: false },
    endRight: { type: Boolean, default: false },
    endDblclick: { type: Boolean, default: false },
    editable: { type: Boolean, default: false },
    clear: { type: Boolean, default: false },
    wrapX: { type: Boolean, default: false },
    finishCondition: { type: Object, default: undefined },
    geometryFunction: { type: Function, default: undefined },
    geometryName: { type: String, default: undefined },
    condition: { type: Object, default: undefined },
    freehand: { type: Boolean, default: false },
    freehandCondition: { type: Object, default: undefined },
    drawStyle: { type: [Object, Boolean], default: false },
    arrow: { type: [Object, Boolean], default: false },
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
        if (value) {
          this.initDraw();
        } else {
          this.disposeDraw();
        }
      },
      immediate: false,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    init() {
      const source = addVectorSource(this.source, this.map);
      if (this.source.features.length <= 0 && this.features.length > 0) {
        const features = setFeatures(this.features, this.map);
        source.addFeatures(features);
      }

      const layerOpt = { ...this.$props, source };
      this.layer = new VectorLayer(layerOpt);
      this.layer.setStyle((feature) => {
        if (feature.get("style")) {
          return setStyle(feature.get("style"));
        } else if (this.featureStyle) {
          return setStyle(this.featureStyle);
        } else {
          return setStyle({
            fill: { color: "rgba(67,126,255,0.15)" },
            stroke: { color: "rgba(67,126,255,1)", width: 1 },
          });
        }
      });

      const layerId = this.layerId || `draw-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "draw");
      this.layer.set("users", true);

      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }

      addLayerToParentComp({
        type: this.$parent.$options.name,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });

      if (this.type) {
        this.initDraw();
      }
    },

    initDraw() {
      this.resetDraw();
      this.draw.set("type", "draw");
      this.map.addInteraction(this.draw);

      this.draw.on("drawstart", (evt) => {
        this.$emit("drawstart", evt, this.map);
        if (this.clear) {
          this.layer.getSource().clear();
        }
      });

      this.draw.on("drawend", (evt) => {
        const geometry = evt.feature.getGeometry();
        if (this.type === "LineString") {
          evt.measure = formatLength(geometry);
        } else if (this.type === "Polygon") {
          evt.measure = formatArea(geometry);
        }
        this.$emit("drawend", evt, this.map);

        if (this.drawOnce) {
          this.draw.setActive(false);
        }

        // 优化: 使用 BaseLayer 的事件管理避免重复绑定
        if (this.endRight && this.type) {
          this.removeListener("contextmenu-end");
          const listener = this.map.on("contextmenu", () => {
            this.draw.setActive(false);
          });
          this.addListener(listener, "contextmenu-end");
        }

        if (this.endDblclick) {
          this.removeListener("dblclick-end");
          const listener = this.map.on("dblclick", () => {
            this.draw.setActive(false);
          });
          this.addListener(listener, "dblclick-end");
        }
      });

      if (this.editable) {
        this.select = new Snap({ source: this.layer.getSource() });
        this.map.addInteraction(this.select);

        this.modify = new Modify({ source: this.layer.getSource() });
        this.modify.set("type", "modify");
        this.map.addInteraction(this.modify);

        this.modify.on("modifystart", (evt) => {
          this.$emit("modifystart", evt, this.map);
        });

        this.modify.on("modifyend", (evt) => {
          const geometry = evt.features.getArray()[0].getGeometry();
          if (this.type === "LineString") {
            evt.measure = formatLength(geometry);
          } else if (this.type === "Polygon") {
            evt.measure = formatArea(geometry);
          }
          this.$emit("modifyend", evt, this.map);
        });
      }
    },

    resetDraw() {
      if (this.draw) {
        this.map.removeInteraction(this.draw);
        this.draw = null;
      }

      const option = {
        source: this.layer.getSource(),
        type: this.type,
        freehand: this.freehand,
        clickTolerance: this.clickTolerance,
        features: setFeatures(this.features, this.map),
        dragVertexDelay: this.dragVertexDelay,
        snapTolerance: this.snapTolerance,
        stopClick: this.stopClick,
        maxPoints: this.maxPoints,
        minPoints: this.minPoints,
        wrapX: this.wrapX,
        geometryName: this.geometryName,
        geometryFunction: this.geometryFunction,
        style: this.drawStyle ? setStyle(this.drawStyle) : null,
      };

      if (this.type === "Rectangle") {
        const drawOpt = { ...option, type: "Circle", geometryFunction: createBox() };
        this.draw = new Draw(drawOpt);
      } else if (this.type === "Square") {
        const drawOpt = { ...option, type: "Circle", geometryFunction: createRegularPolygon(4) };
        this.draw = new Draw(drawOpt);
      } else if (this.type.indexOf("Star") > -1) {
        const points = this.type.split("-")[1] || 5;
        const geometryFunction = function (coordinates, geometry) {
          const center = coordinates[0];
          const last = coordinates[coordinates.length - 1];
          const dx = center[0] - last[0];
          const dy = center[1] - last[1];
          const radius = Math.sqrt(dx * dx + dy * dy);
          const rotation = Math.atan2(dy, dx);
          const newCoordinates = [];
          const numPoints = Number(points) * 2;
          for (let i = 0; i < numPoints; ++i) {
            const angle = rotation + (i * 2 * Math.PI) / numPoints;
            const fraction = i % 2 === 0 ? 1 : 0.5;
            const offsetX = radius * fraction * Math.cos(angle);
            const offsetY = radius * fraction * Math.sin(angle);
            newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
          }
          newCoordinates.push(newCoordinates[0].slice());
          if (!geometry) {
            geometry = new Polygon([newCoordinates]);
          } else {
            geometry.setCoordinates([newCoordinates]);
          }
          return geometry;
        };
        const drawOpt = { ...option, type: "Circle", geometryFunction };
        this.draw = new Draw(drawOpt);
      } else {
        this.draw = new Draw(option);

        if (this.arrow) {
          // 使用 BaseLayer 的事件管理
          const postRenderListener = this.layer.on("postrender", () => {
            const zoom = this.map.getView().getZoom();
            this.layer
              .getSource()
              .getFeatures()
              .forEach((feature) => {
                if (feature.get("isArrow")) {
                  this.layer.getSource().removeFeature(feature);
                }
              });
            if (Math.round(zoom) === zoom) {
              this.layer
                .getSource()
                .getFeatures()
                .forEach((feature) => {
                  arrowLine({
                    coordinates: feature.getGeometry().getCoordinates(),
                    map: this.map,
                    source: this.layer.getSource(),
                    ...this.arrow,
                  });
                });
            }
          });
          this.addListener(postRenderListener, "arrow-postrender");
        }
      }
    },

    disposeDraw() {
      if (this.draw) {
        this.map.removeInteraction(this.draw);
        this.draw = null;
      }
      if (this.select) {
        this.map.removeInteraction(this.select);
        this.select = null;
      }
      if (this.modify) {
        this.map.removeInteraction(this.modify);
        this.modify = null;
      }
    },

    /**
     * 优化后的 dispose 方法
     */
    dispose() {
      this.disposeDraw();

      if (this.layer) {
        this.layer.getSource().clear();
        if (this.map) {
          this.map.removeLayer(this.layer);
        }
      }

      // 调用基类清理
      this.baseDispose();
    },

    finish() {
      if (this.draw) {
        this.draw.finishDrawing();
      }
    },

    remove() {
      if (this.draw) {
        this.map.removeInteraction(this.draw);
        this.layer.getSource().clear();
        this.map.removeInteraction(this.select);
        this.map.removeInteraction(this.modify);
      }
    },

    setActive(value) {
      if (this.draw) {
        this.draw.setActive(value);
      }
    },
  },
};
</script>

<style scoped></style>
