<template>
  <div><slot></slot></div>
</template>

<script>
import BaseLayer from '~/VLayers/BaseLayer'
import { addClusterLayer, addVectorSource, setFeatures, uuid } from '~/utils'
import { Cluster } from 'ol/source'

export default {
  name: 'v-cluster-layer',
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `vector-layer-${uuid()}`
      }
    },
    source: {
      type: Object,
      default () {
        return { features: [] }
      }
    },
    distance: {
      type: Number,
      default: 20
    },
    minDistance: {
      type: Number,
      default: 0
    },
    features: {
      type: Array,
      default () {
        return []
      }
    },
    FeatureStyle: {
      type: [Array, undefined],
      default () {
        return undefined
      }
    }
  },
  data () {
    return {
      layer: null,
      cluster: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    visible: {
      handler (value) {
        console.log('layer visible change', value)
        this.layer.setVisible(value)
      },
      immediate: false
    },
    distance: {
      handler (value) {
        console.log('layer visible change', value)
        this.cluster.setDistance(value)
      },
      immediate: false
    },
    minDistance: {
      handler (value) {
        console.log('layer visible change', value)
        this.cluster.setMinDistance(value)
      },
      immediate: false
    },
    features: {
      handler (value) {
        console.log('layer features change', value)
        if (value && value.length > 0) {
          this.dispose()
          this.init()
        }
      },
      immediate: false
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.dispose()
  },
  methods: {
    init () {
      const source = addVectorSource(this.source, this.map)
      if (this.source.features.length <= 0 && this.features.length > 0) {
        const features = setFeatures(this.features, this.map)
        source.addFeatures(features)
      }
      const option = {
        source: source,
        distance: this.distance,
        minDistance: this.minDistance
      }
      this.cluster = new Cluster(option)
      const layerOption = {
        source: this.cluster,
        style: this.FeatureStyle
      }
      this.layer = addClusterLayer(layerOption, this.map)
      this.layer.set('id', this.layerId)
      this.layer.set('type', 'cluster')
      this.layer.set('users', true)
      this.map.addLayer(this.layer)
    },
    dispose () {
      this.cluster.clear()
      this.map.removeLayer(this.layer)
    }
  }
}
</script>

<style scoped>

</style>
