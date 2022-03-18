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
      type: [Number, String],
      default: 15
    },
    radius: {
      type: [Number, String],
      default: 8
    },
    weight: {
      type: [String, Function],
      default: 'weight'
    }
  },
  watch: {
    visible: {
      handler (value) {
        console.log('heatmap layer visible change', value)
        this.layer.setVisible(value)
      },
      immediate: false
    },
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
    const option = {
      source: source,
      blur: this.blur,
      radius: this.radius,
      weight: this.weight
    }
    this.layer = new HeatmapLayer(option)
    this.layer.set('id', this.layerId)
    this.layer.set('type', 'heatmap')
    this.layer.set('users', true)
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
