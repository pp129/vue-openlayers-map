<template>
  <div class="image-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-image source-type="Static" :image-url="imageUrl" :image-extent="imageExtent" :opacity="0.7" />
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile, VImage } from "@/packages";

export default {
  name: "ImageExample",
  components: { VMap, VTile, VImage },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 13, projection: "EPSG:4326" },
      imageUrl: "https://openlayers.org/en/latest/examples/data/kml/2012_Earthquakes_Mag5.png",
      imageExtent: [117.9, 24.3, 118.3, 24.7],
    };
  },
};
</script>
