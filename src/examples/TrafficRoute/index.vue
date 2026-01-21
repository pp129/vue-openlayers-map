<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <div class="item">
        <label>显示路况</label>
        <input type="checkbox" v-model="GDRoute.visible" />
      </div>
      <div class="item">
        <label>显示辖区</label>
        <input type="checkbox" v-model="wms.visible" />
      </div>
      <div class="item">
        <label>选择底图</label>
        <select id="changeLayer" class="btn" v-model="tile" @change="changeTile">
          <option v-for="(item, index) in baseTile" :key="index" :value="item.value">{{ item.name }}</option>
        </select>
      </div>
    </div>
    <v-map ref="map" :view="view">
      <v-tile :tile-type="tileType" :xyz="xyz" :z-index="0"></v-tile>
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
      <v-vector :features="features"></v-vector>
      <v-tile ref="wms" tile-type="WMS" :wms="wms" :z-index="9" :visible="wms.visible"></v-tile>
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
      tile: "bd",
      tileType: "bd",
      baseTile: [
        {
          name: "天地图-街道+注记",
          value: "TD",
        },
        {
          name: "天地图-影像+注记",
          value: "TD_IMG",
        },
        {
          name: "百度",
          value: "bd",
        },
        {
          name: "百度-暗夜",
          value: "BD_BLUE",
        },
        {
          name: "百度-深色",
          value: "bd_dark",
        },
        {
          name: "arcgis-暗夜",
          value: "arcgis_blue",
        },
        {
          name: "arcgis-灰色",
          value: "arcgis_gray",
        },
        {
          name: "arcgis-暖色",
          value: "arcgis_warm",
        },
        {
          name: "arcgis-正常",
          value: "arcgis_normal",
        },
        {
          name: "高德",
          value: "GD",
        },
        {
          name: "高德卫星",
          value: "GD_IMG",
        },
        {
          name: "OSM",
          value: "OSM",
        },
        {
          name: "福建省深色",
          value: "FJ_BLUE",
        },
        {
          name: "集恩厦门卫星2022",
          value: "XYZ_1",
        },
        {
          name: "集恩厦门卫星2022_2",
          value: "XYZ_2",
        },
      ],
      xyz: {},
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
      wms: {
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
    };
  },
  computed: {},
  watch: {},
  methods: {
    handleClick(e) {
      console.log(e);
    },
    changeTile() {
      // if (this.tile === "XYZ") {
      //   this.xyz = { ...this.XYZMix };
      // }
      // this.tileType2 = val;
      if (this.tile.indexOf("XYZ") > -1) {
        this.tileType = "XYZ";
        const tile = this.baseTile.find((item) => item.value === this.tile);
        if (tile) {
          console.log(tile);
          this.xyz = {
            ...this.XYZMix[this.tile],
          };
        }
      } else {
        this.tileType = this.tile;
      }
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
