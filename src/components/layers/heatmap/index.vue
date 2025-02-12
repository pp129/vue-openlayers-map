<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import { addVectorSource, setFeatures } from "@/utils";
import { Heatmap } from "ol/layer";

export default {
  name: "v-heatmap",
  render(createElement, context) {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  data() {
    return {};
  },
  props: {
    layerId: {
      type: String,
      default() {
        return `heatmap-layer-${nanoid()}`;
      },
    },
    source: {
      type: [Object, undefined],
      default() {
        return { features: [] };
      },
    },
    features: {
      type: Array,
      default() {
        return [];
      },
    },
    blur: {
      type: Number,
      default: 15,
    },
    radius: {
      type: Number,
      default: 8,
    },
    weight: {
      type: String,
      default: "weight",
    },
    gradient: {
      type: Array,
      default() {
        return ["#00f", "#0ff", "#0f0", "#ff0", "#f00"];
      },
    },
  },
  watch: {
    features: {
      handler(value) {
        this.layer.getSource().clear();
        if (value && value.length > 0) {
          const features = setFeatures(value, this.map);
          this.layer.getSource().addFeatures(features);
        }
      },
      immediate: false,
    },
    blur: {
      handler(value) {
        this.layer.setBlur(value);
      },
      immediate: false,
    },
    radius: {
      handler(value) {
        this.layer.setRadius(value);
      },
      immediate: false,
    },
    gradient: {
      handler(value) {
        this.layer.setGradient(value);
      },
      immediate: false,
      deep: true,
    },
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  mounted() {
    const source = addVectorSource(this.source, this.map);
    if (this.source.features.length <= 0 && this.features.length > 0) {
      const features = setFeatures(this.features, this.map);
      source.addFeatures(features);
    }
    const layerOpt = { ...this.$props, ...{ source } };
    this.layer = new Heatmap(layerOpt);
    this.layer.set("id", this.layerId);
    this.layer.set("type", "heatmap");
    this.layer.set("users", true);
    if (this.zIndex) {
      this.layer.setZIndex(this.zIndex);
    }
    this.map.addLayer(this.layer);
  },
  beforeDestroy() {
    // this.layer.getSource().clear()
    this.map.removeLayer(this.layer);
  },
};
</script>

<style scoped></style>
