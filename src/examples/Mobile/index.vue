<template>
  <div class="page">
    <v-map class="map" ref="map" :view="view">
      <v-tile tile-type="TD"></v-tile>
    </v-map>
    <div class="location">
      <span>经度: {{ lon }}</span>
      <span>维度: {{ lat }}</span>
      <span>{{ error }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: "MobilePage",
  data() {
    return {
      view: {
        center: [116.403981, 39.915599],
        zoom: 10,
      },
      lon: "",
      lat: "",
      error: "",
    };
  },
  methods: {
    getGeoLocation() {
      console.log(11);
      if ("geolocation" in navigator) {
        // geolocation is available
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(position);
            console.log("Latitude is :", position.coords.latitude);
            this.lat = position.coords.latitude;
            console.log("Longitude is :", position.coords.longitude);
            this.lon = position.coords.longitude;
          },
          (error) => {
            console.error("Error Code = " + error.code + " - " + error.message);
            this.error = "Error Code = " + error.code + " - " + error.message;
          }
        );
      } else {
        // geolocation is not supported
        console.log("Geolocation is not supported by this browser.");
      }
    },
  },
  mounted() {
    this.getGeoLocation();
  },
};
</script>
<style scoped>
.page {
  position: relative;
  width: 100%;
  height: 100%;
}
.location {
  position: absolute;
  top: 8%;
  left: 20px;
  width: 300px;
  height: 30px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  color: #fff;
  display: flex;
  align-items: center;
  padding-left: 10px;
}
.location span {
  margin-right: 8px;
}
</style>
