import VTileLayer from './TileLayer.vue'
import VVectorLayer from './VectorLayer.vue'
import VGraphicLayer from './GraphicLayer'
import VHeatmapLayer from './HeatmapLayer'
import VClusterLayer from './ClusterLayer'
import VRouteLayer from './RouteLayer'
import VWebglpointsLayer from './WebGlPointsLayer'

function install (app) {
  if (install.installed) {
    return
  }

  install.installed = true

  app.component(VTileLayer.name, VTileLayer)
  app.component(VVectorLayer.name, VVectorLayer)
  app.component(VGraphicLayer.name, VGraphicLayer)
  app.component(VHeatmapLayer.name, VHeatmapLayer)
  app.component(VClusterLayer.name, VClusterLayer)
  app.component(VRouteLayer.name, VRouteLayer)
  app.component(VWebglpointsLayer.name, VWebglpointsLayer)
}

export default install

export {
  install,
  VTileLayer,
  VVectorLayer,
  VGraphicLayer,
  VHeatmapLayer,
  VClusterLayer,
  VRouteLayer,
  VWebglpointsLayer
}
