<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import { GeoJSON } from "ol/format";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Stroke, Style } from "ol/style";
import { unByKey } from "ol/Observable";

export default {
  name: "v-gd-route",
  render() {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    interval: {
      type: Number,
      default: 10000,
    },
    layerId: {
      type: String,
      default() {
        return `traffic-layer-${nanoid()}`;
      },
    },
    colors: {
      type: Array,
      default() {
        return ["#4fd27d", "#ffd045", "#e80e0e", "#b40000", "#8f979c"];
      },
    },
    url: String,
  },
  data() {
    return {
      source: null,
      layer: null,
      eventList: ["singleclick", "pointermove"],
      eventRender: [],
      timer: null,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    visible: {
      async handler(value) {
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        this.layer.setVisible(value);
        if (this.layer && this.layer.getVisible()) {
          await this.reload();
        }
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
  methods: {
    getColor(state) {
      switch (state) {
        case state === 1:
          return this.colors[0];
        case state === 2:
          return this.colors[1];
        case state === 3:
          return this.colors[2];
        case state === 4:
          return this.colors[3];
        case state === -1:
          return this.colors[4];
        default:
          return this.colors[0];
      }
    },
    async getData() {
      const form = new FormData();
      form.append("f", "geojson");
      form.append("returnGeometry", true);
      const view = this.map.getView();
      const extent = view.calculateExtent(this.map.getSize());
      const polygon = [
        [extent[0], extent[1]],
        [extent[2], extent[1]],
        [extent[2], extent[3]],
        [extent[0], extent[3]],
        [extent[0], extent[1]],
      ];
      const geometry = {
        type: "Polygon",
        coordinates: [polygon],
      };
      form.append("geometry", JSON.stringify(geometry));
      return fetch(this.url, {
        method: "POST",
        body: form,
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          return data;
        });
    },
    async init() {
      if (!this.url) {
        return;
      }
      this.source = new VectorSource();
      const layerOpt = {
        ...this.$props,
        source: this.source,
        style: (feature) => {
          const state = feature.get("state");
          const color = this.getColor(Number(state));
          return new Style({
            stroke: new Stroke({
              color: color,
              width: 4,
            }),
          });
        },
      };
      this.layer = new VectorLayer(layerOpt);
      this.layer.set("id", this.layerId);
      // this.layer.set("type", "vector");
      this.layer.set("users", true);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      this.map.addLayer(this.layer);
      // 绑定事件
      this.eventList.forEach((listenerKey) => {
        this.eventRender.push(this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt)));
      });
      // 视窗改变后渲染
      this.map.getView().once("change:resolution", () => {
        this.map.once("moveend", (evt) => {
          this.zoomEnd(evt);
        });
      });
      // 定时更新
      if (this.layer && this.layer.getVisible()) {
        await this.reload();
      }
    },
    async zoomEnd(evt) {
      if (this.layer && this.layer.getVisible()) {
        await this.renderRoute();
      }
      evt.map.once("moveend", (evt) => {
        this.zoomEnd(evt);
      });
    },
    async renderRoute() {
      const data = await this.getData();
      const { featureCount } = data;
      if (featureCount > 0) {
        const features = new GeoJSON().readFeatures(data);
        if (this.source) {
          this.source.clear();
          this.source.addFeatures(features);
        }
      }
    },
    async reload() {
      await this.renderRoute();
      this.timer = setTimeout(async () => {
        if (this.layer && this.layer.getVisible()) {
          await this.reload();
        }
      }, this.interval);
    },
    eventHandler(listenerKey, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);
      this.$emit(listenerKey, evt, feature);
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
    dispose() {
      // 清除定时器
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      // 移除事件
      this.eventRender.forEach((listenerKey) => {
        unByKey(listenerKey);
      });
      this.map.removeLayer(this.layer);
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
