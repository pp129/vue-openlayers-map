<script>
import BaseLayer from './BaseLayer'
import { addVectorSource, setFeatures, setStyle, uuid, vectorLayer } from '~/utils'

export default {
  name: 'v-vector-layer',
  render (createElement, context) {
    return null
  },
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
    features: {
      type: Array,
      default () {
        return []
      }
    },
    FeatureStyle: {
      type: [Object, Boolean],
      default () {
        return false
      }
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
        this.layer.getSource().clear()
        if (value && value.length > 0) {
          const features = setFeatures(value, this.map, true)
          this.layer.getSource().addFeatures(features)
        }
      },
      immediate: false
    },
    visible: {
      handler (value) {
        console.log('layer visible change', value)
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
    const source = addVectorSource(this.source, this.map)
    if (this.source.features.length <= 0 && this.features.length > 0) {
      const features = setFeatures(this.features, this.map, true)
      source.addFeatures(features)
    }
    const layerOpt = { ...this.$props, ...{ source: source } }
    this.layer = vectorLayer(layerOpt)
    this.layer.setStyle((feature) => {
      if (feature.get('style')) {
        return setStyle(feature.get('style'))
      } else {
        if (this.FeatureStyle) {
          return setStyle(this.FeatureStyle)
        } else {
          return setStyle({
            fill: {
              color: 'rgba(67,126,255,0.15)'
            },
            stroke: {
              color: 'rgba(67,126,255,1)',
              width: 1
              // lineDash: [20, 10, 20, 10]
            }
          })
        }
      }
    })
    this.layer.set('id', this.layerId)
    this.layer.set('type', 'vector')
    this.layer.set('users', true)
    this.layer.setZIndex(1)
    this.map.addLayer(this.layer)
  },
  beforeDestroy () {
    this.layer.getSource().clear()
    this.map.removeLayer(this.layer)
  },
  methods: {
    updateFeatureById (featureId, update) {
      const features = this.layer.getSource().getFeatures()
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
  }
}
</script>

<style scoped>

</style>
