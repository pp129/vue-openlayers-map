<template>
  <div class="container">
    <v-map>
      <v-tile></v-tile>
    </v-map>
    <v-map>
      <v-tile></v-tile>
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile } from "v-ol-map";

export default {
  name: "MultiMap",
  components: {
    VMap,
    VTile,
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
</style>
