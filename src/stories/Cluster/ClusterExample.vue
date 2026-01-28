<template>
  <div class="cluster-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-super-cluster :features="features" :distance="60" :min-distance="40" :cluster="{ style: clusterStyle }" />
    </v-map>
    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background-color: rgba(52, 211, 153, 0.8)"></div>
        <span class="legend-text">1-10</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: rgba(59, 130, 246, 0.8)"></div>
        <span class="legend-text">10-50</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: rgba(239, 68, 68, 0.8)"></div>
        <span class="legend-text">50+</span>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VSuperCluster } from "v-ol-map";

export default {
  name: "ClusterExample",
  components: { VMap, VTile, VSuperCluster },
  data() {
    return {
      view: {
        center: [118.0894, 24.4798],
        zoom: 11,
        projection: "EPSG:4326",
      },
      features: this.generatePoints(100),
      clusterStyle: [
        {
          min: 0,
          max: 10,
          circle: {
            radius: 15,
            fill: { color: "rgba(52, 211, 153, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: { fill: { color: "#fff" }, font: "bold 14px sans-serif" },
        },
        {
          min: 10,
          max: 50,
          circle: {
            radius: 20,
            fill: { color: "rgba(59, 130, 246, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: { fill: { color: "#fff" }, font: "bold 16px sans-serif" },
        },
        {
          min: 50,
          max: 99999,
          circle: {
            radius: 25,
            fill: { color: "rgba(239, 68, 68, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: { fill: { color: "#fff" }, font: "bold 18px sans-serif" },
        },
      ],
    };
  },
  methods: {
    generatePoints(count) {
      const points = [];
      for (let i = 0; i < count; i++) {
        points.push({
          type: "point",
          coordinates: [118.0894 + (Math.random() - 0.5) * 0.3, 24.4798 + (Math.random() - 0.5) * 0.3],
          id: `point-${i}`,
          properties: { name: `点 ${i + 1}` },
          style: {
            circle: {
              radius: 5,
              // 黄色圆点
              fill: { color: "rgba(255, 255, 0, 0.8)" },
              stroke: { color: "#fff", width: 2 },
            },
          },
        });
      }
      return points;
    },
  },
};
</script>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px;
  position: absolute;
  right: 10px;
  bottom: 10px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.legend-color {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
.legend-text {
  font-size: 14px;
}
.cluster-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}
.cluster-example .legend {
  margin-top: 20px;
}
.cluster-example .legend .legend-item {
  margin-bottom: 10px;
}
</style>
