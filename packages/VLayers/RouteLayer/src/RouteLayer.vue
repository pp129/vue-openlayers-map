<script>
import BaseLayer from '~/VLayers/BaseLayer'
import axios from 'axios'
import qs from 'qs'
import { addVectorSource, setFeatures, setStyle, uuid, vectorLayer } from '~/utils'

export default {
  name: 'v-route-layer',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `arcgis-route-layer-${uuid()}`
      }
    },
    serviceUrl: {
      type: String,
      default () {
        return ''
      }
    },
    method: {
      type: String,
      default: 'GET',
      validator (value) {
        return ['GET', 'POST', 'get', 'post'].includes(value)
      }
    },
    stops: {
      type: Array,
      default () {
        return []
      }
    },
    routeType: {
      type: String,
      require: true,
      validator (value) {
        return ['arcgis', 'graphhopper'].includes(value)
      }
    },
    showStart: {
      type: Boolean,
      default: false
    },
    showPass: {
      type: Boolean,
      default: false
    },
    showEnd: {
      type: Boolean,
      default: false
    },
    routeStyle: {
      type: Object,
      default: undefined
    },
    // arcgis
    barriers: {
      type: String,
      default: ''
    },
    polylineBarriers: {
      type: String,
      default: ''
    },
    polygonBarriers: {
      type: String,
      default: ''
    },
    outSR: {
      type: String,
      default: ''
    },
    ignoreInvalidLocations: {
      type: Boolean,
      default: true
    },
    accumulateAttributeNames: {
      type: String,
      default: ''
    },
    impedanceAttributeName: {
      type: String,
      default: 'Length'
    },
    restrictionAttributeNames: {
      type: String,
      default: ''
    },
    attributeParameterValues: {
      type: String,
      default: ''
    },
    restrictUTurns: {
      type: String,
      default: 'esriNFSBAllowBacktrack'
    },
    useHierarchy: {
      type: Boolean,
      default: false
    },
    returnDirections: {
      type: Boolean,
      default: false
    },
    returnRoutes: {
      type: Boolean,
      default: true
    },
    returnStops: {
      type: Boolean,
      default: true
    },
    returnBarriers: {
      type: Boolean,
      default: false
    },
    returnPolygonBarriers: {
      type: Boolean,
      default: false
    },
    directionsLanguage: {
      type: String,
      default: 'en'
    },
    directionsStyleName: {
      type: String,
      default: ''
    },
    outputLines: {
      type: String,
      default: 'esriNAOutputLineTrueShape'
    },
    findBestSequence: {
      type: Boolean,
      default: false
    },
    preserveFirstStop: {
      type: Boolean,
      default: true
    },
    preserveLastStop: {
      type: Boolean,
      default: true
    },
    useTimeWindows: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Number,
      default: 0
    },
    startTimeIsUTC: {
      type: Boolean,
      default: false
    },
    outputGeometryPrecision: {
      type: String,
      default: ''
    },
    outputGeometryPrecisionUnits: {
      type: String,
      default: 'esriDecimalDegrees'
    },
    directionsOutputType: {
      type: String,
      default: 'esriDOTComplete'
    },
    directionsTimeAttributeName: {
      type: String,
      default: ''
    },
    directionsLengthUnits: {
      type: String,
      default: 'esriNAUMiles'
    },
    returnZ: {
      type: Boolean,
      default: false
    },
    travelMode: {
      type: String,
      default: ''
    },
    f: {
      type: String,
      default: 'pjson'
    },
    // graphhopper
    type: {
      type: String,
      default: 'json'
    },
    points_encoded: {
      type: Boolean,
      default: false
    },
    point_hint: {
      type: Array,
      default () {
        return []
      }
    },
    locale: {
      type: String,
      default: 'en'
    },
    vehicle: {
      type: String,
      default: 'car'
    },
    weighting: {
      type: String,
      default: 'fastest'
    },
    elevation: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      layer: null,
      defaultStyle: {
        line: {
          stroke: {
            color: 'rgba(67,126,255,1)',
            width: 4
          }
        },
        start: {
          circle: {
            radius: 15,
            fill: {
              color: 'rgba(255,255,255,1)'
            },
            stroke: {
              color: 'rgba(67,126,255,1)',
              width: 2
            }
          },
          text: {
            text: '起',
            fill: {
              color: '#3d73e8'
            }
          }
        },
        end: {
          circle: {
            radius: 15,
            fill: {
              color: 'rgba(255,255,255,1)'
            },
            stroke: {
              color: 'rgba(67,126,255,1)',
              width: 2
            }
          },
          text: {
            text: '终',
            fill: {
              color: '#3d73e8'
            }
          }
        },
        pass: {
          circle: {
            radius: 8,
            fill: {
              color: 'rgba(255,255,255,1)'
            },
            stroke: {
              color: 'tomato',
              width: 4
            }
          }
        }
      }
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    stops: {
      handler (value) {
        if (value.length < 2) return false
        this.routeType === 'arcgis' ? this.updateArcgisRoute() : this.updateGraphhopperRoute()
      },
      immediate: false,
      deep: true
    },
    visible: {
      handler (value) {
        console.log('layer visible change', value)
        this.layer.setVisible(value)
      },
      immediate: false
    },
    zIndex: {
      handler (value) {
        this.layer.setZIndex(value)
      },
      immediate: false
    },
    maxZoom: {
      handler (value) {
        this.layer.setMaxZoom(value)
      },
      immediate: false
    },
    minZoom: {
      handler (value) {
        this.layer.setMinZoom(value)
      },
      immediate: false
    },
    extent: {
      handler (value) {
        this.layer.setExtent(value)
      },
      immediate: false
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.layer.getSource().clear()
    this.map.removeLayer(this.layer)
  },
  methods: {
    async getArcgisRouteData () {
      let params = this.$props
      if (this.stops.length > 0) {
        params = { ...this.$props, ...{ stops: this.stops.join(';') } }
        if (this.method.toUpperCase() === 'POST') {
          return axios.post(this.serviceUrl, qs.stringify(params)).then(res => {
            return this.getArcgisData(res)
          })
        } else {
          return axios.get(this.serviceUrl, { params: params }).then(res => {
            return this.getArcgisData(res)
          })
        }
      } else {
        return []
      }
    },
    getArcgisData (res) {
      if (res.status === 200 && res.data && res.data.routes.features.length > 0) {
        const routes = res.data.routes
        if (routes.features[0].geometry.paths.length > 0) {
          const routesFeatures = []
          if (this.showStart) {
            routesFeatures.push({
              type: 'point',
              style: this.routeStyle ? this.routeStyle.start : this.defaultStyle.start,
              coordinates: routes.features[0].geometry.paths[0][0]
            })
          }
          routesFeatures.push({
            type: 'polyline',
            style: this.routeStyle ? this.routeStyle.line : this.defaultStyle.line,
            coordinates: routes.features[0].geometry.paths[0]
          })
          if (this.showPass) {
            this.stops.slice(1, this.stops.length - 1).forEach(point => {
              routesFeatures.push({
                type: 'point',
                style: this.routeStyle ? this.routeStyle.pass : this.defaultStyle.pass,
                coordinates: point
              })
            })
          }
          if (this.showEnd) {
            routesFeatures.push({
              type: 'point',
              style: this.routeStyle ? this.routeStyle.end : this.defaultStyle.end,
              coordinates: routes.features[0].geometry.paths[0][routes.features[0].geometry.paths[0].length - 1]
            })
          }
          return setFeatures(routesFeatures, this.map)
        }
      } else {
        return []
      }
    },
    async getGraphhopperRouteData () {
      let params = qs.stringify(this.$props)
      if (this.stops.length > 0) {
        let points = '&point='
        this.stops.forEach((point, index) => {
          points = points + point[1] + ',' + point[0] + (index < this.stops.length - 1 ? '&point=' : '')
        })
        params = params + points
        if (this.method.toUpperCase() === 'POST') {
          return axios.post(this.serviceUrl, params).then(res => {
            return this.getGraphhopperData(res)
          })
        } else {
          return axios.get(this.serviceUrl + '?' + params).then(res => {
            return this.getGraphhopperData(res)
          })
        }
      } else {
        return []
      }
    },
    getGraphhopperData (res) {
      console.log(res.data)
      if (res.status === 200 && res.data && res.data.paths[0].points.coordinates.length > 0) {
        const routes = res.data.paths[0]
        if (routes.points.coordinates.length > 0) {
          const routesFeatures = []
          if (this.showStart) {
            routesFeatures.push({
              type: 'point',
              style: this.routeStyle ? this.routeStyle.start : this.defaultStyle.start,
              coordinates: routes.points.coordinates[0]
            })
          }
          routesFeatures.push({
            type: 'polyline',
            style: this.routeStyle ? this.routeStyle.line : this.defaultStyle.line,
            coordinates: routes.points.coordinates
          })
          if (this.showPass) {
            this.stops.slice(1, this.stops.length - 1).forEach(point => {
              routesFeatures.push({
                type: 'point',
                style: this.routeStyle ? this.routeStyle.pass : this.defaultStyle.pass,
                coordinates: point
              })
            })
          }
          if (this.showEnd) {
            routesFeatures.push({
              type: 'point',
              style: this.routeStyle ? this.routeStyle.end : this.defaultStyle.end,
              coordinates: routes.points.coordinates[routes.points.coordinates.length - 1]
            })
          }
          return setFeatures(routesFeatures, this.map)
        }
      } else {
        return []
      }
    },
    async init () {
      const source = addVectorSource({ }, this.map)
      const features = this.routeType === 'arcgis' ? await this.getArcgisRouteData() : await this.getGraphhopperRouteData()
      source.addFeatures(features)
      const layerOpt = { ...this.$props, ...{ source: source } }
      this.layer = vectorLayer(layerOpt)
      this.layer.setStyle((feature) => {
        if (feature.get('style')) {
          return setStyle(feature.get('style'))
        } else {
          if (this.FeatureStyle) {
            return setStyle(this.FeatureStyle)
          } else {
            return setStyle({
              fill: {
                color: 'rgba(67,126,255,0.15)'
              },
              stroke: {
                color: 'rgba(67,126,255,1)',
                width: 1
                // lineDash: [20, 10, 20, 10]
              }
            })
          }
        }
      })
      this.layer.set('id', this.layerId)
      this.layer.set('type', 'vector')
      this.layer.set('users', true)
      this.layer.setZIndex(1)
      this.map.addLayer(this.layer)
    },
    async updateArcgisRoute () {
      this.layer.getSource().clear()
      const features = await this.getArcgisRouteData()
      this.layer.getSource().addFeatures(features)
    },
    async updateGraphhopperRoute () {
      this.layer.getSource().clear()
      const features = await this.getGraphhopperRouteData()
      this.layer.getSource().addFeatures(features)
    },
    setStopsFeatures () {

    }
  }
}
</script>

<style scoped>

</style>
