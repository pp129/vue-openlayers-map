<script>
export default {
  render(createElement, context) {
    return null;
  },
  props: {
    className: {
      type: String,
      default: "ol-layer",
    },
    opacity: {
      type: Number,
      default: 1,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    extent: {
      type: Array,
    },
    zIndex: {
      type: Number,
    },
    maxResolution: {
      type: Number,
    },
    minResolution: {
      type: Number,
    },
    minZoom: {
      type: Number,
    },
    maxZoom: {
      type: Number,
    },
    title: {
      type: String,
    },
    name: {
      type: String,
    },
    preview: {
      type: String,
    },
    baseLayer: {
      type: Boolean,
    },
    properties: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      layer: null,
    };
  },
  watch: {
    visible: {
      handler(value) {
        this.layer.setVisible(value);
      },
      immediate: false,
    },
    opacity: {
      handler(value) {
        this.layer.setOpacity(value);
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
    maxResolution: {
      handler(value) {
        this.layer.setMaxResolution(value);
      },
      immediate: false,
    },
    minResolution: {
      handler(value) {
        this.layer.setMinResolution(value);
      },
      immediate: false,
    },
    properties: {
      handler(value) {
        this.layer.setProperties(value);
      },
      immediate: false,
      deep: true,
    },
  },
};
</script>

<style scoped></style>
