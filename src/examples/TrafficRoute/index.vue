<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <div class="item">
        <label>显示路况</label>
        <input type="checkbox" v-model="GDRoute.visible" />
      </div>
    </div>
    <v-map ref="map" :view="view">
      <v-tile tile-type="BD"></v-tile>
      <!-- 路况图层 -->
      <v-gd-route
        :url="GDRoute.url"
        :visible="GDRoute.visible"
        :z-index="3"
        :colors="colors"
        :updateWhileInteracting="false"
        :declutter="true"
        @click="handleClick"
      ></v-gd-route>
    </v-map>
  </div>
</template>

<script>
export default {
  name: "TrafficRoute",
  components: {},
  props: {},
  data() {
    const colors = ["#34b000", "#fecb00", "#df0100", "#8e0e0b", "#8f979c"];
    return {
      view: {
        city: "厦门",
        zoom: 11,
      },
      colors: colors,
      GDRoute: {
        url:
          "http://36.248.238.35:8888/admin-api/Features/gd_route_clean/JointFeatureXmGaode?ak=f5ce622f301640a7a1d9b7d7e1ac5f6b",
        visible: true,
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    handleClick(e) {
      console.log(e);
    },
  },
  created() {},
  mounted() {},
};
</script>

<style scoped>
.tool {
  /* display: none; */
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  z-index: 2;
}
</style>
