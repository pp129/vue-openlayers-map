import 'ol/ol.css'
import { Map, View } from 'ol'
import { Circle, LineString, Point, Polygon } from 'ol/geom'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style'
import { Vector as VectorSource, XYZ, Cluster, OSM, TileWMS } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer, Heatmap, WebGLPoints } from 'ol/layer'
import { defaults as defaultControls, OverviewMap } from 'ol/control'
import Feature from 'ol/Feature'
import TileGrid from 'ol/tilegrid/TileGrid'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import { containsExtent, getCenter, containsCoordinate, applyTransform } from 'ol/extent'
import ImageLayer from 'ol/layer/Image'
import { toContext } from 'ol/render'
import { Draw, Modify, Select, defaults as defaultInteraction } from 'ol/interaction'
import { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import Overlay from 'ol/Overlay'
import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj'
import { distance, length, lineString, point } from '@turf/turf'
import coordtransform from '~/VMap/src/utils/coordtransform'
import projzh from '~/VMap/src/utils/projConvert'
import { getCenterByCity } from '~/utils/cityMap'

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
    function (e) {
      return i(e, t)
    },
    a, n)
}
Map.prototype.forEachSmFeatureAtPixel = function (t, r, s, i) {
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
  return this.forEachFeatureAtPixel(t, r, s)
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

Map.prototype.getLayerById = function (id) {
  const layers = this.getLayers().getArray()
  return layers.find(x => (x.get('id') === id))
}

const getGraphicsInExtent = function (source, e) {
  const t = []
  return e ? (source.get('graphics').map(function (r) {
    console.log(r)
    // eslint-disable-next-line no-sequences
    return containsExtent(e, r.getGeometry().getExtent()) && t.push(r), r
  }), t) : (source.get('graphics').map(function (e) {
    // eslint-disable-next-line no-sequences
    return t.push(e), e
  }), t)
}
ImageCanvasSource.prototype._forEachFeatureAtCoordinate = function (e, r, s, i, a) {
  const n = getGraphicsInExtent(this)
  for (let o = n.length - 1; o >= 0; o--) {
    const l = n[o]._style
    if (!l) return
    const h = n[o]._coordinates
    const u = l.getImage()
    let c = !1

    const _t = []
    // eslint-disable-next-line no-unused-expressions,no-sequences
    // console.log(u)
    if (u.getAnchor()) {
      _t[0] = h[0] - u.getAnchor()[0] * r
      _t[2] = h[0] + u.getAnchor()[0] * r
      _t[1] = h[1] - u.getAnchor()[1] * r
      _t[3] = h[1] + u.getAnchor()[1] * r
    }
    containsCoordinate(_t, e) && (c = !0)
    // eslint-disable-next-line no-unused-expressions
    !0 !== c ? _t.isHighLight && _t._highLightClose() : (_t.isHighLight && _t._highLight(h, u, n[o], i), s && s(n[o], a))
  }
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

  getPosition = function () {
    return this.getGeometry().getCoordinates()
  }

  setRotateAngle = function (angle) {
    this.getStyle().getImage().setRotation(angle)
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

export function vectorLayer (option) {
  return new VectorLayer(option)
}

export function imageCanvasSource (option) {
  return new ImageCanvasSource(option)
}

export function imageLayer (option) {
  return new ImageLayer(option)
}

export function olToContext (canvas, size) {
  return toContext(canvas, size)
}

export function olPoint (option) {
  return new Point(option)
}

export function olLineString (option) {
  return new LineString(option)
}

export function olPolygon (option) {
  return new Polygon(option)
}

export function olCluster (option) {
  return new Cluster(option)
}

export function HeatmapLayer (option) {
  return new Heatmap(option)
}

export function olTileLayer (option) {
  return new TileLayer(option)
}

export function olTileGrid (option) {
  return new TileGrid(option)
}

export function olXYZ (option) {
  return new XYZ(option)
}

export function WMS (option) {
  return new TileWMS(option)
}

export function olOSM (option) {
  return new OSM(option)
}

export function WebGLPointsLayer (option) {
  return new WebGLPoints(option)
}

export function olView (option) {
  return new View(option)
}

export function olDraw (option) {
  return new Draw(option)
}

export function olCreateBox () {
  return createBox()
}

export function olCreateRegularPolygon (sides, angle) {
  return createRegularPolygon(sides, angle)
}

export function olSelect (option) {
  return new Select(option)
}

export function olModify (option) {
  return new Modify(option)
}

export function olOverlay (option) {
  return new Overlay(option)
}

export function olVectorSource (option) {
  return new VectorSource(option)
}

// 注册百度坐标系
const baiduMercatorProj = new Projection({
  code: 'baidu',
  // extent: applyTransform(extent, projzh.ll2bmerc),
  units: 'm'
})
addProjection(baiduMercatorProj)
addCoordinateTransforms('EPSG:4326', baiduMercatorProj, projzh.ll2bmerc, projzh.bmerc2ll)
addCoordinateTransforms('EPSG:3857', baiduMercatorProj, projzh.smerc2bmerc, projzh.bmerc2smerc)
// 注册高德坐标系
const AMapMercatorProj = new Projection({
  code: 'GCJ02',
  extent: applyTransform([-180, -90, 180, 90], projzh.ll2gcj02mc),
  units: 'm'
})
addProjection(AMapMercatorProj)
addCoordinateTransforms('EPSG:4326', AMapMercatorProj, projzh.ll2gcj02mc, projzh.gcj02mc2ll)
addCoordinateTransforms('EPSG:3857', AMapMercatorProj, projzh.mc2gcj02mc, projzh.gcj02mc2mc)

export const uuid = () => {
  const tempUrl = URL.createObjectURL(new Blob())
  const uuid = tempUrl.toString() // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(tempUrl)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}

export const validObjKey = (obj, key) => {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key] && (Object.keys(obj[key]).length > 0 || typeof obj[key] === 'function')
  } else {
    return false
  }
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
 * 设置多元素
 * @param features
 * @param map
 * @param hasStyle
 * @returns {*[]}
 */
export function setFeatures (features, map, hasStyle = false) {
  const output = []
  features.forEach(val => {
    output.push(setFeature(val, map, hasStyle))
  })
  return output
}

/**
 * 设置元素
 * @param option
 * @param map
 * @param hasStyle
 * @returns {FeatureExt}
 */
function setFeature (option, map, hasStyle = false) {
  if (validObjKey(option, 'type')) {
    const type = option.type
    switch (type) {
      case 'point':
        return setPointFeature(option, map, hasStyle)
      case 'polygon':
        return setPolygon(option)
      case 'polyline':
        return setPolyline(option)
      case 'circle':
        return setCircle(option, map)
      default:
        return setPointFeature(option, map, hasStyle)
    }
  } else {
    return setPointFeature(option, map, hasStyle)
  }
}

/**
 * 获取点类型元素
 * @param option
 * @param map
 * @param hasStyle
 * @returns {FeatureExt}
 */
export function setPointFeature (option, map, hasStyle = false) {
  let coordinates
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
  // newFeaturePrototype(feature)
  if (validObjKey(option, 'style')) {
    const featureStyle = setStyle(option.style)
    feature.setStyle(featureStyle)
    if (validObjKey(option.style, 'styleFunction')) {
      feature.setStyle(function (feature, resolution) {
        return option.style.styleFunction(feature, resolution, map, featureStyle)
      })
    } else {
      feature.setStyle(featureStyle)
    }
  } else if (!hasStyle) {
    feature.setStyle(new Style({
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({
          color: 'blue'
        })
      })
    }))
  }
  if (validObjKey(option, 'id')) {
    feature.setId(option.id)
  } else {
    feature.setId(`feature-${uuid()}`)
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
export function setCircle (option, map) {
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
export function setPolyline (option) {
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
 */
export function setStyle (option) {
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
  if (validObjKey(option, 'circle')) {
    const circle = setCircleStyle(option.circle)
    style.setImage(circle)
  }
  if (validObjKey(option, 'text')) {
    const optionText = option.text
    const textStyle = setText(optionText)
    style.setText(textStyle)
  }
  return style
}

export function setImage (option) {
  return new Promise(resolve => {
    const image = new Image()
    image.src = option.src
    image.onload = () => {
      return resolve(new Style({
        image: new Icon({
          img: image,
          imgSize: [34, 37]
        })
      }))
    }
  })
}

function setCircleStyle (option) {
  let radius = 2
  if (validObjKey(option, 'radius')) {
    radius = option.radius
  }
  const optionCircle = {
    radius: radius
  }
  if (validObjKey(option, 'fill')) {
    optionCircle.fill = new Fill(option.fill)
  } else {
    optionCircle.fill = new Fill({ color: 'blue' })
  }
  if (validObjKey(option, 'stroke')) {
    optionCircle.stroke = new Stroke(option.stroke)
  }
  return new CircleStyle(optionCircle)
}

/**
 * 设置文本样式
 * @param option
 * @returns {Text}
 */
function setText (option) {
  const defaultParam = {
    font: '14px sans-serif',
    padding: [2, 5, 2, 5] // [top, right, bottom, left].
  }
  const defaultOption = { ...defaultParam, ...option }
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
 * 添加矢量图层来源
 * @param option
 * @param map
 * @returns {VectorSource<Geometry>}
 */
export function addVectorSource (option, map) {
  let features = []
  if (validObjKey(option, 'features')) {
    features = option.features
  }
  const source = { ...option, ...{ features: setFeatures(features, map) } }
  return new VectorSource(source)
}

/**
 * 添加聚合图层
 * @param option
 * @param map
 * @returns {VectorLayer<VectorSourceType>}
 */
export function addClusterLayer (option, map) {
  const clusterSource = option.source
  console.log(clusterSource)
  const styleCache = {}
  const clusterOptions = {
    source: clusterSource,
    style: function (feature) {
      const size = feature.get('features').length
      let style = styleCache[size]
      if (size > 1) {
        if (!style) {
          let styleOptions = {}
          if (!validObjKey(option, 'style') || !option.style) {
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
            option.style.forEach(e => {
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
                const total = option.source.getFeatures()
                if (total > 0) {
                  const average = total / option.style.length
                  for (let i = 0; i < option.style.length; i++) {
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
  }
  return new VectorLayer(clusterOptions)
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
 * 添加鹰眼
 * @param option
 * @returns {OverviewMap}
 */
export function addOverviewMapControl (option) {
  return new OverviewMap(option)
}

/**
 * 百度地图
 * @returns {TileLayer<TileSourceType>[]}
 * @param xyz
 * @param tileLayer
 */
export function getBDMap (xyz, tileLayer) {
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
}

export function getAMap (xyz, tileLayer) {
  const xyzOpt = {
    ...xyz,
    ...{
      url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7',
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
}

/**
 * 自定义xyz切片
 * @param option
 * @param visible
 * @returns {*[]}
 */
export function getCustomerTileXYZ (option, visible) {
  const tiles = []
  option.option.forEach(val => {
    let tileGrid
    if (validObjKey(val, 'tileGrid')) {
      tileGrid = new TileGrid(val.tileGrid)
    }
    const xyzOpt = { ...val, ...{ tileGrid: tileGrid } }
    const layer = new TileLayer({
      visible: false,
      source: new XYZ(xyzOpt)
    })
    let visibleTile = ''
    if (typeof visible === 'string') {
      visibleTile = visible
    } else if (typeof visible === 'object') {
      if (visible instanceof Array) {
        visibleTile = visible[0]
      } else {
        visibleTile = visible.name
      }
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
 * 删除图层
 * @param layer
 * @param map
 */
function removeLayer (layer, map) {
  map.removeLayer(layer)
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
 * 地图移动动画
 * @param map
 * @param center
 * @param zoom
 */
function panTo (map, center, zoom) {
  map.getView().animate({ center: center }, { zoom: zoom })
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
 * 地图导出png
 * @param map 地图对象
 * @param downLoadId 下载标签
 */
function exportPNG (map, downLoadId) {
  map.once('rendercomplete', function () {
    const mapCanvas = document.createElement('canvas')
    const size = map.getSize()
    mapCanvas.width = size[0]
    mapCanvas.height = size[1]
    const mapContext = mapCanvas.getContext('2d')
    Array.prototype.forEach.call(
      map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity =
            canvas.parentNode.style.opacity || canvas.style.opacity
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)

          const backgroundColor = canvas.parentNode.style.backgroundColor
          if (backgroundColor) {
            mapContext.fillStyle = backgroundColor
            mapContext.fillRect(0, 0, canvas.width, canvas.height)
          }

          let matrix
          const transform = canvas.style.transform
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              // eslint-disable-next-line no-useless-escape
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number)
          } else {
            matrix = [
              parseFloat(canvas.style.width) / canvas.width,
              0,
              0,
              parseFloat(canvas.style.height) / canvas.height,
              0,
              0
            ]
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          )
          mapContext.drawImage(canvas, 0, 0)
        }
      }
    )
    mapContext.globalAlpha = 1
    if (navigator.msSaveBlob) {
      // link download attribute does not work on MS browsers
      navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png')
    } else {
      const link = document.getElementById(downLoadId)
      link.href = mapCanvas.toDataURL()
      link.click()
    }
  })
  map.renderSync()
}

export class VMap {
  static map = VMap

  static removeLayer (val) {
    return removeLayer(val, VMap.map.map)
  }

  static removeLayerById (val) {
    return removeLayerById(val, VMap.map.map)
  }

  static getOverlays () {
    return VMap.map.map.getOverlays()
  }

  static getOverlaysById (id) {
    return VMap.map.map.getOverlayById(id)
  }

  static panTo (center, zoom) {
    return panTo(VMap.map.map, center, zoom)
  }

  static setFeature (option) {
    return setFeature(option, VMap.map.map)
  }

  static setFeatures (option) {
    return setFeatures(option, VMap.map.map)
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

  static exportPNG (downLoadId) {
    return exportPNG(VMap.map.map, downLoadId)
  }

  constructor (option = {}) {
    // view
    const viewOptDefault = {
      center: [108.552500, 34.322700],
      zoom: 5,
      constrainResolution: true,
      projection: 'EPSG:4326'
    }
    const viewOption = { ...viewOptDefault, ...option.view }
    if (validObjKey(viewOption, 'city') && viewOption.city) {
      viewOption.center = getCenterByCity(viewOption.city) || viewOption.center || viewOptDefault.center
    }
    const view = new View(viewOption)

    // controls
    const controlsDefault = {
      zoom: false,
      rotate: false,
      attribution: false
    }
    const controlsOption = { ...controlsDefault, ...option.controls }
    const controls = defaultControls(controlsOption).extend([])

    // 生成地图
    this.map = new Map({
      target: option.target,
      view: view,
      controls: controls,
      interactions: defaultInteraction(option.interactions)
    })
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

  get getLayers () {
    return this.map.getLayers()
  }
}
