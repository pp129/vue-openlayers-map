import coordtransform from '~/VMap/src/utils/coordtransform'
import { Circle, LineString, Point, Polygon } from 'ol/geom'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style'
import { FeatureExt } from '~/VMap/src/VMap'
import { Vector as VectorSource, XYZ } from 'ol/source'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OverviewMap } from 'ol/control'
// import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj'
// import projzh from '~/VMap/src/utils/projConvert'
import TileGrid from 'ol/tilegrid/TileGrid'

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
 * 设置多元素
 * @param features
 * @param map
 * @returns {*[]}
 */
export function setFeatures (features, map) {
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
export function setPointFeature (option, map) {
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
  } else {
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
