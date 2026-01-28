<template>
  <v-map :view="view" style="width: 100%; height: 600px">
    <v-tile tile-type="TD" />
  </v-map>
</template>

<script>
import { VMap, VTile } from "v-ol-map";

export default {
  name: "TileDefaultExample",
  components: { VMap, VTile },
  data() {
    return {
      view: {
        center: [118.1689, 24.6478],
        zoom: 10,
      },
    };
  },
};
</script>
