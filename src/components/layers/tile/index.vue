<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import { AMapMercatorProj, setFeature, validObjKey } from '@/utils/index.js'
import TileGrid from 'ol/tilegrid/TileGrid'
import { OSM, TileArcGISRest, TileWMS, XYZ } from 'ol/source'
import TileLayer from 'ol/layer/Tile'
import Mask from 'ol-ext/filter/Mask'
import { Fill } from 'ol/style'

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
      validator: value => [
        'TD',
        'TD_IMG',
        'XYZ',
        'BD',
        'BD_DARK',
        'BD_BLUE',
        'GD',
        'GD_IMG',
        'OSM',
        'WMS',
        'ARCGIS_BLUE',
        'ARCGIS_WARM',
        'ARCGIS_NORMAL',
        'ARCGIS_GRAY',
        'PGIS_XM_GA',
        'PGIS_XM_GA_IMG',
        'FJ_BLUE',
        'FJ_BLUE_GA'
      ].includes(value.toUpperCase())
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
    tileArcGISRest: {
      type: Object,
      default () {
        return {}
      }
    },
    wms: {
      type: Object,
      default () {}
    },
    mask: {
      type: Object
    }
  },
  data () {
    return {
      layer: null,
      layers: [],
      addForOverview: false,
      filterMask: null
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
    },
    mask: {
      handler (newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          this.layers.forEach(layer => {
            layer.removeFilter(this.filterMask)
            this.addMask(layer, this.mask)
          })
        } else if (!newValue) {
          this.layers.forEach(layer => {
            // layer.addFilter(this.filterMask)
            layer.removeFilter(this.filterMask)
          })
        }
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
        case 'PGIS_XM_GA':
          this.initTilePGISXMGA()
          break
        case 'FJ_BLUE':
          this.initTileFJBlue()
          break
        case 'FJ_BLUE_GA':
          this.initTileFJBlueGA()
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
        case 'BD_BLUE':
          this.initBD('midnight')
          break
        case 'BD_DARK':
          this.initBD('dark')
          break
        case 'ARCGISREST':
          this.initTileArcGISRest()
          break
        case 'ARCGIS_BLUE':
          this.initArcgisTile('blue')
          break
        case 'ARCGIS_WARM':
          this.initArcgisTile('warm')
          break
        case 'ARCGIS_NORMAL':
          this.initArcgisTile('normal')
          break
        case 'ARCGIS_GRAY':
          this.initArcgisTile('gray')
          break
        case 'GD':
          this.initGD()
          break
        case 'GD_IMG':
          this.initAMapImage()
          break
        case 'OSM':
          this.initTileOSM()
          break
        default:
          this.initTD()
          break
      }
    },
    initTileArcGISRest () {
      let tileGrid
      if (validObjKey(this.tileArcGISRest, 'tileGrid')) {
        tileGrid = new TileGrid(this.tileArcGISRest.tileGrid)
      }
      const xyzOpt = { ...this.tileArcGISRest, ...{ tileGrid } }
      const source = new TileArcGISRest(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', this.base)
      // this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.mask && Object.keys(this.mask).length > 0) {
            this.addMask(layer, this.mask)
          }
          this.map.addLayer(layer)
        })
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
      // this.layer.setZIndex(0)
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex)
      }
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.mask && Object.keys(this.mask).length > 0) {
            this.addMask(this.mask)
          }
          this.map.addLayer(layer)
        })
      }
    },
    /**
     * @厦门规划局2022版本
     */
    initTileFJBlue () {
      // const url = 'https://xmghszzx.com/arcgis/rest/services/Updata/XMMAP_DP_2000/MapServer/tile'
      const url = 'http://172.16.28.120:6080/arcgis/rest/services/xiamen/MapServer/tile' // 加自绘翔安大桥
      this.layer = this.initXYZbyURL(`${url}/{z}/{y}/{x}`, { projection: 'EPSG:4326' })
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.zIndex) {
            layer.setZIndex(this.zIndex)
          }
          this.map.addLayer(layer)
        })
      }
    },
    /**
     * @厦门规划局-公安网版本
     */
    initTileFJBlueGA () {
      const url = 'http://10.130.145.45:5001/xmblue'
      this.layer = this.initXYZbyURL(`${url}/{z}/{y}/{x}.png`, { projection: 'EPSG:4326' })
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.zIndex) {
            layer.setZIndex(this.zIndex)
          }
          this.map.addLayer(layer)
        })
      }
    },
    // 厦门公安网PGIS图层-Tile_sl2019
    initTilePGISXMGA () {
      const xyzOpt = {
        projection: 'EPSG:4326',
        tileUrlFunction: function (tileCoord) {
          if (!tileCoord) {
            return ''
          }
          const z = tileCoord[0]
          const x = tileCoord[1]
          const y = tileCoord[2]
          // http://44.64.135.5/Tile_sl2019/81326548cf7f46638db93d0ab919f0da/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col=3394&Row=742&Zoom=12&V=1.0.0
          return `http://44.64.18.11/Tile_sl2019/40219e3adef540b4b3d0b9b5e1d66c53/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col=${x}&Row=${y}&Zoom=${z}&V=1.0.0`
        },
        crossOrigin: 'anonymous'
      }
      const source = new XYZ(xyzOpt)
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new TileLayer(layerOpt)
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.zIndex) {
            layer.setZIndex(this.zIndex)
          }
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
      this.layer.set('type', 'wms')
      // this.layer.setZIndex(0)
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex)
      }
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.mask && Object.keys(this.mask).length > 0) {
            this.addMask(layer, this.mask)
          }
          this.map.addLayer(layer)
        })
      }
    },
    initTD () {
      const layerVec = this.initXYZbyURL(this.tdVec || 'https://t4.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      const layerCva = this.initXYZbyURL(this.tdCva || 'https://t3.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      this.layers = [layerVec, layerCva]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.zIndex) {
            layer.setZIndex(this.zIndex)
          }
          this.map.addLayer(layer)
        })
      }
    },
    initXYZbyURL (url, sourceOptions = {}) {
      const xyzOpt = { ...{ crossOrigin: 'anonymous' }, ...this.$props.xyz, ...{ url } }
      const source = new XYZ({ ...xyzOpt, ...sourceOptions })
      const layerOpt = { ...this.$props, ...{ source } }
      const layer = new TileLayer(layerOpt)
      layer.set('base', true)
      if (this.zIndex) {
        layer.setZIndex(this.zIndex)
      }
      if (this.mask && Object.keys(this.mask).length > 0) {
        this.addMask(layer, this.mask)
      }
      return layer
    },
    initTDIMG () {
      const layerImg = this.initXYZbyURL(this.tdImg || 'https://t4.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      const layerCia = this.initXYZbyURL(this.tdCia || 'https://t3.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a')
      this.layers = [layerImg, layerCia]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          this.map.addLayer(layer)
        })
      }
    },
    initArcgisTile (type) {
      // http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/1/2/1
      let url = ''
      switch (type) {
        case 'blue':
          url = import.meta.env.DEV ? 'http:' : 'https:'
          url = url + '//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/'
          break
        case 'warm':
          url = import.meta.env.DEV ? 'http:' : 'https:'
          url = url + '//cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile'
          break
        case 'normal':
          url = import.meta.env.DEV ? 'http:' : 'https:'
          url = url + '//cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile'
          break
        case 'gray':
          url = import.meta.env.DEV ? 'http:' : 'https:'
          url = url + '//cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile'
          break
        default:
          url = import.meta.env.DEV ? 'http:' : 'https:'
          url = url + '//cache1.arcgisonline.cn/arcgarcgis/rest/services/ChinaOnlineCommunity/MapServer/tile'
          break
      }
      this.layer = this.initXYZbyURL(`${url}/{z}/{y}/{x}`, { projection: 'GCJ02' })
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.zIndex) {
            layer.setZIndex(this.zIndex)
          }
          this.map.addLayer(layer)
        })
      }
    },
    initBD (customid) {
      this.layers = this.getBDMap(this.xyz, this.$props, customid)
      if (this.layers.length > 0) {
        if (!this.addForOverview) {
          this.layers.forEach(layer => {
            // layer.setZIndex(0)
            if (this.mask && Object.keys(this.mask).length > 0) {
              this.addMask(layer, this.mask)
            }
            this.map.addLayer(layer)
          })
        }
      }
    },
    getBDMap (xyz, tileLayer, customid = '') {
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
            // https://api.map.baidu.com/customimage/tile?qt=customimage&x=787&y=290&z=12&udt=20220819&scale=2&ak=E4805d16520de693a3fe707cdc962045&customid=midnight&v=2.1&seckey=9LZaB7DLvQ7m%2FRRaNMpgH4S9Zhcxe6d7n%2FqWfPnSoEY%3D%2CDGZ_XDIb0iZ2S_XjrNUTXaf57stJrPVtt77DgTiPElcmmxLfFQRplqMLY-DcBrNQ73d-IDnPJdvDOt8ywP9tRUdmE__T2m_3re7uE7Bh4ZEawAqJa4FkUTq2CDzXupYGQdr0DnfvZsq1eBICikh7cQcvdN1JVdk7P4J_MoGEaDzTI0nkFHNlmD-ntA8DuGMa&timeStamp=1661247410473&sign=98ca621224b9

            if (customid) {
              // https://api.map.baidu.com/customimage/tile?qt=customimage&x=787&y=290&z=12&udt=20220819&scale=2&ak=E4805d16520de693a3fe707cdc962045&customid=midnight&v=2.1&seckey=9LZaB7DLvQ7m%2FRRaNMpgH4S9Zhcxe6d7n%2FqWfPnSoEY%3D%2CDGZ_XDIb0iZ2S_XjrNUTXaf57stJrPVtt77DgTiPElcmmxLfFQRplqMLY-DcBrNQ73d-IDnPJdvDOt8ywP9tRUdmE__T2m_3re7uE7Bh4ZEawAqJa4FkUTq2CDzXupYGQdr0DnfvZsq1eBICikh7cQcvdN1JVdk7P4J_MoGEaDzTI0nkFHNlmD-ntA8DuGMa&timeStamp=1661247410473&sign=98ca621224b9
              return 'http://api0.map.bdimg.com/customimage/tile?' +
                  '&x=' + x +
                  '&y=' + y +
                  '&z=' + z +
                  'udt=20220819' +
                  '&scale=1' +
                  '&ak=5ieMMexWmzB9jivTq6oCRX9j' +
                  '&customid=' + customid
            } else {
              return 'https://maponline1.bdimg.com/tile/?qt=vtile&x=' +
                  x + '&y=' + y + '&z=' + z +
                  '&styles=pl&scaler=1&udt=20220113&from=jsapi2_0'
            }
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
      if (this.zIndex) {
        layer.setZIndex(this.zIndex)
      }
      return [layer]
    },
    initGD () {
      this.layers = [this.getAMap(this.xyz, this.$props, this.gdUrl)]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.mask && Object.keys(this.mask).length > 0) {
            this.addMask(layer, this.mask)
          }
          this.map.addLayer(layer)
        })
      }
    },
    initAMapImage () {
      this.layers = [
        this.getAMap(this.xyz, this.$props, 'https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6'),
        this.getAMap(this.xyz, this.$props, 'https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8')
      ]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.mask && Object.keys(this.mask).length > 0) {
            this.addMask(layer, this.mask)
          }
          this.map.addLayer(layer)
        })
      }
    },
    getAMap (xyz, tileLayer, url) {
      const xyzOpt = {
        ...xyz,
        ...{
          url: url || 'https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7',
          projection: AMapMercatorProj,
          crossOrigin: 'anonymous'
        }
      }
      const tile = new XYZ(xyzOpt)
      const layerOpt = { ...tileLayer, ...{ source: tile } }
      const layer = new TileLayer(layerOpt)
      layer.set('type', 'AMap')
      layer.set('name', 'AMap')
      layer.set('base', true)
      if (this.zIndex) {
        layer.setZIndex(this.zIndex)
      }
      return layer
    },
    initTileOSM () {
      const source = new OSM()
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new TileLayer(layerOpt)
      this.layer.set('base', this.base)
      // this.layer.setZIndex(0)
      this.layers = [this.layer]
      if (!this.addForOverview) {
        this.layers.forEach(layer => {
          if (this.mask && Object.keys(this.mask).length > 0) {
            this.addMask(layer, this.mask)
          }
          if (this.zIndex) {
            layer.setZIndex(this.zIndex)
          }
          this.map.addLayer(layer)
        })
      }
    },
    addMask (layer, maskOption) {
      console.log(maskOption)
      const option = {
        feature: maskOption.feature,
        wrapX: maskOption.wrapX || true,
        inner: maskOption.inner || false,
        shadowWidth: maskOption.shadowWidth || 0,
        fill: maskOption.fill || 'rgba(255, 255, 255, 0.8)'
      }
      console.log(this.layers)
      const filterFeature = setFeature(option.feature, this.map)
      this.filterMask = new Mask({
        feature: filterFeature,
        wrapX: option.wrapX || true,
        inner: option.inner || false,
        fill: new Fill({ color: option.fill })
      })
      this.filterMask.set('shadowWidth', option.shadowWidth || 0)
      layer.addFilter(this.filterMask)
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
