<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import Projection from "ol/proj/Projection";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import Static from "ol/source/ImageStatic";
import Layer from "ol-ext/layer/GeoImage";
import Source from "ol-ext/source/GeoImage";
import { validObjKey } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-image",
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
  props: {
    layerId: {
      type: String,
      default: "",
    },
    source: {
      type: Object,
    },
    features: {
      type: Array,
      default() {
        return [];
      },
    },
    FeatureStyle: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
    sourceType: {
      type: String,
      default: "Static",
      validator(value) {
        return ["Static", "GeoImage", "WMS"].map((item) => item.toLowerCase()).includes(value.toLowerCase());
      },
    },
    geoImage: {
      type: Boolean,
      default: false,
    },
    wms: {
      type: Object,
      default() {},
    },
  },
  data() {
    return {
      layerOpt: {},
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
      handler() {
        // this.layer.getSource().clear()
        this.changeSource();
      },
      immediate: false,
      deep: true,
    },
    sourceType() {
      this.changeSource();
    },
  },
  methods: {
    changeSource() {
      if (this.sourceType.toLowerCase() === "geoimage") {
        this.layer.setSource(new Source(this.source));
      } else if (this.sourceType.toLowerCase() === "static") {
        this.layer.setSource(new Static(this.source));
      } else if (this.sourceType.toLowerCase() === "wms") {
        this.layer.setSource(new ImageWMS(this.wms));
      }
    },
    init() {
      if (this.sourceType.toLowerCase() === "geoimage") {
        this.layerOpt = { ...this.$props };
        this.layer = new Layer({
          ...this.layerOpt,
          source: new Source(this.source),
        });
        this.layer.set("type", "image");
      } else if (this.sourceType.toLowerCase() === "static") {
        let extent = [0, 0, 180, 90];
        if (validObjKey(this.source, "extent")) {
          extent = this.source.extent;
        }
        const projection = new Projection({
          code: "EPSG:4326",
          units: "pixels",
          extent,
        });
        const sourceOpts = {
          ...this.source,
          ...projection,
        };
        const source = new Static(sourceOpts);
        this.layerOpt = { ...this.$props };
        this.layer = new ImageLayer({
          ...this.layerOpt,
          source,
        });
        this.layer.set("type", "image");
      } else if (this.sourceType.toLowerCase() === "wms") {
        this.layerOpt = { ...this.$props };
        this.layer = new ImageLayer({
          ...this.layerOpt,
          source: new ImageWMS(this.wms),
        });
        this.layer.set("type", "wms");
      }
      const layerId = this.layerId || `image-layer-${nanoid()}`;
      this.layer.set("id", layerId);
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
      this.$emit("load", this.layer, this.map);
    },
    dispose() {
      this.map.removeLayer(this.layer);
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
