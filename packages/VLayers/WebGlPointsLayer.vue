<script>
import BaseLayer from './BaseLayer'
import { addVectorSource, setFeatures, uuid, WebGLPointsLayer } from '~/utils'

export default {
  name: 'v-webglpoints-layer',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `webgl-layer-${uuid()}`
      }
    },
    source: {
      type: Object,
      default () {
        return { features: [] }
      }
    },
    features: {
      type: Array,
      default: () => []
    },
    disableHitDetection: {
      type: Boolean,
      default: false
    },
    styles: {
      type: Object,
      default: () => ({
        symbol: {
          symbolType: 'circle',
          size: 8,
          color: '#33AAFF',
          opacity: 0.9
        }
      })
    }
  },
  data () {
    return {
      layer: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    features: {
      handler (value) {
        console.log('layer features change', value)
        this.map.removeLayer(this.layer)
        this.layer.dispose()
        this.init()
      },
      immediate: false
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.map.removeLayer(this.layer)
  },
  methods: {
    init () {
      const source = addVectorSource(this.source, this.map)
      if (this.source.features.length <= 0 && this.features.length > 0) {
        const features = setFeatures(this.features, this.map)
        source.addFeatures(features)
      }
      console.log(this.styles)
      const layerOpt = { ...this.$props, ...{ source: source, style: this.styles } }
      console.log(layerOpt)
      this.layer = WebGLPointsLayer(layerOpt)
      this.map.addLayer(this.layer)
    }
  }
}
</script>

<style scoped>

</style>
