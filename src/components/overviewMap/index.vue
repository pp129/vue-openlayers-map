<script>
import tile from '@/components/layers/tile/index.vue'
import { View } from 'ol'
import { OverviewMap } from 'ol/control'

export default {
  name: 'v-overview',
  render (createElement, context) {
    return null
  },
  extends: tile,
  inject: ['VMap'],
  props: {
    className: {
      type: String
    },
    collapsed: {
      type: Boolean
    },
    collapseLabel: {
      type: String
    },
    collapsible: {
      type: Boolean
    },
    render: {
      type: Function
    },
    rotateWithView: {
      type: Boolean
    },
    target: {
      type: String
    },
    tipLabel: {
      type: String
    },
    view: {
      type: Object
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    tileType: {
      handler (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          this.clearLayer(oldValue)
          this.initLayers()
          this.initOverview()
        }
      },
      immediate: false,
      deep: true
    },
    rotateWithView: {
      handler (value) {
        this.overview.setRotateWithView(value)
      },
      immediate: false
    },
    collapsed: {
      handler (value) {
        this.overview.setCollapsed(value)
      },
      immediate: false
    },
    collapsible: {
      handler (value) {
        this.overview.setCollapsible(value)
      },
      immediate: false
    }
  },
  data () {
    return {
      overview: null
    }
  },
  methods: {
    initLayers () {
      this.addForOverview = true
      this.init()
    },
    clearLayer (oldValue) {
      const layers = this.overview.getOverviewMap().getLayers().getArray().filter(x => x.get('base'))
      if (layers && layers.length > 0) {
        layers.forEach(layer => {
          if (layer.get('tileType') === oldValue || layer.get('isDefault')) {
            this.overview.getOverviewMap().removeLayer(layer)
          }
        })
      }
      // this.clear(value)
    },
    initOverview () {
      const viewOptDefault = {
        ...{
          constrainResolution: false,
          projection: 'EPSG:4326'
        },
        ...this.view
      }
      const option = {
        ...this.$props,
        view: new View(viewOptDefault),
        layers: this.layers
      }
      this.overview = new OverviewMap(option)
      this.map.addControl(this.overview)
    }
  },
  mounted () {
    this.initLayers()
    this.initOverview()
  },
  beforeUnmount () {
    this.addForOverview = false
    this.map.removeControl(this.overview)
  }
}
</script>

<style scoped>

</style>
