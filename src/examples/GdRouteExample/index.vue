<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <h4>路况图层控制</h4>
      <div class="item">
        <label>
          <input type="checkbox" v-model="routeVisible" />
          显示路况
        </label>
      </div>
      <div class="item">
        <label>
          <input type="checkbox" v-model="showLegend" />
          显示图例
        </label>
      </div>
      <div class="item">
        <label>过滤条件 (where)</label>
        <select v-model="whereClause">
          <option value="">全部道路</option>
          <option value="state in (2,3,4)">拥堵及以上</option>
          <option value="state in (3,4)">严重拥堵</option>
          <option value="state = 4">仅严重拥堵</option>
        </select>
      </div>
      <div class="item">
        <label>线宽</label>
        <input type="range" min="1" max="5" step="0.5" v-model.number="lineWidth" />
        <span>{{ lineWidth }}</span>
      </div>
      <div class="item">
        <label>更新间隔 (ms)</label>
        <input type="number" v-model.number="updateInterval" min="5000" max="120000" step="5000" />
      </div>
      <div class="item">
        <button @click="refreshData">立即刷新</button>
      </div>
      <div class="item" v-if="clickedFeature">
        <h5>选中道路信息</h5>
        <p>名称: {{ clickedFeature.road_name }}</p>
        <p>速度: {{ clickedFeature.speed }} km/h</p>
        <p>状态: {{ clickedFeature.stateText }}</p>
        <p>时间: {{ clickedFeature.travel_time }}</p>
      </div>
    </div>

    <v-map ref="map" :view="view" :interactions="interactions" @click="onMapClick">
      <v-tile tile-type="BD" :z-index="0"></v-tile>
      <v-gd-route
        ref="gdRoute"
        :url="routeUrl"
        :visible="routeVisible"
        :z-index="3"
        :line-width="lineWidth"
        :update-interval="updateInterval"
        :show-legend="showLegend"
        :colors="colors"
        :update-while-interacting="false"
        :declutter="true"
        @click="onFeatureClick"
        @render="onRender"
      ></v-gd-route>
    </v-map>
  </div>
</template>

<script>
import VGDRoute from "@/components/layers/gd-route/index.vue";
export default {
  name: "GdRouteExample",
  components: { "v-gd-route": VGDRoute },
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      interactions: {
        DragRotateAndZoom: true,
        doubleClickZoom: false,
        dragPan: true,
        mouseWheelZoom: true,
      },
      // 路况服务地址（请替换为实际可用的服务地址）
      routeUrl:
        "http://36.248.238.35:8888/admin-api/Features/gd_route_clean/JointFeatureXmGaode?ak=f5ce622f301640a7a1d9b7d7e1ac5f6b",
      routeVisible: true,
      showLegend: true,
      whereClause: "state in (2,3,4)",
      lineWidth: 2,
      updateInterval: 30000,
      colors: ["#34b000", "#fecb00", "#df0100", "#8e0e0b", "#8f979c"],
      clickedFeature: null,
    };
  },
  methods: {
    onFeatureClick(featureInfo) {
      this.clickedFeature = featureInfo;
      console.log("[GdRouteExample] 点击道路:", featureInfo);
    },
    onRender(data) {
      console.log("[GdRouteExample] 路况数据渲染完成, 要素数:", data.features?.length || 0);
    },
    onMapClick(evt) {
      // 地图空白处点击时清除选中
      if (!this.clickedFeature) return;
      // 延迟清除，让 v-gd-route 的 click 事件先处理
      setTimeout(() => {
        this.clickedFeature = null;
      }, 100);
    },
    refreshData() {
      const gdRoute = this.$refs.gdRoute;
      if (gdRoute && typeof gdRoute.updateData === "function") {
        gdRoute.updateData();
      }
    },
  },
};
</script>

<style scoped>
.tool {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  max-width: 280px;
}

.tool h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
}

.item {
  margin-bottom: 10px;
}

.item label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #555;
}

.item input[type="range"] {
  flex: 1;
}

.item input[type="number"],
.item select {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
}

.item button {
  width: 100%;
  padding: 6px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.item button:hover {
  background: #40a9ff;
}

.item h5 {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: #333;
}

.item p {
  margin: 3px 0;
  font-size: 11px;
  color: #666;
}
</style>
