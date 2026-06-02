<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 基础瓦片图层 -->
      <v-tile tile-type="TD" :z-index="0" />

      <!-- 聚合图层 -->
      <v-super-cluster
        ref="cluster"
        :features="clusterFeatures"
        :z-index="10"
        :cluster="cluster"
        @load="onClusterLoad"
        @precompose="updateClusterCount"
        @singleclick="onClusterClick"
      />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label>聚合距离: {{ cluster.radius }}px</label>
        <input type="range" v-model.number="cluster.radius" min="20" max="100" step="10" />
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
      clusterCount: 0,
      cluster: {
        radius: 60,
        style: [
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
            max: Infinity,
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
      },
    };
  },
  mounted() {
    // 初始生成 2000 个点
    this.generatePoints(2000);
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

    onClusterClick(evt, feature) {
      console.log(evt, feature);
      if (!feature) return;
      const isClusterFeature = feature.get("cluster");
      const extent = feature.get("geometry").getExtent();
      this.map.getView().fit(extent, {
        duration: 500,
        padding: [50, 50, 50, 50],
        maxZoom: 16,
      });
      if (!isClusterFeature) {
        // 点击聚合点，放大地图
        const props = feature.get("properties");
        alert(`点击了: ${props.name || "未命名点"}`);
      } else {
        const id = feature.get("cluster_id");
        const leaves = this.$refs.cluster.getLeaves(id);
        console.log(leaves);
      }
    },

    /**
     * 生成随机点
     */
    generatePoints(count) {
      const points = [];
      const centerLon = 118.0894;
      const centerLat = 24.4798;
      const spread = 0.1; // 散布范围（调小以便点更集中、聚合效果更直观）
      const startIndex = this.clusterFeatures.length;

      for (let i = 0; i < count; i++) {
        const randomLon = centerLon + (Math.random() - 0.5) * spread;
        const randomLat = centerLat + (Math.random() - 0.5) * spread;
        const index = startIndex + i;

        points.push({
          type: "point",
          coordinates: [randomLon, randomLat],
          id: `cluster-point-${Date.now()}-${index}`,
          style: {
            circle: {
              radius: 5,
              fill: { color: "rgba(59, 130, 246, 0.6)" },
              stroke: { color: "#fff", width: 1 },
            },
          },
          properties: {
            name: `点 ${index + 1}`,
            value: Math.floor(Math.random() * 100),
          },
        });
      }

      // 累加到现有点集（生成新数组引用以触发 features 侦听器重建聚合）
      this.clusterFeatures = this.clusterFeatures.concat(points);
      console.log(`[ClusterExample] 新增 ${count} 个点，当前共 ${this.clusterFeatures.length} 个`);
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
      // 从聚合图层读取当前实际渲染的聚合要素数量（随缩放/平移变化）
      this.$nextTick(() => {
        const cluster = this.$refs.cluster;
        this.clusterCount = cluster && typeof cluster.getFeatureCount === "function" ? cluster.getFeatureCount() : 0;
      });
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
