<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { setFeatureStyle, setStyle, setText, validObjKey } from "@/utils";
import { WFS, GeoJSON } from "ol/format";

export default {
  name: "v-wfs",
  render() {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  components: {},
  props: {
    layerId: {
      type: String,
      default: `vector-layer-${nanoid()}`,
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
      vectorLayer: null,
      vectorSource: null,
      eventRender: [],
      eventList: ["singleclick", "pointermove"],
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    visible: {
      handler(value) {
        this.vectorLayer.setVisible(value);
      },
      immediate: false,
    },
    zIndex: {
      handler(value) {
        this.vectorLayer.setZIndex(value);
      },
      immediate: false,
    },
    maxZoom: {
      handler(value) {
        this.vectorLayer.setMaxZoom(value);
      },
      immediate: false,
    },
    minZoom: {
      handler(value) {
        this.vectorLayer.setMinZoom(value);
      },
      immediate: false,
    },
    extent: {
      handler(value) {
        this.vectorLayer.setExtent(value);
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    init() {
      this.vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        ...this.$props,
        source: this.vectorSource,
        style: (feature) => {
          let labelText = "";
          if (this.layerStyle.text.key) {
            labelText = feature.get(this.layerStyle.text.key);
          }
          const style = setStyle(this.layerStyle);
          const textOptions = {
            ...this.layerStyle.text,
            text: labelText,
          };
          const textStyle = setText(textOptions);
          style.setText(textStyle);
          return style;
        },
      });
      this.vectorLayer.set("id", this.layerId);
      this.map.addLayer(this.vectorLayer);
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
          if (layer?.get("id") === this.vectorLayer?.get("id")) return feature;
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
