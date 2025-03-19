<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import { createDefaultStyle } from "ol/style/flat";
import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";

export default {
  name: "v-vector-tile",
  render(createElement, context) {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
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
      this.map.addLayer(this.layer);
      this.$emit("load", this.layer, this.map);
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped></style>
