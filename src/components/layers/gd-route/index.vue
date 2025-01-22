<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import { GeoJSON } from "ol/format";
import VectorSource from "ol/source/Vector";
import WebGLVector from "ol/layer/WebGLVector";
import VectorLayer from "ol/layer/Vector";
import { unByKey } from "ol/Observable";
import { Stroke, Style } from "ol/style";
import { throttle } from "throttle-debounce";

export default {
  name: "v-gd-route",
  render() {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    className: {
      type: String,
      default: "gd-route-layer",
    },
    layerId: {
      type: String,
      default() {
        return `traffic-layer-${nanoid()}`;
      },
    },
    // 自动跟新频率（ms）
    interval: {
      type: Number,
      default: 30000,
    },
    // 拥堵程度颜色
    colors: {
      type: Array,
      default() {
        //  return ["rgba(0,192,73,0.99609375)", "rgba(242,48,48,0.99609375)", "rgba(255,159,25,0.99609375)"];
        // return ["#4fd27d", "#ffd045", "#e80e0e", "#b40000", "#8f979c"];
        return ["rgba(0,192,73,0.99609375)", "rgba(255,159,25,0.99609375)", "#e80e0e", "#b40000", "#8f979c"];
      },
    },
    // 服务地址
    url: String,
    // 过滤条件
    where: String,
    // 是否使用WebGLVector
    webGl: {
      type: Boolean,
      default: false,
    },
    // 路况线宽
    lineWidth: {
      type: [Number, String],
      default: 2,
    },
    // 查询范围内的路况
    geometry: Object,
    // 以视窗为范围
    inViewport: {
      type: Boolean,
      default: true,
    },
    lowLevel: {
      type: Number,
      default: 14,
    },
    lowLevelClass: {
      type: String,
      default: "(1,2,3)",
    },
    midLevelClass: {
      type: String,
      default: "(1,2,3,4)",
    },
    highLevel: {
      type: Number,
      default: 16,
    },
    highLevelClass: {
      type: String,
      default: "(1,2,3,4,5)",
    },
  },
  data() {
    return {
      source: null,
      layer: null,
      eventList: ["singleclick"],
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
    webGl: {
      handler() {
        this.dispose();
        this.init();
      },
      immediate: false,
      deep: true,
    },
    geometry: {
      handler() {
        this.dispose();
        this.init();
      },
      immediate: false,
      deep: true,
    },
    where: {
      handler() {
        this.dispose();
        this.init();
      },
      immediate: false,
      deep: true,
    },
    inViewport: {
      handler() {
        this.dispose();
        this.init();
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    getColor(state) {
      // console.log("getColor", state);
      if (state === 1) {
        return this.colors[0];
      } else if (state === 2) {
        return this.colors[1];
      } else if (state === 3) {
        return this.colors[2];
      } else if (state === 4) {
        return this.colors[3];
      } else if (state === -1) {
        return this.colors[4];
      } else {
        return this.colors[0];
      }
    },
    async getData() {
      const form = new FormData();
      form.append("f", "geojson");
      form.append("returnGeometry", true);
      form.append("resultRecordCount", 50000);
      const zoom = this.map.getView().getZoom();
      // console.log(zoom);
      if (zoom < this.lowLevel) {
        if (this.where) {
          form.append("where", `roadclass in ${this.lowLevelClass} and ${this.where}`);
        } else {
          form.append("where", `roadclass in ${this.lowLevelClass}`);
        }
      } else if (zoom >= this.lowLevel && zoom < this.highLevel) {
        if (this.where) {
          form.append("where", `roadclass in ${this.midLevelClass} and ${this.where}`);
        } else {
          form.append("where", `roadclass in ${this.midLevelClass}`);
        }
      } else if (zoom >= this.highLevel) {
        if (this.where) {
          form.append("where", `roadclass in ${this.highLevelClass} and ${this.where}`);
        } else {
          form.append("where", `roadclass in ${this.highLevelClass}`);
        }
      }

      if (this.inViewport) {
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
      } else {
        if (this.geometry && Object.keys(this.geometry).length > 0) form.append("geometry", JSON.stringify(this.geometry));
      }
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
    setLayer() {
      if (this.webGl) {
        const layerOpt = {
          ...this.$props,
          source: this.source,
          style: {
            "stroke-color": [
              "case",
              ["==", ["get", "state"], 1],
              this.colors[0],
              ["==", ["get", "state"], 2],
              this.colors[1],
              ["==", ["get", "state"], 3],
              this.colors[2],
              ["==", ["get", "state"], 4],
              this.colors[3],
              ["==", ["get", "state"], -1],
              this.colors[4],
              this.colors[4],
            ],
            "stroke-width": this.lineWidth,
          },
        };
        return new WebGLVector(layerOpt);
      } else {
        const layerOpt = {
          ...this.$props,
          source: this.source,
          style: (feature) => {
            const state = feature.get("state");
            const color = this.getColor(Number(state));
            // console.log("121", color);
            return new Style({
              stroke: new Stroke({
                color: color,
                width: this.lineWidth,
              }),
            });
          },
        };
        return new VectorLayer(layerOpt);
      }
    },
    async init() {
      if (!this.url) {
        return;
      }
      this.source = new VectorSource();
      this.layer = this.setLayer();
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
    renderRoute: throttle(2000, async function () {
      const data = await this.getData();
      const { featureCount } = data;
      if (featureCount > 0) {
        const features = new GeoJSON().readFeatures(data);
        if (this.source) {
          this.source.clear();
          this.source.addFeatures(features);
          this.$emit("render", data);
        }
      }
    }),
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
