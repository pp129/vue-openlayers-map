<template>
  <div><slot></slot></div>
</template>

<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Fill, Style, Text } from 'ol/style'
import Supercluster from 'supercluster'
import { convertCoordinate, setStyle, validObjKey } from '@/utils'
import CircleStyle from 'ol/style/Circle'
import { unByKey } from 'ol/Observable'
// import { throttle } from 'throttle-debounce'

export default {
  name: 'v-super-cluster',
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `cluster-layer-${nanoid()}`
      }
    },
    features: {
      type: Array,
      default () {
        return []
      }
    },
    FeatureStyle: {
      type: [Array, undefined],
      default () {
        return undefined
      }
    },
    /**
     * Option  Default  Description
     * minZoom  0  Minimum zoom level at which clusters are generated.
     * maxZoom  16  Maximum zoom level at which clusters are generated.
     * minPoints  2  Minimum number of points to form a cluster.
     * radius  40  Cluster radius, in pixels.
     * extent  512  (Tiles) Tile extent. Radius is calculated relative to this value.
     * nodeSize  64  Size of the KD-tree leaf node. Affects performance.
     * log  false  Whether timing info should be logged.
     * generateId  false  Whether to generate ids for input features in vector tiles.
     */
    cluster: {
      type: Object
    },
    overlay: {
      type: Object
    },
    throttleDelay: {
      type: Number,
      default: 1000
    }
  },
  data () {
    return {
      layer: null,
      clusters: null,
      featureChildren: [],
      featureCluster: false,
      total: 0,
      eventRender: [],
      eventList: ['singleclick', 'pointermove']
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    cluster: {
      handler (value) {
        if (value) {
          this.clusters = new Supercluster(this.cluster)
          this.clusters.load(this.getGeoFeatures())
          console.log(this.clusters)
          this.total = this.clusters.points.length
          const extent = this.map.getView().calculateExtent(this.map.getSize())
          const cluster = this.clusters.getClusters(extent, this.map.getView().getZoom())
          const features = {
            type: 'FeatureCollection',
            features: cluster
          }
          const source = this.layer.getSource()
          if (source) {
            source.clear()
            source.addFeatures(new GeoJSON().readFeatures(features).map(feature => {
              const properties = feature.get('properties')
              if (properties && typeof properties === 'object') {
                for (const i in properties) {
                  if (Object.prototype.hasOwnProperty.call(properties, i)) {
                    feature.set(i, properties[i])
                  }
                }
              }
              return feature
            }))
          }
        }
      },
      immediate: false,
      deep: true
    },
    features: {
      handler () {
        this.dispose()
        this.init()
      },
      immediate: false,
      deep: true
    },
    visible: {
      handler (value) {
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
    this.dispose()
  },
  methods: {
    getGeoFeatures () {
      return this.features.map(feature => {
        const coordinates = convertCoordinate(feature.coordinates, feature.convert)
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates
          },
          properties: feature
        }
      })
    },
    styleFunction (styleCache, feature) {
      // console.log(feature)
      const cluster = feature.get('cluster') || 0
      const size = feature.get('point_count_abbreviated') || 0
      let styles = styleCache[size]
      if (cluster) {
        if (!styles) {
          let styleOptions = {}
          styleOptions = {
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: 'blue'
              })
            }),
            text: new Text({
              font: '16px sans-serif',
              text: size.toString()
            })
          }
          // const { style } = this.cluster
          if (validObjKey(this.cluster, 'style')) {
            styles = setStyle(this.cluster.style)
            styles.getText().setText(size.toString())
          } else {
            styles = new Style(styleOptions)
          }
          styleCache[size] = styles
        }
      } else {
        const style = feature.get('style')
        styles = setStyle(style)
      }
      // console.log(styles)
      return styles
    },
    init () {
      this.clusters = new Supercluster(this.cluster)
      this.clusters.load(this.getGeoFeatures())
      console.log(this.clusters)
      this.total = this.clusters.points.length
      const extent = this.map.getView().calculateExtent(this.map.getSize())
      const cluster = this.clusters.getClusters(extent, this.map.getView().getZoom())
      const features = {
        type: 'FeatureCollection',
        features: cluster
      }
      const styleCache = {}
      this.layer = new VectorLayer({
        ...this.$props,
        source: new VectorSource({
          features: new GeoJSON().readFeatures(features).map(feature => {
            const properties = feature.get('properties')
            if (properties && typeof properties === 'object') {
              for (const i in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, i)) {
                  feature.set(i, properties[i])
                }
              }
            }
            return feature
          })
        }),
        style: (feature) => this.styleFunction(styleCache, feature)
      })
      this.layer.set('cluster', true)
      this.layer.set('id', this.layerId)
      this.layer.set('type', 'vector')
      this.layer.set('users', true)
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex)
      }
      this.map.addLayer(this.layer)
      // 重新计算聚合 节流
      this.map.on('movestart', evt => { this.$emit('movestart') })
      // this.map.on('moveend', evt => { this.$emit('moveend') })
      this.map.on('precompose', () => {
        // this.$emit('changeresolution')
        const extent = this.map.getView().calculateExtent(this.map.getSize())
        const cluster = this.clusters.getClusters(extent, this.map.getView().getZoom())
        const features = {
          type: 'FeatureCollection',
          features: cluster
        }
        const source = this.layer.getSource()
        if (source) {
          source.clear()
          source.addFeatures(new GeoJSON().readFeatures(features).map(feature => {
            const properties = feature.get('properties')
            if (properties && typeof properties === 'object') {
              for (const i in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, i)) {
                  feature.set(i, properties[i])
                }
              }
            }
            return feature
          }))
        }
        this.$emit('precompose')
      })
      // 绑定事件
      this.eventList.forEach(listenerKey => {
        this.eventRender.push(this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt)))
      })
    },
    zoomEnd (evt) {
      const extent = this.map.getView().calculateExtent(this.map.getSize())
      const cluster = this.clusters.getClusters(extent, this.map.getView().getZoom())
      const features = {
        type: 'FeatureCollection',
        features: cluster
      }
      const source = this.layer.getSource()
      if (source) {
        source.clear()
        source.addFeatures(new GeoJSON().readFeatures(features).map(feature => {
          const properties = feature.get('properties')
          if (properties && typeof properties === 'object') {
            for (const i in properties) {
              if (Object.prototype.hasOwnProperty.call(properties, i)) {
                feature.set(i, properties[i])
              }
            }
          }
          return feature
        }))
      }
      this.$emit('moveend')
      // this.$emit('changeZoom', evt, this.map)
      evt.map.once('moveend', (evt) => {
        this.zoomEnd(evt)
      })
    },
    getFeatureAtPixel (pixel) {
      return this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer?.get('id') === this.layer?.get('id')) return feature
      }, {})
    },
    eventHandler (listenerKey, evt) {
      const { pixel } = evt
      const feature = this.getFeatureAtPixel(pixel)
      this.$emit(listenerKey, evt, feature)
    },
    getLeaves (id, limit) {
      return this.clusters.getLeaves(id, limit)
    },
    dispose () {
      // 移除事件
      this.eventRender.forEach(listenerKey => {
        unByKey(listenerKey)
      })
      const source = this.layer.getSource()
      if (source) {
        source.clear()
      }
      this.map.removeLayer(this.layer)
    }
  }
}
</script>

<style scoped>

</style>
