<template>
  <div class="draw-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-vector :features="drawnFeatures" />
      <v-draw v-if="isDrawing" :type="drawType" @drawend="onDrawEnd" />
    </v-map>
    <div class="toolbar">
      <button
        v-for="tool in tools"
        :key="tool.type"
        :class="{ active: drawType === tool.type && isDrawing }"
        @click="selectTool(tool.type)"
      >
        {{ tool.label }}
      </button>
      <button @click="stopDrawing">停止</button>
      <button @click="drawnFeatures = []">清除</button>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector, VDraw } from "v-ol-map";

export default {
  name: "DrawExample",
  components: { VMap, VTile, VVector, VDraw },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 13, projection: "EPSG:4326" },
      isDrawing: false,
      drawType: "Point",
      drawnFeatures: [],
      tools: [
        { type: "Point", label: "点" },
        { type: "LineString", label: "线" },
        { type: "Polygon", label: "面" },
        { type: "Circle", label: "圆" },
      ],
    };
  },
  methods: {
    selectTool(type) {
      this.drawType = type;
      this.isDrawing = true;
    },
    stopDrawing() {
      this.isDrawing = false;
    },
    onDrawEnd(feature) {
      const geom = feature.getGeometry();
      this.drawnFeatures.push({
        type: this.drawType,
        coordinates: geom.getCoordinates(),
        id: `drawn-${Date.now()}`,
        style: {
          fill: { color: "rgba(67, 126, 255, 0.3)" },
          stroke: { color: "#437eff", width: 2 },
        },
      });
    },
  },
};
</script>

<style scoped>
.draw-example {
  position: relative;
}
.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.toolbar button {
  margin-right: 5px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.toolbar button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}
</style>
