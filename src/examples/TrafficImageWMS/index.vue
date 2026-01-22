<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <div class="item">
        <label>显示路况</label>
        <input type="checkbox" v-model="wms.visible" />
      </div>
      <div class="item">
        <label>显示叠加路况</label>
        <input type="checkbox" v-model="wms3.visible" />
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
    <v-map ref="map" :view="view" :interactions="interactions" @click="click">
      <v-tile tile-type="BD" :z-index="0"></v-tile>
      <v-image ref="wms" source-type="WMS" :wms="wms" :z-index="2" :visible="wms.visible"></v-image>
      <v-image ref="wms3" source-type="WMS" :wms="wms3" :z-index="2" :visible="wms3.visible"></v-image>
      <!-- 点图层 -->
      <v-vector :features="features"></v-vector>
      <!-- 辖区 -->
      <v-image ref="wms2" source-type="WMS" :wms="wms2" :z-index="1" :visible="wms2.visible"></v-image>
      <v-image
        ref="trafficLight"
        source-type="WMS"
        :wms="trafficLight.wms"
        :z-index="4"
        :visible="trafficLight.visible"
      ></v-image>
      <v-image ref="bayonet" source-type="WMS" :wms="bayonet.wms" :z-index="4" :visible="bayonet.visible"></v-image>
    </v-map>
  </div>
</template>

<script>
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
      wms3: {
        visible: true,
        url: "http://36.248.238.35:8888/wms-api/xm/wms",
        params: {
          VERSION: "1.1.1",
          FORMAT: "image/png",
          STYLES: "",
          LAYERS: "xm:gd_route_clean",
          CQL_FILTER: "state in (2,3,4)",
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
        timer: null,
      },
    };
  },
  methods: {
    refresh() {
      console.log("刷新数据");
      this.timer = setInterval(() => {
        console.log("刷新数据");
        this.updateParams();
      }, 10000);
    },
    updateParams() {
      const source = this.$refs.wms?.layer.getSource();
      console.log(source);
      if (!source) return;
      source.updateParams({ TIME: new Date().getTime() });
    },
    click(evt, map) {
      const layer = this.$refs.wms?.layer;
      if (!layer) return;
      const wmsSource = layer.getSource();
      const visible = layer.getVisible();
      if (!wmsSource || !visible) return;
      const view = map.getView();
      const viewResolution = view.getResolution();
      if (!viewResolution) return;
      const url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection().getCode(), {
        INFO_FORMAT: "application/json",
        FEATURE_COUNT: 10,
      });
      if (url) {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
          });
      }
    },
  },
  mounted() {
    this.refresh();
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
