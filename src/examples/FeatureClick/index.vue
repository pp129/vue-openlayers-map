<template>
  <v-map :view="view">
    <v-tile tile-type="BD"></v-tile>
    <v-vector :features="features" @singleclick="onClickFeature" @pointermove="pointermove"></v-vector>
    <v-vector :features="markers" @singleclick="onClickMarker"></v-vector>
  </v-map>
</template>

<script>
export default {
  name: "FeatureClick",
  data() {
    return {
      view: {
        city: "xiamen",
        zoom: 12,
      },
      features: [
        {
          id: "point2",
          coordinates: [118.168742, 24.487505],
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
      markers: [
        {
          id: "point3",
          coordinates: [118.1401534526062, 24.461376055501933],
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL("../../assets/img/point_2.png", import.meta.url).href,
            },
          },
          properties: {
            level: 3,
            name: "point3",
          },
        },
      ],
    };
  },
  methods: {
    onClickFeature(evt, feature) {
      console.log("feature", feature);
    },
    onClickMarker(evt, marker) {
      console.log("marker", marker);
    },
    pointermove(evt, feature) {
      // console.log('feature', feature)
      this.features.forEach((e) => {
        e.style.icon.src = new URL("../../assets/img/point_4.png", import.meta.url).href;
        if (feature) {
          const id = feature.get("id");
          if (id === e.id) {
            e.style.icon.src = new URL("../../assets/img/point_1.png", import.meta.url).href;
          }
        }
      });
    },
  },
};
</script>

<style scoped></style>
