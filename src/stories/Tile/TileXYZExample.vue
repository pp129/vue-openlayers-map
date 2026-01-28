<template>
  <v-map :view="view" style="width: 100%; height: 600px">
    <v-tile tile-type="XYZ" :xyz="xyzOptions" />
  </v-map>
</template>

<script>
import { VMap, VTile } from "v-ol-map";

export default {
  name: "TileXYZExample",
  components: { VMap, VTile },
  data() {
    return {
      view: {
        center: [118.1689, 24.6478],
        zoom: 10,
        projection: "EPSG:4326",
      },
      // XYZ 瓦片配置
      xyzOptions: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        projection: "EPSG:3857",
        crossOrigin: "anonymous",
      },
    };
  },
};
</script>
