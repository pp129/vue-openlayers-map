<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <div class="item">
        <label>更新WMS参数，是否只看拥堵路段</label>
        <input type="checkbox" v-model="onlyShowCongested" @change="updateParams" />
      </div>
    </div>
    <v-map ref="map" :view="view" @click="click">
      <v-tile tile-type="BD" :z-index="0"></v-tile>
      <v-image ref="wms" source-type="WMS" :wms="wms" :z-index="1" :visible="wms.visible"></v-image>
    </v-map>
  </div>
</template>

<script>
import { VMap, VTile, VImage } from "v-ol-map";

export default {
  name: "ImageWMS",
  components: {
    VMap,
    VTile,
    VImage,
  },
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      onlyShowCongested: false,
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
    };
  },
  methods: {
    refresh() {
      console.log("刷新数据");
      this.timer = setInterval(() => {
        console.log("刷新数据");
        this.updateParamsByTime();
      }, 10000);
    },
    updateParams() {
      const source = this.$refs.wms?.layer.getSource();
      if (!source) return;
      // 更新参数
      source.updateParams({ CQL_FILTER: this.onlyShowCongested ? "state in (3,4)" : "" });
    },
    updateParamsByTime() {
      const source = this.$refs.wms?.layer.getSource();
      if (!source) return;
      // 强制触发更新
      source.updateParams({ TIME: new Date().getTime() });
    },
    // 点击事件,获取图层要素信息示例
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
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}
</style>
