<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import { validObjKey } from '@/utils/index.js'
import TileGrid from 'ol/tilegrid/TileGrid'
import { OSM, TileWMS, XYZ } from 'ol/source.js'
import TileLayer from 'ol/layer/Tile.js'

export default {
  name: 'v-tile',
  render (createElement, context) {
    return null
  },
  extends: BaseLayer,
  inject: ['VMap'],
  props: {
    layerId: {
      type: String,
      default () {
        return `tile-layer-${nanoid()}`
      }
    },
    preload: {
      type: Number,
      default: 0
    },
    tileType: {
      type: String,
      default: 'TD',
      validator: value => ['TD', 'TD_IMG', 'XYZ', 'BD', 'GD', 'OSM', 'WMS'].includes(value.toUpperCase())
    },
    tdVec: {
      type: String
    },
    tdCva: {
      type: String
    },
    tdImg: {
      type: String
    },
    tdCia: {
      type: String
    },
    gdUrl: {
      type: String
    },
    base: {
      type: Boolean,
      default: true
    },
    xyz: {
      type: Object,
      default () {
        return {}
      }
    },
    wms: {
      type: Object,
      default () {}
    }
  },
  data () {
    return {
      layer: null,
      layers: [],
      addForOverview: false
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    tileType: {
      handler (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          this.clear(oldValue)
          this.init()
        }
      },
      immediate: false,
      deep: true
    },
    visible: {
      handler (value) {
        this.layers.map(layer => layer.setVisible(value))
      },
      immediate: false
    },
    zIndex: {
      handler (value) {
        this.layers.map(layer => layer.setZIndex(value))
      },
      immediate: false
    },
    maxZoom: {
      handler (value) {
        this.layers.map(layer => layer.setMaxZoom(value))
      },
      immediate: false
    },
    minZoom: {
      handler (value) {
        this.layers.map(layer => layer.setMinZoom(value))
      },
      immediate: false
    },
    extent: {
      handler (value) {
        this.layers.map(layer => layer.setExtent(value))
      },
      immediate: false
    },
    'xyz.attributions': {
      handler (value) {
        this.layers.map(layer => layer.getSource().setAttributions(value))
      },
      immediate: false,
      deep: true
    }
  },
  methods: {
    clear (oldValue) {
      const layers = this.map.getLayers().getArray().filter(x => x.get('base'))
      if (layers && layers.length > 0) {
        layers.forEach(layer => {
          if (layer.get('tileType') === oldValue || layer.get('isDefault')) {
            this.map.removeLayer(layer)
          }
        })
      }
    },
    init () {
      switch (this.tileType.toUpperCase()) {
        case 'XYZ':
          this.initTileXYZ()
          break
        case 'WMS':
          this.initTileWMS()
          break
        case 'TD':
          this.initTD()
          break
        case 'TD_IMG':
          this.initTDIMG()
          break
        case 'BD':
          this.initBD()
          break
        case 'GD':
          this.initGD()
          break
        case 'OSM':
          this.initTileOSM()
          break
        default:
          this.initTD()
          break
      }
    },
    initTileXYZ () {
      let tileGrid
      if (validObjKey(this.xyz, 'tileGrid')) {
        tileGrid = new TileGrid(this.xyz.tileGrid)
      }
      const xyzOpt = { ...this.xyz, ...{ tileGrid } }
      const source = new XYZ(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', this.base)
      this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    },
    initTileWMS () {
      let tileGrid
      if (validObjKey(this.wms, 'tileGrid')) {
        tileGrid = new TileGrid(this.wms.tileGrid)
      }
      const wmsOpt = { ...this.wms, ...{ tileGrid } }
      const source = new TileWMS(wmsOpt)
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', this.base)
      this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    },
    initTD () {
      const layerVec = this.initXYZbyURL(this.tdVec || 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      const layerCva = this.initXYZbyURL(this.tdCva || 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      this.layers = [layerVec, layerCva]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    },
    initXYZbyURL (url) {
      const xyzOpt = { ...{ crossOrigin: 'anonymous' }, ...this.$props.xyz, ...{ url } }
      const source = new XYZ(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source } }
      const layer = new TileLayer(layerOpt)
      layer.set('base', true)
      layer.setZIndex(0)
      return layer
    },
    initTDIMG () {
      const layerImg = this.initXYZbyURL(this.tdImg || 'http://t4.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      const layerCia = this.initXYZbyURL(this.tdCia || 'http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      this.layers = [layerImg, layerCia]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    },
    initBD () {
      this.layers = this.getBDMap(this.xyz, this.$props)
      if (this.layers.length > 0) {
        if (!this.addForOverview) {
          this.layers.forEach(layer => {
            layer.setZIndex(0)
            this.map.addLayer(layer)
          })
        }
      }
    },
    getBDMap (xyz, tileLayer) {
      // const extent = [72.004, 0.8293, 137.8347, 55.8271]//中国范围
      // 计算百度使用的分辨率
      const resolutions = []
      for (let i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i)
      }
      const tilegrid = new TileGrid({
        // extent: applyTransform(extent, projzh.ll2bmerc),
        origin: [0, 0], // 设置原点坐标
        resolutions // 设置分辨率
      })
      // 创建百度地图的数据源
      const xyzOpt = {
        ...xyz,
        ...{
          projection: 'baidu',
          tileGrid: tilegrid,
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            if (!tileCoord) {
              return ''
            }
            const z = tileCoord[0]
            const x = tileCoord[1]
            const y = -tileCoord[2] - 1
            return 'https://maponline1.bdimg.com/tile/?qt=vtile&x=' +
                x + '&y=' + y + '&z=' + z +
                '&styles=pl&scaler=1&udt=20220113&from=jsapi2_0'
          },
          crossOrigin: 'anonymous'
        }
      }
      const tile = new XYZ(xyzOpt)
      // 百度地图层
      const layerOpt = { ...tileLayer, ...{ source: tile } }
      const layer = new TileLayer(layerOpt)
      layer.set('type', 'bd')
      layer.set('name', 'bd')
      layer.set('base', true)
      return [layer]
    },
    initGD () {
      this.layers = this.getAMap(this.xyz, this.$props, this.gdUrl)
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    },
    getAMap (xyz, tileLayer, url) {
      const xyzOpt = {
        ...xyz,
        ...{
          url: url || 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7',
          projection: 'GCJ02',
          crossOrigin: 'anonymous'
        }
      }
      const tile = new XYZ(xyzOpt)
      const layerOpt = { ...tileLayer, ...{ source: tile } }
      const layer = new TileLayer(layerOpt)
      layer.set('type', 'AMap')
      layer.set('name', 'AMap')
      layer.set('base', true)
      return [layer]
    },
    initTileOSM () {
      const source = new OSM()
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', this.base)
      this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    }
  },
  updated () {
    this.init()
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.layers.forEach(layer => {
      layer.getSource().clear()
      this.map.removeLayer(layer)
    })
  }
}
</script>

<style scoped>

</style>
