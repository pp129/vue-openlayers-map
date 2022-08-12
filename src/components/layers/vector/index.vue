<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import { addVectorSource, setFeatures, setStyle, validObjKey } from '@/utils'
import VectorLayer from 'ol/layer/Vector'
import { Modify, Select } from 'ol/interaction'
import { Collection } from 'ol'

export default {
  name: 'v-vector',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `vector-layer-${nanoid()}`
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
    },
    modify: {
      type: [Object, Boolean],
      default: false
    },
    select: {
      type: [Object, Boolean],
      default: false
    }
  },
  data () {
    return {
      layer: null,
      selectObj: null,
      modifyObj: null
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
          const features = setFeatures(value, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0)
          this.layer.getSource().addFeatures(features)
        }
      },
      immediate: false,
      deep: true
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
      immediate: false,
      deep: true
    },
    modify: {
      handler (value) {
        if (value) {
          this.setModify()
        } else {
          if (this.selectObj) {
            this.map.removeInteraction(this.selectObj)
            this.selectObj = null
          }
          if (this.modifyObj) {
            this.map.removeInteraction(this.modifyObj)
            this.modifyObj = null
          }
        }
      },
      immediate: false
    }
  },
  methods: {
    getFeatureById (id) {
      const features = this.layer.getSource().getFeatures()
      let target
      features.forEach(feature => {
        if (feature.get('id') === id || feature.getId() === id) {
          target = feature
        }
      })
      return target
    },
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
    },
    setModify () {
      let features = []
      if (this.select) {
        let selectStyle
        if (validObjKey(this.select, 'style')) {
          selectStyle = setStyle(this.select.style)
        }
        this.selectObj = new Select({
          style: selectStyle,
          layers: [this.layer]
        })
        this.map.addInteraction(this.selectObj)
        this.selectObj.on('select', evt => {
          // const params = { ...evt, ...{ select: this.select } }
          this.$emit('select', evt, this.map)
        })
        features = this.selectObj.getFeatures()
      } else {
        features = new Collection(this.layer.getSource().getFeatures())
      }
      let modifyStyle
      if (validObjKey(this.modify, 'style')) {
        modifyStyle = setStyle(this.modify.style)
      }
      this.modifyObj = new Modify({
        features,
        style: modifyStyle
      })
      this.map.addInteraction(this.modifyObj)
      this.modifyObj.on('modifystart', evt => {
        this.$emit('modifystart', evt, this.map)
        features.getArray().forEach(feature => {
          feature.getGeometry().on('change', evt => {
            this.$emit('modifychange', evt, this.map, feature)
          })
        })
      })
      this.modifyObj.on('modifyend', evt => {
        const params = { ...evt, ...{ select: this.selectObj } }
        this.$emit('modifyend', params, this.map)
      })
    }
  },
  mounted () {
    const source = addVectorSource(this.source, this.map)
    if (this.source.features.length <= 0 && this.features.length > 0) {
      const features = setFeatures(this.features, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0)
      source.addFeatures(features)
    }
    const layerOpt = { ...this.$props, ...{ source } }
    this.layer = new VectorLayer(layerOpt)
    this.layer.setStyle((feature) => {
      if (feature.get('style')) {
        return setStyle(feature.get('style'))
      } else {
        if (this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0) {
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
    this.$emit('load', this.layer, this.map)
    if (this.modify) {
      this.setModify()
    }
  },
  beforeUnmount () {
    this.layer.getSource().clear()
    this.map.removeLayer(this.layer)
    this.map.removeInteraction(this.selectObj)
    this.map.removeInteraction(this.modifyObj)
  }
}
</script>

<style scoped>

</style>
