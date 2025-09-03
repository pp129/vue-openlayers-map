<template>
  <div class="page">
    <form class="form">
      <label for="radius">radius size: {{ form.radius }}</label>
      <input id="radius" type="range" :min="1" :max="10" :step="1" v-model="form.radius" @change="handleRadiusChange" />
      <label for="blur">blur size: {{ form.blur }}</label>
      <input id="blur" type="range" :min="1" :max="20" :step="1" v-model="form.blur" @change="handleBlurChange" />
    </form>
    <v-map :view="view">
      <v-tile tile-type="BD"></v-tile>
      <v-heatmap :features="features" :radius="radius" :blur="blur" :weight="heatWeight"></v-heatmap>
      <!-- <v-heatmap :features="features" :radius="radius" :blur="blur"></v-heatmap> -->
    </v-map>
  </div>
</template>

<script>
import { heatData } from "./mock";

export default {
  name: "heatmap-page",
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      features: [],
      radius: 3,
      blur: 8,
      form: {
        radius: 3,
        blur: 8,
      },
    };
  },
  mounted() {
    this.getMockData();
  },
  methods: {
    getData() {
      fetch("heatmap.json")
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          const points = [].concat.apply(
            [],
            res.map(function (track) {
              return track.map(function (seg) {
                return {
                  coordinates: seg.coord,
                  convert: "bd-84", // 百度数据源，坐标转化
                };
              });
            })
          );
          console.log(points);
          this.features = points;
        });
    },
    getMockData() {
      this.features = heatData;
    },
    getMockData2() {
      fetch("situation.json")
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          this.features = res.result.filter((item) => item.coordinates !== null);
        });
    },
    heatWeight(feature) {
      const count = feature.get("value");
      const weight = count / 100;
      console.log(weight);
      return weight;
    },
    handleRadiusChange() {
      this.radius = Number(this.form.radius);
    },
    handleBlurChange() {
      this.blur = Number(this.form.blur);
    },
  },
};
</script>

<style scoped>
.page {
  width: 100%;
  height: 100vh;
  position: relative;
}
.form {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
}
</style>
