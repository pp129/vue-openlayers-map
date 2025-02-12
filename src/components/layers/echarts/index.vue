<script>
import { nanoid } from "nanoid";
import EChartsLayer from "ol-echarts";

export default {
  name: "v-echarts",
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
    chartOptions: {
      type: Object,
    },
    options: {
      type: Object,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    zIndex: {
      type: Number,
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
  },
  watch: {
    visible: {
      handler(val) {
        if (this.layer) {
          this.layer.setVisible(val);
        }
      },
      immediate: false,
    },
    zIndex: {
      handler(val) {
        if (this.layer) {
          this.layer.setZIndex(val);
        }
      },
      immediate: false,
    },
    chartOptions: {
      handler(val) {
        if (this.layer) {
          this.layer.setChartOptions(val);
        }
      },
      deep: true,
      immediate: false,
    },
  },
  methods: {
    init() {
      this.layer = new EChartsLayer(this.chartOptions, this.options);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      this.layer.setVisible(this.visible);
      this.layer.appendTo(this.map);
    },
    dispose() {
      // this.map.removeLayer(this.layer)
      this.layer.remove();
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.map.removeLayer(this.layer);
    this.dispose();
  },
};
</script>

<style scoped></style>
