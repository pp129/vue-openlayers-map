import 'ol/ol.css'
import { Map, View } from 'ol'
import Overlay from 'ol/Overlay'
import { Tile as TileLayer, Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer'
import { Cluster, XYZ, Vector as VectorSource } from 'ol/source'
import Feature from 'ol/Feature'
import { Circle, LineString, Point, Polygon } from 'ol/geom'
import { Fill, Icon, Stroke, Style, Text, Circle as CircleStyle } from 'ol/style'
import { OverviewMap, defaults as defaultControls } from 'ol/control'
import { Draw, Modify, Select } from 'ol/interaction'
// import { defaults as defaultControls } from 'ol/control'

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
    default:
      return getTDMap(visible)
  }
}

/**
 * 天地图-矢量图
 * @param visible
 * @param XYZUrl
 * @returns {*[]}
 */
function getTDMap (visible, XYZUrl) {
  const urls = XYZUrl || [
    'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
    'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
  ]
  return getCustomerTileXYZ({
    url: urls,
    type: 'td',
    base: true
  }, visible)
}

/**
 * 天地图-影像图
 * @param visible
 * @param XYZUrl
 * @returns {*[]}
 */
function getTDImg (visible, XYZUrl) {
  const urls = XYZUrl || [
    'http://t4.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
    'http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
  ]
  return getCustomerTileXYZ({
    url: urls,
    type: 'td_img',
    base: true
  }, visible)
}

/**
 * 自定义xyz切片
 * @param option
 * @param visible
 * @returns {*[]}
 */
function getCustomerTileXYZ (option, visible) {
  const tiles = []
  option.url.forEach(val => {
    const layer = new TileLayer({
      visible: false,
      source: new XYZ({
        url: val
      })
    })
    let visibleTile = ''
    if (typeof visible === 'string') {
      visibleTile = visible
    } else if (typeof visible === 'object') {
      visibleTile = visible.type
    }
    if (option.type === visibleTile) {
      layer.setVisible(true)
    }
    layer.set('type', option.type || '')
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
 * @param name
 */
function restVisibleBaseTile (map, name) {
  const layers = map.getLayers()
  layers.forEach(layer => {
    if (layer.get('base') === true) {
      layer.setVisible(false)
      if (layer.get('type') === name) {
        layer.setVisible(true)
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
  const layer = setVectorLayer(option, map)
  map.addLayer(layer)
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
 * 设置矢量图层
 * @param option
 * @param map
 * @returns {VectorLayer<VectorSourceType>|Heatmap}
 */
function setVectorLayer (option, map) {
  if (validObjKey(option, 'type') && option.type === 'cluster') {
    // 聚合图层
    const layer = addClusterLayer(option)
    layer.set('id', option.id || '')
    layer.set('type', option.type)
    layer.set('users', true)
    return layer
  } else if (validObjKey(option, 'type') && option.type === 'heatmap') {
    // 热力图
    const layer = addHeatmapLayer(option)
    layer.set('id', option.id || '')
    layer.set('type', option.type)
    layer.set('users', true)
    return layer
  } else {
    // 元素图层
    const source = addVectorSource(option.features || [], map)
    const layerOptions = Object.assign({
      source: source,
      visible: true
    }, option)
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
    layer.set('users', true)
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
  if (validObjKey(option, 'element')) {
    option.element = document.getElementById(option.element.toString())
    const overlayOption = Object.assign({
      position: undefined
    }, option)
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
        return setPointFeature(option)
      case 'polygon':
        return setPolygon(option)
      case 'polyline':
        return setPolyline(option)
      case 'circle':
        return setCircle(option, map)
      default:
        return setPointFeature(option)
    }
  } else {
    return setPointFeature(option)
  }
}

/**
 * 获取点类型元素
 * @param option
 * @returns {FeatureExt}
 */
function setPointFeature (option) {
  const feature = new FeatureExt({
    geometry: new Point(option.coordinates)
  })
  // newFeaturePrototype(feature)
  const featureStyle = new Style({})
  if (validObjKey(option, 'style')) {
    const optionStyle = option.style
    if (validObjKey(optionStyle, 'icon')) {
      const imageStyle = new Icon(optionStyle.icon)
      featureStyle.setImage(imageStyle)
    }
    if (validObjKey(optionStyle, 'text')) {
      const optionText = optionStyle.text
      const textStyle = setText(optionText)
      featureStyle.setText(textStyle)
    }
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
  }
  if (validObjKey(option, 'stroke')) {
    style.setStroke(new Stroke(option.stroke))
  }
  if (validObjKey(option, 'icon')) {
    style.setImage(new Icon(option.icon))
  }
  return style
}

/**
 * 添加矢量图层来源
 * @param features
 * @param map
 * @returns {VectorSource<Geometry>}
 */
function addVectorSource (features, map) {
  return new VectorSource({
    features: setFeatures(features, map)
  })
}

function addDrawLayer (id = 'draw', map, style) {
  removeLayerById(id, map)
  const layer = setVectorLayer({ id: id, type: 'draw' }, map)
  if (style) {
    layer.setStyle(setStyle(style))
  }
  console.log(layer)
  map.addLayer(layer)
}

function getSourceByLayerId (id = 'draw', map) {
  const layer = getLayerById(id, map)
  return layer.getSource()
}

/**
 * 添加聚合图层
 * @param option
 * @returns {VectorLayer<VectorSourceType>}
 */
function addClusterLayer (option) {
  const options = Object.assign({}, option.cluster)
  const clusterSource = new Cluster(options)
  const source = addVectorSource(option.features)
  clusterSource.setSource(source)
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
 * @returns {Heatmap}
 */
function addHeatmapLayer (option) {
  const options = Object.assign({}, option)
  const vector = new HeatmapLayer(options)
  const source = addVectorSource(option.features)
  vector.setSource(source)
  vector.set('id', options.id)
  return vector
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
  if (value && value.length > 0) {
    value.forEach(item => {
      if (item.type === 'draw') {
        addDrawLayer(item.layer, map, item.style)
        draw = new Draw({
          source: getSourceByLayerId(item.layer, map),
          type: item.value,
          freehand: item.freehand
        })
        draw.set('type', 'draw')
        map.addInteraction(draw)
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
  }
}

export class VMap {
  static map = VMap

  static setLayer (val) {
    return setLayer(val, VMap.map.map)
  }

  static removeLayer (val) {
    return removeLayer(val, VMap.map.map)
  }

  static restVisibleBaseTile (name) {
    return restVisibleBaseTile(VMap.map.map, name)
  }

  static addOverlay (option) {
    const overlays = VMap.map.map.getOverlays()
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
            setOverlayPosition(overlay, option.position)
          }
        })
      } else {
        return addOverlay(option)
      }
    }
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

  static panTo (center, zoom) {
    return panTo(VMap.map.map, center, zoom)
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

    // 生成地图
    this.map = new Map({
      target: option.target || 'map',
      view: view,
      controls: controls
    })

    // 移动动画
    if (validObjKey(viewOption, 'animate')) {
      const animate = Object.assign({
        center: [0, 0], // 中心点
        zoom: 12, // 级别
        resolution: undefined, // zoom设置了，这个被忽略
        rotation: undefined, // 缩放完成view视图旋转弧度
        anchor: undefined, // 在旋转或分辨率动画期间保持固定的可选锚点 不需要设置，
        duration: 1000 // 缩放持续时间，默认不需要设置
      }, viewOption.animate)
      view.animate(animate)
    }

    // 鼠标悬浮
    this.map.on('pointermove', evt => {
      const pixel = this.map.getEventPixel(evt.originalEvent)
      const hit = this.map.hasFeatureAtPixel(pixel)
      this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
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

    // 弹框
    const overlays = option.overlays
    if (overlays && overlays.length > 0) {
      overlays.forEach(overlay => {
        const item = addOverlay(overlay)
        if (item) {
          this.map.addOverlay(item)
        }
      })
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
