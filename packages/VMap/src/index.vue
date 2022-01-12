<template>
  <div :id="target" :style="{'width':width,'height':height}"></div>
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
    }
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
        this.setLayers(value)
      },
      deep: true,
      immediate: false
    },
    overlays: {
      handler (value) {
        if (value) {
          console.log('overlays change', value)
          this.setOverlayPosition(value)
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
    }
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
      this.users = []
      VMap.map.map.getLayers().forEach(layer => {
        if (layer && layer.get('users')) {
          this.users.push(layer.get('id'))
        }
      })
      layers.forEach(layer => { this.setLayer(layer) })
    },
    restVisibleBaseTile (visibleTile) {
      console.log('reset tile')
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
