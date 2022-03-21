<template>
  <div></div>
</template>

<script>
import BaseLayer from './BaseLayer'
import axios from 'axios'
import qs from 'qs'
import { setFeatures, setStyle, uuid } from '~/utils'
import VectorLayer from 'ol/layer/Vector'
import { Vector as VectorSource } from 'ol/source'

export default {
  name: 'v-route-layer',
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
      default: 'GET'
    },
    stops: {
      type: Array,
      default () {
        return []
      }
    },
    routeType: {
      type: String,
      require: true
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
    routeStyle: {
      type: Object,
      default: undefined
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
        stroke: {
          color: 'rgba(67,126,255,1)',
          width: 5
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
        if (this.method === 'POST') {
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
          const line = [{
            type: 'polyline',
            style: this.routeStyle || this.defaultStyle,
            coordinates: routes.features[0].geometry.paths[0]
          }]
          return setFeatures(line, this.map)
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
        if (this.method === 'POST') {
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
      if (res.status === 200 && res.data && res.data.paths[0].points.coordinates.length > 0) {
        const routes = res.data.paths[0]
        if (routes.points.coordinates.length > 0) {
          const line = [{
            type: 'polyline',
            style: this.routeStyle || this.defaultStyle,
            coordinates: routes.points.coordinates
          }]
          return setFeatures(line, this.map)
        }
      } else {
        return []
      }
    },
    async init () {
      const features = this.routeType === 'arcgis' ? await this.getArcgisRouteData() : await this.getGraphhopperRouteData()
      const source = new VectorSource({
        features: features
      })
      const layerOpt = { ...this.$props, ...{ source: source } }
      this.layer = new VectorLayer(layerOpt)
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
    }
  }
}
</script>

<style scoped>

</style>
