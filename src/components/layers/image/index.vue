<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import Projection from 'ol/proj/Projection'
import ImageLayer from 'ol/layer/Image'
import Layer from 'ol-ext/layer/GeoImage'
import Source from 'ol-ext/source/GeoImage'
import Static from 'ol/source/ImageStatic'
import { validObjKey } from '@/utils'

export default {
  name: 'v-image',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `image-layer-${nanoid()}`
      }
    },
    source: {
      type: Object
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
    geoImage: {
      type: Boolean,
      default: false
    },
    opacity: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      layer: null,
      layerOpt: {}
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
    }
  },
  methods: {
    init () {
      if (this.geoImage) {
        this.layer = new Layer({
          opacity: this.opacity,
          source: new Source(this.source)
        })
      } else {
        let extent = [0, 0, 180, 90]
        if (validObjKey(this.source, 'extent')) {
          extent = this.source.extent
        }
        const projection = new Projection({
          code: 'EPSG:4326',
          units: 'pixels',
          extent
        })
        const sourceOpts = {
          ...this.source,
          ...projection
        }
        const source = new Static(sourceOpts)
        this.layer = new ImageLayer({
          source
        })
      }

      this.layer.set('id', this.layerId)
      this.layer.set('type', 'image')
      this.layer.set('users', true)
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex)
      }
      this.map.addLayer(this.layer)
      this.$emit('load', this.layer, this.map)
    },
    dispose () {
      this.map.removeLayer(this.layer)
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.dispose()
  }
}
</script>

<style scoped>

</style>
