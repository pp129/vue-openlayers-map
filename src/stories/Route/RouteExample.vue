<template>
  <div class="route-example">
    <v-map ref="mapRef" :view="view" style="width: 100%; height: 600px" @click="onMapClick">
      <v-tile tile-type="TD" />
      <!-- 途经点图标图层 -->
      <v-vector :features="pointFeatures" :z-index="10" />
      <!-- 路径规划图层 -->
      <v-route
        ref="routeRef"
        :service-url="serviceUrl"
        :route-type="routeType"
        :stops="stops"
        :method="method"
        :show-start="false"
        :show-end="false"
        :show-pass="false"
        :route-style="routeStyle"
        :arrow="arrow"
        @render="onRouteRender"
      />
    </v-map>
    <div class="controls">
      <div class="control-row">
        <label>路由服务:</label>
        <select v-model="routeType" @change="clearRoute">
          <option value="graphhopper">GraphHopper</option>
          <option value="arcgis">ArcGIS</option>
        </select>
      </div>
      <div class="control-row">
        <label>服务地址:</label>
        <input v-model="serviceUrl" type="text" placeholder="输入路由服务地址" />
      </div>
      <div class="control-row">
        <label>
          <input type="checkbox" v-model="showStart" />
          显示起点
        </label>
        <label>
          <input type="checkbox" v-model="showPass" />
          显示途经点
        </label>
        <label>
          <input type="checkbox" v-model="showEnd" />
          显示终点
        </label>
      </div>
      <div class="control-row">
        <label>
          <input type="checkbox" v-model="showArrow" />
          显示箭头
        </label>
      </div>
      <div class="stops-list">
        <div class="stops-header">
          <span>途经点列表 ({{ stops.length }})</span>
          <button @click="clearStops" :disabled="stops.length === 0">清空</button>
        </div>
        <div v-for="(stop, index) in stops" :key="index" class="stop-item">
          <span>{{ index === 0 ? "起" : index === stops.length - 1 ? "终" : "途" }}</span>
          <span>{{ formatCoord(stop) }}</span>
          <button @click="removeStop(index)">×</button>
        </div>
      </div>
      <div class="tip">点击地图添加途经点（至少2个点可规划路径）</div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector, VRoute } from "v-ol-map";

export default {
  name: "RouteExample",
  components: { VMap, VTile, VVector, VRoute },
  data() {
    return {
      view: {
        center: [118.0894, 24.4798],
        zoom: 13,
        projection: "EPSG:4326",
      },
      // GraphHopper 示例服务地址（需替换为实际可用的服务）
      serviceUrl: "http://172.16.34.29:8989/route",
      routeType: "graphhopper",
      method: "GET",
      stops: [],
      showArrow: false,
      routeStyle: {
        line: {
          stroke: { color: "rgba(24, 144, 255, 0.8)", width: 6 },
        },
        start: {
          circle: {
            radius: 12,
            fill: { color: "#52c41a" },
            stroke: { color: "#fff", width: 2 },
          },
          text: { text: "起", fill: { color: "#fff" }, font: "bold 12px sans-serif" },
        },
        end: {
          circle: {
            radius: 12,
            fill: { color: "#f5222d" },
            stroke: { color: "#fff", width: 2 },
          },
          text: { text: "终", fill: { color: "#fff" }, font: "bold 12px sans-serif" },
        },
        pass: {
          circle: {
            radius: 8,
            fill: { color: "#faad14" },
            stroke: { color: "#fff", width: 2 },
          },
        },
      },
    };
  },
  computed: {
    arrow() {
      return this.showArrow
        ? {
            spacing: 100,
            style: {
              icon: {
                src: new URL("../../assets/img/arrow.png", import.meta.url).href,
                scale: 0.5,
              },
            },
          }
        : false;
    },
    // 生成途经点图标 features
    pointFeatures() {
      return this.stops.map((coord, index) => {
        const isStart = index === 0;
        const isEnd = index === this.stops.length - 1 && this.stops.length > 1;
        let style, label;

        if (isStart) {
          style = {
            circle: {
              radius: 14,
              fill: { color: "#52c41a" },
              stroke: { color: "#fff", width: 3 },
            },
            text: {
              text: "起",
              fill: { color: "#fff" },
              font: "bold 12px sans-serif",
            },
          };
          label = "起点";
        } else if (isEnd) {
          style = {
            circle: {
              radius: 14,
              fill: { color: "#f5222d" },
              stroke: { color: "#fff", width: 3 },
            },
            text: {
              text: "终",
              fill: { color: "#fff" },
              font: "bold 12px sans-serif",
            },
          };
          label = "终点";
        } else {
          style = {
            circle: {
              radius: 10,
              fill: { color: "#faad14" },
              stroke: { color: "#fff", width: 2 },
            },
            text: {
              text: String(index),
              fill: { color: "#fff" },
              font: "bold 11px sans-serif",
            },
          };
          label = `途经点 ${index}`;
        }

        return {
          id: `stop-${index}`,
          coordinates: coord,
          style,
          properties: { label, index },
        };
      });
    },
  },
  methods: {
    onMapClick(evt) {
      // 获取点击坐标
      if (evt && evt.coordinate) {
        this.stops = [...this.stops, evt.coordinate];
      }
    },
    onRouteRender(routeData, map, features) {
      console.log("路径规划完成", { routeData, features });
    },
    removeStop(index) {
      this.stops = this.stops.filter((_, i) => i !== index);
    },
    clearStops() {
      this.stops = [];
    },
    clearRoute() {
      this.stops = [];
    },
    formatCoord(coord) {
      if (!coord) return "-";
      return `${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}`;
    },
  },
};
</script>

<style scoped>
.route-example {
  position: relative;
}
.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 350px;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.control-row label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.control-row select,
.control-row input[type="text"] {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}
.stops-list {
  margin-top: 10px;
  border-top: 1px solid #e8e8e8;
  padding-top: 10px;
}
.stops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 14px;
}
.stops-header button {
  padding: 2px 8px;
  border: none;
  background: #ff4d4f;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.stops-header button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
.stop-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 13px;
}
.stop-item span:first-child {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1890ff;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
}
.stop-item span:nth-child(2) {
  flex: 1;
  font-family: monospace;
}
.stop-item button {
  padding: 0 6px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 16px;
}
.stop-item button:hover {
  color: #ff4d4f;
}
.tip {
  margin-top: 10px;
  padding: 8px;
  background: #e6f7ff;
  border-radius: 4px;
  font-size: 13px;
  color: #1890ff;
  text-align: center;
}
</style>
