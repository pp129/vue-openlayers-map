<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { createDefaultStyle } from "ol/style/flat";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { unByKey } from "ol/Observable";

export default {
  name: "v-webgl-vector",
  render(createElement, context) {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    layerId: {
      type: String,
      default() {
        return `vector-layer-${nanoid()}`;
      },
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
      vectorSource: null,
      eventList: ["singleclick", "pointermove", "dblclick"],
      eventRender: [],
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    data: {
      handler(val) {
        if (this.vectorSource) {
          this.vectorSource.clear();
          if (val) {
            const features = new GeoJSON().readFeatures(this.data);
            this.vectorSource.addFeatures(features);
          }
        }
      },
      deep: true,
    },
    layerStyle: {
      handler(val) {
        this.layer.setStyle(val);
      },
      deep: true,
    },
  },
  methods: {
    init() {
      this.vectorSource = new VectorSource(this.source);
      console.log(this.data);
      if (this.data) {
        const features = new GeoJSON().readFeatures(this.data);
        this.vectorSource.addFeatures(features);
      }
      this.layer = new WebGLVectorLayer({
        ...this.$props,
        source: this.vectorSource,
        style: this.layerStyle,
      });
      this.layer.set("id", this.layerId);
      this.layer.set("type", "webGlVector");
      this.layer.set("users", true);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      this.map.addLayer(this.layer);
      this.$emit("load", this.layer, this.map);
      // 绑定事件
      this.eventList.forEach((listenerKey) => {
        this.eventRender.push(this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt)));
      });
    },
    getFeatureAtPixel(pixel) {
      return this.map.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          if (layer?.get("id") === this.layer?.get("id")) return feature;
        },
        {}
      );
    },
    eventHandler(listenerKey, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);
      this.$emit(listenerKey, evt, feature);
    },
    dispose() {
      // 移除事件
      this.eventRender.forEach((listenerKey) => {
        unByKey(listenerKey);
      });
      this.map.removeLayer(this.layer);
      this.layer = null;
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
