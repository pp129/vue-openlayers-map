<script>
import BaseLayer from "@/packages/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import { Heatmap } from "ol/layer";
import { addVectorSource, setFeatures } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-heatmap",
  render() {
    return null;
  },
  extends: BaseLayer,
  inject: {
    VMap: { value: "VMap", default: null },
    VGroupLayer: { value: "VGroupLayer", default: null },
  },
  props: {
    layerId: { type: String, default: "" },
    source: { type: [Object, undefined], default: () => ({ features: [] }) },
    features: { type: Array, default: () => [] },
    blur: { type: Number, default: 15 },
    radius: { type: Number, default: 8 },
    weight: { type: [String, Function], default: "weight" },
    gradient: { type: Array, default: () => ["#00f", "#0ff", "#0f0", "#ff0", "#f00"] },
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
  mounted() {
    const source = addVectorSource(this.source, this.map);
    if (this.source.features.length <= 0 && this.features.length > 0) {
      const features = setFeatures(this.features, this.map);
      source.addFeatures(features);
    }

    const layerOpt = { ...this.$props, source };
    this.layer = new Heatmap(layerOpt);

    const layerId = this.layerId || `heatmap-layer-${nanoid()}`;
    this.layer.set("id", layerId);
    this.layer.set("type", "heatmap");
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
  },
  beforeDestroy() {
    // 清理图层
    if (this.layer && this.map) {
      this.map.removeLayer(this.layer);
    }
    // 调用基类清理
    this.baseDispose();
  },
};
</script>

<style scoped></style>
