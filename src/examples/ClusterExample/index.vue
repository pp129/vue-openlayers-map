<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 基础瓦片图层 -->
      <v-tile tile-type="TD" :z-index="0" />

      <!-- 聚合图层 -->
      <v-super-cluster
        :features="clusterFeatures"
        :distance="clusterDistance"
        :min-distance="40"
        :z-index="10"
        :style="clusterStyle"
        @load="onClusterLoad"
        @cluster-click="onClusterClick"
      />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label>聚合距离: {{ clusterDistance }}px</label>
        <input type="range" v-model.number="clusterDistance" min="20" max="100" step="10" />
      </div>

      <div class="control-group">
        <label>点数量: {{ clusterFeatures.length }}</label>
        <button @click="generatePoints(100)">生成 100 个点</button>
        <button @click="generatePoints(500)">生成 500 个点</button>
        <button @click="generatePoints(1000)">生成 1000 个点</button>
        <button @click="clearPoints">清除所有</button>
      </div>

      <div class="stats">
        <p>当前显示的聚合点数: {{ clusterCount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VSuperCluster } from "@/packages";

export default {
  name: "ClusterExample",
  components: {
    VMap,
    VTile,
    VSuperCluster,
  },
  data() {
    return {
      map: null,
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 11,
        projection: "EPSG:4326",
      },
      clusterFeatures: [],
      clusterDistance: 60,
      clusterCount: 0,
      clusterStyle: [
        {
          min: 0,
          max: 10,
          circle: {
            radius: 15,
            fill: { color: "rgba(52, 211, 153, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            fill: { color: "#fff" },
            font: "bold 14px sans-serif",
          },
        },
        {
          min: 10,
          max: 50,
          circle: {
            radius: 20,
            fill: { color: "rgba(59, 130, 246, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            fill: { color: "#fff" },
            font: "bold 16px sans-serif",
          },
        },
        {
          min: 50,
          max: 200,
          circle: {
            radius: 25,
            fill: { color: "rgba(251, 146, 60, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            fill: { color: "#fff" },
            font: "bold 18px sans-serif",
          },
        },
        {
          min: 200,
          max: 99999,
          circle: {
            radius: 30,
            fill: { color: "rgba(239, 68, 68, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            fill: { color: "#fff" },
            font: "bold 20px sans-serif",
          },
        },
      ],
    };
  },
  mounted() {
    // 初始生成 100 个点
    this.generatePoints(100);
  },
  methods: {
    onMapLoad(map) {
      this.map = map;
      console.log("[ClusterExample] 地图加载完成");
    },

    onClusterLoad(layer, map) {
      console.log("[ClusterExample] 聚合图层加载完成");
      this.updateClusterCount();
    },

    onClusterClick(feature) {
      const features = feature.get("features");
      if (features && features.length > 1) {
        // 点击聚合点，放大地图
        const extent = feature.getGeometry().getExtent();
        this.map.getView().fit(extent, {
          duration: 500,
          padding: [50, 50, 50, 50],
          maxZoom: 18,
        });
      } else {
        // 单个点，显示详情
        const singleFeature = features[0];
        const props = singleFeature.get("properties");
        alert(`点击了: ${props.name || "未命名点"}`);
      }
    },

    /**
     * 生成随机点
     */
    generatePoints(count) {
      const points = [];
      const centerLon = 118.0894;
      const centerLat = 24.4798;
      const spread = 0.3; // 散布范围

      for (let i = 0; i < count; i++) {
        const randomLon = centerLon + (Math.random() - 0.5) * spread;
        const randomLat = centerLat + (Math.random() - 0.5) * spread;

        points.push({
          type: "point",
          coordinates: [randomLon, randomLat],
          id: `cluster-point-${Date.now()}-${i}`,
          style: {
            circle: {
              radius: 5,
              fill: { color: "rgba(59, 130, 246, 0.6)" },
              stroke: { color: "#fff", width: 1 },
            },
          },
          properties: {
            name: `点 ${i + 1}`,
            value: Math.floor(Math.random() * 100),
          },
        });
      }

      this.clusterFeatures = points;
      console.log(`[ClusterExample] 生成了 ${count} 个点`);
    },

    /**
     * 清除所有点
     */
    clearPoints() {
      this.clusterFeatures = [];
      this.clusterCount = 0;
    },

    /**
     * 更新聚合点数量
     */
    updateClusterCount() {
      // 这个方法可以由聚合图层触发的事件来更新
      // 这里简单模拟
      setTimeout(() => {
        if (this.map) {
          // 实际应该从聚合图层获取
          this.clusterCount = this.clusterFeatures.length;
        }
      }, 100);
    },
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 600px;
}

.control-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 250px;
}

.control-group {
  margin-bottom: 15px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.control-group input[type="range"] {
  width: 100%;
}

.control-group button {
  margin-right: 5px;
  margin-bottom: 5px;
  padding: 8px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.control-group button:hover {
  background: #40a9ff;
}

.stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.stats p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>
