<template>
  <v-map :view="view" style="width: 100%; height: 600px">
    <v-tile tile-type="TD" />
    <v-vector :geoJson="geoJsonData" :cluster="clusterConfig" />
  </v-map>
</template>

<script>
import { VMap, VTile, VVector } from "@/packages";

export default {
  name: "GeoJsonClusterExample",
  components: { VMap, VTile, VVector },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 8, projection: "EPSG:4326" },
      clusterConfig: {
        distance: 50,
        minDistance: 20,
      },
      geoJsonData: {
        type: "FeatureCollection",
        features: this.generateRandomPoints(50),
      },
    };
  },
  methods: {
    generateRandomPoints(count) {
      const features = [];
      const centerLng = 118.0894;
      const centerLat = 24.4798;

      for (let i = 0; i < count; i++) {
        features.push({
          type: "Feature",
          properties: {
            id: `point-${i}`,
            name: `点位 ${i + 1}`,
          },
          geometry: {
            type: "Point",
            coordinates: [centerLng + (Math.random() - 0.5) * 1.5, centerLat + (Math.random() - 0.5) * 1],
          },
        });
      }
      return features;
    },
  },
};
</script>
