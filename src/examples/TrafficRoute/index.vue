<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div class="tool">
      <div class="item">
        <label>显示路况</label>
        <input type="checkbox" v-model="GDRoute.visible" />
      </div>
      <div class="item">
        <label>WebGL</label>
        <input type="checkbox" v-model="GDRoute.webGl" @change="onGLChange" />
      </div>
      <div class="item">
        <label>渲染方式</label>
        <select v-model="GDRoute.rendered" :disabled="GDRoute.webGl">
          <option value="v">VectorLayer</option>
          <!--          <option value="vt">VectorTileLayer</option>-->
          <option value="gl">WebGlVectorLayer</option>
        </select>
      </div>
    </div>
    <v-map ref="map" :view="view">
      <v-tile tile-type="BD"></v-tile>
      <!-- 路况图层 -->
      <v-gd-route
        :url="GDRoute.url"
        :visible="GDRoute.visible"
        :web-gl="GDRoute.webGl"
        :rendered="GDRoute.rendered"
        :fix="GDRoute.fix"
        :z-index="3"
        :line-width="1.5"
        :colors="colors"
        :updateWhileInteracting="false"
        :declutter="true"
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
      enableSelect: false,
      colors: colors,
      GDRoute: {
        url:
          "http://36.248.238.35:8888/admin-api/Features/gd_route_clean/JointFeatureXmGaode?ak=f5ce622f301640a7a1d9b7d7e1ac5f6b",
        visible: true,
        webGl: true,
        rendered: "gl",
        fix: false,
        style: {
          "stroke-color": [
            "case",
            ["==", ["get", "state"], 1],
            colors[0],
            ["==", ["get", "state"], 2],
            colors[1],
            ["==", ["get", "state"], 3],
            colors[2],
            ["==", ["get", "state"], 4],
            colors[3],
            ["==", ["get", "state"], -1],
            colors[4],
            ["*", ["get", "state"], colors[0]],
          ],
          "stroke-width": 1.5,
        },
      },
    };
  },
  computed: {},
  watch: {},
  methods: {
    onGLChange() {
      if (this.GDRoute.webGl) {
        this.GDRoute.rendered = "gl";
      }
    },
    onRenderedChange() {
      this.GDRoute.webGl = this.GDRoute.rendered === "gl";
    },
  },
  created() {},
  mounted() {},
};
</script>

<style scoped>
.tool {
  display: none;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}
</style>
