<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import { createDefaultStyle } from "ol/style/flat";
import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-vector-tile",
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
    data: {
      type: Object,
    },
    layerStyle: {
      type: [Object, undefined],
      default: () => {
        return createDefaultStyle();
      },
    },
  },
  data() {
    return {
      vectorTileSource: null,
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
        this.vectorTileSource.clear();
        this.layer.setSource(value);
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    init() {
      this.vectorTileSource = new VectorTileSource(this.source);
      this.layer = new VectorTileLayer({
        ...this.$props,
        source: this.vectorTileSource,
        style: this.layerStyle,
      });
      const layerId = this.layerId || `vectorTile-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "vectorTile");
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
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped></style>
