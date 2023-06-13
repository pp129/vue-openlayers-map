<template>
<v-map :view="view">
  <v-tile tile-type="BD"></v-tile>
  <v-heatmap :features="features"></v-heatmap>
</v-map>
</template>

<script>
export default {
  name: 'heatmap-page',
  data () {
    return {
      view: {
        city: '杭州',
        zoom: 12
      },
      features: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      fetch('heatmap.json').then(res => res.json()).then(res => {
        console.log(res)
        const points = [].concat.apply([], res.map(function (track) {
          return track.map(function (seg) {
            return {
              coordinates: seg.coord,
              convert: 'bd-84' // 百度数据源，坐标转化
            }
          })
        }))
        console.log(points)
        this.features = points
      })
    }
  }
}
</script>

<style scoped>

</style>
