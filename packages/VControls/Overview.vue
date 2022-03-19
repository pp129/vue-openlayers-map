<template>
  <div><slot></slot></div>
</template>

<script>
import { addOverviewMapControl, baseTile } from '~/utils'
import { View } from 'ol'

export default {
  name: 'v-overview',
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
    layers: {
      type: Array
    },
    view: {
      type: Object
    }
  },
  data () {
    return {
      overview: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  mounted () {
    const overviewLayer = baseTile(this.layers, this.layers)
    const viewOptDefault = {
      ...{
        constrainResolution: false,
        projection: 'EPSG:4326'
      },
      ...this.view
    }
    const option = {
      view: new View(viewOptDefault),
      layers: overviewLayer,
      collapsible: this.collapsible,
      collapsed: this.collapsed
    }
    this.overview = addOverviewMapControl(option)
    this.map.addControl(this.overview)
  },
  beforeDestroy () {
    this.map.removeControl(this.overview)
  }
}
</script>

<style scoped>

</style>
