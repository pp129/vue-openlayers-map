<template>
  <div style="width: 100%; height: 100%; position: relative">
    <v-map ref="map" :view="view">
      <v-tile tile-type="BD"></v-tile>
      <v-tile ref="wms" tile-type="WMS" :wms="wms" :z-index="9" :visible="true"></v-tile>
    </v-map>
  </div>
</template>

<script>
export default {
  name: "Wms",
  components: {},
  props: {},
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      wms: {
        url: "http://172.16.34.132:8222/geoserver/test/wms",
        params: {
          //   VERSION: "1.3.0",
          FORMAT: "image/png",
          STYLES: "",
          LAYERS: "test:v_zdwg",
          // CQL_FILTER: "manage_department in ('350200271204','350200271208')",
          //   LAYERS: "test:v_lkd",
          //   CQL_FILTER: "manage_department in ('350200271208','350200271210')",
          exceptions: "application/vnd.ogc.se_inimage",
          //   CRS: "EPSG:4326",
          tiled: true,
        },
        serverType: "geoserver",
        ratio: 1,
        crossOrigin: "anonymous",
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    handleClickJurisdiction(evt, feature) {
      console.log("handleClickJurisdiction", feature);
      if (!feature) return;
      this.geometry = this.getGeometryByFeature(feature);
      console.log(this.geometry);
      this.mask = {
        feature: this.geometry,
        shadowWidth: 50,
        fill: "rgba(0, 0, 0, 0.5) ",
      };
      this.GDRoute.visible = true;
    },
    getExtentByFeature(feature) {
      const geometry = feature.getGeometry();
      const extent = geometry.getExtent();
      const polygon = [
        [extent[0], extent[1]],
        [extent[2], extent[1]],
        [extent[2], extent[3]],
        [extent[0], extent[3]],
        [extent[0], extent[1]],
      ];
      return {
        type: "Polygon",
        coordinates: [polygon],
      };
    },
    getGeometryByFeature(feature) {
      if (!feature) return;
      const geo = this.$refs.map.writeFeatureObject(feature);
      const { geometry } = geo;
      return geometry;
    },
  },
  created() {},
  mounted() {},
};
</script>

<style scoped>
.box {
  padding: 4px;
  background: white;
  position: absolute;
  left: 3%;
  top: 3%;
  z-index: 9;
}
</style>
