<script>
import { nanoid } from "nanoid";
import BaseLayer from "../BaseLayer.vue";
import LineString from "ol/geom/LineString";
import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { throttle } from "throttle-debounce";
import { create as createTransform, multiply as multiplyTransform, compose as composeTransform, makeInverse } from "ol/transform";
import CanvasImmediateRenderer from "ol/render/canvas/Immediate";
import { getSquaredTolerance } from "ol/renderer/vector";
import { getUserProjection, getTransformFromProjections } from "ol/proj";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-gd-route",
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
    className: {
      type: String,
      default: "gd-route-layer",
    },
    colors: {
      type: Array,
      default: () => {
        return ["#34b000", "#fecb00", "#df0100", "#8e0e0b", "#8f979c"];
      },
    },
    lineWidth: {
      type: Number,
      default: 1.5,
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
      timer: null,
      data: null,
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
          ["*", ["get", "state"], this.colors[0]],
        ],
        "stroke-width": this.lineWidth,
      },
      source: null,
      canvas: null,
      layer: null,
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
    geometry: {
      handler() {
        this.dispose();
        this.renderRoute();
      },
      immediate: false,
      deep: true,
    },
    where: {
      handler() {
        this.dispose();
        this.renderRoute();
      },
      immediate: false,
      deep: true,
    },
    inViewport: {
      handler() {
        this.dispose();
        this.renderRoute();
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    // 获取路况数据
    async getData() {
      const form = new FormData();
      form.append("f", "geojson");
      form.append("returnGeometry", true);
      form.append("resultRecordCount", 50000);
      const zoom = this.map.getView().getZoom();
      // 根据层级判断显示道路级别
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
      // 是否以视窗为范围
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
        // 显示指定范围内的路况
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
    setColors(state) {
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
    setLineStyle(state) {
      return new Style({
        stroke: new Stroke({
          color: this.setColors(state),
          width: this.lineWidth,
        }),
      });
    },
    async setSource() {
      const data = await this.getData();
      const { features } = data;
      this.$emit("render", data);
      return new ImageCanvasSource({
        canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
          const vc = this.getCanvasVectorContext(extent, resolution, pixelRatio, size, projection);
          // console.log(size);
          if (features && features.length > 0) {
            features.forEach((item) => {
              var anchor = new Feature({
                geometry: new LineString(item.geometry.coordinates),
              });
              anchor.setProperties(item.properties);
              const lineStyle = this.setLineStyle(anchor.get("state"));
              vc.drawFeature(anchor, lineStyle);
            });
          }
          return this.canvas;
        },
        projection: "EPSG:4326",
      });
    },
    async init() {
      if (!this.url) {
        return;
      }
      this.canvas = document.createElement("canvas");
      this.source = await this.setSource();
      this.layer = new ImageLayer({
        source: this.source,
      });
      const layerId = this.layerId || `route-layer-${nanoid()}`;
      this.layer.set("id", layerId);
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

      this.$nextTick(async () => {
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
      this.source = await this.setSource();
      this.source.refresh();
      this.layer.setSource(this.source);
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
    getCanvasVectorContext(extent, resolution, pixelRatio, size, projection) {
      this.canvas.width = size[0] * 1;
      this.canvas.height = size[1] * 1;
      let width = Math.round(size[0] * 1);
      let height = Math.round(size[1] * 1);
      let context = this.canvas.getContext("2d");
      let coordinateToPixelTransform = createTransform();
      let pixelTransform = createTransform();
      let inversePixelTransform = createTransform();

      let rotation = this.map.getView().getRotation();
      let center = this.map.getView().getCenter();
      composeTransform(
        coordinateToPixelTransform,
        size[0] / 2,
        size[1] / 2,
        1 / resolution,
        -1 / resolution,
        -rotation,
        -center[0],
        -center[1]
      );
      composeTransform(
        pixelTransform,
        size[0] / 2,
        size[1] / 2,
        1 / pixelRatio,
        1 / pixelRatio,
        rotation,
        -width / 2,
        -height / 2
      );
      makeInverse(inversePixelTransform, pixelTransform);
      const transform = multiplyTransform(inversePixelTransform.slice(), coordinateToPixelTransform);
      const squaredTolerance = getSquaredTolerance(resolution, pixelRatio);
      let userTransform;
      const userProjection = getUserProjection();
      if (userProjection) {
        userTransform = getTransformFromProjections(userProjection, projection);
      }
      return new CanvasImmediateRenderer(context, pixelRatio, extent, transform, rotation, squaredTolerance, userTransform);
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
