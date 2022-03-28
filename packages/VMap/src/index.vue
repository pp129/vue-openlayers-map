<template>
  <div :id="target" :style="{'width':width,'height':height}"><slot v-if="load"></slot></div>
</template>

<script>
import { VMap } from '~/VMap/src/VMap.js'
import { uuid } from '~/utils'

export default {
  name: 'v-map',
  provide () {
    return {
      VMap: this
    }
  },
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
    }
  },
  computed: {
    mapOption () {
      return {
        target: this.target,
        view: this.view,
        controls: this.controls
      }
    },
    map () {
      return VMap.map.map
    }
  },
  watch: {
  },
  data () {
    return {
      load: false
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
        this.map.on('singleclick', (r) => {
          this.map.forEachSmFeatureAtPixel(r.pixel, (i, e) => {
            this.$emit('onClickFeature', i, e)
          }, {}, r)
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
    zoomEnd (evt) {
      this.$emit('changeZoom', evt, this.map)
      evt.map.once('moveend', (evt) => {
        this.zoomEnd(evt)
      })
    },
    getMap () {
      return VMap.map
    },
    updateFeatureById (layerId, featureId, update) {
      this.map.getLayers().getArray().forEach(val => {
        console.log(val)
        if (val.get('id') === layerId) {
          const features = val.getSource().getFeatures()
          console.log(features)
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
    removeLayerById (id) {
      VMap.removeLayerById(id)
    },
    removeLayer (layer) {
      VMap.removeLayer(layer)
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
    setOverlayPosition (overlays) {
      overlays.forEach(overlay => {
        VMap.setOverlayPosition(overlay)
      })
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
    },
    setLayerVisible (layer, visible) {
      layer.setVisible(visible)
    },
    setLayerVisibleById (id, visible) {
      const layers = this.map.getLayers().getArray()
      const layer = layers.find(x => x.get('id') === id)
      if (layer) layer.setVisible(visible)
    }
  }
}
</script>

<style scoped>

</style>
