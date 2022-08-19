<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import { addClusterLayer, addVectorSource, setFeatures } from '@/utils'
// import { Cluster } from 'ol/source'
import OlSuperCluster from '@/utils/ol-supercluster'
// import VectorSource from 'ol/source/Vector'

export default {
  name: 'v-cluster',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `cluster-layer-${nanoid()}`
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
        source,
        view: this.map.getView(),
        radius: this.distance
      }
      this.cluster = new OlSuperCluster(option)
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