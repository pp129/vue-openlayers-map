<template>
  <div class="measure-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-measure v-if="isMeasuring" :type="measureType" @bindbindBindBindBindBindMeasureEnd="onMeasureEnd" />
    </v-map>
    <div class="toolbar">
      <button :class="{ active: measureType === 'LineString' && isMeasuring }" @click="startMeasure('LineString')">测距</button>
      <button :class="{ active: measureType === 'Polygon' && isMeasuring }" @click="startMeasure('Polygon')">测面</button>
      <button @click="stopMeasure">停止</button>
    </div>
    <div class="result" v-if="measureResult">{{ measureResult }}</div>
  </div>
</template>

<script>
import { VMap, VTile, VMeasure } from "v-ol-map";

export default {
  name: "MeasureExample",
  components: { VMap, VTile, VMeasure },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 13, projection: "EPSG:4326" },
      isMeasuring: false,
      measureType: "LineString",
      measureResult: "",
    };
  },
  methods: {
    startMeasure(type) {
      this.measureType = type;
      this.isMeasuring = true;
    },
    stopMeasure() {
      this.isMeasuring = false;
    },
    onMeasureEnd(result) {
      this.measureResult = result;
    },
  },
};
</script>

<style scoped>
.measure-example {
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
.result {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 4px;
}
</style>
