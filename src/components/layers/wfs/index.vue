<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { WFS, GeoJSON } from "ol/format";
import { setFeatureStyle, validObjKey } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-wfs",
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
  components: {},
  props: {
    layerId: {
      type: String,
      default: "",
    },
    options: {
      type: Object,
      default: () => {
        return {};
      },
    },
    layerStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      vectorSource: null,
      eventRender: [],
      eventList: ["singleclick", "pointermove"],
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
  methods: {
    init() {
      this.vectorSource = new VectorSource();
      this.layer = new VectorLayer({
        ...this.$props,
        source: this.vectorSource,
        style: (feature) => {
          return setFeatureStyle(feature, this.layerStyle, this.map);
        },
      });
      const layerId = this.layerId || `wfs-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      // this.map.addLayer(this.layer);
      addLayerToParentComp({
        type: this.$parent.$options.name,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });
      // 绑定事件
      this.eventList.forEach((listenerKey) => {
        this.eventRender.push(this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt)));
      });
      this.addFeatures();
    },
    addFeatures() {
      if (!validObjKey(this.options, "featureNS")) throw new Error("featureNS is required");

      // generate a GetFeature request
      const featureRequest = new WFS().writeGetFeature({
        ...this.options,
        outputFormat: "application/json",
      });

      // then post the request and add the received features to a layer
      fetch(this.options.featureNS, {
        method: "POST",
        body: new XMLSerializer().serializeToString(featureRequest),
      })
        .then(function (response) {
          return response.json();
        })
        .then((json) => {
          const features = new GeoJSON().readFeatures(json);
          this.vectorSource.addFeatures(features);
          // map.getView().fit(vectorSource.getExtent());
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
  },
  created() {},
  mounted() {
    this.init();
  },
};
</script>

<style scoped></style>
