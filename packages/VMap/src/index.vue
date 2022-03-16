<template>
  <div :id="target" :style="{'width':width,'height':height}"></div>
</template>

<script>
import { VMap } from '~/VMap/src/VMap.js'
// 轨迹动画
import PathSimplifier from '~/VMap/src/utils/track'
import { uuid } from '~/VMap/src/utils'

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
    target: {
      type: String,
      default: `map-${uuid()}`
    },
    controls: {
      type: Object,
      default () {
        return {
          zoom: false,
          rotate: false
        }
      }
    },
    baseTile: {
      type: Array,
      default () {
        return ['td']
      }
    },
    visibleTile: {
      type: [String, Object],
      default () {
        return this.baseTile[0]
      }
    },
    overview: {
      type: [String, Array, Boolean, Object],
      default: false
    },
    view: {
      type: Object,
      default () {
        return {
          center: [0, 0],
          zoom: 12,
          constrainResolution: true,
          projection: 'EPSG:4326'
        }
      }
    },
    layers: {
      type: Array,
      default () {
        return []
      }
    },
    heatmaps: {
      type: Array,
      default () {
        return []
      }
    },
    clusters: {
      type: Array,
      default () {
        return []
      }
    },
    graphicLayers: {
      type: Array,
      default () {
        return []
      }
    },
    overlays: {
      type: Array,
      default () {
        return []
      }
    },
    track: {
      type: Array,
      default () {
        return []
      }
    },
    interaction: {
      type: Array,
      default () {
        return []
      }
    },
    measure: {
      type: [Boolean, Array],
      default () {
        return false
      }
    }
  },
  computed: {
    mapOption () {
      return {
        target: this.target,
        view: this.view,
        controls: this.controls,
        baseTile: this.baseTile,
        visibleTile: this.visibleTile,
        overview: this.overview,
        layers: this.layers,
        heatmaps: this.heatmaps,
        clusters: this.clusters,
        graphicLayers: this.graphicLayers,
        overlays: this.overlays,
        track: this.track,
        interaction: this.interaction,
        measure: this.measure
      }
    },
    map () {
      return VMap.map.map
    }
  },
  watch: {
    layers: {
      handler (value) {
        console.log('layers change', value)
        if (value) {
          this.setLayers(value)
        }
      },
      deep: true,
      immediate: false
    },
    heatmaps: {
      handler (value) {
        console.log('heatmaps change', value)
        if (value) {
          this.setHeatmaps(value)
        }
      },
      deep: true,
      immediate: false
    },
    clusters: {
      handler (value) {
        console.log('clusters change', value)
        if (value) {
          this.setClusters(value)
        }
      },
      deep: true,
      immediate: false
    },
    graphicLayers: {
      handler (value) {
        console.log('graphicLayers change', value)
        if (value) {
          this.setGraphicLayers(value)
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
        if (this.baseTile.length > 1 && value !== oldValue) { // 理论上有多基础图层的情况下才有必要走这一步
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
          this.initTrack()
        }
      },
      deep: true,
      immediate: false
    }
  },
  data () {
    return {
      load: false,
      changeObj: {
        layers: [],
        overlays: []
      }
    }
  },
  mounted () {
    this.init().then(res => {
      if (res === 'success') {
        this.load = true
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
        this.$emit('load')
      }
    })
  },
  beforeDestroy () {
    this.dispose()
  },
  methods: {
    validObjKey (obj, key) {
      return obj && Object.prototype.hasOwnProperty.call(obj, key) && Object.keys(obj).length > 0
    },
    init () {
      return new Promise((resolve, reject) => {
        console.log(this.mapOption)
        VMap.map = new VMap(this.mapOption)
        if (VMap.map.map) {
          resolve('success')
        } else {
          reject(new Error('fail'))
        }
      })
    },
    dispose () {
      if (!this.map) return
      const layers = [...this.map.getLayers().getArray()]
      layers.forEach(layer => {
        if (layer) {
          const layerTitle = layer.get('users')
          if (layerTitle) {
            console.log('destroying layer', layerTitle)
            layer.getSource().clear()
            layer.getRenderer().dispose()
            layer.setSource(undefined)
            this.map.removeLayer(layer)
          }
        }
      })
      this.map.disposeInternal()
      // this.map.setTarget(null)
      // this.map = null
    },
    initTrack () {
      // 初始化轨迹图层
      const tracks = []
      this.track.forEach(item => {
        const option = Object.assign({}, item, {
          map: this.map
        })
        const track = PathSimplifier(option)
        item.target = track
        console.log(item)
        if (track) {
          tracks.push(track)
        }
      })
      if (tracks.length > 0) {
        this.$emit('onLoadTrack', tracks)
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
      return VMap.setLayer(layer, this.map)
    },
    setLayers (layers) {
      const output = []
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
      layers.forEach(layer => {
        output.push(this.setLayer(layer))
      })
      if (this.load) {
        this.changeObj.layers = output
        this.$emit('change', this.changeObj)
      }
    },
    updateFeatures (layerId, data) {
      this.map.getLayers().getArray().forEach(val => {
        if (val.get('id') === layerId) {
          console.log(val)
          val.getSource().clear()
          const features = VMap.setFeatures(data)
          val.getSource().addFeatures(features)
        }
      })
    },
    updateFeatureById (layerId, featureId, update) {
      this.map.getLayers().getArray().forEach(val => {
        if (val.get('id') === layerId) {
          const features = val.getSource().getFeatures()
          features.forEach(feature => {
            if (feature.get('id') === featureId) {
              if (typeof update === 'object') {
                for (const i in update) {
                  if (Object.prototype.hasOwnProperty.call(update, i)) {
                    feature.update(i, update[i])
                  }
                }
              }
            }
          })
        }
      })
    },
    setHeatmaps (layers) {
      this.map.getLayers().forEach(layer => {
        let index = -1
        if (layer && layer.get('type') === 'heatmap') {
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
      layers.forEach(val => {
        const layer = { ...{ id: `heatmap-${uuid()}`, type: 'heatmap' }, ...val }
        this.setLayer(layer)
      })
    },
    setClusters (layers) {
      this.map.getLayers().forEach(layer => {
        let index = -1
        if (layer && layer.get('type') === 'cluster') {
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
      layers.forEach(val => {
        const layer = { ...{ id: `heatmap-${uuid()}`, type: 'cluster' }, ...val }
        this.setLayer(layer)
      })
    },
    setGraphicLayers (layers) {
      this.map.getLayers().forEach(layer => {
        let index = -1
        if (layer && layer.get('type') === 'graphicLayer') {
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
      layers.forEach(val => {
        const layer = { ...{ id: `heatmap-${uuid()}`, type: 'graphicLayer' }, ...val }
        this.setLayer(layer)
      })
    },
    removeLayerById (id) {
      VMap.removeLayerById(id)
    },
    clearLayerById (id) {
      const layer = this.map.getLayerById(id)
      // console.log(layer)
      if (layer.get('type') === 'graphicLayer') {
        layer.setSource(null)
      } else {
        layer.getSource().clear()
      }
    },
    restVisibleBaseTile (visibleTile) {
      console.log('reset tile')
      VMap.restVisibleBaseTile(visibleTile, this.map)
    },
    setOverlays (overlays) {
      let output = []
      overlays.forEach(val => {
        output = VMap.addOverlay(val, this.map)
      })
      if (this.load && output.length > 0) {
        this.changeObj.overlays = output.getArray()
        this.$emit('change', this.changeObj)
      }
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
    },
    getFeatureById (layerId, featureId) {
      return this.map.getFeatureById(layerId, featureId)
    }
  }
}
</script>

<style scoped>

</style>
