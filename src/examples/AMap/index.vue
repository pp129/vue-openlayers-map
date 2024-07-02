<template>
  <v-map :view="view">
    <v-tile tile-type="GD"></v-tile>
    <v-vector :source="source" :features="features"></v-vector>
  </v-map>
</template>

<script>
export default {
  name: "AMap",
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      source: {
        projection: "GCJ02",
      },
      features: [
        {
          id: "point1",
          coordinates: [118.052232, 24.607223],
          // convert: 'gd-84',
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL("../../assets/img/point_1.png", import.meta.url).href,
              anchor: [0.5, 1],
            },
          },
        },
      ],
    };
  },
};
</script>

<style scoped></style>
