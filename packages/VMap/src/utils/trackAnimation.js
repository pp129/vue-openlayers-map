import 'ol/ol.css'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorSource from 'ol/source/Vector'
import { Icon, Stroke, Style } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import { getVectorContext } from 'ol/render'
import LineString from 'ol/geom/LineString'

let distance = 0// 距离比例
let lastTime
function moveFeature (event, route, position, styles, map, speed) {
  const time = event.frameState.time
  const elapsedTime = time - lastTime
  distance = (distance + (speed * elapsedTime) / 1e6) % 2
  console.log(distance)
  if (distance < 1) {
    lastTime = time

    const currentCoordinate = route.getCoordinateAt(distance)

    position.setCoordinates(currentCoordinate)
    const vectorContext = getVectorContext(event)
    console.log(styles.geoMarker)
    vectorContext.setStyle(styles.geoMarker)
    vectorContext.drawGeometry(position)
    // tell OpenLayers to continue the postrender animation
    map.render()
  }
}
function startAnimation (vectorLayer, geoMarker, route, position, styles, map, speed) {
  lastTime = Date.now()
  vectorLayer.on('postrender', (event) => {
    moveFeature(event, route, position, styles, map, speed)
  })
  // hide geoMarker and trigger map render through change event
  geoMarker.setGeometry(null)
}
export default {
  map: null,
  route: null,
  routeFeature: null,
  vectorLayer: null,
  geoMarker: null,
  position: null,
  startMarker: null,
  endMarker: null,
  styles: null,
  init: function (option) {
    // const polyline = result.routes[0].geometry
    this.route = new LineString(option.routes)
    this.routeFeature = new Feature({
      type: 'route',
      geometry: this.route
    })
    this.startMarker = new Feature({
      type: 'start',
      geometry: new Point(this.route.getFirstCoordinate())
    })
    this.endMarker = new Feature({
      type: 'end',
      geometry: new Point(this.route.getLastCoordinate())
    })
    this.position = this.startMarker.getGeometry().clone()
    this.geoMarker = new Feature({
      type: 'geoMarker',
      geometry: this.position
    })
    this.styles = {
      route: new Style({
        stroke: new Stroke({
          width: 6,
          color: 'rgba(237, 212, 0, 0.8)'
        })
      }),
      start: new Style({
        image: new Icon(option.start.icon)
      }),
      end: new Style({
        image: new Icon(option.end.icon)
      }),
      geoMarker: new Style({
        image: new Icon(option.geoMarker.icon)
      })
    }
    this.vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [this.routeFeature, this.geoMarker, this.startMarker, this.endMarker]
      }),
      style: (feature) => {
        return this.styles[feature.get('type')]
      }
    })
    this.map = option.map
    option.map.addLayer(this.vectorLayer)
  },
  start: function (speed) {
    startAnimation(this.vectorLayer, this.geoMarker, this.route, this.position, this.styles, this.map, speed)
  }
}
