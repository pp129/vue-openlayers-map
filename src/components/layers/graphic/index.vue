<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import ImageCanvasSource from "ol/source/ImageCanvas";
import { toContext } from "ol/render";
import { Point } from "ol/geom";
import ImageLayer from "ol/layer/Image";
import { FeatureExt, setImage, setStyle, validObjKey } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-graphic",
  render(createElement, context) {
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
  data() {
    return {};
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
    featureStyle: {
      type: Object,
    },
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
      handler(value) {
        console.log("layers change", value);
        this.layer.getSource().refresh();
      },
      immediate: false,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.map.removeLayer(this.layer);
    this.layer.dispose();
  },
  methods: {
    init() {
      let source;
      if (this.featureStyle) {
        setImage(this.featureStyle.icon).then((res) => {
          source = this.setSource(res);
          this.setLayer(source);
        });
      } else {
        source = this.setSource();
        this.setLayer(source);
      }

      // console.log(style.getImage().getImageState())
    },
    setSource(style) {
      const source = new ImageCanvasSource({
        canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
          // console.log(style.getImage().getImageState())
          const geoms = [];
          const canvas = document.createElement("canvas");
          const width = size[0] / pixelRatio;
          const height = size[1] / pixelRatio;
          const vectorContext = toContext(canvas.getContext("2d"), { size: [width, height] });
          if (style) {
            vectorContext.setStyle(style);
          }
          // console.log(this.VMap)
          const maxsize = this.map.getSize();
          const s = [(width - maxsize[0]) / 2, (height - maxsize[1]) / 2];
          const h = -this.map.getView().getRotation();
          const u = this.map.getPixelFromCoordinate(this.map.getView().getCenter());
          if (this.features.length > 0) {
            this.features.forEach((feature) => {
              const r = feature.coordinates;
              const l = this.map.getPixelFromCoordinate(r);
              const c = (function (e, t, r) {
                return [
                  Math.cos(t) * (e[0] - r[0]) - Math.sin(t) * (e[1] - r[1]) + r[0],
                  Math.sin(t) * (e[0] - r[0]) + Math.cos(t) * (e[1] - r[1]) + r[1],
                ];
              })(
                (function (e, t, r) {
                  return [(e[0] - t[0]) * r + t[0], (e[1] - t[1]) * r + t[1]];
                })(l, u, 1),
                h,
                u
              );
              const d = [c[0] + s[0], c[1] + s[1]];
              const p = new Point(d, "XY");
              const geom = new FeatureExt(p);
              geom._coordinates = r;
              for (const i in feature) {
                if (Object.prototype.hasOwnProperty.call(feature, i)) {
                  geom.set(i, feature[i]);
                }
              }
              if (validObjKey(feature, "style")) {
                style = setStyle(feature.style);
                vectorContext.drawFeature(geom, style);
              } else {
                vectorContext.drawGeometry(p);
              }
              geom._style = style;
              geoms.push(geom);
            });
          }
          source.set("graphics", geoms);
          return canvas;
        },
      });
      return source;
    },
    setLayer(source) {
      const layerOpt = { ...this.$props, ...{ source } };
      this.layer = new ImageLayer(layerOpt);
      const layerId = this.layerId || `graphic-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "graphic");
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
    },
  },
};
</script>

<style scoped></style>
