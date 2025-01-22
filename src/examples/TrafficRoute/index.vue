<template>
  <div style="width: 100%; height: 100%; position: relative">
    <v-map ref="map" :view="view">
      <v-tile tile-type="BD"></v-tile>
      <!-- 路况图层 -->
      <v-gd-route
        :url="GDRoute.url"
        :visible="GDRoute.visible"
        :web-gl="GDRoute.webGl"
        :z-index="3"
        :line-width="1.5"
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
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      GDRoute: {
        url: "http://36.248.238.35:8888/admin-api/Features/gd_route_clean/JointFeatureXmGaode?ak=f5ce622f301640a7a1d9b7d7e1ac5f6b",
        visible: true,
        webGl: true,
      },
    };
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {},
};
</script>

<style scoped></style>
