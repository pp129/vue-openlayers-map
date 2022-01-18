<template>
  <div :id="target" :style="{'width':width,'height':height}"></div>
</template>

<script>
import { VMap } from '~/VMap/src/VMap.js'
// todo 轨迹动画
// import track from '~/VMap/src/utils/track'
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
    map () {
      return VMap.map.map
    },
    target () {
      return this.option.target || 'map'
    },
    animate () {
      return this.option.view.animate
    },
    layers () {
      return this.option.layers
    },
    overlays () {
      return this.option.overlays
    },
    visibleTile () {
      return this.option.visibleTile
    },
    interaction () {
      return this.option.interaction
    },
    measure () {
      return this.option.measure
    }
    // track () {
    //   return this.option.track
    // }
  },
  watch: {
    animate: {
      handler (value) {
        if (value) {
          console.log('view animate change', value)
          const center = value.center
          const zoom = value.zoom
          VMap.panTo(center, zoom)
        }
      },
      deep: true,
      immediate: false
    },
    layers: {
      handler (value) {
        console.log('layers change', value)
        if (value) {
          if (this.option.updateLayers && this.option.updateLayers.length > 0) {
            // 局部更新图层
            this.option.updateLayers.forEach(updateLayer => {
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
                const indexUpdate = this.option.updateLayers.map(item => item.id).indexOf(updateLayer)
                this.option.updateLayers.splice(indexUpdate, 1)
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
        if (this.option.baseTile.length > 1 && value !== oldValue) { // 理论上有多基础图层的情况下才有必要走这一步
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
    }
    // track: {
    //   handler (value) {
    //     if (value) {
    //       console.log('track change', value)
    //       value.forEach(item => {
    //         if (item.state) {
    //           switch (item.state) {
    //             case 'start':
    //               track.start(item.speed)
    //               break
    //           }
    //         }
    //       })
    //     }
    //   },
    //   deep: true,
    //   immediate: false
    // }
  },
  data () {
    return {
      users: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
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
      // this.option.track.forEach(item => {
      //   const option = Object.assign({}, item, {
      //     map: this.map
      //   })
      //   track.init(option)
      // })
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
      console.log(value)
      VMap.setMeasure(value)
      let measure
      this.map.getInteractions().forEach(item => {
        console.log(item)
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
    }
  }
}
</script>

<style scoped>

</style>
