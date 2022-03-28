<script>
import BaseLayer from './BaseLayer'
import { getBDMap, uuid, validObjKey } from '~/utils'
import TileGrid from 'ol/tilegrid/TileGrid'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
export default {
  name: 'v-tile-layer',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `tile-layer-${uuid()}`
      }
    },
    preload: {
      type: Number,
      default: 0
    },
    tileType: {
      type: String,
      default: 'TD'
    },
    xyz: {
      type: Object,
      default () {
        return {}
      }
    },
    tileGrid: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      layer: null,
      layers: []
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    tileType: {
      handler (value) {
        if (value) {
          this.init(this.$parent.$options.name)
        }
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
    this.init(this.$parent.$options.name)
  },
  beforeDestroy () {
    this.layers.forEach(layer => {
      layer.getSource().clear()
      this.map.removeLayer(layer)
    })
  },
  methods: {
    init (name) {
      const layers = this.map.getLayers().getArray().filter(x => x.get('base'))
      if (layers && layers.length > 0) {
        layers.forEach(layer => {
          this.map.removeLayer(layer)
        })
      }
      switch (this.tileType) {
        case 'XYZ':
          this.initTileXYZ(name)
          break
        case 'TD':
          this.initTD(name)
          break
        case 'TD_IMG':
          this.initTDIMG(name)
          break
        case 'BD':
          this.initBD(name)
          break
        case 'GD':
          this.initGD(name)
          break
        case 'OSM':
          this.initTileOSM(name)
          break
        case 'PGIS_TILE':
          this.initPGIS(name, true)
          break
        case 'PGIS_HPYX':
          this.initPGIS(name, false)
          break
        default:
          this.initTD(name)
          break
      }
    },
    initTileXYZ (name) {
      let tileGrid
      if (validObjKey(this.xyz, 'tileGrid')) {
        tileGrid = new TileGrid(this.xyz.tileGrid)
      }
      const xyzOpt = { ...this.xyz, ...{ tileGrid: tileGrid } }
      const source = new XYZ(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source: source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', true)
      this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (name === 'v-map') {
        this.map.addLayer(this.layer)
      } else {
        this.$parent.layers = this.layers
        this.$parent.init()
      }
    },
    initXYZbyURL (url) {
      const xyzOpt = { ...this.$props.xyz, ...{ url: url } }
      const source = new XYZ(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source: source } }
      const layer = new TileLayer(layerOpt)
      layer.set('base', true)
      layer.setZIndex(0)
      return layer
      // this.map.addLayer(this.layer)
    },
    initTD (name) {
      const layerVec = this.initXYZbyURL('http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      const layerCva = this.initXYZbyURL('http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      this.layers = [layerVec, layerCva]
      if (name === 'v-map') {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      } else {
        this.$parent.layers = this.layers
        this.$parent.init()
      }
    },
    initTDIMG (name) {
      const layerImg = this.initXYZbyURL('http://t4.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      const layerCia = this.initXYZbyURL('http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      this.layers = [layerImg, layerCia]
      if (name === 'v-map') {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      } else {
        this.$parent.layers = this.layers
        this.$parent.init()
      }
    },
    initGD (name) {
      this.layers = [this.initXYZbyURL('http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7')]
      if (name === 'v-map') {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      } else {
        this.$parent.layers = this.layers
        this.$parent.init()
      }
    },
    initBD (name) {
      this.layers = getBDMap({ name: 'bd' }, { name: 'bd' })
      if (this.layers.length > 0) {
        // this.layer = layers[0]
        // this.layer.set('base', true)
        // this.map.addLayer(this.layer)
        if (name === 'v-map') {
          this.layers.forEach(layer => {
            layer.setZIndex(0)
            this.map.addLayer(layer)
          })
        } else {
          this.$parent.layers = this.layers
          this.$parent.init()
        }
      }
    },
    initTileOSM (name) {
      const source = new OSM()
      const layerOpt = { ...this.$props, ...{ source: source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', true)
      this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (name === 'v-map') {
        this.map.addLayer(this.layer)
      } else {
        this.$parent.layers = this.layers
        this.$parent.init()
      }
    },
    initPGIS (name, tile = true) {
      const url = tile ? 'http://44.64.135.5/Tile_sl2019/81326548cf7f46638db93d0ab919f0da/EzMap?Service=getImage&Type=RGB&ZoomOffset=0' : 'http://44.64.135.5/Tile_hpyx2019/81326548cf7f46638db93d0ab919f0da/EzMap?Service=getImage&Type=RGB&ZoomOffset=0'
      // console.log(url)
      const xyzOpt = {
        projection: 'EPSG:4326',
        tileUrlFunction: (tileCoord, pixelRatio, proj) => {
          if (!tileCoord) return ''
          const z = tileCoord[0]
          const x = tileCoord[1]
          const y = tileCoord[2]
          return url +
            '&Col=' + x +
            '&Row=' + y +
            '&Zoom=' + z +
            '&V=1.0.0'
        },
        crossOrigin: 'anonymous'
      }
      const source = new XYZ(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source: source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', true)
      this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (name === 'v-map') {
        this.map.addLayer(this.layer)
      } else {
        this.$parent.layers = this.layers
        this.$parent.init()
      }
    },
    initTileArcGISRest () {}
  }
}
</script>

<style scoped>

</style>
