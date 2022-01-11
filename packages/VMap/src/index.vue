<template>
  <div ref="map" id="map" :style="{'width':width,'height':height}"></div>
</template>

<script>
import { VMap } from './VMap.js'

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
        return {
          layers: [],
          view: {},
          baseTile: []
        }
      }
    }
  },
  computed: {
    map () {
      return VMap.map.map
    }
  },
  watch: {
    option: {
      handler (value) {
        console.log('watch option ----> ', value)
        if (value.updateLayers && value.updateLayers.length > 0) {
          // 局部更新图层
          value.updateLayers.forEach(updateLayer => {
            value.layers.forEach(layer => {
              if (layer.id === updateLayer) {
                this.setLayer(layer)
              }
            })
          })
        } else {
          // 全量更新
          this.setLayers(value.layers)
        }
        if (value.baseTile.length > 1) { // 理论上有多基础图层的情况下才有必要走这一步
          this.restVisibleBaseTile(value.visibleTile)
        }
        this.setOverlayPosition(value.overlays)
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
    init () {
      VMap.map = new VMap(this.option)
      // 添加事件
      if (Object.prototype.hasOwnProperty.call(this.option, 'eventListeners') && this.option.eventListeners && this.option.eventListeners.length > 0) {
        // 点击事件
        if (this.option.eventListeners.indexOf('click') > -1) {
          this.map.on('click', evt => {
            this.$emit('click', evt, this.map)
          })
        }
        // 层级变化
        if (this.option.eventListeners.indexOf('changeZoom') > -1) {
          this.map.getView().once('change:resolution', () => {
            this.map.once('moveend', (evt) => {
              this.zoomEnd(evt)
            })
          })
        }
      }
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
      layers.forEach(layer => { this.setLayer(layer) })
    },
    restVisibleBaseTile (visibleTile) {
      VMap.restVisibleBaseTile(visibleTile)
    },
    setOverlayPosition (overlays) {
      overlays.forEach(overlay => {
        VMap.setOverlayPosition(overlay)
      })
    }
  }
}
</script>

<style scoped>

</style>
