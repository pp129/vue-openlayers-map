<script>
import { addOverviewMapControl } from '~/utils'
import { View } from 'ol'

export default {
  name: 'v-overview',
  render (createElement, context) {
    return null
  },
  inject: ['VMap'],
  props: {
    collapsible: {
      type: Boolean,
      default: true
    },
    collapsed: {
      type: Boolean,
      default: true
    },
    // layers: {
    //   type: Array
    // },
    view: {
      type: Object
    }
  },
  data () {
    return {
      overview: null,
      layers: []
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  mounted () {
    if (!this.$slots.default || this.$slots.default.length <= 0) {
      this.layers = this.map.getLayers().getArray().filter(x => x.get('base') === true)
      this.init()
    }
  },
  beforeDestroy () {
    this.map.removeControl(this.overview)
  },
  methods: {
    init () {
      // const overviewLayer = baseTile(this.layers, this.layers)
      const viewOptDefault = {
        ...{
          constrainResolution: false,
          projection: 'EPSG:4326'
        },
        ...this.view
      }
      const option = {
        view: new View(viewOptDefault),
        layers: this.layers,
        collapsible: this.collapsible,
        collapsed: this.collapsed
      }
      this.overview = addOverviewMapControl(option)
      this.map.addControl(this.overview)
    }
  }
}
</script>

<style scoped>

</style>
