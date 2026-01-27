<template>
  <v-map :view="view" style="width: 100%; height: 600px">
    <v-tile tile-type="TD" />
  </v-map>
</template>

<script>
import { VMap, VTile } from "@/packages";

export default {
  name: "MapDefaultExample",
  components: { VMap, VTile },
  data() {
    return {
      // 地图视图配置
      view: {
        center: [118.1689, 24.6478], // 中心点坐标 [经度, 纬度]
        zoom: 10, // 缩放级别
      },
    };
  },
};
</script>
