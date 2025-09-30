<template>
  <div>
    <!-- 交通图例 -->
    <div v-if="showLegend" class="traffic-legend">
      <div class="legend-title">交通状况</div>
      <div class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: colors[0] }"></span>
        <span class="legend-text">畅通</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: colors[1] }"></span>
        <span class="legend-text">缓慢</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: colors[2] }"></span>
        <span class="legend-text">拥堵</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: colors[3] }"></span>
        <span class="legend-text">严重拥堵</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: colors[4] }"></span>
        <span class="legend-text">无数据</span>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { nanoid } from "nanoid";
import BaseLayer from "../BaseLayer.vue";
import LineString from "ol/geom/LineString";
import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { debounce } from "throttle-debounce";
import { create as createTransform, compose as composeTransform } from "ol/transform";
import CanvasImmediateRenderer from "ol/render/canvas/Immediate";
import { addLayerToParentComp } from "@/utils/parent";

export default {
  name: "v-gd-route",
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
    // 自动更新频率（ms）
    updateInterval: {
      type: Number,
      default: 30000,
    },
    // 显示图例
    showLegend: {
      type: Boolean,
      default: false,
    },
    // 服务地址
    url: {
      type: String,
      required: true,
    },
    // 请求参数
    requestParams: {
      type: Object,
      default: () => ({
        f: "geojson",
        returnGeometry: true,
        resultRecordCount: 50000,
      }),
    },
    // 过滤条件
    where: String,
    // 查询范围内的路况（GeoJSON字符串）
    geometry: String,
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
      updateTimer: null,
      layer: null,
      trafficFeatures: [], // 存储交通要素
      hoveredFeatureId: null, // 当前悬浮的要素ID
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
        this.debouncedUpdateTrafficData();
      },
      immediate: false,
      deep: true,
    },
    where: {
      handler() {
        this.debouncedUpdateTrafficData();
      },
      immediate: false,
      deep: true,
    },
    visible: {
      handler(visible) {
        if (this.layer) {
          if (visible) {
            this.startUpdate();
          } else {
            this.stopUpdate();
          }
        }
      },
      immediate: false,
    },
    updateInterval: {
      handler() {
        if (this.visible) {
          this.startUpdate();
        }
      },
      immediate: false,
    },
    colors: {
      handler() {
        this.debouncedUpdateTrafficData();
      },
      immediate: false,
      deep: true,
    },
    lineWidth: {
      handler() {
        this.debouncedUpdateTrafficData();
      },
      immediate: false,
    },
    url: {
      handler() {
        this.debouncedUpdateTrafficData();
      },
      immediate: false,
    },
    requestParams: {
      handler() {
        this.debouncedUpdateTrafficData();
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    // 根据地图缩放级别生成道路级别过滤参数
    generateWhereParam(zoom) {
      if (zoom <= this.lowLevel) {
        return `roadclass in ${this.lowLevelClass}`;
      } else if (zoom <= this.highLevel) {
        return `roadclass in ${this.midLevelClass}`;
      } else {
        return `roadclass in ${this.highLevelClass}`;
      }
    },
    // 获取完整的where参数，包含层级过滤和附加条件
    getCurrentWhereParam() {
      const currentZoom = this.map?.getView().getZoom() || 10;
      const baseWhere = this.generateWhereParam(currentZoom);

      if (this.where && this.where.trim()) {
        return `${baseWhere} AND (${this.where.trim()})`;
      }

      return baseWhere;
    },
    // 根据当前地图视窗范围生成Polygon GeoJSON
    getCurrentExtentGeometry() {
      if (!this.map) {
        return "";
      }

      try {
        const view = this.map.getView();
        const extent = view.calculateExtent(this.map.getSize());
        const [minX, minY, maxX, maxY] = extent;

        const polygon = {
          type: "Polygon",
          coordinates: [
            [
              [minX, minY],
              [maxX, minY],
              [maxX, maxY],
              [minX, maxY],
              [minX, minY],
            ],
          ],
        };

        return JSON.stringify(polygon);
      } catch (error) {
        console.warn("Failed to generate extent geometry:", error);
        return "";
      }
    },
    // 获取当前的geometry参数
    getCurrentGeometryParam() {
      if (this.geometry && this.geometry.trim()) {
        return this.geometry.trim();
      }
      return this.getCurrentExtentGeometry();
    },
    // 根据state值获取对应的颜色
    getColorByState(state) {
      const colorMap = {
        1: 0, // 畅通
        2: 1, // 缓慢
        3: 2, // 拥堵
        4: 3, // 严重拥堵
        [-1]: 4, // 无数据
      };

      const colorIndex = colorMap[state];
      return colorIndex !== undefined ? this.colors[colorIndex] : this.colors[4];
    },
    // 获取状态文本
    getStateText(state) {
      const stateMap = {
        1: "畅通",
        2: "缓慢",
        3: "拥堵",
        4: "严重拥堵",
        [-1]: "无数据",
      };
      return stateMap[state] || "未知";
    },
    // 计算点到线段的距离
    distanceToLineSegment(point, start, end) {
      const [px, py] = point;
      const [sx, sy] = start;
      const [ex, ey] = end;

      const lengthSquared = (ex - sx) * (ex - sx) + (ey - sy) * (ey - sy);

      if (lengthSquared === 0) {
        return Math.sqrt((px - sx) * (px - sx) + (py - sy) * (py - sy));
      }

      const t = Math.max(0, Math.min(1, ((px - sx) * (ex - sx) + (py - sy) * (ey - sy)) / lengthSquared));
      const projectionX = sx + t * (ex - sx);
      const projectionY = sy + t * (ey - sy);

      return Math.sqrt((px - projectionX) * (px - projectionX) + (py - projectionY) * (py - projectionY));
    },
    // 检测鼠标位置是否在要素上
    getFeatureAtPixel(pixel) {
      if (!this.map) return null;

      const coordinate = this.map.getCoordinateFromPixel(pixel);
      if (!coordinate) return null;

      const tolerance = (this.map.getView().getResolution() || 1) * 5;

      for (const feature of this.trafficFeatures) {
        const geometry = feature.getGeometry();
        if (geometry && geometry.getType() === "LineString") {
          const coordinates = geometry.getCoordinates();

          for (let i = 0; i < coordinates.length - 1; i++) {
            const start = coordinates[i];
            const end = coordinates[i + 1];

            const distance = this.distanceToLineSegment(coordinate, start, end);
            if (distance <= tolerance) {
              return feature;
            }
          }
        }
      }

      return null;
    },
    // 鼠标移动事件处理
    handleMouseMove(event) {
      if (!this.map) return;

      const pixel = this.map.getEventPixel(event.originalEvent);
      const feature = this.getFeatureAtPixel(pixel);

      if (feature) {
        this.map.getTargetElement().style.cursor = "pointer";
        const featureId = feature.get("gid") || "unknown";
        if (this.hoveredFeatureId !== featureId) {
          this.hoveredFeatureId = featureId;
        }
      } else {
        this.map.getTargetElement().style.cursor = "default";
        if (this.hoveredFeatureId !== null) {
          this.hoveredFeatureId = null;
        }
      }
    },
    // 鼠标点击事件处理
    handleMapClick(event) {
      if (!this.map) return;

      const pixel = this.map.getEventPixel(event.originalEvent);
      const feature = this.getFeatureAtPixel(pixel);

      if (feature) {
        const featureInfo = {
          road_name: feature.get("road_name") || "未知道路",
          speed: feature.get("speed") || 0,
          state: feature.get("state") || -1,
          travel_time: feature.get("travel_time") || "未知",
          length: feature.get("length") || "未知",
          color: this.getColorByState(feature.get("state") || -1),
          stateText: this.getStateText(feature.get("state") || -1),
          coordinate: event.coordinate,
          feature_id: feature.get("feature_id") || "",
          gid: feature.get("gid") || "",
        };

        // emit点击事件，由父组件处理信息显示
        this.$emit("click", featureInfo);
      }
    },
    // 加载交通数据
    async loadTrafficDataFromJson() {
      try {
        const formData = new FormData();

        Object.entries(this.requestParams || {}).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        const whereParam = this.getCurrentWhereParam();
        formData.append("where", whereParam);

        const geometryParam = this.getCurrentGeometryParam();
        if (geometryParam) {
          formData.append("geometry", geometryParam);
        }

        const response = await fetch(this.url, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        // 触发数据渲染事件
        this.$emit("render", data);

        const features = [];

        if (data.features && Array.isArray(data.features)) {
          data.features.forEach((item) => {
            if (item.geometry && item.geometry.type === "LineString") {
              const lineString = new LineString(item.geometry.coordinates);
              const state = item.properties.state || -1;
              const color = this.getColorByState(state);

              const style = new Style({
                stroke: new Stroke({
                  color: color,
                  width: this.lineWidth,
                }),
              });

              const feature = new Feature({
                geometry: lineString,
                road_name: item.properties.road_name,
                speed: parseFloat(item.properties.speed) || 0,
                state: item.properties.state,
                travel_time: item.properties.travel_time,
                length: item.properties.length,
                feature_id: item.properties.gid?.toString() || "",
                gid: item.properties.gid,
              });

              feature.setStyle(style);
              features.push(feature);
            }
          });
        }

        return features;
      } catch (error) {
        console.warn("Failed to load traffic data from URL:", error);
        return [];
      }
    },
    // 生成Canvas矢量上下文
    getCanvasVectorContext(canvas, extent, resolution, pixelRatio) {
      if (!this.map || this.trafficFeatures.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const transform = createTransform();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const extentWidth = extent[2] - extent[0];
      const extentHeight = extent[3] - extent[1];
      const scaleX = canvasWidth / extentWidth;
      const scaleY = canvasHeight / extentHeight;

      composeTransform(transform, 0, canvasHeight, scaleX, -scaleY, 0, -extent[0], -extent[1]);

      const immediateRenderer = new CanvasImmediateRenderer(ctx, pixelRatio, extent, transform, 0);

      this.trafficFeatures.forEach((feature) => {
        const geometry = feature.getGeometry();
        const style = feature.getStyle();

        if (geometry && style) {
          immediateRenderer.setStyle(style);
          immediateRenderer.drawGeometry(geometry);
        }
      });
    },
    // 初始化交通层
    initTrafficLayer() {
      if (!this.map) return;

      const imageCanvasSource = new ImageCanvasSource({
        canvasFunction: (extent, resolution, pixelRatio, size) => {
          const canvas = document.createElement("canvas");
          canvas.width = size[0];
          canvas.height = size[1];

          this.getCanvasVectorContext(canvas, extent, resolution, pixelRatio);

          return canvas;
        },
        ratio: 1,
      });

      this.layer = new ImageLayer({
        ...this.$props,
        source: imageCanvasSource,
      });

      const layerId = this.layerId || `route-layer-${nanoid()}`;
      this.layer.set("id", layerId);

      addLayerToParentComp({
        type: this.$parent.$options.name,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });

      this.debouncedUpdateTrafficData();
    },
    // 更新交通数据
    async updateTrafficData() {
      if (!this.layer) return;

      try {
        this.trafficFeatures = await this.loadTrafficDataFromJson();

        const source = this.layer.getSource();
        source.changed();
      } catch (error) {
        console.warn("Failed to update traffic data:", error);
      }
    },
    // 启动定时更新
    startUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
      }

      this.updateTimer = setInterval(() => {
        this.updateTrafficData();
      }, this.updateInterval);
    },
    // 停止定时更新
    stopUpdate() {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }
    },
    // 地图缩放级别变化处理
    mapZoomHandler() {
      this.debouncedUpdateTrafficData();
    },
    // 地图移动处理
    mapMoveHandler() {
      if (!this.geometry) {
        this.debouncedUpdateTrafficData();
      }
    },
    // 清理资源
    dispose() {
      this.stopUpdate();

      if (this.map) {
        this.map.getView().un("change:resolution", this.mapZoomHandler);
        this.map.getView().un("change:center", this.mapMoveHandler);
        this.map.un("pointermove", this.handleMouseMove);
        this.map.un("click", this.handleMapClick);
        this.map.getTargetElement().style.cursor = "default";
      }

      if (this.debouncedUpdateTrafficData) {
        this.debouncedUpdateTrafficData.cancel();
      }

      if (this.layer) {
        try {
          if (this.map && this.map.getLayers().getArray().includes(this.layer)) {
            this.map.removeLayer(this.layer);
          }
        } catch (error) {
          console.warn("Failed to remove traffic layer:", error);
        }
      }
    },
    // 暴露给父组件的方法
    getLayer() {
      return this.layer;
    },
    updateData() {
      return this.updateTrafficData();
    },
    startAutoUpdate() {
      this.startUpdate();
    },
    stopAutoUpdate() {
      this.stopUpdate();
    },
    getCurrentWhere() {
      return this.getCurrentWhereParam();
    },
    getCurrentGeometry() {
      return this.getCurrentGeometryParam();
    },
    getCurrentZoom() {
      return this.map?.getView().getZoom() || 10;
    },
    getCurrentExtent() {
      return this.map?.getView().calculateExtent(this.map.getSize());
    },
  },
  created() {
    // 创建防抖版本的数据更新函数，2秒内只会触发一次请求
    this.debouncedUpdateTrafficData = debounce(2000, this.updateTrafficData);
  },
  mounted() {
    if (this.map) {
      this.initTrafficLayer();

      this.map.getView().on("change:resolution", this.mapZoomHandler);
      this.map.getView().on("change:center", this.mapMoveHandler);
      this.map.on("pointermove", this.handleMouseMove);
      this.map.on("click", this.handleMapClick);

      if (this.visible) {
        this.startUpdate();
      }
    }
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>

<style scoped>
.traffic-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 12px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.legend-color {
  width: 16px;
  height: 3px;
  margin-right: 6px;
  border-radius: 2px;
}

.legend-text {
  color: #666;
}
</style>
