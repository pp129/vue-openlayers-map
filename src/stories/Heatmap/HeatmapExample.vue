<template>
  <div class="heatmap-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-heatmap :features="features" :blur="15" :radius="10" />
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile, VHeatmap } from "@/packages";

export default {
  name: "HeatmapExample",
  components: { VMap, VTile, VHeatmap },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 12, projection: "EPSG:4326" },
      features: this.generatePoints(200),
    };
  },
  methods: {
    generatePoints(count) {
      const points = [];
      for (let i = 0; i < count; i++) {
        points.push({
          type: "point",
          coordinates: [118.0894 + (Math.random() - 0.5) * 0.2, 24.4798 + (Math.random() - 0.5) * 0.2],
          weight: Math.random(),
        });
      }
      return points;
    },
  },
};
</script>
