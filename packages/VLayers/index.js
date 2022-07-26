import VTileLayer from './TileLayer/index'
import VVectorLayer from './VectorLayer/index'
import VGraphicLayer from './GraphicLayer/index'
import VHeatmapLayer from './HeatmapLayer/index'
import VClusterLayer from './ClusterLayer/index'
import VRouteLayer from './RouteLayer/index'
import VWebglpointsLayer from './WebGlPointsLayer/index'

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
