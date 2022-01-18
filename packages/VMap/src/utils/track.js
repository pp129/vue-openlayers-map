import LineString from 'ol/geom/LineString'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Stroke, Style, Circle as CircleStyle, Fill } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector } from 'ol/source'
import Overlay from 'ol/Overlay'

export const setLayer = function (routeCoords, routeFeature, geoMarker, startMarker, endMarker) {
  // 将离散点构建成一条折线
  return new VectorLayer({
    source: new Vector({
      features: [routeFeature, geoMarker, startMarker, endMarker]
    })
  })
}

let timerFlag = false
let animating = false
let elapsedTime = 0

// 要素移动
const moveFeature = function (vectorLayer, routeLength, routeCoords, startMarker, endMarker, geoMarker, styles, geoRotation, speed, map) {
  if (!vectorLayer.getVisible()) {
    vectorLayer.setVisible(true)
  }

  elapsedTime++ // elapsedTime 已过时间

  // 通过增加速度，来获得lineString坐标
  console.log('speed: ', speed)
  const index = Math.round(speed * elapsedTime / 60)

  if (index >= routeLength) {
    clearInterval(timer)
    return
  }

  let x, y, rotation
  console.log('index: ', index)
  if (routeCoords[index] && routeCoords[index + 1]) {
    // x = routeCoords[index][0] - routeCoords[index + 1][0]
    // y = routeCoords[index][1] - routeCoords[index + 1][1]
    if (routeCoords[index][0] > routeCoords[index + 1][0]) {
      x = routeCoords[index][0] - routeCoords[index + 1][0]
    } else {
      x = routeCoords[index + 1][0] - routeCoords[index][0]
    }
    if (routeCoords[index][1] > routeCoords[index + 1][1]) {
      y = routeCoords[index][1] - routeCoords[index + 1][1]
    } else {
      y = routeCoords[index + 1][1] - routeCoords[index][1]
    }
    rotation = Math.atan2(y, x)
  } else {
    rotation = 0
  }
  // const styleOption = Object.assign({}, styles.geoMarker, {
  //   rotateWithView: false,
  //   rotation: Math.atan2(1, 0) - rotation
  // })
  console.log(styles.geoMarker)
  const carStyleMove = styles.geoMarker
  console.log(Math.atan2(1, 0) - rotation)
  carStyleMove.getImage().setRotation(Math.atan2(1, 0) - rotation)
  const line = new Feature({
    geometry: new LineString(routeCoords.slice(0, index + 1))
  })
  const lineStyle = new Style({
    stroke: new Stroke({
      width: 6,
      color: 'rgba(237, 212, 0, 1)'
    })
  })
  line.setStyle(lineStyle)
  const line1 = new Feature({
    geometry: new LineString(routeCoords.slice(index))
  })
  const lineStyle1 = new Style({
    stroke: new Stroke({
      width: 6,
      color: 'rgba(0, 212, 0, 1)'
    })
  })
  line1.setStyle(lineStyle1)
  const currentPoint = new Point(routeCoords[index])
  // 添加矢量元素
  const feature = new Feature(currentPoint)
  vectorLayer.getSource().clear()
  feature.setStyle(carStyleMove)

  // vectorLayer.getSource().addFeature(routeFeature)
  vectorLayer.getSource().addFeature(startMarker)
  vectorLayer.getSource().addFeature(endMarker)
  vectorLayer.getSource().addFeature(feature)
  vectorLayer.getSource().addFeature(line)
  vectorLayer.getSource().addFeature(line1)

  // content.textContent = gpsPoints[index].gpsTime
  popup.setPosition(routeCoords[index])
  // 继续动画效果
  map.render()
}

let timer

function startAnimation (vectorLayer, routeLength, routeCoords, startMarker, endMarker, geoMarker, styles, geoRotation, speed, map) {
  animating = true
  // 隐藏geoMarker
  geoMarker.changed()
  // map.getView().setCenter([113.88170241890477, 34.49780059604906])
  // 添加事件，地图渲染时触发
  if (timer) {
    clearInterval(timer)
  }
  timer = setInterval(() => {
    moveFeature(vectorLayer, routeLength, routeCoords, startMarker, endMarker, geoMarker, styles, geoRotation, speed, map)
  }, 60)
  elapsedTime = 0
}

/**
 * @param vectorLayer
 * @param routeFeature
 * @param startMarker
 * @param endMarker
 */
function stopAnimation (vectorLayer, routeFeature, startMarker, endMarker) {
  clearInterval(timer)
  popup.setPosition(undefined) // 未定义popup位置
  vectorLayer.getSource().clear()
  vectorLayer.getSource().addFeature(routeFeature)
  vectorLayer.getSource().addFeature(startMarker)
  vectorLayer.getSource().addFeature(endMarker)
}

function pauseAnimation () {
  clearInterval(timer)
  timerFlag = true
}

function continueAnimation (vectorLayer, routeLength, routeCoords, startMarker, endMarker, geoMarker, speed) {
  if (timerFlag) {
    // map.getView().setCenter(Coordinates[0])
    // 添加事件，地图渲染时触发
    timer = setInterval(() => {
      moveFeature(vectorLayer, routeLength, routeCoords, startMarker, endMarker, geoMarker, speed)
    }, 60)
  }
  timerFlag = false
}

/**
 * 实现popup的html元素
 */
const container = document.getElementById('popup')
// const content = document.getElementById('popup-content')

/**
 * 在地图容器中创建一个Overlay
 */
const popup = new Overlay({
  element: container,
  autoPan: true,
  positioning: 'bottom-center',
  stopEvent: false,
  autoPanAnimation: {
    duration: 250
  }
})
// map.addOverlay(popup)

export default {
  map: null,
  vectorLayer: null,
  speed: null,
  route: null,
  routeCoords: null,
  routeLength: null,
  // 轨迹线
  routeFeature: null,
  // 移动点
  geoMarker: null,
  // 起点
  startMarker: null,
  // 终点
  endMarker: null,
  styles: null,
  geoRotation: 0,
  init: function (option) {
    let routes = []
    if (option && Object.prototype.hasOwnProperty.call(option, 'routes') && Object.keys(option).length > 0) {
      routes = option.routes
    }
    if (routes.length >= 2) {
      this.route = new LineString(routes)
      this.routeCoords = this.route.getCoordinates()
      this.routeLength = this.routeCoords.length
      this.routeFeature = new Feature({
        type: 'route',
        geometry: this.route
      })
      this.geoMarker = new Feature({
        type: 'geoMarker',
        geometry: new Point(this.routeCoords[0])
      })
      this.startMarker = new Feature({
        type: 'start',
        geometry: new Point(this.routeCoords[0])
      })
      this.endMarker = new Feature({
        type: 'end',
        geometry: new Point(this.routeCoords[this.routeLength - 1])
      })
      this.vectorLayer = setLayer(this.routeCoords, this.routeFeature, this.geoMarker, this.startMarker, this.endMarker)
      this.geoRotation = option.geoMarker.icon.rotation
      this.vectorLayer.setStyle((feature) => {
        const geoStyle = Object.assign({}, option.geoMarker.icon, {
          rotateWithView: false,
          rotation: -Math.atan2(this.routeCoords[0][1] - this.routeCoords[1][1], this.routeCoords[0][
            0
          ] - this.routeCoords[1][0])
        })
        this.styles = {
          route: new Style({
            // 轨迹线
            stroke: new Stroke({
              width: 6,
              color: 'rgba(0, 212, 0, 1)'
            })
          }),
          icon: new Style({
            // 默认icon样式
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: 'red' }),
              stroke: new Stroke({
                color: 'white',
                width: 2
              })
            })
          }),
          start: new Style({
            // 设置开始标记样式
            image: new Icon(option.start.icon)
          }),
          end: new Style({
            // 设置结束标记样式
            image: new Icon(option.end.icon)
          }),
          geoMarker: new Style({
            image: new Icon(geoStyle)
          })
        }
        if (animating && feature.get('type') === 'geoMarker') {
          return null
        }
        return this.styles[feature.get('type')]
      })
      this.map = option.map
      option.map.addLayer(this.vectorLayer)
    }
  },
  start: function (speed = 45) {
    startAnimation(this.vectorLayer, this.routeLength, this.routeCoords, this.startMarker, this.endMarker, this.geoMarker, this.styles, this.geoRotation, speed, this.map)
  },
  pause: pauseAnimation,
  continue: function (speed) {
    continueAnimation(this.vectorLayer, this.routeLength, this.routeCoords, this.startMarker, this.endMarker, this.geoMarker, speed, this.map)
  },
  stop: function () {
    stopAnimation(this.vectorLayer, this.routeFeature, this.startMarker, this.endMarker)
  }
}
