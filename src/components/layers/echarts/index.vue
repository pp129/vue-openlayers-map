<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import EChartsLayer from "ol-echarts";

export default {
  name: "v-echarts",
  extends: BaseLayer,
  inject: ["VMap"],
  render(createElement, context) {
    return null;
  },
  props: {
    layerId: {
      type: String,
      default() {
        return `draw-layer-${nanoid()}`;
      },
    },
    options: {
      type: Object,
    },
  },
  data() {
    return {
      layer: null,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
    map3d() {
      return this.VMap.map3d;
    },
  },
  watch: {
    visible: {
      handler(value) {
        console.log("layer visible change", value);
        this.layer.setVisible(value);
      },
      immediate: false,
    },
    zIndex: {
      handler(value) {
        this.layer.setZIndex(value);
      },
      immediate: false,
    },
    maxZoom: {
      handler(value) {
        this.layer.setMaxZoom(value);
      },
      immediate: false,
    },
    minZoom: {
      handler(value) {
        this.layer.setMinZoom(value);
      },
      immediate: false,
    },
    extent: {
      handler(value) {
        this.layer.setExtent(value);
      },
      immediate: false,
      deep: true,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.map.removeLayer(this.layer);
    this.dispose();
  },
  methods: {
    init() {
      this.layer = new EChartsLayer(this.options);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      this.layer.appendTo(this.map);
    },
    dispose() {
      // this.map.removeLayer(this.layer)
      this.layer.remove();
    },
  },
};
</script>

<style scoped></style>
