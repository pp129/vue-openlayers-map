<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div id="toolbar" style="position: absolute; top: 20px; left: 20px; z-index: 1">
      <label for="">地图类型:</label>
      <select v-model="tileType" @change="tileTypeChange">
        <option value="BD">百度</option>
        <option value="GD">高德</option>
        <option value="XYZ">Carto</option>
      </select>
    </div>
    <v-map ref="map" :view="view">
      <v-tile :tile-type="tileType" :xyz="xyz"></v-tile>
    </v-map>
  </div>
</template>

<script>
export default {
  name: "TileExample",
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      tileType: "BD",
      xyz: {
        url: "",
        projection: "",
      },
    };
  },
  methods: {
    tileTypeChange() {
      if (this.tileType === "XYZ") {
        this.xyz.url = "http://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png";
        this.xyz.projection = "EPSG:3857";
      } else {
        this.xyz.url = "";
        this.xyz.projection = "";
      }
    },
  },
};
</script>

<style scoped></style>
