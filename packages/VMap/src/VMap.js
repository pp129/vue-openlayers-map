import 'ol/ol.css'
import { Map, View } from 'ol'
import Overlay from 'ol/Overlay'
import { Tile as TileLayer, Vector as VectorLayer, VectorImage as VectorImageLayer, Heatmap as HeatmapLayer } from 'ol/layer'
import ImageLayer from 'ol/layer/Image'
import WebGLPointsLayer from 'ol/layer/WebGLPoints'
import { Cluster, XYZ, Vector as VectorSource } from 'ol/source'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import Feature from 'ol/Feature'
import { Circle, LineString, Point, Polygon } from 'ol/geom'
import { Fill, Icon, Stroke, Style, Text, Circle as CircleStyle, RegularShape } from 'ol/style'
import { OverviewMap, defaults as defaultControls } from 'ol/control'
import { Draw, Modify, Select } from 'ol/interaction'
import TileGrid from 'ol/tilegrid/TileGrid'
import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj'
import { getArea, getLength } from 'ol/sphere'
import { getCenter } from 'ol/extent'
import { toContext } from 'ol/render'
import { point, lineString, distance, length } from '@turf/turf'

import projzh from '~/VMap/src/utils/projConvert'
import coordtransform from '~/VMap/src/utils/coordtransform'
import * as olExtent from 'ol/extent'
// import LayerGroup from 'ol/layer/Group'

function validObjKey (obj, key) {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) && Object.keys(obj).length > 0
}

/**
 * 对Map进行扩展，根据图层id获取当前图层下所有元素
 * @param id
 * @returns {*[]}
 */
Map.prototype.getFeaturesByLayerId = function (id) {
  const layers = this.getLayers()
  let features = []
  layers.forEach(layer => {
    if (layer.get('id') === id) {
      features = layer.getSource().getFeatures()
    }
  })
  return features
}
const e = function (t, r, s, i, a, n) {
  t.getSource()._forEachFeatureAtCoordinate && t.getSource()._forEachFeatureAtCoordinate(r, s,
    (function (e) {
      console.log(e)
      return i(e, t)
    })(),
    a, n)
}
Map.prototype.forEachSmFeatureAtPixel = function (t, r, s, i) {
  debugger
  const a = s && s.layerFilter ? s.layerFilter : function () {
    return !0
  }
  const n = this.getLayers().getArray()
  const o = this.getView().getResolution()
  const l = this.getCoordinateFromPixel(t)
  for (let ss = 0; ss < n.length; ss++) {
    const h = n[ss]
    // console.log(h)
    // eslint-disable-next-line no-useless-call
    h.getVisible() && a.call(null, h) && e(h, l, o, r, t, i)
  }
}

/**
 * 对Map进行扩展，根据图层id获取当前图层下制定id的要素
 * @param layerId
 * @param featureId
 * @returns {*}
 */
Map.prototype.getFeatureById = function (layerId, featureId) {
  const layers = this.getLayers()
  let feature
  layers.forEach(layer => {
    if (layer.get('id') === layerId) {
      feature = layer.getSource().getFeatureById(featureId)
    }
  })
  return feature
}

/**
 * 对VectorLayer扩展，获取当前layer下制定id的要素
 * @param id
 * @returns {*}
 */
VectorLayer.prototype.getFeatureById = function (id) {
  const source = this.getSource()
  return source.getFeatureById(id)
}

const getGraphicsInExtent = function (source, e) {
  var t = []
  return e ? (source.get('graphics').map(function (r) {
    console.log(r)
    // eslint-disable-next-line no-sequences
    return olExtent.containsExtent(e, r.getGeometry().getExtent()) && t.push(r), r
  }), t) : (source.get('graphics').map(function (e) {
    // eslint-disable-next-line no-sequences
    return t.push(e), e
  }), t)
}
ImageCanvasSource.prototype._forEachFeatureAtCoordinate = function (e, r, s, i, a) {
  var n = getGraphicsInExtent(this)
  console.log(n)
  for (var o = n.length - 1; o >= 0; o--) {
    var l = n[o].getStyle()
    if (!l) return
    var h = n[o].getGeometry().getCoordinates()
    var u = l.getImage()
    var c = !1

    var _t = []
    // eslint-disable-next-line no-unused-expressions,no-sequences
    _t[0] = h[0] - u.getAnchor()[0] * r, _t[2] = h[0] + u.getAnchor()[0] * r, _t[1] = h[1] - u.getAnchor()[1] * r,
    _t[3] = h[1] + u.getAnchor()[1] * r,
    olExtent.containsCoordinate(_t, e) && (c = !0)

    // eslint-disable-next-line no-unused-expressions
    !0 !== c ? _t.isHighLight && _t._highLightClose() : (_t.isHighLight && _t._highLight(h, u, n[o], i), this._forEachFeatureAtCoordinate && this._forEachFeatureAtCoordinate(n[o], a))
  }
}

/**
 * 对Feature扩展
 */
export class FeatureExt extends Feature {
  /**
   * 更新元素位置
   * @param coordinates
   */
  setPosition = function (coordinates) {
    setPosition(this, coordinates)
  }

  /**
   * 更新元素属性
   * @param key
   * @param value
   */
  update = function (key, value) {
    if (key === 'style') {
      this.setStyle(setStyle(value))
    }
    if (key === 'position') {
      setPosition(this, value)
    }
  }
}

/**
 * 用turf计算两点距离
 * @param from {Array} [经度,纬度]
 * @param to {Array} [经度,纬度]
 * @param units 单位为千米kilometers，单位还可以设置为degrees, radians, miles
 * @returns {number}
 */
function getDistancePoint (from, to, units = 'kilometers') {
  const fromPoint = point(from)
  const toPoint = point(to)
  const options = { units: units }

  return distance(fromPoint, toPoint, options)
}

/**
 * 用turf计算折线长度
 * @param lines {Array} [[经度,纬度]...]
 * @param units 单位为千米kilometers，单位还可以设置为degrees, radians, miles
 * @returns {number}
 */
function getDistanceString (lines, units = 'kilometers') {
  const line = lineString(lines)
  const options = { units: units }
  return length(line, options)
}

/**
 * 地图移动动画
 * @param map
 * @param center
 * @param zoom
 */
function panTo (map, center, zoom) {
  map.getView().animate({ center: center }, { zoom: zoom })
}

/**
 * 设置元素位置
 * @param feature
 * @param coordinates
 */
function setPosition (feature, coordinates) {
  feature.getGeometry().setCoordinates(coordinates)
}

/**
 * 设置地图基础切片图层
 * @param option
 * @param visible
 * @returns {*[]}
 */
function baseTile (option, visible) {
  let layers = []
  if (typeof option === 'string') {
    layers = getBaseTile({ type: option }, visible)
  } else if (typeof option === 'object') {
    if (option instanceof Array) {
      option.forEach(item => {
        if (typeof item === 'string') {
          const layer = getBaseTile({ type: item }, visible)
          layers = layers.concat(layer)
        } else if (typeof item === 'object') {
          const layer = getBaseTile(item, visible)
          layers = layers.concat(layer)
        }
      })
    } else {
      const layer = getBaseTile(option, visible)
      layers = layers.concat(layer)
    }
  }
  return layers
}

/**
 * 获取地图基础切片图层
 * @param option
 * @param visible
 * @returns {*[]}
 */
function getBaseTile (option, visible) {
  switch (option.type) {
    case 'td':
      return getTDMap(visible)
    case 'td_img':
      return getTDImg(visible)
    case 'xyz':
      option.base = true
      return getCustomerTileXYZ(option, visible)
    case 'bd':
      return getBDMap(option, visible)
    default:
      return getTDMap(visible)
  }
}

/**
 * 天地图-矢量图
 * @param visible
 * @returns {*[]}
 */
function getTDMap (visible) {
  return getCustomerTileXYZ({
    option: [
      {
        url: 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      },
      {
        url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      }
    ],
    type: 'td',
    name: 'td',
    base: true
  }, visible)
}

/**
 * 天地图-影像图
 * @param visible
 * @returns {*[]}
 */
function getTDImg (visible) {
  return getCustomerTileXYZ({
    option: [
      {
        url: 'http://t4.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      },
      {
        url: 'http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      }
    ],
    type: 'td_img',
    name: 'td_img',
    base: true
  }, visible)
}
const baiduMercatorProj = new Projection({
  code: 'baidu',
  // extent: applyTransform(extent, projzh.ll2bmerc),
  units: 'm'
})

addProjection(baiduMercatorProj)
addCoordinateTransforms('EPSG:4326', baiduMercatorProj, projzh.ll2bmerc, projzh.bmerc2ll)
addCoordinateTransforms('EPSG:3857', baiduMercatorProj, projzh.smerc2bmerc, projzh.bmerc2smerc)

/**
 * 百度地图
 * @param option
 * @param visible
 * @returns {TileLayer<TileSourceType>[]}
 */
function getBDMap (option, visible) {
  // const extent = [72.004, 0.8293, 137.8347, 55.8271]//中国范围
  // 计算百度使用的分辨率
  const resolutions = []
  for (let i = 0; i < 19; i++) {
    resolutions[i] = Math.pow(2, 18 - i)
  }
  const tilegrid = new TileGrid({
    // extent: applyTransform(extent, projzh.ll2bmerc),
    origin: [0, 0], // 设置原点坐标
    resolutions: resolutions // 设置分辨率
  })
  // 创建百度地图的数据源
  const tile = new XYZ({
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
  })
  // 百度地图层
  const layer = new TileLayer({
    visible: false,
    source: tile
  })
  let visibleTile = ''
  if (typeof visible === 'string') {
    visibleTile = visible
  } else if (typeof visible === 'object') {
    visibleTile = visible.name
  }
  if (option.name === visibleTile) {
    layer.setVisible(true)
  }
  layer.set('type', option.type || 'bd')
  layer.set('name', option.name || 'bd')
  layer.set('base', true)
  return [layer]
}

/**
 * 自定义xyz切片
 * @param option
 * @param visible
 * @returns {*[]}
 */
function getCustomerTileXYZ (option, visible) {
  const tiles = []
  option.option.forEach(val => {
    let tileGrid
    if (validObjKey(val, 'tileGrid')) {
      tileGrid = new TileGrid(val.tileGrid)
    }
    const xyzOpt = Object.assign({}, val, {
      tileGrid: tileGrid
    })
    const layer = new TileLayer({
      visible: false,
      source: new XYZ(xyzOpt)
    })
    let visibleTile = ''
    if (typeof visible === 'string') {
      visibleTile = visible
    } else if (typeof visible === 'object') {
      visibleTile = visible.name
    }
    if (option.name === visibleTile) {
      layer.setVisible(true)
    }
    layer.set('type', option.type || '')
    layer.set('name', option.name || '')
    if (validObjKey(option, 'base')) {
      layer.set('base', option.base)
    }
    tiles.push(layer)
  })
  return tiles
}

/**
 * 更新可视的基础切片图层
 * @param map
 * @param tile
 */
function restVisibleBaseTile (map, tile) {
  const layers = map.getLayers()
  layers.forEach(layer => {
    if (layer.get('base') === true) {
      layer.setVisible(false)
      if (typeof tile === 'string') {
        if (layer.get('name') === tile) {
          layer.setVisible(true)
        }
      } else {
        if (layer.get('name') === tile.name) {
          layer.setVisible(true)
        }
      }
    }
  })
}

/**
 * 添加图层
 * @param option
 * @param map
 */
function setLayer (option, map) {
  removeLayerById(option.id, map)
  // 启动计时器
  console.time('layer render')
  if (option.type === 'tile') {
    const tiles = getCustomerTileXYZ(option.tile, option.tile.name)
    tiles.forEach(layer => {
      layer.set('id', option.id || '')
      layer.set('type', option.type)
      layer.set('users', true)
      map.addLayer(layer)
    })
    // 停止计时，输出时间
    console.timeEnd('layer render')
    return tiles
  } else {
    const layer = setVectorLayer(option, map)
    map.addLayer(layer)
    // 停止计时，输出时间
    console.timeEnd('layer render')
    return layer
  }
}

/**
 * 根据id获取图层
 * @param id
 * @param map
 * @returns {*}
 */
function getLayerById (id, map) {
  let layer
  map.getLayers().forEach(item => {
    if (item && item.get('id') === id) {
      layer = item
    }
  })
  return layer
}

/**
 * 根据id删除制定图层
 * @param id
 * @param map
 */
function removeLayerById (id, map) {
  const layers = map.getLayers()
  layers.forEach(item => {
    if (item && item.get('id') === id) {
      map.removeLayer(item)
    }
  })
}

/**
 * 删除图层
 * @param layer
 * @param map
 */
function removeLayer (layer, map) {
  map.removeLayer(layer)
}

/**
 * 设置图层
 * @param option
 * @param map
 * @returns {VectorLayer<VectorSourceType>|Heatmap}
 */
function setVectorLayer (option, map) {
  if (validObjKey(option, 'type') && option.type === 'cluster') {
    // 聚合图层
    const layer = addClusterLayer(option, map)
    layer.set('id', option.id || '')
    layer.set('type', option.type)
    layer.set('users', true)
    return layer
  } else if (validObjKey(option, 'type') && option.type === 'heatmap') {
    // 热力图
    const layer = addHeatmapLayer(option, map)
    layer.set('id', option.id || '')
    layer.set('type', option.type)
    layer.set('users', true)
    return layer
  } else if (validObjKey(option, 'type') && option.type === 'webGLPoints') {
    const layer = addWebGLPointsLayer(option, map)
    console.log(layer)
    layer.set('id', option.id || '')
    layer.set('type', option.type)
    layer.set('users', true)
    return layer
  } else if (validObjKey(option, 'type') && option.type === 'VectorImage') {
    // 元素图层
    let sourceOption
    if (validObjKey(option, 'source')) {
      sourceOption = option.source
    }
    const source = addVectorSource(sourceOption, map)
    const layerOptions = Object.assign({
      visible: true
    }, option, {
      source: source
    })
    const layer = new VectorImageLayer(layerOptions)
    layer.setStyle(function (feature) {
      if (feature.get('style')) {
        return setStyle(feature.get('style'))
      } else {
        if (validObjKey(option, 'style')) {
          return setStyle(option.style)
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
    layer.set('id', option.id || '')
    layer.set('type', option.type || 'VectorImage')
    layer.set('users', true)
    return layer
  } else if (validObjKey(option, 'type') && option.type === 'graphicLayer') {
    // let geoms = []
    const source = new ImageCanvasSource({
      canvasFunction: function (extent, resolution, pixelRatio, size, projection) {
        const geoms = []
        const canvas = document.createElement('canvas')
        const width = size[0] / pixelRatio
        const height = size[1] / pixelRatio
        const vectorContext = toContext(canvas.getContext('2d'), { size: [width, height] })
        // const fill = new Fill({ color: 'blue' })
        // vectorContext.setStyle(style)
        const mapsize = map.getSize()
        const t = width
        const r = height
        const s = [(t - mapsize[0]) / 2, (r - mapsize[1]) / 2]
        if (validObjKey(option, 'source')) {
          if (validObjKey(option.source, 'features') && option.source.features.length > 0) {
            option.source.features.forEach(feature => {
              let style
              if (validObjKey(feature, 'style')) {
                style = setStyle(feature.style)
              } else {
                style = new Style({
                  image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                      color: 'blue'
                    })
                  })
                })
              }
              const r = feature.coordinates
              const l = map.getPixelFromCoordinate(r)
              const h = -map.getView().getRotation()
              const u = map.getPixelFromCoordinate(map.getView().getCenter())
              const c = (function (e, t, r) {
                return [Math.cos(t) * (e[0] - r[0]) - Math.sin(t) * (e[1] - r[1]) + r[0], Math.sin(t) * (e[0] - r[0]) + Math.cos(t) * (e[1] - r[1]) + r[1]]
              }((function (e, t, r) {
                return [(e[0] - t[0]) * r + t[0], (e[1] - t[1]) * r + t[1]]
              }(l, u, 1)), h, u))
              const d = [c[0] + s[0], c[1] + s[1]]
              const p = new Point(d, 'XY')
              const geom = new Feature(p)
              geoms.push(geom)
              vectorContext.drawFeature(geom, style)
            })
          }
        }
        source.set('graphics', geoms)
        console.log('graphics=====', source.get('graphics'))
        // canvas.width = size[0]
        // canvas.height = size[1]
        // const context = canvas.getContext('2d')
        // context.fillStyle = 'blue'
        // const mapsize = map.getSize()
        // const delt = [((size[0] - mapsize[0]) / 2), ((size[1] - mapsize[1]) / 2)]
        // if (validObjKey(option, 'source')) {
        //   if (option.source.features.length > 0) {
        //     option.source.features.forEach(feature => {
        //       const pix = map.getPixelFromCoordinate(feature.coordinates)
        //       context.beginPath()
        //       context.arc(pix[0] + delt[0], pix[1] + delt[1], 10, 0, 2 * Math.PI)
        //       context.closePath()
        //       context.fill()
        //       // context.fillRect(pix[0] + delt[0], pix[1] + delt[1], 10, 10)
        //     })
        //   }
        // }
        return canvas
      }
    })
    console.log('graphics-----', source.get('graphics'))
    // console.log(geoms)
    const layerOptions = Object.assign({
      visible: true
    }, option, {
      source: source
    })
    const layer = new ImageLayer(layerOptions)
    layer.set('id', option.id || '')
    layer.set('type', option.type || 'graphicLayer')
    layer.set('users', true)
    map.on('singleclick', function (r) {
      console.log(r.pixel)
      console.log(option)
      map.forEachSmFeatureAtPixel(r.pixel, option.onClick, {}, r)
    })
    return layer
  } else {
    // 元素图层
    let sourceOption
    if (validObjKey(option, 'source')) {
      sourceOption = option.source
    }
    const source = addVectorSource(sourceOption, map)
    const layerOptions = Object.assign({
      visible: true
    }, option, {
      source: source
    })
    const layer = new VectorLayer(layerOptions)
    layer.setStyle(function (feature) {
      if (feature.get('style')) {
        return setStyle(feature.get('style'))
      } else {
        if (validObjKey(option, 'style')) {
          return setStyle(option.style)
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
    layer.set('id', option.id || '')
    layer.set('type', option.type || 'VectorLayer')
    if (option.type === 'draw') {

    }
    if (option.id !== '_draw') {
      layer.set('users', true)
    }
    return layer
  }
}

/**
 * 添加鹰眼
 * @param view
 * @param layers
 * @returns {OverviewMap}
 */
function addOverviewMapControl (view, layers) {
  return new OverviewMap({
    view: new View(view),
    collapsed: false,
    layers: layers
  })
}

/**
 * 添加弹框
 * @param option
 * @returns {Overlay}
 */
function addOverlay (option) {
  if (validObjKey(option, 'element') && option.element !== null) {
    let element
    if (typeof option.element === 'string') {
      element = document.getElementById(option.element.toString())
    }
    const overlayOption = Object.assign({
      position: undefined
    }, option, {
      element: element
    })
    return new Overlay(overlayOption)
  }
}

/**
 * 更新弹框位置
 * @param overlay
 * @param position
 */
function setOverlayPosition (overlay, position) {
  overlay.setPosition(position)
}

function updateOverlay (overlay, option) {
  if (validObjKey(option, 'position')) {
    overlay.setPosition(option.position)
  }
  if (validObjKey(option, 'offset')) {
    overlay.setOffset(option.offset)
  }
}

/**
 * 设置文本样式
 * @param option
 * @returns {Text}
 */
function setText (option) {
  const defaultOption = Object.assign({
    font: '14px sans-serif',
    padding: [2, 5, 2, 5] // [top, right, bottom, left].
  }, option)
  const textStyle = new Text(defaultOption)
  if (validObjKey(option, 'fill')) {
    const fillStyle = new Fill(option.fill)
    textStyle.setFill(fillStyle)
  }
  if (validObjKey(option, 'backgroundFill')) {
    const backgroundFillStyle = new Fill(option.backgroundFill)
    textStyle.setBackgroundFill(backgroundFillStyle)
  }
  if (validObjKey(option, 'stroke')) {
    const strokeStyle = new Stroke(option.stroke)
    textStyle.setStroke(strokeStyle)
  }
  if (validObjKey(option, 'backgroundStroke')) {
    const backgroundStrokeStyle = new Stroke(option.backgroundStroke)
    textStyle.setBackgroundStroke(backgroundStrokeStyle)
  }
  return textStyle
}

/**
 * 设置多元素
 * @param features
 * @param map
 * @returns {*[]}
 */
function setFeatures (features, map) {
  const output = []
  features.forEach(val => {
    output.push(setFeature(val, map))
  })
  return output
}

/**
 * 设置元素
 * @param option
 * @param map
 * @returns {FeatureExt}
 */
function setFeature (option, map) {
  if (validObjKey(option, 'type')) {
    const type = option.type
    switch (type) {
      case 'point':
        return setPointFeature(option, map)
      case 'polygon':
        return setPolygon(option)
      case 'polyline':
        return setPolyline(option)
      case 'circle':
        return setCircle(option, map)
      default:
        return setPointFeature(option, map)
    }
  } else {
    return setPointFeature(option, map)
  }
}

/**
 * 获取点类型元素
 * @param option
 * @param map
 * @returns {FeatureExt}
 */
function setPointFeature (option, map) {
  let coordinates = []
  if (validObjKey(option, 'convert') && option.convert) {
    switch (option.convert) {
      case 'bd-84':
        coordinates = coordtransform.bd09towgs84(option.coordinates[0], option.coordinates[1])
        break
      case 'bd-gd':
        coordinates = coordtransform.bd09togcj02(option.coordinates[0], option.coordinates[1])
        break
      case 'gd-84':
        coordinates = coordtransform.gcj02towgs84(option.coordinates[0], option.coordinates[1])
        break
      case 'gd-bd':
        coordinates = coordtransform.gcj02tobd09(option.coordinates[0], option.coordinates[1])
        break
      case '84-gd':
        coordinates = coordtransform.wgs84togcj02(option.coordinates[0], option.coordinates[1])
        break
      case '84-bd':
        coordinates = coordtransform.wgs84tobd09(option.coordinates[0], option.coordinates[1])
        break
      default:
        coordinates = option.coordinates
        break
    }
  } else {
    coordinates = option.coordinates
  }
  const feature = new FeatureExt({
    geometry: new Point(coordinates)
  })
  const featureStyle = new Style()
  // newFeaturePrototype(feature)
  if (validObjKey(option, 'style')) {
    const optionStyle = option.style
    let imageStyle
    let textStyle
    if (validObjKey(optionStyle, 'icon')) {
      imageStyle = new Icon(optionStyle.icon)
      featureStyle.setImage(imageStyle)
    }
    if (validObjKey(optionStyle, 'text')) {
      const optionText = optionStyle.text
      textStyle = setText(optionText)
      featureStyle.setText(textStyle)
    }
    if (validObjKey(optionStyle, 'styleFunction')) {
      feature.setStyle(function (feature, resolution) {
        return optionStyle.styleFunction(feature, resolution, map, featureStyle)
      })
    } else {
      feature.setStyle(featureStyle)
    }
  } else {
    featureStyle.setImage(new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: '#ff0000'
      })
    }))
    feature.setStyle(featureStyle)
  }
  if (validObjKey(option, 'id')) {
    feature.setId(option.id)
  }
  if (typeof option === 'object') {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i])
      }
    }
  }
  return feature
}

/**
 * 获取圆形类型元素
 * @param option
 * @param map
 * @returns {FeatureExt}
 */
function setCircle (option, map) {
  const feature = new FeatureExt({
    geometry: new Circle(option.center, getRadiusByUnit(map, option.radius))
  })
  feature.set('style', option.style || null)
  feature.set('type', option.type || 'circle')
  feature.set('properties', option.properties || null)
  return feature
}

/**
 * 获取以米为单位的半径
 * @param map
 * @param radius
 * @returns {number}
 */
function getRadiusByUnit (map, radius) {
  const metersPerUnit = map.getView().getProjection().getMetersPerUnit()
  return radius / metersPerUnit
}

/**
 * 获取折线类型元素
 * @param option
 * @returns {FeatureExt}
 */
function setPolyline (option) {
  const feature = new FeatureExt({
    geometry: new LineString(option.coordinates)
  })
  feature.set('style', option.style || null)
  feature.set('type', option.type || 'polyline')
  feature.set('properties', option.properties || null)
  return feature
}

/**
 * 获取多边形类型元素
 * @param option
 * @returns {FeatureExt}
 */
function setPolygon (option) {
  const feature = new FeatureExt({
    geometry: new Polygon([option.coordinates])
  })
  if (typeof option === 'object') {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i])
      }
    }
  }
  return feature
}

/**
 * 获取样式
 * @param option
 * @returns {Style}
 */
function setStyle (option) {
  const style = new Style()
  if (validObjKey(option, 'fill')) {
    style.setFill(new Fill(option.fill))
  } else {
    style.setFill(new Fill({
      color: 'rgba(67,126,255,0.15)'
    }))
  }
  if (validObjKey(option, 'stroke')) {
    style.setStroke(new Stroke(option.stroke))
  } else {
    style.setStroke(new Stroke({
      color: 'rgba(67,126,255,1)',
      width: 1
      // lineDash: [20, 10, 20, 10]
    }))
  }
  if (validObjKey(option, 'icon')) {
    style.setImage(new Icon(option.icon))
  }
  if (validObjKey(option, 'text')) {
    const optionText = option.text
    const textStyle = setText(optionText)
    style.setText(textStyle)
  }
  return style
}

/**
 * 添加矢量图层来源
 * @param option
 * @param map
 * @returns {VectorSource<Geometry>}
 */
function addVectorSource (option, map) {
  let features = []
  if (validObjKey(option, 'features')) {
    features = option.features
  }
  const source = Object.assign({}, option, {
    features: setFeatures(features, map)
  })
  return new VectorSource(source)
}

/**
 * 绘制图层
 * @param id
 * @param map
 * @param style
 */
function addDrawLayer (id = '_draw', map, style) {
  removeLayerById(id, map)
  const layer = setVectorLayer({ id: id, type: 'draw' }, map)
  if (style) {
    layer.setStyle(setStyle(style))
  }
  map.addLayer(layer)
}

function clearDrawLayer (map, layer = '_draw') {
  const layers = map.getLayers()
  layers.forEach(item => {
    if (item && item.get('id') === layer) {
      item.getSource().clear()
    }
  })
}

/**
 * 根据图层id获取图层来源
 * @param id
 * @param map
 * @returns {*}
 */
function getSourceByLayerId (id, map) {
  const layer = getLayerById(id, map)
  return layer.getSource()
}

/**
 * 添加聚合图层
 * @param option
 * @param map
 * @returns {VectorLayer<VectorSourceType>}
 */
function addClusterLayer (option, map) {
  const source = addVectorSource(option.cluster.source, map)
  const options = Object.assign({}, option.cluster, {
    source: source
  })
  const clusterSource = new Cluster(options)
  const styleCache = {}
  const clusterOptions = Object.assign({
    source: clusterSource,
    style: function (feature) {
      const size = feature.get('features').length
      let style = styleCache[size]
      if (size > 1) {
        if (!style) {
          let styleOptions = {}
          if (!validObjKey(options, 'style')) {
            styleOptions = {
              image: new CircleStyle({
                radius: 20,
                stroke: new Stroke({
                  color: '#fff'
                }),
                fill: new Fill({
                  color: '#3399CC'
                })
              }),
              text: new Text({
                font: '16px sans-serif',
                text: size.toString(),
                fill: new Fill({
                  color: '#fff'
                })
              })
            }
          } else {
            options.style.forEach(e => {
              let min = 0
              let max = 0
              let textColor = 'white'
              if (validObjKey(e, 'textColor')) {
                textColor = e.textColor
              }
              if (validObjKey(e, 'min') && validObjKey(e, 'max')) {
                min = e.min
                max = e.max
              } else {
                const total = source.getFeatures()
                if (total > 0) {
                  const average = total / options.style.length
                  for (let i = 0; i < options.style.length; i++) {
                    min = i
                    max = average * (i + 1)
                  }
                }
              }
              if (min < size && size <= max) {
                styleOptions = clusterFeatureStyle(e.icon, size.toString(), textColor)
              }
            })
          }
          style = new Style(styleOptions)
          styleCache[size] = style
        }
      } else {
        style = setStyle(feature.get('features')[0].get('style'))
      }
      return style
    }
  }, option)
  const clusters = new VectorLayer(clusterOptions)
  clusters.set('type', 'cluster')
  clusters.set('id', options.id)
  return clusters
}

/**
 * 设置聚合样式
 * @param icon
 * @param text
 * @param color
 * @returns {{image: Icon, text: Text}}
 */
function clusterFeatureStyle (icon, text, color) {
  const styleImage = new Icon({
    src: icon
  })
  const styleText = new Text({
    text: text,
    fill: new Fill({
      color: color
    })
  })
  return {
    image: styleImage,
    text: styleText
  }
}

/**
 * 添加热力图图层
 * @param option
 * @param map
 * @returns {Heatmap}
 */
function addHeatmapLayer (option, map) {
  const source = addVectorSource(option.source, map)
  const options = Object.assign({}, option, {
    source: source
  })
  const vector = new HeatmapLayer(options)
  vector.setSource(source)
  vector.set('id', options.id)
  return vector
}

/**
 * WebGL图层样式
 * @type {{size: number, color: string, opacity: number, rotateWithView: boolean, symbolType: string}}
 */
const defaultWebGLPointStyleSymbol = {
  symbolType: 'circle',
  size: 18,
  color: '#006688',
  opacity: 0.95,
  rotateWithView: false
}

/**
 * WebGL图层
 * @param option
 * @param map
 * @returns {WebGLPointsLayer<VectorSourceType>}
 */
function addWebGLPointsLayer (option, map) {
  let sourceOption
  if (validObjKey(option, 'source')) {
    sourceOption = option.source
  }
  let symbol = defaultWebGLPointStyleSymbol
  if (validObjKey(option, 'symbol')) {
    symbol = option.symbol
  }
  const source = addVectorSource(sourceOption, map)
  return new WebGLPointsLayer(Object.assign({
    disableHitDetection: false // 将此设置为true会稍微提高性能，但会阻止在图层上进行所有命中检测，需要交互的话，设置false
  }, option, {
    style: {
      symbol: symbol
    },
    source: source
  }))
}

/**
 * 设置交互功能
 * @param map
 * @param value
 */
function setInteraction (map, value) {
  map.getInteractions().forEach(interaction => {
    if (interaction && interaction.get('type')) {
      if (interaction.get('type') === 'draw' || interaction.get('type') === 'select' || interaction.get('type') === 'modify') {
        map.removeInteraction(interaction)
      }
    }
  })
  const select = new Select()
  select.set('type', 'select')
  let draw
  let modify
  let endRight = false
  let editable = false
  if (value && value.length > 0) {
    value.forEach(item => {
      if (item.type === 'draw') {
        addDrawLayer(item.layer, map, item.style)
        draw = new Draw({
          source: getSourceByLayerId(item.layer || '_draw', map),
          type: item.value,
          freehand: item.freehand
        })
        draw.set('type', 'draw')
        map.addInteraction(draw)
        if (validObjKey(item, 'endRight') && item.endRight) {
          endRight = item.endRight
        }
        if (validObjKey(item, 'editable') && item.editable) {
          editable = item.editable
        }
        if (endRight) {
          map.on('contextmenu', evt => {
            map.removeInteraction(draw)
            clearDrawLayer(map, item.layer)
          })
        }
        if (editable) {
          draw.on('drawend', evt => {
            map.addInteraction(select)
            modify = new Modify({
              features: select.getFeatures()
            })
            modify.set('type', 'modify')
            map.addInteraction(modify)
          })
        }
        draw.on('drawend', evt => {
          if (validObjKey(item, 'clear') && item.clear) {
            clearDrawLayer(map, item.layer)
          }
        })
      }
      if (item.type === 'select') {
        map.addInteraction(select)
      }
      if (item.type === 'modify') {
        if (validObjKey(item, 'selectFeature') && item.selectFeature) {
          modify = new Modify({
            features: select.getFeatures()
          })
          modify.set('type', 'modify')
          map.addInteraction(modify)
        }
      }
    })
  } else {
    clearDrawLayer(map, '_draw')
  }
}

/**
 * 删除交互
 * @param map
 * @param value
 */
function removeInteraction (map, value) {
  map.removeInteraction(value)
}

/**
 * 删除所有测量图层
 * @param map
 */
function removeAllMeasureLayers (map) {
  const layers = map.getLayers()
  layers.forEach(item => {
    if (item && item.get('measureLayer') && item.get('measureLayer') === true) {
      map.removeLayer(item)
    }
  })
}

/**
 * 测量交互
 * @param map
 * @param value
 * @returns {boolean}
 */
function setMeasure (map, value) {
  if (!value) {
    map.getInteractions().forEach(interaction => {
      if (interaction && interaction.get('type')) {
        if (interaction.get('type') === 'measure') {
          map.removeInteraction(interaction)
        }
      }
    })
    // removeLayerById('measure', map)
    removeAllMeasureLayers(map)
  }
  let clear = true
  if (validObjKey(value, 'clear') && typeof value.clear === 'boolean') {
    clear = value.clear
  }
  map.getInteractions().forEach(interaction => {
    if (interaction && interaction.get('type')) {
      if (interaction.get('type') === 'measure') {
        map.removeInteraction(interaction)
      }
    }
  })
  if (clear) {
    removeAllMeasureLayers(map)
  }

  if (!validObjKey(value, 'type') || !value.type) {
    return false
  }

  const style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)'
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      })
    })
  })
  const labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)'
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)'
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)'
      })
    })
  })
  const tipStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)'
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)'
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15
    })
  })
  const modifyStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)'
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)'
      })
    }),
    text: new Text({
      text: '编辑测量',
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)'
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)'
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15
    })
  })
  const segmentStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)'
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)'
      }),
      padding: [2, 2, 2, 2],
      textBaseline: 'bottom',
      offsetY: -12
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)'
      })
    })
  })
  const segmentStyles = [segmentStyle]
  const formatLength = function (line) {
    const length = getLength(line, {
      projection: 'EPSG:4326'
    })
    let output
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' km'
    } else {
      output = Math.round(length * 100) / 100 + ' m'
    }
    return output
  }
  const formatArea = function (polygon) {
    const area = getArea(polygon, {
      projection: 'EPSG:4326'
    })
    let output
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2'
    } else {
      output = Math.round(area * 100) / 100 + ' m\xB2'
    }
    return output
  }
  const source = new VectorSource()
  const modify = new Modify({ source: source, style: modifyStyle })
  let tipPoint
  let segments = true
  if (validObjKey(value, 'segments') && typeof value.segments === 'boolean') {
    segments = value.segments
  }
  function styleFunction (feature, segments, drawType, tip) {
    const styles = [style]
    const geometry = feature.getGeometry()
    const type = geometry.getType()
    let point, label, line
    if (!drawType || drawType === type) {
      if (type === 'Polygon') {
        point = geometry.getInteriorPoint()
        label = formatArea(geometry)
        line = new LineString(geometry.getCoordinates()[0])
      } else if (type === 'LineString') {
        point = new Point(geometry.getLastCoordinate())
        label = formatLength(geometry)
        line = geometry
      }
    }
    if (segments && line) {
      let count = 0
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b])
        const label = formatLength(segment)
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone())
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5))
        segmentStyles[count].setGeometry(segmentPoint)
        segmentStyles[count].getText().setText(label)
        styles.push(segmentStyles[count])
        count++
      })
    }
    if (label) {
      labelStyle.setGeometry(point)
      labelStyle.getText().setText(label)
      styles.push(labelStyle)
    }
    if (
      tip &&
      type === 'Point' &&
      !modify.getOverlay().getSource().getFeatures().length
    ) {
      tipPoint = geometry
      tipStyle.getText().setText(tip)
      styles.push(tipStyle)
    }
    return styles
  }
  const vector = new VectorLayer({
    source: source,
    style: function (feature) {
      return styleFunction(feature, segments)
    }
  })
  vector.set('id', 'measure')
  vector.set('measureLayer', true)
  map.addLayer(vector)
  modify.set('type', 'measure')
  map.addInteraction(modify)
  const drawType = value.type
  const activeTip =
    '点击继续测量' +
    (drawType === 'Polygon' ? '面积' : '长度')
  const idleTip = '点击开始测量'
  let tip = idleTip
  const draw = new Draw({
    source: source,
    type: drawType,
    style: function (feature) {
      return styleFunction(feature, segments, drawType, tip)
    }
  })
  draw.set('type', 'measure')
  draw.set('measureDraw', true)
  draw.on('drawstart', function () {
    if (clear) {
      source.clear()
    }
    modify.setActive(false)
    tip = activeTip
  })
  draw.on('drawend', function () {
    modifyStyle.setGeometry(tipPoint)
    modify.setActive(true)
    map.once('pointermove', function () {
      modifyStyle.setGeometry()
    })
    tip = idleTip
  })
  modify.setActive(true)
  map.addInteraction(draw)
}

export class VMap {
  static map = VMap

  static setLayer (val, map) {
    return setLayer(val, map)
  }

  static removeLayer (val) {
    return removeLayer(val, VMap.map.map)
  }

  static removeLayerById (val) {
    return removeLayerById(val, VMap.map.map)
  }

  static restVisibleBaseTile (name, map) {
    return restVisibleBaseTile(map, name)
  }

  static addOverlay (option, target) {
    const overlays = target.getOverlays()
    if (overlays) {
      const existOverlays = []
      overlays.forEach(overlay => {
        if (overlay.getId() === option.id) {
          existOverlays.push(overlay)
        }
      })
      if (existOverlays.length > 0) {
        existOverlays.forEach(overlay => {
          if (overlay.getId() === option.id) {
            updateOverlay(overlay, option)
          }
        })
      } else {
        const overlay = addOverlay(option)
        target.addOverlay(overlay)
      }
    }
    return overlays
  }

  static getOverlays () {
    return VMap.map.map.getOverlays()
  }

  static getOverlaysById (id) {
    return VMap.map.map.getOverlayById(id)
  }

  static setOverlayPosition (option) {
    const overlays = VMap.map.map.getOverlays()
    overlays.forEach(overlay => {
      if (overlay.getId() === option.id) {
        return setOverlayPosition(overlay, option.position)
      }
    })
  }

  static setInteraction (value) {
    return setInteraction(VMap.map.map, value)
  }

  static removeInteraction (value) {
    removeInteraction(VMap.map.map, value)
  }

  static setMeasure (value) {
    return setMeasure(VMap.map.map, value)
  }

  static panTo (center, zoom) {
    return panTo(VMap.map.map, center, zoom)
  }

  static setFeature (option) {
    return setFeature(option, VMap.map.map)
  }

  static getCenterByExtent (extent) {
    return getCenter(extent)
  }

  static getDistancePoint (from, to, units) {
    return getDistancePoint(from, to, units)
  }

  static getDistanceString (lines, units) {
    return getDistanceString(lines, units)
  }

  constructor (option = {}) {
    // view
    const viewOption = Object.assign({
      center: [0, 0],
      zoom: 12,
      constrainResolution: true,
      projection: 'EPSG:4326'
    }, option.view)
    const view = new View(viewOption)

    // controls
    const controlsOption = Object.assign({ zoom: false, rotate: false }, option.controls)
    const controls = defaultControls(controlsOption).extend([])

    // tile
    const baseTiles = Object.assign(['td'], option.baseTile)
    let visibleTile
    if (validObjKey(option, 'visibleTile') && option.visibleTile) {
      visibleTile = option.visibleTile
    } else {
      visibleTile = baseTiles[0]
    }

    let target = 'map'
    if (validObjKey(option, 'target')) {
      target = option.target
    }
    // 生成地图
    this.map = new Map({
      target: target,
      view: view,
      controls: controls
    })

    // 鼠标悬浮
    this.map.on('pointermove', evt => {
      const pixel = this.map.getEventPixel(evt.originalEvent)
      const hit = this.map.hasFeatureAtPixel(pixel)
      this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
    })

    this.map.on('contextmenu', evt => {
      evt.preventDefault()
    })

    // 基础图层
    const tileLayer = baseTile(baseTiles, visibleTile)

    // 添加图层
    const vectorLayersOption = option.layers
    const vectorLayers = []
    if (vectorLayersOption && vectorLayersOption.length > 0) {
      vectorLayersOption.forEach(val => {
        vectorLayers.push(this.setVectorLayer(val, this.map))
      })
    }

    // 所有图层
    const layers = tileLayer.concat(vectorLayers)
    layers.forEach(layer => {
      this.map.addLayer(layer)
    })

    // 鹰眼
    if (option.overview) {
      const overviewLayer = baseTile(option.overview, option.overview)
      this.map.addControl(addOverviewMapControl(viewOption, overviewLayer))
    }

    // 编辑
    if (validObjKey(option, 'interaction') && option.interaction.length > 0) {
      this.setInteraction(this.map, option.interaction)
    }
  }

  getMap () {
    return VMap.map
  }

  addSource (features = [], map) {
    return new VectorSource({
      features: this.setFeatures(features, map)
    })
  }

  setFeature (option, map) {
    return setFeature(option, map)
  }

  setFeatures (features, map) {
    return setFeatures(features, map)
  }

  addLayer (option) {
    const layer = this.setVectorLayer(option)
    this.map.addLayer(layer)
  }

  setVectorLayer (option, map) {
    return setVectorLayer(option, map)
  }

  setInteraction (map, value) {
    setInteraction(map, value)
  }

  get getLayers () {
    return this.map.getLayers()
  }
}
