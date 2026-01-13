<template>
  <div style="width: 100%; height: 100%; position: relative">
    <v-map ref="map" :view="view" :interactions="interactions">
      <v-tile tile-type="BD"></v-tile>
      <v-tile ref="wms" tile-type="WMS" :wms="wms" :z-index="9" :visible="true"></v-tile>
    </v-map>
  </div>
</template>

<script>
import { utils } from "@/components";
export default {
  name: "TrafficWMS",
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      interactions: {
        DragRotateAndZoom: true,
        doubleClickZoom: false,
        dragPan: true,
        mouseWheelZoom: true,
      },
      wms: {
        url: "http://36.248.238.35:8888/wms-api/xm/wms",
        params: {
          VERSION: "1.1.1",
          FORMAT: "image/png",
          STYLES: "",
          LAYERS: "xm:gd_route_clean",
        },
        serverType: "geoserver",
        ratio: 1,
        crossOrigin: "anonymous",
      },
    };
  },
  methods: {
    getArea() {
      fetch("/squadron.json")
        .then((res) => res.json())
        .then((data) => {
          // 使用简化功能，将多环多边形简化为单个外环
          const geom = utils.esri2wktGeometry(data, true);
          console.log("简化后的几何体:", geom);

          // 也可以获取简化后的EsriJSON数据
          const simplifiedEsriJson = utils.simplifyEsriPolygon(data);
          console.log("简化后的EsriJSON:", simplifiedEsriJson);

          // 可以取消注释下面的代码来更新WMS参数
          // this.updateParams(geom);
        })
        .catch((error) => {
          console.error("获取数据失败:", error);
        });
    },
    updateParams(geom) {
      const source = this.$refs.wms?.layer.getSource();
      console.log(source);
      if (!source) return;
      source.updateParams({
        CQL_FILTER: `intersects(geom, ${geom})`,
      });
    },
  },
  mounted() {
    this.getArea();
  },
};
</script>

<style lang="less" scoped></style>
