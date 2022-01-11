import 'ol/ol.css'
import { Map, View } from 'ol'
// import { defaults as defaultControls } from 'ol/control'

export class VMap {
  static map = VMap

  constructor (option = {}) {
    const view = Object.assign({
      zoom: 12,
      center: [118.045456, 24.567489],
      projection: 'EPSG:4326'
    }, option.view)

    this.map = new Map({
      target: option.target || 'map',
      layers: [],
      view: new View(view),
      controls: []
    })

    this.map.on('pointermove', evt => {
      const pixel = this.map.getEventPixel(evt.originalEvent)
      const hit = this.map.hasFeatureAtPixel(pixel)
      this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
    })
  }

  getMap () {
    return VMap.map
  }
}
