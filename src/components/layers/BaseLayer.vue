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
    minResolution: {
      type: Number,
    },
    maxResolution: {
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
};
</script>

<style scoped></style>
