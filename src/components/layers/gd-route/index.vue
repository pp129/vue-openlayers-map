<script>
import BaseLayer from "@/components/layers/BaseLayer.vue";
import webGlVector from "@/components/layers/webGlVector";
import vectorTile from "@/components/layers/vectorTile";
import vectorLayer from "@/components/layers/vector";
import { GeoJSON } from "ol/format";
import { throttle } from "throttle-debounce";
import { createDefaultStyle } from "ol/style/flat";
// import GDRouteFix from "@/utils/GDRouteFix";

export default {
  name: "v-gd-route",
  render(h) {
    let component = webGlVector;
    if (this.rendered === "vt") {
      component = vectorTile;
    } else if (this.rendered === "v") {
      component = vectorLayer;
    } else if (this.rendered === "gl") {
      component = webGlVector;
    }
    if (this.webGl) component = webGlVector;
    return h(component, {
      ref: `${this.rendered}Layer`,
      props: {
        ...this.$props,
        data: this.data,
      },
    });
  },
  extends: BaseLayer,
  inject: ["VMap"],
  components: {
    webGlVector,
    vectorTile,
  },
  props: {
    // 保留这个参数, 默认情况下或者设置了true就强制使用webgl
    webGl: {
      type: Boolean,
      default: true,
    },
    // 如果webGl参数被设置了false, 则使用vt:VectorTile或者v:vector，或者还是设置成gl，默认v
    rendered: {
      type: String,
      default: "v",
      validator: (value) => {
        return ["gl", "vt", "v"].includes(value);
      },
    },
    className: {
      type: String,
      default: "gd-route-layer",
    },
    layerStyle: {
      type: [Object, undefined],
      default: () => {
        return createDefaultStyle();
      },
    },
    // 自动跟新频率（ms）
    interval: {
      type: Number,
      default: 30000,
    },
    // 服务地址
    url: String,
    // 过滤条件
    where: String,
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
    fix: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      layer: null,
      source: null,
      eventList: ["singleclick"],
      eventRender: [],
      timer: null,
      data: null,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    rendered: {
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
    fix: {
      handler() {
        this.dispose();
        this.init();
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
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
    init() {
      if (!this.url) {
        return;
      }
      this.$nextTick(async () => {
        this.layer = this.$refs[this.rendered + "Layer"].layer;
        if (!this.webGl && this.rendered === "v") {
          this.layer.setStyle(this.layerStyle);
        }
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
      });
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
        if (!this.webGl && this.rendered === "v") {
          const source = this.layer?.getSource();
          const features = new GeoJSON().readFeatures(data);
          if (source) {
            source.clear();
            source.addFeatures(features);
          }
        }
        this.data = data;
      }
      this.$emit("render", data);
    }),
    async reload() {
      await this.renderRoute();
      this.timer = setTimeout(async () => {
        if (this.layer && this.layer.getVisible()) {
          await this.reload();
        }
      }, this.interval);
    },
    dispose() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
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
