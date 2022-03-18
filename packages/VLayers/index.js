import VVectorLayer from './VectorLayer.vue'
import VGraphicLayer from '~/VLayers/GraphicLayer'
import VHeatmapLayer from '~/VLayers/HeatmapLayer'
import VClusterLayer from '~/VLayers/ClusterLayer'

function install (app) {
  if (install.installed) {
    return
  }

  install.installed = true

  app.component(VVectorLayer.name, VVectorLayer)
  app.component(VGraphicLayer.name, VGraphicLayer)
  app.component(VHeatmapLayer.name, VHeatmapLayer)
  app.component(VClusterLayer.name, VClusterLayer)
}

export default install

export {
  install,
  VVectorLayer,
  VGraphicLayer,
  VHeatmapLayer,
  VClusterLayer
}
