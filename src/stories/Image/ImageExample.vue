<template>
  <div class="image-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-image source-type="Static" :image-url="imageUrl" :image-extent="imageExtent" :opacity="0.7" />
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile, VImage } from "v-ol-map";

export default {
  name: "ImageExample",
  components: { VMap, VTile, VImage },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 13, projection: "EPSG:4326" },
      imageUrl: new URL(`../../assets/img/siming.jpg`, import.meta.url).href,
      imageExtent: [118.0531, 24.423728, 118.197989, 24.502344],
    };
  },
};
</script>
