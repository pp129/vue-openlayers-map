<template>
  <div style="width: 100%; height: 100%; position: relative">
    <v-map ref="map" :view="view">
      <v-tile tile-type="BD" :mask="mask"></v-tile>
      <!-- 辖区图层 -->
      <v-vector
        :source="jurisdiction.source"
        :z-index="1"
        :layer-style="jurisdiction.style"
        :visible="jurisdiction.visible"
        @singleclick="handleClickJurisdiction"
      ></v-vector>
      <!-- 路况图层 -->
      <v-gd-route
        :url="GDRoute.url"
        :visible="GDRoute.visible"
        :web-gl="GDRoute.webGl"
        :in-viewport="false"
        :geometry="geometry"
        :z-index="3"
      ></v-gd-route>
    </v-map>
  </div>
</template>

<script>
export default {
  name: "RouteInArea",
  components: {},
  props: {},
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      GDRoute: {
        url: "http://36.248.238.35:8888/admin-api/Features/gd_route_clean/JointFeature?ak=f5ce622f301640a7a1d9b7d7e1ac5f6b",
        visible: false,
        webGl: true,
      },
      jurisdiction: {
        visible: true,
        source: {
          url: "http://27.154.234.238:3398/admin-api/Features/jjzd20241230/JointFeature?ak=3a772a1c9c1245d5905a6f7cd522bbf5&returnGeometry=true&f=geojson",
          format: true,
        },
        style: {
          fill: {
            color: "rgb(198, 226, 255,0.6)",
          },
          stroke: {
            color: "rgb(51, 126, 204)",
            width: 2,
          },
          text: {
            text: "",
            font: "16px sans-serif",
            fill: {
              color: "#fff",
            },
            stroke: {
              color: "#000",
              width: 3,
            },
          },
          styleFunction: function (feature, resolution, map, style) {
            const textStyle = style.getText(); // 获取文本样式
            const labelKey = "name";
            const text_ = feature.get(labelKey); // 设置文本内容
            textStyle.setText(text_); // 更新文本样式
            style.setText(textStyle);
            return style; // 返回样式
          },
        },
      },
      geometry: null,
      mask: null,
      maskOption: {
        feature: {
          type: "MultiPolygon",
          coordinates: [],
        },
        shadowWidth: 50,
        fill: "rgba(0, 0, 0, 0.5) ",
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

<style scoped></style>
