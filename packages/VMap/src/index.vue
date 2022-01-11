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
        this.setLayers(value.layers)
        this.restVisibleBaseTile(value.visibleTile)
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
      this.map.on('click', evt => {
        this.$emit('click', evt, this.map)
      })
      // 添加事件
      if (Object.prototype.hasOwnProperty.call(this.option, 'eventListeners') && this.option.eventListeners && this.option.eventListeners.length > 0) {
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
