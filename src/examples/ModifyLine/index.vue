<template>
  <div style="width: 100%;height: 100%;position: relative">
    <button style="position: absolute; top: 10px;right: 20px;z-index: 2;" @click="drawType = 'Rectangle'">框选</button>
    <button style="position: absolute; top: 50px;right: 20px;z-index: 2;" @click="delPoint">删除</button>
    <v-map :view="view">
      <v-tile tile-type="BD"></v-tile>
      <!--可编辑图层-->
      <v-vector
          :features="features"
          modify
          select
          :z-index="4"
          @select="onselect" @modifystart="modifystart" @modifyend="modifyend" @modifychange="modifychange"></v-vector>
      <v-vector :features="turningFeatures" :z-index="5"></v-vector>
      <v-draw :type="drawType" draw-once @drawend="ondrawend"></v-draw>
    </v-map>
  </div>
</template>

<script>
import * as turf from '@turf/turf'
export default {
  name: 'ModifyLine',
  components: {},
  props: {},
  data () {
    return {
      view: {
        city: '厦门', // 优先级比center高
        // center: [118.1689, 24.6478], // 预留此参数，组件监听view.center变化，触发panTo方法
        zoom: 12
        // maxZoom: 12
      },
      turningFeatures: [{
        type: 'MultiPoint',
        coordinates: []
      }],
      features: [
        {
          type: 'LineString',
          style: {
            stroke: {
              // color: 'rgba(220,171,119,1)',
              color: 'rgba(51, 181, 94, 1)',
              width: 6
              // lineDash: [20, 10, 20, 10]
            },
            text: {
              text: 'line'
            }
          },
          coordinates: [[118.25156700065546, 24.6221373022732], [118.25156700065546, 24.6221373022732], [118.25002070715837, 24.61987888228266], [118.24817735901289, 24.617151746266767], [118.24632663479261, 24.614808166140005], [118.24326958706789, 24.61118517231314], [118.24051495840959, 24.60785319816439], [118.23908802321367, 24.606357866638586], [118.23849793723039, 24.605842211955473], [118.23570441654138, 24.603383967393324], [118.2325206344407, 24.601446071380064], [118.23193054845743, 24.60100417744486], [118.23069337954931, 24.600246453398153], [118.23022600462846, 24.599913188928053], [118.22946693947725, 24.59947867106764], [118.22848390987329, 24.598636457436964], [118.2271622513812, 24.597646051758215], [118.22660032859258, 24.597295352929518], [118.22519820383005, 24.59642966996996], [118.22445322027616, 24.5960581840214], [118.22297800531797, 24.595690721386358], [118.22213445058279, 24.595305153840467], [118.22192322662286, 24.595199877136633], [118.22145585170202, 24.594933667891905], [118.22033200612478, 24.59423227023451], [118.22012078216486, 24.594126993530676], [118.219471017031, 24.593548306935713], [118.21915451636724, 24.59316944491236], [118.21899626603536, 24.593011865132734], [118.21866233101301, 24.592545160764143], [118.21806151619367, 24.591798165553495], [118.21789253702573, 24.59151787471144], [118.21744997253828, 24.590854698532507], [118.21683842888288, 24.589984992259428], [118.216680178551, 24.589827412479803], [118.21627181222848, 24.588894674294874], [118.21565356305055, 24.587410742157385], [118.21527335992269, 24.58595094990103], [118.21512919118814, 24.58449786316721], [118.21498837521486, 24.583866202944204], [118.2148790751975, 24.58336127709715], [118.21481939604692, 24.583003872745916], [118.21481939604692, 24.582793319338247], [118.21481939604692, 24.582014808171675], [118.21476977518014, 24.581867286675855], [118.21476977518014, 24.581825712436125]]
        }
      ],
      drawType: '',
      modifying: false,
      delIndexList: []
    }
  },
  computed: {},
  watch: {},
  methods: {
    onselect (evt) {
      console.log('on select: ', evt)
      const feature = evt.selected[0]
      if (feature) {
        this.modifying = true
        const geo = feature.getGeometry()
        this.turningFeatures[0].coordinates = geo.getCoordinates()
      } else {
        this.delIndexList = []
        this.drawType = ''
      }
    },
    modifystart (evt) {
      console.log('modify start: ', evt)
    },
    modifyend (evt) {
      console.log('modify end: ', evt)
      const feature = evt.features.getArray()[0]
      const geometry = feature.getGeometry()
      this.turningFeatures[0].coordinates = geometry.getCoordinates()
    },
    modifychange (evt) {
      console.log('modify change: ', evt)
    },
    ondrawend (evt) {
      this.delIndexList = []
      const geometry = evt.feature.getGeometry()
      if (this.turningFeatures[0].coordinates.length > 0) {
        this.turningFeatures[0].coordinates.forEach((coordinate, index) => {
          const pt = turf.point(coordinate)
          const polygon = turf.polygon(geometry.getCoordinates())
          const bool = turf.booleanPointInPolygon(pt, polygon)
          if (bool) {
            this.delIndexList.push(index)
          }
        })
      }
    },
    delPoint () {
      if (this.delIndexList.length > 0) {
        this.features[0].coordinates = this.removeElementsByIndexes(this.features[0].coordinates, this.delIndexList)
        this.turningFeatures[0].coordinates = this.features[0].coordinates
        this.drawType = ''
      }
    },
    removeElementsByIndexes (arr, indexes) {
      return arr.filter((_, index) => !indexes.includes(index))
    }
  },
  created () {
  },
  mounted () {
  }
}
</script>

<style scoped>

</style>
