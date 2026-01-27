<template>
  <div class="map-methods-example">
    <v-map ref="map" :view="view" style="width: 100%; height: 600px" @load="onMapLoad">
      <v-tile tile-type="TD" />
      <v-vector :features="features" />
    </v-map>
    <div class="controls">
      <!-- 视图移动 -->
      <div class="control-group">
        <div class="group-title">视图移动</div>
        <div class="btn-row">
          <button @click="panTo">平移到厦门</button>
          <button @click="flyTo">飞行到杭州</button>
        </div>
      </div>

      <!-- 缩放控制 -->
      <div class="control-group">
        <div class="group-title">缩放控制</div>
        <div class="btn-row">
          <button @click="setZoom(10)">Zoom 10</button>
          <button @click="setZoom(14)">Zoom 14</button>
          <button @click="setZoom(16)">Zoom 16</button>
        </div>
        <div class="btn-row">
          <button @click="setMaxZoom(15)">最大 15</button>
          <button @click="setMinZoom(8)">最小 8</button>
          <button @click="resetZoomLimits">重置限制</button>
        </div>
      </div>

      <!-- 视图适应 -->
      <div class="control-group">
        <div class="group-title">视图适应</div>
        <div class="btn-row">
          <button @click="fitToExtent">适应范围</button>
          <button @click="fitToFeatures">适应要素</button>
        </div>
      </div>

      <!-- 工具方法 -->
      <div class="control-group">
        <div class="group-title">工具方法</div>
        <div class="btn-row">
          <button @click="exportPNG">导出 PNG</button>
          <button @click="getDistance">计算距离</button>
        </div>
      </div>

      <!-- 信息显示 -->
      <div v-if="info" class="info-box">
        {{ info }}
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector } from "v-ol-map";

export default {
  name: "MapMethodsExample",
  components: { VMap, VTile, VVector },
  data() {
    return {
      view: {
        center: [118.0894, 24.4798],
        zoom: 12,
        projection: "EPSG:4326",
      },
      features: [
        {
          id: "point1",
          coordinates: [118.08, 24.47],
          style: {
            circle: { radius: 8, fill: { color: "#1890ff" }, stroke: { color: "#fff", width: 2 } },
          },
          properties: { name: "点位 A" },
        },
        {
          id: "point2",
          coordinates: [118.12, 24.5],
          style: {
            circle: { radius: 8, fill: { color: "#52c41a" }, stroke: { color: "#fff", width: 2 } },
          },
          properties: { name: "点位 B" },
        },
      ],
      info: "",
    };
  },
  methods: {
    onMapLoad(map) {
      console.log("地图加载完成", map);
    },
    // 视图移动
    panTo() {
      this.$refs.map.panTo({
        zoom: 13,
        center: [118.137676, 24.494068],
      });
      this.info = "panTo: 平移到厦门";
    },
    flyTo() {
      this.$refs.map.flyTo({
        zoom: 13,
        flyZoom: 6,
        center: [120.12636, 30.230779],
      });
      this.info = "flyTo: 飞行到杭州";
    },
    // 缩放控制
    setZoom(zoom) {
      this.$refs.map.setZoom(zoom);
      this.info = `setZoom: 设置缩放级别为 ${zoom}`;
    },
    setMaxZoom(zoom) {
      this.$refs.map.setMaxZoom(zoom);
      this.info = `setMaxZoom: 最大缩放级别设为 ${zoom}`;
    },
    setMinZoom(zoom) {
      this.$refs.map.setMinZoom(zoom);
      this.info = `setMinZoom: 最小缩放级别设为 ${zoom}`;
    },
    resetZoomLimits() {
      this.$refs.map.setMaxZoom(18);
      this.$refs.map.setMinZoom(1);
      this.info = "已重置缩放限制: min=1, max=18";
    },
    // 视图适应
    fitToExtent() {
      // 厦门岛范围
      const extent = [118.05, 24.42, 118.18, 24.52];
      this.$refs.map.fit(extent, {
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
      this.info = "fit: 适应到指定范围";
    },
    fitToFeatures() {
      // 根据要素坐标计算范围
      const coords = this.features.map((f) => f.coordinates);
      const extent = this.$refs.map.boundingExtent(coords);
      this.$refs.map.fit(extent, {
        duration: 1000,
        padding: [80, 80, 80, 80],
        maxZoom: 15,
      });
      this.info = "fit + boundingExtent: 适应到要素范围";
    },
    // 工具方法
    exportPNG() {
      this.$refs.map.exportPNG("map-export");
      this.info = "exportPNG: 已导出地图截图";
    },
    getDistance() {
      const from = this.features[0].coordinates;
      const to = this.features[1].coordinates;
      const distance = this.$refs.map.getDistancePoint(from, to, "kilometers");
      this.info = `getDistancePoint: A到B距离 ${distance.toFixed(2)} 公里`;
    },
  },
};
</script>

<style scoped>
.map-methods-example {
  position: relative;
}
.controls {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-width: 280px;
}
.control-group {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}
.control-group:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.group-title {
  font-weight: bold;
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}
.btn-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.btn-row:last-child {
  margin-bottom: 0;
}
.btn-row button {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.btn-row button:hover {
  border-color: #1890ff;
  color: #1890ff;
}
.btn-row button:active {
  background: #e6f7ff;
}
.info-box {
  margin-top: 10px;
  padding: 8px 10px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  font-size: 12px;
  color: #1890ff;
  word-break: break-all;
}
</style>
