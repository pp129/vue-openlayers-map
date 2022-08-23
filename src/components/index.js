import VMap from '@/components/map/index'
import VOverview from '@/components/overviewMap/index'
import VOverlay from '@/components/overlay/index'
import VTile from '@/components/layers/tile/index'
import VVector from '@/components/layers/vector/index'
import VRoute from '@/components/layers/route/index'
import VHeatmap from '@/components/layers/heatmap/index'
import VGraphic from '@/components/layers/graphic/index'
import VDraw from '@/components/layers/draw/index'
import VMeasure from '@/components/layers/measure/index'
import VTrack from '@/components/track/index'

const components = [VMap, VOverview, VOverlay, VTile, VVector, VRoute, VHeatmap, VGraphic, VDraw, VMeasure, VTrack]

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
  ...components
}

export {
  VMap,
  VOverview,
  VOverlay,
  VTile,
  VVector,
  VRoute,
  VHeatmap,
  VGraphic,
  VDraw,
  VMeasure,
  VTrack
}
