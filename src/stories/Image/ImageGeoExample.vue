<template>
  <div class="image-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-image source-type="geoImage" :source="imageSource" :opacity="imageOpacity" />
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile, VImage } from "v-ol-map";

export default {
  name: "ImageGeoExample",
  components: { VMap, VTile, VImage },
  data() {
    return {
      view: { center: [118.213269, 24.569244], zoom: 13, projection: "EPSG:4326" },
      imageSource: {
        url: new URL(`../../assets/img/xiangan.jpg`, import.meta.url).href,
        imageCenter: [118.213269, 24.569244],
        imageScale: [0.00004, 0.00004],
      },
      imageOpacity: 0.7,
    };
  },
};
</script>
