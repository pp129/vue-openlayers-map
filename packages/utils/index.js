import 'ol/ol.css'
import { Map, View } from 'ol'
import { Circle, LineString, Point, Polygon } from 'ol/geom'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style'
import { Vector as VectorSource, XYZ, Cluster, OSM } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer, Heatmap, WebGLPoints } from 'ol/layer'
import { defaults as defaultControls, OverviewMap } from 'ol/control'
import Feature from 'ol/Feature'
import TileGrid from 'ol/tilegrid/TileGrid'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import { containsExtent, getCenter, containsCoordinate } from 'ol/extent'
import ImageLayer from 'ol/layer/Image'
import { toContext } from 'ol/render'
import { Draw, Modify, Select } from 'ol/interaction'
import Overlay from 'ol/Overlay'
import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj'
import { distance, length, lineString, point } from '@turf/turf'
import coordtransform from '~/VMap/src/utils/coordtransform'
import projzh from '~/VMap/src/utils/projConvert'

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

const baiduMercatorProj = new Projection({
  code: 'baidu',
  // extent: applyTransform(extent, projzh.ll2bmerc),
  units: 'm'
})

addProjection(baiduMercatorProj)
addCoordinateTransforms('EPSG:4326', baiduMercatorProj, projzh.ll2bmerc, projzh.bmerc2ll)
addCoordinateTransforms('EPSG:3857', baiduMercatorProj, projzh.smerc2bmerc, projzh.bmerc2smerc)

export const uuid = () => {
  const tempUrl = URL.createObjectURL(new Blob())
  const uuid = tempUrl.toString() // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
  URL.revokeObjectURL(tempUrl)
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}

export const validObjKey = (obj, key) => {
  return obj && Object.prototype.hasOwnProperty.call(obj, key) && Object.keys(obj).length > 0
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
 * @returns {Style}
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
 * 设置地图基础切片图层
 * @param option
 * @param visible
 * @returns {*[]}
 */
export function baseTile (option, visible) {
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

/**
 * 百度地图
 * @param option
 * @param visible
 * @returns {TileLayer<TileSourceType>[]}
 */
export function getBDMap (option, visible) {
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
 * 更新弹框位置
 * @param overlay
 * @param position
 */
function setOverlayPosition (overlay, position) {
  overlay.setPosition(position)
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

  static setOverlayPosition (option) {
    const overlays = VMap.map.map.getOverlays()
    overlays.forEach(overlay => {
      if (overlay.getId() === option.id) {
        return setOverlayPosition(overlay, option.position)
      }
    })
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

  constructor (option = {}) {
    // view
    const viewOptDefault = {
      constrainResolution: true,
      projection: 'EPSG:4326'
    }
    const viewOption = { ...viewOptDefault, ...option.view }
    const view = new View(viewOption)

    // controls
    const controls = defaultControls(option.controls).extend([])

    // 生成地图
    this.map = new Map({
      target: option.target,
      view: view,
      controls: controls
    })

    this.map.on('contextmenu', evt => {
      evt.preventDefault()
    })

    // 基础图层
    const tileLayer = baseTile('td', 'td')

    tileLayer.forEach(layer => {
      this.map.addLayer(layer)
    })

    // 鼠标悬浮
    this.map.on('pointermove', evt => {
      const pixel = this.map.getEventPixel(evt.originalEvent)
      const hit = this.map.hasFeatureAtPixel(pixel)
      // this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
      this.map.getLayers().getArray().forEach(layer => {
        if (layer.get('users')) {
          const data = layer.getData(evt.pixel)
          const hitImage = data && data[3] > 0 // transparent pixels have zero for data[3]
          this.map.getTargetElement().style.cursor = hitImage || hit ? 'pointer' : ''
        }
      })
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
