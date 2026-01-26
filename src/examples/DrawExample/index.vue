<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 基础瓦片图层 -->
      <v-tile tile-type="TD" :z-index="0" />

      <!-- 矢量图层 - 显示绘制的要素 -->
      <v-vector :features="drawnFeatures" :z-index="10" />

      <!-- 绘制图层 -->
      <v-draw
        v-if="isDrawing"
        :type="drawType"
        :style="drawStyle"
        :freehand="freehand"
        :end-right="endRight"
        @drawend="onDrawEnd"
        @load="onDrawLoad"
      />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label>绘制工具:</label>
        <div class="tool-buttons">
          <button
            v-for="tool in drawTools"
            :key="tool.value"
            :class="{ active: drawType === tool.value && isDrawing }"
            @click="selectDrawTool(tool.value)"
          >
            {{ tool.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="freehand" />
          自由绘制模式
        </label>
        <label>
          <input type="checkbox" v-model="endRight" />
          右键结束绘制
        </label>
      </div>

      <div class="control-group">
        <button @click="stopDrawing" v-if="isDrawing" class="stop-button">停止绘制</button>
        <button @click="clearAll" class="clear-button">清除所有</button>
      </div>

      <div class="stats">
        <p>已绘制要素数: {{ drawnFeatures.length }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector, VDraw } from "@/packages";

export default {
  name: "DrawExample",
  components: {
    VMap,
    VTile,
    VVector,
    VDraw,
  },
  data() {
    return {
      map: null,
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 13,
        projection: "EPSG:4326",
      },
      isDrawing: false,
      drawType: "Point",
      freehand: false,
      endRight: true,
      drawnFeatures: [],
      drawTools: [
        { label: "点", value: "Point" },
        { label: "线", value: "LineString" },
        { label: "多边形", value: "Polygon" },
        { label: "圆", value: "Circle" },
        { label: "矩形", value: "Box" },
      ],
      drawStyle: {
        fill: { color: "rgba(67, 126, 255, 0.3)" },
        stroke: { color: "rgba(67, 126, 255, 1)", width: 2 },
        circle: {
          radius: 6,
          fill: { color: "rgba(67, 126, 255, 0.8)" },
          stroke: { color: "#fff", width: 2 },
        },
      },
    };
  },
  methods: {
    onMapLoad(map) {
      this.map = map;
      console.log("[DrawExample] 地图加载完成");
    },

    onDrawLoad(interaction, map) {
      console.log("[DrawExample] 绘制工具加载完成", interaction);
    },

    /**
     * 选择绘制工具
     */
    selectDrawTool(type) {
      this.drawType = type;
      this.isDrawing = true;
    },

    /**
     * 停止绘制
     */
    stopDrawing() {
      this.isDrawing = false;
    },

    /**
     * 绘制完成
     */
    onDrawEnd(feature) {
      console.log("[DrawExample] 绘制完成", feature);

      // 将绘制的要素添加到数组
      const newFeature = {
        type: this.drawType === "Box" ? "Polygon" : this.drawType,
        coordinates: this.getFeatureCoordinates(feature),
        id: `drawn-feature-${Date.now()}`,
        style: this.getFeatureStyle(this.drawType),
        properties: {
          drawType: this.drawType,
          drawTime: new Date().toLocaleString(),
        },
      };

      this.drawnFeatures = [...this.drawnFeatures, newFeature];

      // 继续绘制
      if (this.isDrawing) {
        // 绘制组件会自动重新激活
      }
    },

    /**
     * 获取要素坐标
     */
    getFeatureCoordinates(feature) {
      const geom = feature.getGeometry();
      const type = geom.getType();

      if (type === "Circle") {
        // 圆形特殊处理，转换为中心点和半径
        return {
          center: geom.getCenter(),
          radius: geom.getRadius(),
        };
      }

      return geom.getCoordinates();
    },

    /**
     * 获取要素样式
     */
    getFeatureStyle(type) {
      const styles = {
        Point: {
          circle: {
            radius: 8,
            fill: { color: "rgba(255, 0, 0, 0.6)" },
            stroke: { color: "#fff", width: 2 },
          },
        },
        LineString: {
          stroke: { color: "rgba(0, 0, 255, 1)", width: 3 },
        },
        Polygon: {
          fill: { color: "rgba(0, 255, 0, 0.3)" },
          stroke: { color: "rgba(0, 255, 0, 1)", width: 2 },
        },
        Circle: {
          fill: { color: "rgba(255, 165, 0, 0.3)" },
          stroke: { color: "rgba(255, 165, 0, 1)", width: 2 },
        },
        Box: {
          fill: { color: "rgba(128, 0, 128, 0.3)" },
          stroke: { color: "rgba(128, 0, 128, 1)", width: 2 },
        },
      };

      return styles[type] || styles.Point;
    },

    /**
     * 清除所有
     */
    clearAll() {
      this.drawnFeatures = [];
      this.stopDrawing();
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
  min-width: 280px;
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

.control-group label input[type="checkbox"] {
  margin-right: 5px;
}

.tool-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tool-buttons button {
  flex: 1;
  min-width: 60px;
  padding: 8px 12px;
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.tool-buttons button:hover {
  background: #e0e0e0;
}

.tool-buttons button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.stop-button {
  width: 100%;
  padding: 8px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 5px;
}

.stop-button:hover {
  background: #ff7875;
}

.clear-button {
  width: 100%;
  padding: 8px 12px;
  background: #faad14;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.clear-button:hover {
  background: #ffc53d;
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
