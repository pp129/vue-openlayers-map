import Vue from 'vue'
import VMap from '~/VMap/src/index.vue'
import { VTileLayer, VVectorLayer, VGraphicLayer, VHeatmapLayer, VClusterLayer, VRouteLayer } from '~/VLayers'
import { VOverlay } from '~/VOverlay'
import { VOverview } from '~/VControls'
import { VTrack } from '~/VTrack'

Vue.component(VMap.name, VMap)
// import VMap from '~/VMap/index.js'
const components = [VMap, VTileLayer, VVectorLayer, VGraphicLayer, VHeatmapLayer, VClusterLayer, VRouteLayer, VOverlay, VOverview, VTrack]

const install = function (Vue) {
  if (install.installed) return
  components.map(component => {
    Vue.use(component)
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
  VOverlay,
  VOverview,
  VTrack
}
export {
  VMap,
  VTileLayer,
  VVectorLayer,
  VGraphicLayer,
  VHeatmapLayer,
  VClusterLayer,
  VRouteLayer,
  VOverlay,
  VOverview,
  VTrack
}
