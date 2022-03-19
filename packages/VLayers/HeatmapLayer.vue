<template>
  <div><slot></slot></div>
</template>

<script>
import BaseLayer from '~/VLayers/BaseLayer'
import { Heatmap as HeatmapLayer } from 'ol/layer'
import { addVectorSource, setFeatures, uuid } from '~/utils'

export default {
  name: 'v-heatmap-layer',
  extends: BaseLayer,
  inject: ['VMap'],
  data () {
    return {
      layer: null
    }
  },
  props: {
    layerId: {
      type: String,
      default () {
        return `vector-layer-${uuid()}`
      }
    },
    source: {
      type: [Object, undefined],
      default () {
        return { features: [] }
      }
    },
    features: {
      type: Array,
      default () {
        return []
      }
    },
    blur: {
      type: Number,
      default: 15
    },
    radius: {
      type: Number,
      default: 8
    },
    weight: {
      type: [String, Function],
      default: 'weight'
    }
  },
  watch: {
    features: {
      handler (value) {
        console.log('layer features change', value)
        this.layer.getSource().clear()
        if (value && value.length > 0) {
          const features = setFeatures(value, this.map)
          this.layer.getSource().addFeatures(features)
        }
      },
      immediate: false
    },
    blur: {
      handler (value) {
        this.layer.setBlur(value)
      },
      immediate: false
    },
    radius: {
      handler (value) {
        this.layer.setRadius(value)
      },
      immediate: false
    },
    visible: {
      handler (value) {
        console.log('heatmap layer visible change', value)
        this.layer.setVisible(value)
      },
      immediate: false
    },
    zIndex: {
      handler (value) {
        this.layer.setZIndex(value)
      },
      immediate: false
    },
    maxZoom: {
      handler (value) {
        this.layer.setMaxZoom(value)
      },
      immediate: false
    },
    minZoom: {
      handler (value) {
        this.layer.setMinZoom(value)
      },
      immediate: false
    },
    extent: {
      handler (value) {
        this.layer.setExtent(value)
      },
      immediate: false
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  mounted () {
    const source = addVectorSource(this.source, this.map)
    if (this.source.features.length <= 0 && this.features.length > 0) {
      const features = setFeatures(this.features, this.map)
      source.addFeatures(features)
    }
    const layerOpt = { ...this.$props, ...{ source: source } }
    this.layer = new HeatmapLayer(layerOpt)
    this.layer.set('id', this.layerId)
    this.layer.set('type', 'heatmap')
    this.layer.set('users', true)
    this.layer.setZIndex(1)
    this.map.addLayer(this.layer)
  },
  beforeDestroy () {
    this.layer.getSource().clear()
    this.map.removeLayer(this.layer)
  }
}
</script>

<style scoped>

</style>
