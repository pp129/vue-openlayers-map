<template>
  <v-map :view="view" style="width: 100%; height: 600px">
    <v-tile tile-type="TD" />
    <v-vector :geoJson="geoJsonData" />
  </v-map>
</template>

<script>
import { VMap, VTile, VVector } from "@/packages";

export default {
  name: "GeoJsonArrowExample",
  components: { VMap, VTile, VVector },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 10, projection: "EPSG:4326" },
      geoJsonData: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: "route-1",
              name: "路线1",
              style: {
                stroke: { color: "#ff5722", width: 4 },
              },
              arrow: {
                spacing: 100,
                color: "#ff5722",
                size: 10,
              },
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [117.9, 24.4],
                [118.0, 24.45],
                [118.1, 24.5],
                [118.2, 24.55],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "route-2",
              name: "路线2",
              style: {
                stroke: { color: "#2196f3", width: 3 },
              },
              arrow: {
                spacing: 80,
                color: "#2196f3",
                size: 8,
              },
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [117.95, 24.35],
                [118.05, 24.4],
                [118.15, 24.45],
              ],
            },
          },
        ],
      },
    };
  },
};
</script>
