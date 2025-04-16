<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import Projection from "ol/proj/Projection";
import ImageLayer from "ol/layer/Image";
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
    geoImage: {
      type: Boolean,
      default: false,
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
      handler(value) {
        // this.layer.getSource().clear()
        if (this.geoImage) {
          this.layer.setSource(new Source(value));
        } else {
          this.layer.setSource(new Static(value));
        }
        // this.layer.getSource().refresh()
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    init() {
      if (this.geoImage) {
        this.layerOpt = { ...this.$props };
        this.layer = new Layer({
          ...this.layerOpt,
          source: new Source(this.source),
        });
      } else {
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
      }
      const layerId = this.layerId || `image-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "image");
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
