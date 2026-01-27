<template>
  <div class="graphic-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-graphic :features="features" :feature-style="featureStyle" />
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile, VGraphic } from "@/packages";

export default {
  name: "GraphicExample",
  components: { VMap, VTile, VGraphic },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 12, projection: "EPSG:4326" },
      features: this.generatePoints(100),
      featureStyle: {
        circle: {
          radius: 6,
          fill: { color: "#3399CC" },
          stroke: { color: "#ffffff", width: 2 },
        },
      },
    };
  },
  methods: {
    generatePoints(count) {
      const features = [];
      for (let i = 0; i < count; i++) {
        features.push({
          id: `point-${i}`,
          coordinates: [118.0894 + (Math.random() - 0.5) * 0.3, 24.4798 + (Math.random() - 0.5) * 0.3],
          name: `Point ${i + 1}`,
        });
      }
      return features;
    },
  },
};
</script>
