import VMap from '~/VMap/src/index.vue'
import { VTileLayer, VVectorLayer, VGraphicLayer, VHeatmapLayer, VClusterLayer, VRouteLayer, VWebglpointsLayer } from '~/VLayers'
import VOverlay from '~/VOverlay'
import VOverview from '~/VControls'
import VTrack from '~/VTrack/index.js'
import { VDraw, VMeasure } from '~/VInteraction'

const components = [
  VMap,
  VTileLayer,
  VVectorLayer,
  VGraphicLayer,
  VHeatmapLayer,
  VClusterLayer,
  VRouteLayer,
  VWebglpointsLayer,
  VOverlay,
  VOverview,
  VTrack,
  VDraw,
  VMeasure
]

const install = function (Vue) {
  if (install.installed) return
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

//  全局引用可自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  install,
  VMap,
  VTileLayer,
  VVectorLayer,
  VGraphicLayer,
  VHeatmapLayer,
  VClusterLayer,
  VRouteLayer,
  VWebglpointsLayer,
  VOverlay,
  VOverview,
  VTrack,
  VDraw,
  VMeasure
}

export {
  VMap,
  VTileLayer,
  VVectorLayer,
  VGraphicLayer,
  VHeatmapLayer,
  VClusterLayer,
  VRouteLayer,
  VWebglpointsLayer,
  VOverlay,
  VOverview,
  VTrack,
  VDraw,
  VMeasure
}
