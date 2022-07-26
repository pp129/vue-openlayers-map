<script>
import BaseLayer from '~/VLayers/BaseLayer'
import { addClusterLayer, addVectorSource, olCluster, setFeatures, uuid } from '~/utils'

export default {
  name: 'v-cluster-layer',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `cluster-layer-${uuid()}`
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
    distance: {
      handler (value) {
        this.cluster.setDistance(value)
      },
      immediate: false
    },
    minDistance: {
      handler (value) {
        this.cluster.setMinDistance(value)
      },
      immediate: false
    },
    features: {
      handler (value) {
        if (value && value.length > 0) {
          this.dispose()
          this.init()
        }
      },
      immediate: false
    },
    visible: {
      handler (value) {
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
      this.cluster = olCluster(option)
      const layerOpt = { ...this.$props, ...{ source: this.cluster, style: this.FeatureStyle } }
      this.layer = addClusterLayer(layerOpt, this.map)
      this.layer.set('id', this.layerId)
      this.layer.set('type', 'cluster')
      this.layer.set('users', true)
      this.layer.setZIndex(1)
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
