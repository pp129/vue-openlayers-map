<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { createDefaultStyle } from "ol/style/flat";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { unByKey } from "ol/Observable";
import { addLayerToParentComp } from "@/utils/parent";
// import { bbox as bboxStrategy } from "ol/loadingstrategy";

export default {
  name: "v-webgl-vector",
  render() {
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
      type: [Object, Array, undefined],
      default: () => {
        return createDefaultStyle();
      },
    },
    declutter: {
      type: [Boolean, Number, String],
      default: false,
    },
    updateWhileInteracting: {
      type: Boolean,
      default: false,
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
    groupLayer() {
      return this.VGroupLayer?.layer;
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
      this.vectorSource = new VectorSource({
        ...this.source,
        // strategy: bboxStrategy,
      });
      console.log(this.$props);
      if (this.data) {
        const features = new GeoJSON().readFeatures(this.data);
        this.vectorSource.addFeatures(features);
      }
      this.layer = new WebGLVectorLayer({
        ...this.$props,
        source: this.vectorSource,
        style: this.layerStyle,
      });
      this.layer.setStyle(this.layerStyle);
      const layerId = this.layerId || `webGlVector-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "webGlVector");
      this.layer.set("users", true);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      // this.map.addLayer(this.layer);

      // 如果上一层是v-gd-route，需要再一层$parent
      let parentType = this.$parent.$options.name;
      if (this.$parent.$options.name === "v-gd-route") {
        parentType = this.$parent.$parent.$options.name;
      }

      addLayerToParentComp({
        type: parentType,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });
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
