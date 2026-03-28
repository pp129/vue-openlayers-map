<template>
  <div style="width: 100%; height: 100%; position: relative">
    <v-map ref="map" :view="view">
      <v-tile tile-type="BD"></v-tile>
      <!--可编辑图层-->
      <v-vector
        :features="features"
        modify
        select
        :z-index="4"
        @select="onselect"
        @deselect="positionRadius = undefined"
        @modifystart="modifystart"
        @modifyend="modifyend"
        @modifychange="modifychange"
        @singleclick="singleclick"
      ></v-vector>

      <v-overlay :position="positionRadius" class="overlay-radius" :z-index="0">
        <div class="overlay-radius-box">
          <span v-if="!showInput" @dblclick="showInput = true">半径：{{ radius }} 米</span>
          <input
            v-else
            type="number"
            v-model="radius"
            @input="onInput"
            @keyup.enter="showInput = false"
            @blur="showInput = false"
          />
        </div>
      </v-overlay>
    </v-map>
  </div>
</template>

<script>
export default {
  name: "ModifyCircle",
  components: {},
  props: {},
  data() {
    return {
      view: {
        center: [118.1311561146873, 24.495006262682914],
        zoom: 16,
      },
      features: [
        {
          type: "Circle",
          style: {
            stroke: {
              // color: 'rgba(220,171,119,1)',
              color: "rgba(51, 181, 94, 1)",
              width: 6,
              // lineDash: [20, 10, 20, 10]
            },
            fill: {
              color: "rgba(51, 181, 94, 0.3)",
            },
          },
          center: [118.1311561146873, 24.495006262682914],
          radius: 100,
        },
      ],
      geometry: null,
      modifying: false,
      maxRadius: 500, // 最大半径（米）
      hasWarned: false, // 防止重复提示
      positionRadius: undefined,
      radius: "",
      showInput: false,
    };
  },
  computed: {
    map() {
      return this.$refs.map.map;
    },
    metersPerUnit() {
      return this.$refs.map?.map.getView().getProjection().getMetersPerUnit() || 1;
    },
  },
  watch: {},
  methods: {
    setRadius(feature) {
      this.geometry = feature.getGeometry();
      const extent = this.geometry.getExtent();
      const geoRadius = this.geometry.getRadius(); // 半径
      this.radius = (geoRadius * this.metersPerUnit).toFixed(2);
      this.positionRadius = [extent[2], (extent[3] + extent[1]) / 2];
    },
    onselect(evt) {
      console.log("on select: ", evt);
      const feature = evt.selected[0];
      if (feature) {
        this.modifying = true;
        this.setRadius(feature);
      }
    },
    modifystart(evt) {
      console.log("modify start: ", evt);
    },
    modifyend(evt) {
      console.log("modify end: ", evt);
      this.modifying = false;
      const feature = evt.features.getArray()[0];
      // 获取绘制图形的圆心（经纬度）和半径（米）
      this.setRadius(feature);
      // console.log("radius: ", radius);
      if (this.radius > this.maxRadius) {
        // 限制半径为最大值
        this.geometry.setRadius(this.maxRadius / this.metersPerUnit);
        this.radius = this.maxRadius;
        const extent = this.geometry.getExtent();
        this.positionRadius = [extent[2], (extent[3] + extent[1]) / 2];
        // 只提示一次
        if (!this.hasWarned) {
          this.hasWarned = true;
          alert(`最大半径不能超过 ${this.maxRadius} 米`);
        }
      } else {
        this.hasWarned = false;
      }
    },
    modifychange(evt) {
      console.log("modify change: ", evt);
    },
    singleclick(evt) {
      console.log("single click: ", evt);
    },
    closeAround() {
      this.positionRadius = undefined;
      this.radius = "";
    },
    onInput() {
      this.geometry.setRadius(Number(this.radius) / this.metersPerUnit);
      const extent = this.geometry.getExtent();
      this.positionRadius = [extent[2], (extent[3] + extent[1]) / 2];
    },
  },
  created() {},
  mounted() {},
};
</script>

<style scoped></style>
