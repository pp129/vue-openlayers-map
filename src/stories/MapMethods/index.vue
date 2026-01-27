<template>
  <div class="container">
    <div class="tool">
      <div class="item">
        <label>视图移动</label>
        <button @click="panTo">厦门</button>
        <button @click="flyTo">杭州</button>
      </div>
    </div>
    <v-map ref="map" :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="BD" />
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile } from "v-ol-map";

export default {
  name: "MapMethodsExample",
  components: { VMap, VTile },
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 14,
      },
    };
  },
  methods: {
    panTo() {
      this.$refs.map.panTo({
        zoom: 13,
        center: [118.137676, 24.494068],
      });
    },
    flyTo() {
      this.$refs.map.flyTo({
        zoom: 13,
        flyZoom: 8,
        center: [120.12636, 30.230779],
      });
    },
  },
};
</script>

<style scoped>
.map {
  position: absolute;
  left: 0;
  top: 0;
}
.tool {
  width: 10%;
  z-index: 2;
  position: absolute;
  right: 10px;
  top: 5%;
  display: flex;
  justify-content: flex-start;
  align-items: start;
  padding-left: 10px;
  flex-direction: column;
  /*background: #ffffff;*/
}
.item {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
}
.label {
  width: 100%;
}
</style>
