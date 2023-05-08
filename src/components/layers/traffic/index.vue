<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import TrafficLayer from '@/utils/TrafficLayer'
import { unByKey } from 'ol/Observable'

export default {
  name: 'v-traffic',
  render () {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `traffic-layer-${nanoid()}`
      }
    },
    timeout: {
      type: Number
    },
    url: {
      type: String,
      require: true
    },
    clearCache: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      timer: null,
      trafficLayer: null,
      eventRender: [],
      eventList: ['singleclick', 'pointermove']
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
        this.trafficLayer.layer.setVisible(value)
      },
      immediate: false
    },
    zIndex: {
      handler (value) {
        this.trafficLayer.layer.setZIndex(value)
      },
      immediate: false
    },
    maxZoom: {
      handler (value) {
        this.trafficLayer.layer.setMaxZoom(value)
      },
      immediate: false
    },
    minZoom: {
      handler (value) {
        this.trafficLayer.layer.setMinZoom(value)
      },
      immediate: false
    },
    extent: {
      handler (value) {
        this.trafficLayer.layer.setExtent(value)
      },
      immediate: false,
      deep: true
    }
  },
  methods: {
    init () {
      this.trafficLayer = new TrafficLayer({
        map: this.map,
        trafficURL: this.url
      })
      this.trafficLayer.layer.set('id', this.layerId)
      this.trafficLayer.layer.set('type', 'traffic')
      this.trafficLayer.layer.set('users', true)
      if (this.zIndex) {
        this.trafficLayer.layer.setZIndex(this.zIndex)
      }
      this.map.addLayer(this.trafficLayer.layer)
      if (this.timeout) {
        this.timer = setInterval(() => {
          this.trafficLayer.draw({
            clearCache: this.clearCache
          })
        }, this.timeout)
      }
      // 绑定事件
      this.eventList.forEach(listenerKey => {
        this.eventRender.push(this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt)))
      })
    },
    getFeatureAtPixel (pixel) {
      return this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer.get('id') === this.trafficLayer.layer.get('id')) return feature
      }, {})
    },
    eventHandler (listenerKey, evt) {
      const { pixel } = evt
      const feature = this.getFeatureAtPixel(pixel)
      this.$emit(listenerKey, evt, feature)
    },
    dispose () {
      // 移除事件
      this.eventRender.forEach(listenerKey => {
        unByKey(listenerKey)
      })
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      if (this.trafficLayer) {
        this.trafficLayer.layer.getSource().clear()
        this.map.removeLayer(this.trafficLayer.layer)
      }
    }
  },
  mounted () {
    this.init()
  },
  update () {
    if (this.trafficLayer) {
      this.dispose()
    }
    this.init()
  },
  beforeDestroy () {
    this.dispose()
  }
}
</script>

<style scoped>

</style>