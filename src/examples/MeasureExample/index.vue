<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 基础瓦片图层 -->
      <v-tile tile-type="TD" :z-index="0" />

      <!-- 测量图层 -->
      <v-measure
        v-if="isActive"
        :type="measureType"
        :modifiable="modifiable"
        :segments="showSegments"
        @load="onMeasureLoad"
        @drawstart="onDrawStart"
        @drawend="onDrawEnd"
        @modifyend="onModifyEnd"
        @measuring="onMeasuring"
      />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>测量工具</h3>

      <div class="tool-buttons">
        <button :class="{ active: isActive && measureType === 'LineString' }" @click="startMeasure('LineString')">
          📏 测量距离
        </button>
        <button :class="{ active: isActive && measureType === 'Polygon' }" @click="startMeasure('Polygon')">📐 测量面积</button>
        <button :class="{ danger: true }" @click="stopMeasure" :disabled="!isActive">⏹ 停止测量</button>
      </div>

      <div class="options">
        <label>
          <input type="checkbox" v-model="modifiable" />
          允许修改测量结果
        </label>
        <label>
          <input type="checkbox" v-model="showSegments" />
          显示分段测量
        </label>
      </div>

      <div class="measurements" v-if="measurements.length > 0">
        <h4>测量记录</h4>
        <div v-for="(item, index) in measurements" :key="index" class="measurement-item">
          <span class="index">{{ index + 1 }}</span>
          <span class="type">{{ item.type === "LineString" ? "距离" : "面积" }}</span>
          <span class="value">{{ item.value }}</span>
          <button @click="removeMeasurement(index)" class="remove-btn">×</button>
        </div>
      </div>

      <div class="current-measurement" v-if="currentMeasurement">
        <h4>当前测量</h4>
        <div class="value-display">{{ currentMeasurement }}</div>
      </div>

      <div class="tips">
        <h4>💡 使用提示</h4>
        <ul>
          <li>点击地图开始测量</li>
          <li>双击结束测量</li>
          <li>启用修改后可拖动节点调整</li>
          <li>分段测量显示每段长度</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile } from "@/packages";
import VMeasure from "@/packages/components/layers/measure/index.vue";

export default {
  name: "MeasureExample",
  components: {
    VMap,
    VTile,
    VMeasure,
  },
  data() {
    return {
      map: null,
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 14,
        projection: "EPSG:4326",
      },
      isActive: false,
      measureType: "LineString",
      modifiable: true,
      showSegments: true,
      measurements: [],
      currentMeasurement: "",
    };
  },
  methods: {
    onMapLoad(map) {
      this.map = map;
      console.log("[MeasureExample] 地图加载完成");
    },

    onMeasureLoad(layer, map) {
      console.log("[MeasureExample] 测量工具加载完成");
    },

    /**
     * 开始测量
     */
    startMeasure(type) {
      this.measureType = type;
      this.isActive = true;
      this.currentMeasurement = "";
      console.log(`[MeasureExample] 开始${type === "LineString" ? "距离" : "面积"}测量`);
    },

    /**
     * 停止测量
     */
    stopMeasure() {
      this.isActive = false;
      this.currentMeasurement = "";
      console.log("[MeasureExample] 停止测量");
    },

    /**
     * 绘制开始
     */
    onDrawStart(feature) {
      console.log("[MeasureExample] 开始绘制", feature);
      this.currentMeasurement = "测量中...";
    },

    /**
     * 绘制结束
     */
    onDrawEnd({ feature, measurement, coordinate }) {
      console.log("[MeasureExample] 绘制结束", { measurement, coordinate });

      // 记录测量结果
      this.measurements.push({
        type: this.measureType,
        value: measurement,
        timestamp: new Date().toLocaleTimeString(),
      });

      this.currentMeasurement = "";

      this.$nextTick(() => {
        // 可以继续下一次测量
        if (this.measurements.length >= 5) {
          this.$message?.info("已记录5条测量结果，建议清理后继续");
        }
      });
    },

    /**
     * 测量中
     */
    onMeasuring({ output, coordinate }) {
      this.currentMeasurement = output;
    },

    /**
     * 修改结束
     */
    onModifyEnd(features) {
      console.log("[MeasureExample] 修改完成", features.length);

      // 更新对应的测量记录
      if (features.length > 0) {
        const lastFeature = features[features.length - 1];
        const measurement = lastFeature.get("measurement");

        if (measurement && this.measurements.length > 0) {
          // 更新最后一条记录
          const lastIndex = this.measurements.length - 1;
          this.measurements[lastIndex].value = measurement;
        }
      }
    },

    /**
     * 移除测量记录
     */
    removeMeasurement(index) {
      this.measurements.splice(index, 1);
    },

    /**
     * 清空所有测量
     */
    clearAllMeasurements() {
      this.measurements = [];
      // 可以添加清空图层的逻辑
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
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  max-height: 580px;
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.control-panel h4 {
  margin: 15px 0 10px 0;
  font-size: 14px;
  color: #666;
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.tool-buttons button {
  padding: 10px 15px;
  background: #fff;
  border: 2px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.tool-buttons button:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.tool-buttons button.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.tool-buttons button.danger {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.tool-buttons button.danger:hover:not(:disabled) {
  background: #ff4d4f;
  color: white;
}

.tool-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.options {
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 15px;
}

.options label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.options label:last-child {
  margin-bottom: 0;
}

.options input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.measurements {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e8e8e8;
}

.measurement-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 13px;
}

.measurement-item .index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  margin-right: 8px;
  flex-shrink: 0;
}

.measurement-item .type {
  color: #666;
  margin-right: 8px;
  flex-shrink: 0;
}

.measurement-item .value {
  flex: 1;
  color: #333;
  font-weight: bold;
}

.measurement-item .remove-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
}

.measurement-item .remove-btn:hover {
  background: #ff7875;
}

.current-measurement {
  margin-top: 15px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  text-align: center;
}

.current-measurement h4 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 12px;
}

.value-display {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.tips {
  margin-top: 15px;
  padding: 10px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  border-radius: 4px;
}

.tips h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #1890ff;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #666;
}

.tips li {
  margin-bottom: 4px;
}

.tips li:last-child {
  margin-bottom: 0;
}
</style>
