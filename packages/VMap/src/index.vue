<template>
  <div :id="target" :style="{'width':width,'height':height}"></div>
</template>

<script>
import { VMap } from '~/VMap/src/VMap.js'
// 轨迹动画
import track from '~/VMap/src/utils/track'
// import track from '~/VMap/src/utils/trackAnimation'

export default {
  name: 'v-map',
  props: {
    width: {
      type: [String, Number],
      default: '1920px'
    },
    height: {
      type: [String, Number],
      default: '960px'
    },
    option: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    mapOption () {
      return Object.assign({
        target: 'map',
        controls: {},
        baseTile: ['td'],
        visibleTile: 'td',
        overview: false,
        view: {
          center: [0, 0],
          zoom: 10,
          animate: null
        },
        layers: [],
        overlays: [],
        track: [],
        interaction: [],
        measure: false,
        updateLayers: []
      }, this.option)
    },
    map () {
      return VMap.map.map
    },
    target () {
      return this.mapOption.target
    },
    layers () {
      return this.mapOption.layers
    },
    overlays () {
      return this.mapOption.overlays
    },
    visibleTile () {
      return this.mapOption.visibleTile
    },
    interaction () {
      return this.mapOption.interaction
    },
    measure () {
      return this.mapOption.measure
    },
    track () {
      return this.mapOption.track
    }
  },
  watch: {
    layers: {
      handler (value) {
        console.log('layers change', value)
        if (value) {
          if (this.mapOption.updateLayers && this.mapOption.updateLayers.length > 0) {
            // 局部更新图层
            this.mapOption.updateLayers.forEach(updateLayer => {
              const index = value.findIndex(x => x.id === updateLayer)
              console.log(index, updateLayer)
              if (index > -1) {
                value.forEach(layer => {
                  if (layer.id === updateLayer) {
                    this.setLayer(layer)
                  }
                })
              } else {
                this.removeLayerById(updateLayer)
                const indexUpdate = this.mapOption.updateLayers.map(item => item.id).indexOf(updateLayer)
                this.mapOption.updateLayers.splice(indexUpdate, 1)
              }
            })
          } else {
            // 全量更新
            this.setLayers(value)
          }
        }
      },
      deep: true,
      immediate: false
    },
    overlays: {
      handler (value) {
        if (value) {
          console.log('overlays change', value)
          this.setOverlays(value)
        }
      },
      deep: true,
      immediate: false
    },
    visibleTile: {
      handler (value, oldValue) {
        console.log('visibleTile change', value, oldValue)
        if (this.mapOption.baseTile.length > 1 && value !== oldValue) { // 理论上有多基础图层的情况下才有必要走这一步
          this.restVisibleBaseTile(value)
        }
      },
      deep: true,
      immediate: false
    },
    interaction: {
      handler (value) {
        console.log('interaction change', value)
        this.setInteraction(value)
      }
    },
    measure: {
      handler (value) {
        console.log('measure change', value)
        this.setMeasure(value)
      }
    },
    track: {
      handler (value) {
        if (value) {
          console.log('track change', value)
          value.forEach(item => {
            if (item.state) {
              switch (item.state) {
                case 'start':
                  track.start(item.speed)
                  break
              }
            }
          })
        }
      },
      deep: true,
      immediate: false
    }
  },
  data () {
    return {}
  },
  mounted () {
    this.init()
  },
  methods: {
    validObjKey (obj, key) {
      return obj && Object.prototype.hasOwnProperty.call(obj, key) && Object.keys(obj).length > 0
    },
    init () {
      VMap.map = new VMap(this.option)
      // 点击事件
      this.map.on('click', evt => {
        this.$emit('click', evt, this.map)
      })
      // 层级变化
      this.map.getView().once('change:resolution', () => {
        this.map.once('moveend', (evt) => {
          this.zoomEnd(evt)
        })
      })
      // 初始化轨迹图层
      this.mapOption.track.forEach(item => {
        const option = Object.assign({}, item, {
          map: this.map
        })
        track.init(option)
      })
    },
    zoomEnd (evt) {
      this.$emit('changeZoom', evt, this.map)
      evt.map.once('moveend', (evt) => {
        this.zoomEnd(evt)
      })
    },
    reloadLayer (layers) {
      layers.forEach(layer => { this.setLayer(layer) })
    },
    getMap () {
      return VMap.map
    },
    setLayer (layer) {
      VMap.setLayer(layer)
    },
    setLayers (layers) {
      this.map.getLayers().forEach(layer => {
        let index = -1
        if (layer && layer.get('users')) {
          layers.forEach(item => {
            if (item.id === layer.get('id')) {
              index++
            }
          })
          if (index < 0) {
            VMap.removeLayer(layer)
          }
        }
      })
      layers.forEach(layer => { this.setLayer(layer) })
    },
    removeLayerById (id) {
      VMap.removeLayerById(id)
    },
    restVisibleBaseTile (visibleTile) {
      console.log('reset tile')
      VMap.restVisibleBaseTile(visibleTile)
    },
    setOverlays (overlays) {
      overlays.forEach(val => {
        VMap.addOverlay(val)
      })
    },
    setOverlayPosition (overlays) {
      overlays.forEach(overlay => {
        VMap.setOverlayPosition(overlay)
      })
    },
    setInteraction (value) {
      VMap.setInteraction(value)
      let modify
      let draw
      this.map.getInteractions().forEach(item => {
        if (item.get('type') === 'modify') {
          modify = item
        }
        if (item.get('type') === 'draw') {
          draw = item
        }
      })
      if (modify) {
        modify.on('modifystart', evt => {
          this.$emit('modifystart', evt, this.map)
        })
        modify.on('modifyend', evt => {
          this.$emit('modifyend', evt, this.map)
        })
      }
      if (draw) {
        draw.on('drawstart', evt => {
          this.$emit('drawstart', evt, this.map)
        })
        draw.on('drawend', evt => {
          this.$emit('drawend', evt, this.map)
        })
      }
    },
    setMeasure (value) {
      VMap.setMeasure(value)
      let measure
      this.map.getInteractions().forEach(item => {
        if (item.get('measureDraw')) {
          measure = item
          if (!value) {
            VMap.removeInteraction(measure)
            return false
          }
        }
      })
      if (measure) {
        measure.on('drawstart', evt => {
          this.$emit('measurestart', evt, this.map)
        })
        measure.on('drawend', evt => {
          this.$emit('measureend', evt, this.map)
        })
      }
    },
    setFeature (option) {
      return VMap.setFeature(option)
    },
    getCenterByExtent (extent) {
      return VMap.getCenterByExtent(extent)
    },
    panTo (option) {
      VMap.panTo(option.center, option.zoom)
    },
    getDistancePoint (from, to, units) {
      return VMap.getDistancePoint(from, to, units)
    },
    getDistanceString (lines, units) {
      return VMap.getDistanceString(lines, units)
    }
  }
}
</script>

<style scoped>

</style>
