<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <div class="item">
        <label>显示路况</label>
        <input type="checkbox" v-model="wms.visible" />
      </div>
      <div class="item">
        <label>显示叠加路况</label>
        <input type="checkbox" v-model="GDRoute.visible" />
      </div>
      <div class="item">
        <label>显示辖区</label>
        <input type="checkbox" v-model="wms2.visible" />
      </div>
      <div class="item">
        <label>显示信号灯</label>
        <input type="checkbox" v-model="trafficLight.visible" />
      </div>
      <div class="item">
        <label>显示摄像头</label>
        <input type="checkbox" v-model="bayonet.visible" />
      </div>
    </div>
    <v-map ref="map" :view="view" :interactions="interactions">
      <v-tile tile-type="BD" :z-index="0"></v-tile>
      <v-tile ref="wms" tile-type="WMS" :wms="wms" :z-index="2" :visible="wms.visible"></v-tile>
      <!-- 路况图层 -->
      <v-gd-route
        :url="GDRoute.url"
        :visible="GDRoute.visible"
        :z-index="3"
        :where="GDRoute.where"
        :updateWhileInteracting="false"
        :declutter="true"
      ></v-gd-route>
      <!-- 点图层 -->
      <v-vector :features="features"></v-vector>
      <!-- 辖区 -->
      <v-tile ref="wms2" tile-type="WMS" :wms="wms2" :z-index="1" :visible="wms2.visible"></v-tile>
      <v-tile ref="trafficLight" tile-type="WMS" :wms="trafficLight.wms" :z-index="4" :visible="trafficLight.visible"></v-tile>
      <v-tile ref="bayonet" tile-type="WMS" :wms="bayonet.wms" :z-index="4" :visible="bayonet.visible"></v-tile>
    </v-map>
  </div>
</template>

<script>
import { utils } from "@/packages";
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
      GDRoute: {
        url:
          "http://36.248.238.35:8888/admin-api/Features/gd_route_clean/JointFeatureXmGaode?ak=f5ce622f301640a7a1d9b7d7e1ac5f6b",
        visible: true,
        where: "state in (2,3,4)",
      },
      wms: {
        visible: true,
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
      wms2: {
        visible: true,
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
      features: [
        {
          id: "point2",
          coordinates: [118.128342, 24.407405],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL("../../assets/img/point_4.png", import.meta.url).href,
            },
          },
          properties: {
            name: "feature2",
            level: 2,
          },
        },
      ],
      trafficLight: {
        visible: true,
        wms: {
          url: `http://172.16.34.132:8222/geoserver/test/wms`,
          params: {
            // VERSION: "1.1.1",
            FORMAT: "image/png",
            STYLES: "",
            LAYERS: "test:v_traffic_light",
            exceptions: "application/vnd.ogc.se_inimage",
            tiled: true,
            // CQL_FILTER: "",
          },
          serverType: "geoserver",
          ratio: 1,
          crossOrigin: "anonymous",
          // wrapX: false, //不平铺
        },
        overlay: {
          showOnClick: false,
          positionOrigin: "feature",
          offset: [30, -161],
          position: undefined,
          className: "overlay-dark overlay-dark-signal",
        },
        layerCode: "TrafficLight",
        isResource: true,
      },
      bayonet: {
        layerCode: "Bayonet",
        isResource: true,
        visible: false,
        features: [],
        wms: {
          url: `http://172.16.34.132:8222/geoserver/test/wms`,
          params: {
            FORMAT: "image/png",
            STYLES: "",
            LAYERS: "test:v_bayonet",
            exceptions: "application/vnd.ogc.se_inimage",
            tiled: true,
            // CQL_FILTER: "",
          },
          serverType: "geoserver",
          ratio: 1,
          crossOrigin: "anonymous",
          // wrapX: false, //不平铺
        },
        overlay: {
          showOnClick: false,
          positionOrigin: "feature",
          offset: [25, -178],
          position: undefined,
          className: "overlay-dark overlay-dark-camera",
        },
        value: [],
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
