import { fromLonLat, toLonLat } from 'ol/proj'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from 'ol/style'
import { containsCoordinate } from 'ol/extent'
import * as olSphere from 'ol/sphere'
import { uuid, olOverlay, FeatureExt, vectorLayer, olVectorSource, olPolygon, olLineString, olPoint } from '~/utils'

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

// 轨迹回放初始化对象 lushuTrack
export class LushuTrack {
  static track = LushuTrack
  constructor (map, path, vacuatePath, vacuate, tracePointsModePlay, labelShow, labelStyle, showTracePoint, opts) {
    if (!path || path.length < 1) {
      return
    }
    this.id = opts.id
    this.changeCarRotate = opts.changeCarRotate
    this.centerAtCar = opts.centerAtCar
    // 小车是否正在移动，控制“move”事件
    this._moving = true
    // 是否移动
    this._ismove = false
    // 地图对象
    this._map = map
    // 轨迹点是否显示时间标签
    this._labelShow = labelShow
    // 轨迹点时间标签的样式
    this._timeContentClass = labelStyle
    // 是否轨迹抽稀
    this._vacuate = vacuate
    // 轨迹点集合
    this._wholePathInfo = path
    // 轨迹点时间弹窗
    this._timeOverlayList = []
    if (vacuate) {
      this._pathInfo = vacuatePath
      this._convertPaths(vacuatePath)
    } else {
      this._pathInfo = path
      this._convertPaths(path)
    }
    // 轨迹点抽稀后结果
    this._vacuatePath = vacuatePath
    this._path = []
    // 通过路径数组20190812
    this._passPath = []
    // 距离轨迹点的距离，单位米
    this._pointIndexDistance = 20
    // 全部轨迹点集合
    this._tracePoints = []
    // 轨迹回放模式--跳转模式和轨迹点时间模式
    this._tracePointsModePlay = tracePointsModePlay
    // 轨迹点时间弹窗
    this._traceTimedivDom = map.traceTimedivDom
    // 轨迹点集合--分段
    this._tracePointsFromTime = []
    // 轨迹回放是否结束
    this._traceEnd = false
    this.traceLayer = vectorLayer({
      source: olVectorSource(),
      zIndex: 99
    })
    this.traceLayer.set('isTrack', true)
    map.addLayer(this.traceLayer)
    // 通过动画轨迹线
    this.tracePassLayer = vectorLayer({
      source: olVectorSource(),
      zIndex: 100
    })
    this.tracePassLayer.set('isTrack', true)
    map.addLayer(this.tracePassLayer)
    // 方向箭头图层
    this.arrowsLayer = vectorLayer({
      source: olVectorSource(),
      zIndex: 101
    })
    this.arrowsLayer.set('isTrack', true)
    map.addLayer(this.arrowsLayer)
    // 小车图层
    this.carLayer = vectorLayer({
      source: olVectorSource(),
      zIndex: 102
    })
    this.carLayer.set('isTrack', true)
    map.addLayer(this.carLayer)
    // 轨迹点要素集合
    this.traceNodes = []
    // 轨迹线要素
    this.traceLineList = []
    // 小车
    this.carMarker = null
    // 小车弹窗
    this._carInfoWin = null
    // 小车所处轨迹线哪条线段
    this._pointIndex = 0
    // 小车处于该条线段的哪个点
    this._traceIndex = 0
    // 倍速
    this._speedUp = 1
    // 小车移动的定时器
    this._intervalTraceFlag = null
    // 显示小车当前时间的定时器
    this._intervalTimeFlag = null
    this._opts = {
      carIcon: {
        src: '',
        scale: 1
      },
      speed: 0, // 回放的速度
      defaultContent: '',
      startIcon: {
        src: '',
        scale: 1
      },
      endIcon: {
        src: '',
        scale: 1
      },
      passFlag: true,
      showInfoWin: false, // 显示信息窗体
      arrowPixel: 50, // 方向箭头之间的像素距离，单位像素
      tracePlay: false // 是否轨迹回放
    }
    this._setOptions(opts)
    // 标识是否重新初始化轨迹线和轨迹点，1表示重新初始化，2表示无
    this._initFlag = 1
    // 是否显示轨迹点
    this._showTracePoint = showTracePoint
  }
}

// 设置轨迹相关参数
LushuTrack.prototype._setOptions = function (opts) {
  if (!opts) {
    return
  }
  for (const p in opts) {
    if (Object.prototype.hasOwnProperty.call(opts, p)) {
      this._opts[p] = opts[p]
    }
  }
}

// 获取当前速度
LushuTrack.prototype.getSpeed = function () {
  return this._opts.speed
}

// 获取当前倍速
LushuTrack.prototype.getSpeedUp = function () {
  return this._speedUp
}

// 获取轨迹点
LushuTrack.prototype.getPaths = function () {
  return this._pathInfo
}

LushuTrack.prototype.getTraceIndex = function () {
  return this._pointIndex
}

LushuTrack.prototype.setTraceIndex = function (index) {
  this._pointIndex = index
  const coor = this._path[index]
  this.carMarker.setPosition(coor)
}

// 获取小车当前进度，为百分比
LushuTrack.prototype.getPercentnum = function () {
  const allPoints = this._tracePoints
  const thisPosition = this.carMarker.getPosition()
  for (let p = 0; p < allPoints.length; p++) {
    if (thisPosition.toString() === allPoints[p].coordinate.toString()) {
      return parseFloat((p / allPoints.length).toFixed(2))
    }
  }
}

// 设置小车当前进度，参数为百分比
LushuTrack.prototype.setPercentnum = function (per) {
  const allPoints = this._tracePoints
  const tracePointsPhased = this._tracePointsFromTime
  const thisPositionIndex = Math.round(allPoints.length * per)
  const thisPosition = allPoints[thisPositionIndex].coordinate
  this.carMarker.setPosition(thisPosition)
  for (let t = 0; t < tracePointsPhased.length; t++) {
    const breakPoints = tracePointsPhased[t].temBreakPointsFromTime
    for (let b = 0; b < breakPoints.length; b++) {
      if (breakPoints[b].coordinate.toString() === thisPosition.toString()) {
        this._traceIndex = b
        this._pointIndex = t
      }
    }
  }
}

// 实时显示小车当前时间
LushuTrack.prototype._showTimePopup = function (map) {
  const me = this
  me._traceTime = me._pathInfo[0].time
  if (me._fromPause) {
    me._traceTime = me._traceTimedivDom.innerText
  }
  const endTime = me._pathInfo[me._pathInfo.length - 1].time
  const endTimeSecond = new Date(endTime).getTime()
  if (endTimeSecond > map.maxEndTime) {
    map.maxEndTime = endTimeSecond
  }

  me._intervalTimeFlag = setInterval(function () {
    if (!me._traceEnd && !me._fromPause && !me._fromStop) {
      me._traceTime = (new Date(me._traceTime)).getTime() + 1000 * me._speedUp
      if (map.maxEndTime < me._traceTime) {
        me._traceEnd = true
        me._traceTimedivDom.innerText = endTime
        return
      }
      if (me._traceTime % 1000 === 0) {
        me._traceTime = formatDateTime(new Date(me._traceTime))
        me._traceTimedivDom.innerText = me._traceTime
      }
    }
  }, 1000)
}

// 设置小车回放的时间
LushuTrack.prototype._setTraceTime = function (time) {
  const me = this
  const tracePointsFromTime = me._tracePointsFromTime

  me._traceTimedivDom.innerText = time
  me._traceTime = time
  if (me._opts.speed === 0) {
    let minTimeDiff = Number.MAX_VALUE
    const thisTraceTime = new Date(me._traceTimedivDom.innerText).getTime()
    if (thisTraceTime > 0 || !isNaN(thisTraceTime)) {
      for (let t = 0; t < tracePointsFromTime.length; t++) {
        const time = tracePointsFromTime[t].temBreakPointsFromTime
        for (let i = 0; i < time.length; i++) {
          if (Math.abs(thisTraceTime - time[i].thisTimeSecond) < minTimeDiff) {
            minTimeDiff = Math.abs(thisTraceTime - time[i].thisTimeSecond)
            me._pointIndex = t
            me._traceIndex = i
          }
        }
      }
    }
    if (me._fromStop) {
      me._pointIndex = 0
      me._traceIndex = 0
    }
    if (me._traceTimedivDom.innerText === '' || me._fromPause || me._fromStop) {
      me._showTimePopup(me._map)
    }
  }
}

// 改变轨迹点组合方式
LushuTrack.prototype._convertPaths = function (paths) {
  this._path = []
  for (let v = 0; v < paths.length; v++) {
    this._path.push([paths[v].longitude, paths[v].latitude])
  }
}

// 启动轨迹回放
LushuTrack.prototype.start = function () {
  this._moving = true
  const me = this
  // const opts = me._opts
  const tracePoints = me.getTracePoints(1)
  me._tracePoints = tracePoints.breakPoints
  me._tracePointsFromTime = tracePoints.breakPointsFromTime
  if (me._path.length < 1) {
    return
  }
  if (me._tracePointsModePlay === 'skip') {
    me.tracePointsPlay()
  } else if (me._tracePointsModePlay === 'animation') {
    me.timePointsPlay()
  }
}

// 轨迹点播放模式
LushuTrack.prototype.tracePointsPlay = function () {
  const me = this
  const pathInfo = me._pathInfo
  const passPath = me._passPath // 设置通过路径数据 20190812
  if (passPath.length === 0) {
    me.tracePassLayer.getSource().clear()
  }

  if (!me._ismove) {
    me._addMarker()
    me._addInfoWin()

    me._intervalTraceFlag = setInterval(function () {
      if (me._fromPause || me._fromStop) {
        return
      }
      if (me._pointIndex >= pathInfo.length) {
        return
      }

      me._pointIndex += me._speedUp
      if (me._pointIndex >= pathInfo.length) {
        me._pointIndex = pathInfo.length - 1
      }

      me.carMarker.setPosition([pathInfo[me._pointIndex].longitude, pathInfo[me._pointIndex].latitude])
      // 设置路径数据数组 20190812
      if (me._pointIndex === 1) {
        passPath.push([pathInfo[me._pointIndex - 1].longitude, pathInfo[me._pointIndex - 1].latitude])
      }
      passPath.push([pathInfo[me._pointIndex].longitude, pathInfo[me._pointIndex].latitude])
      if (me._opts.passFlag) { // 增加参数限制20190819
        const passlineFeature = new FeatureExt({
          geometry: olLineString([
            [pathInfo[me._pointIndex - 1].longitude, pathInfo[me._pointIndex - 1].latitude],
            [pathInfo[me._pointIndex].longitude, pathInfo[me._pointIndex].latitude]
          ])
        })
        passlineFeature.setStyle(new Style({
          stroke: new Stroke({
            color: me._opts.passlineColor,
            width: 5
          })
        }))
        me.tracePassLayer.getSource().addFeature(passlineFeature)
      }

      if (me._opts.showInfoWin) {
        me._carInfoWin.getElement().innerText = pathInfo[me._pointIndex].info
      }
      const extent = me._map.getView().calculateExtent()
      const markerCoordinate = me.carMarker.getPosition()
      const isContains = containsCoordinate(extent, markerCoordinate)
      if (!isContains && me.centerAtCar) {
        me._map.getView().animate({
          center: markerCoordinate
        })
      }
    }, 1000)
  } else {
    if (!me._fromPause) {
      return
    } else if (!me._fromStop) {
      me._pointIndex++

      me.carMarker.setPosition([pathInfo[me._pointIndex].longitude, pathInfo[me._pointIndex].latitude])
      if (me._opts.passFlag) {
        const passlineFeature = new FeatureExt({
          geometry: olLineString([
            [pathInfo[me._pointIndex - 1].longitude, pathInfo[me._pointIndex - 1].latitude],
            [pathInfo[me._pointIndex].longitude, pathInfo[me._pointIndex].latitude]
          ])
        })
        passlineFeature.setStyle(new Style({
          stroke: new Stroke({
            color: me._opts.passlineColor,
            width: 5
          })
        }))
        me.tracePassLayer.getSource().addFeature(passlineFeature)
      }
      me._ismove = false
    }
  }
  this._fromPause = false
  this._fromStop = false
}

// 轨迹时间播放模式
LushuTrack.prototype.timePointsPlay = function () {
  const me = this
  const tracePoints = me._tracePoints
  const tracePointsFromTime = me._tracePointsFromTime
  const passPath = me._passPath
  if (passPath.length === 0) {
    me.tracePassLayer.getSource().clear()
  }

  if (me._opts.speed === 0) {
    let minTimeDiff = Number.MAX_VALUE
    const thisTraceTime = new Date(me._traceTimedivDom.innerText).getTime()
    if (thisTraceTime > 0 || !isNaN(thisTraceTime)) {
      for (let t = 0; t < tracePointsFromTime.length; t++) {
        const time = tracePointsFromTime[t].temBreakPointsFromTime
        for (let i = 0; i < time.length; i++) {
          if (Math.abs(thisTraceTime - time[i].thisTimeSecond) < minTimeDiff) {
            minTimeDiff = Math.abs(thisTraceTime - time[i].thisTimeSecond)
            me._pointIndex = t
            me._traceIndex = i
          }
        }
      }
    }
    if (me._fromStop) {
      me._pointIndex = 0
      me._traceIndex = 0
    }
    if (me._traceTimedivDom.innerText === '' || me._fromPause || me._fromStop) {
      me._showTimePopup(me._map)
    }
  }

  if (!me._ismove) {
    me._addMarker()
    me._addInfoWin()
    me._intervalTraceFlag = setInterval(function () {
      if (me._fromPause || me._fromStop) {
        return
      }
      const speed = me._opts.speed * 1000 / 3600

      if (me._pointIndex >= tracePointsFromTime.length) {
        return
      }

      const lenFromTime = tracePointsFromTime[me._pointIndex].temBreakPointsFromTime
      const differenceTime = tracePointsFromTime[me._pointIndex].differenceTime
      const length = tracePointsFromTime[me._pointIndex].length
      let calculateSpeed = 0
      if (speed === 0) {
        calculateSpeed = (length / differenceTime / 50).toFixed(2) * 10 * me._speedUp
      } else {
        calculateSpeed = (speed / 50).toFixed(2) * 10
      }

      if (me._fromPause || me._fromStop || me._pointIndex >= tracePoints.length - 1 || me._pointIndex >= tracePointsFromTime.length) {
        return
      }
      me._traceIndex += calculateSpeed
      me._traceIndex = Math.round(me._traceIndex)
      if (me._traceIndex >= lenFromTime.length) {
        me._traceIndex = lenFromTime.length - 1
        me._pointIndex++
        const countPass = lenFromTime.slice(0, me._traceIndex)
        for (let p = 0; p < countPass.length; p++) {
          passPath.push(countPass[p].coordinate)
        }
        if (me._opts.passFlag) {
          const passlineFeature = new FeatureExt({
            geometry: olLineString(passPath)
          })
          passlineFeature.setStyle(new Style({
            stroke: new Stroke({
              color: me._opts.passlineColor,
              width: 5
            })
          }))
          me.tracePassLayer.getSource().addFeature(passlineFeature)
        }

        me.carMarker.setPosition(lenFromTime[me._traceIndex].coordinate)
        if (me.changeCarRotate) {
          me.carMarker.setRotateAngle(lenFromTime[me._traceIndex].rotate)
        }

        const index = me._troughPointIndex(lenFromTime[me._traceIndex].coordinate)
        if (me._opts.showInfoWin) {
          if (me._pathInfo[index]) {
            me._carInfoWin.getElement().innerText = me._pathInfo[index].info
            me._carInfoWin.setPosition([me._pathInfo[index].longitude, me._pathInfo[index].latitude])
          } else {
            me._carInfoWin.getElement().innerText = ''
            me._carInfoWin.setPosition(undefined)
          }
        }
        me._traceIndex = 0
      } else {
        const countPass = lenFromTime.slice(Math.round(me._traceIndex - calculateSpeed), me._traceIndex)
        for (let p = 0; p < countPass.length; p++) {
          passPath.push(countPass[p].coordinate)
        }
        if (me._opts.passFlag) {
          const passlineFeature = new FeatureExt({
            geometry: olLineString(passPath)
          })
          passlineFeature.setStyle(new Style({
            stroke: new Stroke({
              color: me._opts.passlineColor,
              width: 5
            })
          }))
          me.tracePassLayer.getSource().addFeature(passlineFeature)
        }

        me.carMarker.setPosition(lenFromTime[me._traceIndex].coordinate)
        if (me.changeCarRotate) {
          me.carMarker.setRotateAngle(lenFromTime[me._traceIndex].rotate)
        }
        const index = me._troughPointIndex(tracePoints[me._pointIndex].coordinate)
        if (me._opts.showInfoWin) {
          if (me._pathInfo[index]) {
            console.log(me._carInfoWin)
            me._carInfoWin.getElement().innerText = me._pathInfo[index].info
            me._carInfoWin.setPosition([me._pathInfo[index].longitude, me._pathInfo[index].latitude])
          } else {
            me._carInfoWin.getElement().innerText = ''
            me._carInfoWin.setPosition(undefined)
          }
        }
      }
      const extent = me._map.getView().calculateExtent()
      const markerCoordinate = me.carMarker.getPosition()
      const isContains = containsCoordinate(extent, markerCoordinate)
      if (!isContains && me.centerAtCar) {
        me._map.getView().animate({
          center: markerCoordinate
        })
      }
    }, 200)
  } else {
    if (!me._fromPause) {
      return
    } else if (!me._fromStop) {
      me._traceIndex++
      me._ismove = false
    }
  }
  this._fromPause = false
  this._fromStop = false
}

// 设置速度，单位km/h
LushuTrack.prototype.setSpeed = function (msg) {
  this._opts.speed = msg
}

// 设置倍速
LushuTrack.prototype.setSpeedUp = function (msg) {
  this._speedUp = msg
}

// 停止播放
LushuTrack.prototype.stop = function () {
  this._moving = false
  this._ismove = false
  this._pointIndex = 0
  this._traceIndex = 0
  this._fromStop = true
  this._passPath = []
  this.tracePassLayer.getSource().clear()
  this.carMarker.setPosition([this._pathInfo[0].longitude, this._pathInfo[0].latitude])
  clearInterval(this._intervalTraceFlag)
  clearInterval(this._intervalTimeFlag)
}

// 暂停播放
LushuTrack.prototype.pause = function () {
  this._moving = false
  this._ismove = true
  this._fromPause = true
  clearInterval(this._intervalTimeFlag)
}

// 新增小车
LushuTrack.prototype._addMarker = function () {
  const me = this
  if (this.carMarker) {
    if (this.carLayer.getSource().getFeatures().length > 0) {
      this.carLayer.getSource().removeFeature(this.carMarker)
    }
    clearInterval(this._intervalTraceFlag)
  }
  const marker = carMarker(this._path[0], this._opts)
  this.carLayer.getSource().addFeature(marker)
  this.carMarker = marker
  marker.on = function (arg, callback) {
    if (arg === 'move') {
      const moveInterval = setInterval(function () {
        if (!me._moving) {
          return
        }
        const carPosition = marker.getPosition()
        const allPathInfo = me._pathInfo
        for (let a = 0; a < allPathInfo.length; a++) {
          if (carPosition.toString() === (allPathInfo[a].longitude + ',' + allPathInfo[a].latitude)) {
            callback(a)
            if (a === allPathInfo.length - 1) {
              clearInterval(moveInterval)
            }
          }
        }
      }, 200)
    }
  }
}

// 新增信息窗体
LushuTrack.prototype._addInfoWin = function () {
  const me = this
  if (!me._opts.showInfoWin) {
    return
  }

  const position = me.carMarker.getPosition()
  if (me._carInfoWin) {
    me._carInfoWin.setPosition(position)
    return
  }
  console.log(me._opts)
  const div = document.createElement('div')
  div.className = 'carOverlay-class'
  div.innerText = ''
  const overlay = olOverlay({
    element: document.getElementById(me._opts.overlay.element.toString()),
    position: position,
    stopEvent: true,
    offset: [10, 0]
  })
  me._carInfoWin = overlay
  me._map.addOverlay(overlay)
}

// 计算方向箭头点集
LushuTrack.prototype.getArrowPoints = function (step) {
  const _pathInfo = this._pathInfo
  const breakPoints = []
  for (let n = 0; n < _pathInfo.length - 1; n++) {
    const initPos = [_pathInfo[n].longitude, _pathInfo[n].latitude]
    const targetPos = [_pathInfo[n + 1].longitude, _pathInfo[n + 1].latitude]

    const INIT_POS = this._map.getPixelFromCoordinate(initPos)
    const TARGET_POS = this._map.getPixelFromCoordinate(targetPos)
    const lnglats = [INIT_POS, TARGET_POS]
    const length = formatLengthFromPixels(lnglats)
    const pointsSum = Math.floor(length / step)
    const rotate = this.getRotationFromPixel(INIT_POS, TARGET_POS)

    for (let p = 1; p < pointsSum + 1; p++) {
      const pixel = [INIT_POS[0] + step * p * Math.cos(rotate), INIT_POS[1] + step * p * Math.sin(rotate)]
      const coordinate = this._map.getCoordinateFromPixel(pixel)
      breakPoints.push({ rotate: rotate, coordinate: coordinate })
    }
  }
  return breakPoints
}

// 计算轨迹回放点集
LushuTrack.prototype.getTracePoints = function (step) {
  const _pathInfo = this._pathInfo
  const breakPoints = []
  const breakPointsFromTime = []
  for (let n = 0; n < _pathInfo.length - 1; n++) {
    const temBreakPointsFromTime = []
    const initPos = [_pathInfo[n].longitude, _pathInfo[n].latitude]
    const targetPos = [_pathInfo[n + 1].longitude, _pathInfo[n + 1].latitude]
    const initTime = _pathInfo[n].time
    const targetTime = _pathInfo[n + 1].time
    const initTimeSecond = new Date(initTime).getTime()
    const targetTimeSecond = new Date(targetTime).getTime()
    const differenceTime = targetTimeSecond - initTimeSecond
    if (differenceTime === 0) {
      continue
    }

    const INIT_POS = fromLonLat(initPos)
    const TARGET_POS = fromLonLat(targetPos)

    const lnglats = [INIT_POS, TARGET_POS]
    const length = formatLengthFromPixels(lnglats)
    const pointsSum = Math.floor(length / step)

    const rotate = this.getRotationFromPixel(INIT_POS, TARGET_POS)
    const angle = this.getAngleFromPixel(INIT_POS, TARGET_POS)
    for (let p = 0; p < pointsSum + 1; p++) {
      const coord = [INIT_POS[0] + p * step * Math.cos(rotate), INIT_POS[1] + p * step * Math.sin(rotate)]
      const coordinate = toLonLat(coord)
      const thisTimeSecond = initTimeSecond + Math.round(differenceTime / pointsSum) * p
      breakPoints.push({ rotate: angle, coordinate: coordinate, thisTimeSecond: thisTimeSecond })
      temBreakPointsFromTime.push({ rotate: angle, coordinate: coordinate, thisTimeSecond: thisTimeSecond })
    }
    if (length % step !== 0) {
      breakPoints.push({ rotate: angle, coordinate: targetPos, thisTimeSecond: targetTimeSecond })
      temBreakPointsFromTime.push({ rotate: angle, coordinate: targetPos, thisTimeSecond: targetTimeSecond })
    }

    breakPointsFromTime.push({
      length: length,
      differenceTime: differenceTime / 1000,
      initTime: initTime,
      targetTime: targetTime,
      temBreakPointsFromTime: temBreakPointsFromTime
    })
  }
  return { breakPoints: breakPoints, breakPointsFromTime: breakPointsFromTime }
}

// 计算两个像素点之间的方位  Math.PI
LushuTrack.prototype.getRotationFromPixel = function (curPos, targetPos) {
  if (!curPos) return false
  curPos = { x: curPos[0], y: curPos[1] }
  targetPos = { x: targetPos[0], y: targetPos[1] }
  const x = Math.abs(targetPos.x - curPos.x)
  const y = Math.abs(targetPos.y - curPos.y)
  const z = Math.sqrt(x * x + y * y)
  const ration = Math.asin(y / z)
  let a = 0
  if (targetPos.y < curPos.y && targetPos.x === curPos.x) {
    a = Math.PI * 2 / 3
  } else if (targetPos.y > curPos.y && targetPos.x === curPos.x) { a = Math.PI / 2 } else if (targetPos.y === curPos.y && targetPos.x < curPos.x) { a = Math.PI } else if (targetPos.y === curPos.y && targetPos.x > curPos.x) { a = 0 } else if (targetPos.y > curPos.y && targetPos.x > curPos.x) { a = ration } else if (targetPos.y > curPos.y && targetPos.x < curPos.x) { a = Math.PI - ration } else if (targetPos.y < curPos.y && targetPos.x < curPos.x) { a = Math.PI + ration } else if (targetPos.y < curPos.y && targetPos.x > curPos.x) { a = Math.PI * 2 - ration }
  return a
}

// 计算两个像素点之间的角度  单位为度
LushuTrack.prototype.getAngleFromPixel = function (curPos, targetPos) {
  curPos = { x: curPos[0], y: curPos[1] }
  targetPos = { x: targetPos[0], y: targetPos[1] }

  const x = Math.abs(targetPos.x - curPos.x)
  const y = Math.abs(targetPos.y - curPos.y)
  const z = Math.sqrt(x * x + y * y)
  const ration = Math.round((Math.asin(y / z) / Math.PI * 180))
  let a = 0
  if (targetPos.y < curPos.y && targetPos.x === curPos.x) {
    a = 270
  } else if (targetPos.y > curPos.y && targetPos.x === curPos.x) { a = 90 } else if (targetPos.y === curPos.y && targetPos.x < curPos.x) { a = 180 } else if (targetPos.y === curPos.y && targetPos.x > curPos.x) { a = 0 } else if (targetPos.y > curPos.y && targetPos.x > curPos.x) { a = 360 - ration } else if (targetPos.y > curPos.y && targetPos.x < curPos.x) { a = 180 + ration } else if (targetPos.y < curPos.y && targetPos.x < curPos.x) { a = 180 - ration } else if (targetPos.y < curPos.y && targetPos.x > curPos.x) { a = ration }
  return a
}

// 计算小车当前位置最近的轨迹点集合_path的索引
LushuTrack.prototype._troughPointIndex = function (markerPoi) {
  const distance = this._pointIndexDistance
  const paths = this._path
  for (let i = 0; i < paths.length; i++) {
    const coordinate = paths[i]
    const length = olSphere.getDistance(coordinate, markerPoi)
    if (length < distance) {
      return i
    }
  }
  return -1
}

// 轨迹线和轨迹点样式
LushuTrack.prototype._traceLineSytle = function (type) {
  const opts = this._opts
  const lineWidth = opts.lineWidth ? opts.lineWidth : 5
  const lineColor = opts.lineColor ? opts.lineColor : 'blue'
  const traceLineStyles = {
    route: new Style({
      stroke: new Stroke({
        width: lineWidth,
        color: lineColor
      })
    }),
    node: new Style({
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: 'white',
          width: 0
        }),
        fill: new Fill({
          color: 'green'
        })
      })
    }),
    start: new Style({
      image: new Icon(this._opts.startIcon),
      text: new Text({
        font: '13px Microsoft Yahei',
        fill: new Fill({
          color: '#aa3300'
        }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        textAlign: 'left'
      })
    }),
    end: new Style({
      image: new Icon(this._opts.endIcon),
      text: new Text({
        font: '13px Microsoft Yahei',
        fill: new Fill({
          color: '#aa3300'
        }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
        textAlign: 'left'
      })
    })
  }

  return traceLineStyles[type]
}

// 初始化轨迹线和轨迹点
LushuTrack.prototype._initLinesAndMarkers = function () {
  const me = this

  const paths = me._pathInfo
  const wholePaths = me._wholePathInfo

  me._convertPaths(paths)
  if (me._initFlag === 1) {
    me.traceNodes = []
    for (const index in wholePaths) {
      const i = Number(index)
      const markerPosition = [wholePaths[i].longitude, wholePaths[i].latitude]
      const id = wholePaths[i].id
      if (i > 0 && i < wholePaths.length - 1) {
        const nodeMarker = new FeatureExt({
          geometry: olPoint(markerPosition)
        })
        nodeMarker.set('id', id)
        nodeMarker.set('number', parseInt(i) + 1)
        if (me._showTracePoint) {
          me.traceNodes.push(nodeMarker)
        }
        nodeMarker.set('type', 'node')
        nodeMarker.on('mouseover', function (e) {
          if (me._map.getInfoWindowById(e.coordinate.toString())) {
            me._map.getInfoWindowById(e.coordinate.toString()).setPosition(e.coordinate)
          }
        })
        nodeMarker.on('mouseout', function (e) {
          if (me._map.getInfoWindowById(this.getPosition().toString())) {
            me._map.getInfoWindowById(this.getPosition().toString()).setPosition(undefined)
          }
        })
      } else {
        if (i === 0) {
          const starMarker = new FeatureExt({
            geometry: olPoint([wholePaths[i].longitude, wholePaths[i].latitude])
          })
          starMarker.set('type', 'start')
          starMarker.set('id', id)
          starMarker.set('number', parseInt(i) + 1)
          me.traceNodes.push(starMarker)
        } else if (i === wholePaths.length - 1) {
          const endMarker = new FeatureExt({
            geometry: olPoint([wholePaths[i].longitude, wholePaths[i].latitude + 0.00000001])
          })
          endMarker.set('type', 'end')
          endMarker.set('id', id)
          endMarker.set('number', parseInt(i) + 1)
          me.traceNodes.push(endMarker)
        }
      }
    }
    console.log(me.traceNodes)
    for (let p = 0; p < me._pathInfo.length - 1; p++) {
      const pathS = [me._pathInfo[p].longitude, me._pathInfo[p].latitude]
      const pathE = [me._pathInfo[p + 1].longitude, me._pathInfo[p + 1].latitude]
      const lineFeature = new FeatureExt({
        geometry: olLineString([pathS, pathE])
      })
      lineFeature.setStyle(me._traceLineSytle('route'))
      me.traceLayer.getSource().addFeature(lineFeature)
      me.traceLineList.push(lineFeature)
    }

    for (let f = 0; f < me.traceNodes.length; f++) {
      const feature = me.traceNodes[f]
      const style = me._traceLineSytle(feature.get('type'))
      feature.setStyle(style)
      if (feature.getGeometry().getType() === 'Point') {
        for (let t = 0; t < paths.length; t++) {
          if (feature.get('id') === paths[t].id) {
            me.traceLayer.getSource().addFeature(feature)
          }
        }
      }
    }
  }
}

LushuTrack.prototype.setTraceLineColor = function (color) {
  const me = this
  me._opts.lineColor = color
  const traceLineList = me.traceLineList
  for (let t = 0; t < traceLineList.length; t++) {
    traceLineList[t].setStrokeColor(color)
  }
  me.traceLayer.refresh()
}

LushuTrack.prototype.setTraceLineWidth = function (width) {
  const me = this
  me._opts.lineWidth = width
  const traceLineList = me.traceLineList
  for (let t = 0; t < traceLineList.length; t++) {
    traceLineList[t].setStrokeWeight(width)
  }
  me.traceLayer.refresh()
}

LushuTrack.prototype._creatTimeOverlays = function () {
  const me = this
  const wholePaths = me._wholePathInfo
  const vacuatePaths = me._vacuatePath
  me._timeOverlayList = []
  if (me._labelShow) {
    const pointsArr = []
    for (let i = 0; i < wholePaths.length; i++) {
      for (let v = 0; v < vacuatePaths.length; v++) {
        if (vacuatePaths[v].longitude === wholePaths[i].longitude && vacuatePaths[v].latitude === wholePaths[i].latitude) {
          const overlayPosition = [wholePaths[i].longitude, wholePaths[i].latitude]
          pointsArr.push({ position: overlayPosition, text: wholePaths[i].time })
        }
      }
    }
    if (typeof me.textLayer === 'undefined') {
      me.textLayer = addNameLayer(me._map, pointsArr, 10)
      me.textLayer.set('id', 'lushuText' + new Date().getTime())
      me._map.addLayer(me.textLayer)
    } else {
      const layer = getLayerById(me.textLayer.get('id'), me._map)
      if (typeof layer === 'undefined') {
        me._map.addLayer(me.textLayer)
      }
    }
  }
}

LushuTrack.prototype.createArrows = function () {
  const me = this
  const breakPoints = me.getArrowPoints(me._opts.arrowPixel)
  for (let b = 0; b < breakPoints.length; b++) {
    const coordinates = breakPoints[b].coordinate
    const rotate = breakPoints[b].rotate
    const marker = new FeatureExt({
      geometry: olPoint(coordinates)
    })
    marker.setStyle(new Style({
      image: new Icon({
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABfUlEQVQ4T3WTTSvFYRDFf8dLKIqytFckthTpJkQWlyhF2fgEVr6BheytpChEsqB08xbZWPgOJAs7ieRlNMzV//75P7vnmZkz58ycR2ZWD7QBF5KM1DGzTuBO0k065neZ2S3QBGwAU5I+iolmNgrsAI9An6SrNIgDnAE9EdgFJiS9+93MuoEToBx4AgYkXSZBHKAWOAS6IrAP5CW9BUge2AIqgJdg8guiSKoBDoDeDJBhwNlVBsiQpNPvGST0VgF7TjPeCsCIpNdo0g84O2fibx4r/AJEUjVwlJDjXbybU/eZjAGbMROXmC8BiKQ64BxoDyYLkuYTTCeB9WD/9B9AA3AMdGQAzALLAfCcluDF3r01itMS5oDFiP3MIUHNi90T7ko/XjyYGOIMsFJSXByimTVGQbFzegOuew0o+7PGKL4AmjM8MA2shua/RjIzX1suw8pucZfiUjOt/AC4BHfaeOoz+d63oziX9Zla3CzAkqTP9G8zM4/dS7r+7zt/Aaattn1kX8VgAAAAAElFTkSuQmCC',
        rotation: rotate,
        scale: 0.5
      })
    }))
    me.arrowsLayer.getSource().addFeature(marker)
  }
}

LushuTrack.prototype.windowAddMouseWheel = function () {
  const me = this
  const scrollFunc = function (e) {
    e = e || window.event
    if (e.wheelDelta) {
      if (e.wheelDelta > 0) {
        me.arrowsLayer.getSource().clear()
      }
      if (e.wheelDelta < 0) {
        me.arrowsLayer.getSource().clear()
      }
    } else if (e.detail) {
      if (e.detail > 0) {
        me.arrowsLayer.getSource().clear()
      }
      if (e.detail < 0) {
        me.arrowsLayer.getSource().clear()
      }
    }
  }
  if (document.addEventListener) {
    document.addEventListener('DOMMouseScroll', scrollFunc, false)
  }

  window.onmousewheel = document.onmousewheel = scrollFunc
}

LushuTrack.prototype.dispose = function () {
  if (this._intervalTimeFlag) {
    clearInterval(this._intervalTimeFlag)
    this._intervalTimeFlag = null
  }
  if (this._intervalTraceFlag) {
    clearInterval(this._intervalTraceFlag)
    this._intervalTraceFlag = null
  }
  const layers = this._map.getLayers().getArray()
  const trackLayers = layers.filter(x => x.get('isTrack') && x.get('isTrack') === true)
  if (trackLayers && trackLayers.length > 0) {
    trackLayers.forEach(layer => {
      layer.getSource().clear()
      this._map.removeLayer(layer)
    })
  }
}

// 抽稀，包括距离抽稀和轨迹抽稀
function smokeTraces (map, lonlats, dMax, smokeMode, callback) {
  if (smokeMode === 'distance') {
    smokeFromDistance(map, lonlats, dMax, callback)
  } else if (smokeMode === 'track') {
    douglasPeucker(map, lonlats, dMax, callback)
  }
}

// 距离抽稀
function smokeFromDistance (map, lonlats, dMax, callback) {
  const coordinate = []
  lonlats.forEach(function (element, index) {
    coordinate.push(element)
  })
  let endCycle = true
  for (let c = 0; c < coordinate.length - 1; c++) {
    const distance = calculationPixelDistance(map, coordinate[c], coordinate[c + 1])
    if (distance < dMax) {
      if (coordinate.length >= 3) {
        endCycle = false
        if (c + 1 < coordinate.length - 1 || c === 0) {
          // coordinate.remove(coordinate[c + 1])
          coordinate.splice(c + 1, 1)
        } else {
          // coordinate.remove(coordinate[c])
          coordinate.splice(c, 1)
        }
        break
      }
    }
  }
  if (!endCycle) {
    smokeFromDistance(map, coordinate, dMax, callback)
  } else {
    callback(lonlats)
  }
};

// 道格拉斯抽稀算法
function douglasPeucker (map, lonlats, dMax, callback) {
  const coordinate = lonlats
  coordinate.forEach(function (item, index) {
    item.id = index
  })
  const result = compressLine(map, coordinate, [], 0, coordinate.length - 1, dMax)
  result.push(coordinate[0])
  if (coordinate.length > 1) {
    result.push(coordinate[coordinate.length - 1])
  }

  const resultLatLng = result.sort(function (a, b) {
    if (a.id < b.id) {
      return -1
    } else if (a.id > b.id) { return 1 }
    return 0
  })
  callback(resultLatLng)
};

// 抽稀算法
const compressLine = function (map, coordinate, result, start, end, dMax) {
  if (start < end) {
    let maxDist = 0
    let currentIndex = 0
    const startPoint = coordinate[start]
    const endPoint = coordinate[end]
    for (let i = start + 1; i < end; i++) {
      const currentDist = distFromPointToLine(map, startPoint, endPoint, coordinate[i])
      if (currentDist > maxDist) {
        maxDist = currentDist
        currentIndex = i
      }
    }
    if (maxDist >= dMax) {
      result.push(coordinate[currentIndex])
      compressLine(map, coordinate, result, start, currentIndex, dMax)
      compressLine(map, coordinate, result, currentIndex, end, dMax)
    }
  }
  return result
}

// 计算点到线的距离
const distFromPointToLine = function (map, start, end, center) {
  const a = Math.abs(calculationPixelDistance(map, start, end))
  const b = Math.abs(calculationPixelDistance(map, start, center))
  const c = Math.abs(calculationPixelDistance(map, end, center))
  const p = (a + b + c) / 2.0
  const s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)))
  return s * 2.0 / a
}

// 计算两个像素点之间的距离
const calculationPixelDistance = function (map, point1, point2) {
  const lat1 = point1.latitude
  const lat2 = point2.latitude
  const lng1 = point1.longitude
  const lng2 = point2.longitude
  const pixels1 = map.getPixelFromCoordinate([lng1, lat1])
  const pixels2 = map.getPixelFromCoordinate([lng2, lat2])
  const length = Math.sqrt(Math.pow((pixels2[0] - pixels1[0]), 2) + Math.pow((pixels2[1] - pixels1[1]), 2))
  return length
}

// 计算两个像素点之间的距离
var formatLengthFromPixels = function (pixels) {
  var length = 0
  for (var i = 0, ii = pixels.length - 1; i < ii; ++i) {
    if (pixels[i + 1]) {
      length += Math.sqrt(Math.pow((pixels[i + 1][0] - pixels[i][0]), 2) + Math.pow((pixels[i + 1][1] - pixels[i][1]), 2))
    }
  }
  return length
}

// var gps_wgs84Sphere = new Sphere(6378137)

function formatDateTime (theDate) {
  var _hour = theDate.getHours()
  var _minute = theDate.getMinutes()
  var _second = theDate.getSeconds()
  var _year = theDate.getFullYear()
  var _month = theDate.getMonth()
  var _date = theDate.getDate()
  if (_hour < 10) {
    _hour = '0' + _hour
  }
  if (_minute < 10) {
    _minute = '0' + _minute
  }
  if (_second < 10) {
    _second = '0' + _second
  }
  _month = _month + 1
  if (_month < 10) {
    _month = '0' + _month
  }
  if (_date < 10) {
    _date = '0' + _date
  }
  return _year + '-' + _month + '-' + _date + ' ' + _hour + ':' + _minute + ':' + _second
}

function carMarker (lnglat, config) {
  const feature = new FeatureExt({
    geometry: olPoint(lnglat)
  })
  feature.setStyle(new Style({
    image: new Icon(config.carIcon)
  }))
  return feature
}

function addNameLayer (map, pointsArr, zoom) {
  var textBounds = []
  var textLayer = vectorLayer({
    source: olVectorSource()
  })
  if (map.getView().getZoom() >= zoom) {
    drawText(map, pointsArr, zoom, textBounds, textLayer)
  }
  map.on('moveend', function (e) {
    if (map.getView().getZoom() >= zoom) {
      drawText(map, pointsArr, zoom, textBounds, textLayer)
    } else {
      textLayer.getSource().clear()
    }
  })
  return textLayer
}

function drawText (map, pointsArr, zoom, textBounds, textLayer) {
  textBounds = []
  textLayer.getSource().clear()
  for (var p = 0; p < pointsArr.length; p++) {
    var element = pointsArr[p]
    var pixel = map.getPixelFromCoordinate(element.position)
    if (!containsCoordinate(map.getView().calculateExtent(), element.position)) {
      continue
    }
    var a = /[\u4e00-\u9fa5]/g
    var textLen = element.text.match(a) ? element.text.match(a).length : 0
    var numberLen = element.text.length - textLen
    var textPixel = textLen * 15 + numberLen * 8

    var rightTopMinx = pixel[0] + 10
    var rightTopMaxx = pixel[0] + textPixel + 20
    var rightTopMiny = pixel[1] - 32
    var rightTopMaxy = pixel[1] - 12
    var rightTopCenter = [rightTopMinx, parseInt((rightTopMiny + rightTopMaxy) / 2)]
    var rightTopMin = { x: rightTopMinx, y: rightTopMiny }
    var rightTopMax = { x: rightTopMaxx, y: rightTopMaxy }

    var leftTopMinx = pixel[0] - textPixel - 20
    var leftTopMaxx = pixel[0] - 10
    var leftTopMiny = pixel[1] - 32
    var leftTopMaxy = pixel[1] - 12
    var leftTopCenter = [leftTopMaxx, parseInt((leftTopMiny + leftTopMaxy) / 2)]
    var leftTopMin = { x: leftTopMinx, y: leftTopMiny }
    var leftTopMax = { x: leftTopMaxx, y: leftTopMaxy }

    var leftBomMinx = pixel[0] - textPixel - 20
    var leftBomMaxx = pixel[0] - 10
    var leftBomMiny = pixel[1] + 12
    var leftBomMaxy = pixel[1] + 32
    var leftBomCenter = [leftBomMaxx, parseInt((leftBomMiny + leftBomMaxy) / 2)]
    var leftBomMin = { x: leftBomMinx, y: leftBomMiny }
    var leftBomMax = { x: leftBomMaxx, y: leftBomMaxy }

    var rightBomMinx = pixel[0] + 10
    var rightBomMaxx = pixel[0] + textPixel + 20
    var rightBomMiny = pixel[1] + 12
    var rightBomMaxy = pixel[1] + 32
    var rightBomCenter = [rightBomMinx, parseInt((rightBomMiny + rightBomMaxy) / 2)]
    var rightBomMin = { x: rightBomMinx, y: rightBomMiny }
    var rightBomMax = { x: rightBomMaxx, y: rightBomMaxy }

    var rightTopBounds = new Bounds(rightTopMin, rightTopMax)
    var leftTopBounds = new Bounds(leftTopMin, leftTopMax)
    var leftBomBounds = new Bounds(leftBomMin, leftBomMax)
    var rightBomBounds = new Bounds(rightBomMin, rightBomMax)

    var title = 'rightTop'
    var isCollision = true
    for (var r = 0; r < 4; r++) {
      for (var i = 0; i < textBounds.length; i++) {
        var pointBounds = textBounds[i]
        if (r === 0) {
          isCollision = pointBounds.intersects(rightTopBounds)
          if (!isCollision) {
            break
          }
        } else if (r === 1) {
          isCollision = pointBounds.intersects(leftTopBounds)
          if (!isCollision) {
            break
          }
        } else if (r === 2) {
          isCollision = pointBounds.intersects(leftBomBounds)
          if (!isCollision) {
            break
          }
        } else if (r === 3) {
          isCollision = pointBounds.intersects(rightBomBounds)
          if (!isCollision) {
            break
          }
        }
      }
      if (isCollision) {
        if (r === 0) {
          title = 'rightTop'
        } else if (r === 1) {
          title = 'leftTop'
        } else if (r === 2) {
          title = 'leftBom'
        } else if (r === 3) {
          title = 'rightBom'
        }
        break
      }
    }

    var minx, miny, maxx, maxy, polylineCenter
    if (!isCollision) {
      continue
    } else if (title === 'rightTop') {
      textBounds.push(rightTopBounds)
      polylineCenter = rightTopCenter
      minx = rightTopMinx
      miny = rightTopMiny
      maxx = rightTopMaxx
      maxy = rightTopMaxy
    } else if (title === 'leftTop') {
      textBounds.push(leftTopBounds)
      polylineCenter = leftTopCenter
      minx = leftTopMinx
      miny = leftTopMiny
      maxx = leftTopMaxx
      maxy = leftTopMaxy
    } else if (title === 'rightBom') {
      textBounds.push(rightBomBounds)
      polylineCenter = rightBomCenter
      minx = rightBomMinx
      miny = rightBomMiny
      maxx = rightBomMaxx
      maxy = rightBomMaxy
    } else if (title === 'leftBom') {
      textBounds.push(leftBomBounds)
      polylineCenter = leftBomCenter
      minx = leftBomMinx
      miny = leftBomMiny
      maxx = leftBomMaxx
      maxy = leftBomMaxy
    }

    var leftTop = map.getCoordinateFromPixel([minx, miny])
    var rightTop = map.getCoordinateFromPixel([maxx, miny])
    var rightBom = map.getCoordinateFromPixel([maxx, maxy])
    var leftBom = map.getCoordinateFromPixel([minx, maxy])
    const textBack = new FeatureExt({
      geometry: olPolygon([leftTop, rightTop, rightBom, leftBom])
    })
    textLayer.getSource().addFeature(textBack)
    polylineCenter = map.getCoordinateFromPixel(polylineCenter)
    const polyline = new FeatureExt({
      geometry: olLineString([element.position, polylineCenter])
    })
    textLayer.getSource().addFeature(polyline)
    textLayer.setStyle(new Style({
      fill: new Fill({
        color: 'rgb(26,58,91)'
      }),
      stroke: new Stroke({
        color: 'rgb(26,58,91)'
      }),
      text: new Text({
        font: '16px sans-serif',
        text: element.text,
        fill: new Fill({
          color: '#000'
        }),
        offsetX: 0,
        offsetY: 1
      })
    }))
    // const text = new WMap.Text({
    //   position: textBack.getCenter(),
    //   text: element.text,
    //   color: 'white',
    //   offset: [0, 1]
    // })
    // textLayer.addFeature(text)
  }
}

function Bounds (min, max) {
  this.min = min
  this.max = max
}
Bounds.prototype.intersects = function (bounds) {
  var min = this.min
  var max = this.max
  var min2 = bounds.min
  var max2 = bounds.max
  return max2.x <= min.x || min2.x >= max.x || max2.y <= min.y || min2.y >= max.y
}

export const PathSimplifier = function (options = {}) {
  const map = options.map ? options.map : {} // 地图对象
  let paths = options.paths ? options.paths : [] // 轨迹点集合
  const id = options.id ? options.id : uuid()
  const opts = options.options ? options.options : {}
  opts.id = id
  const changeCarRotate = false
  opts.changeCarRotate = options.changeCarRotate ? options.changeCarRotate : changeCarRotate
  opts.centerAtCar = options.centerAtCar ? options.centerAtCar : false
  const vacuate = options.vacuate ? options.vacuate : false // 是否抽稀
  const smokeMode = options.smokeMode ? options.smokeMode : 'distance' // 是否为距离抽稀
  const tracePointsModePlay = options.tracePointsModePlay ? options.tracePointsModePlay : 'animation' // 是否为轨迹点回放模式
  const vacuateDistance = options.vacuateDistance ? options.vacuateDistance : 10 // 抽稀距离，单位像素
  const labelShow = options.labelShow ? options.labelShow : false
  const labelStyle = options.labelStyle ? options.labelStyle : 'timeContentClass'
  const showTracePoint = options.showTracePoint !== false

  let vacuatePaths = paths
  let luLocus
  let zoom = map.getView().getZoom()
  // 是否对轨迹点进行抽稀
  if (vacuate) {
    smokeTraces(map, paths, vacuateDistance, smokeMode, function (data) {
      vacuatePaths = data
      luLocus = new LushuTrack(map, paths, vacuatePaths, vacuate, tracePointsModePlay, labelShow, labelStyle, showTracePoint, opts)
      luLocus._initLinesAndMarkers()
      if (labelShow) {
        luLocus._creatTimeOverlays()
      }
      luLocus.createArrows()
    })
  } else {
    luLocus = new LushuTrack(map, paths, vacuatePaths, vacuate, tracePointsModePlay, labelShow, labelStyle, showTracePoint, opts)
    luLocus._initLinesAndMarkers()
    if (labelShow) {
      luLocus._creatTimeOverlays()
    }
    luLocus.createArrows()
  }

  luLocus.setPaths = function (pathsInfo) {
    paths = pathsInfo
    luLocus.arrowsLayer.getSource().clear()
    for (let o = 0; o < luLocus._timeOverlayList.length; o++) {
      map.removeOverlay(luLocus._timeOverlayList[o])
    }
    luLocus.traceLayer.getSource().clear()
    // 清除通过路径图层绘制结果 20190812
    luLocus.tracePassLayer.getSource().clear()
    luLocus.stop()
    zoom = map.getView().getZoom()

    if (vacuate) {
      smokeTraces(map, paths, vacuateDistance, smokeMode, function (data) {
        vacuatePaths = data
        luLocus._pathInfo = vacuatePaths
        luLocus._vacuatePath = vacuatePaths
        luLocus._wholePathInfo = paths
        luLocus._initFlag = 1
        luLocus._initLinesAndMarkers()
        if (labelShow) {
          luLocus._creatTimeOverlays()
        }
        luLocus.createArrows()
      })
    } else {
      luLocus._pathInfo = paths
      luLocus._vacuatePath = paths
      luLocus._wholePathInfo = paths
      luLocus._initFlag = 1
      luLocus._initLinesAndMarkers()
      if (labelShow) {
        luLocus._creatTimeOverlays()
      }
      luLocus.createArrows()
    }
  }

  luLocus.clearPaths = function () {
    luLocus._path = []
    paths = []
    luLocus.arrowsLayer.getSource().clear()
    luLocus.tracePassLayer.getSource().clear()
    for (let o = 0; o < luLocus._timeOverlayList.length; o++) {
      map.removeOverlay(luLocus._timeOverlayList[o])
    }
    luLocus.traceLayer.getSource().clear()
    if (this.carLayer.getFeatures().length > 0) {
      this.carLayer.removeFeature(this.carMarker)
    }
    if (typeof this.textLayer !== 'undefined') {
      map.removeLayer(this.textLayer)
    }
  }

  map.getView().on('change:resolution', function () {
    if (paths.length === 0) {
      return
    }
    zoom = map.getView().getZoom()
    luLocus.arrowsLayer.getSource().clear()
    if (Math.round(zoom) === zoom) {
      luLocus._initFlag = 2
      luLocus.createArrows()

      if (vacuate) {
        smokeTraces(map, paths, vacuateDistance, smokeMode, function (data) {
          vacuatePaths = data
          for (let o = 0; o < luLocus._timeOverlayList.length; o++) {
            map.removeOverlay(luLocus._timeOverlayList[o])
          }
          luLocus._pathInfo = vacuatePaths
          luLocus._vacuatePath = vacuatePaths
          luLocus._wholePathInfo = paths
          luLocus._initLinesAndMarkers()
          if (labelShow) {
            luLocus._creatTimeOverlays()
          }
          luLocus.arrowsLayer.getSource().clear()
          luLocus.createArrows()
        })
      } else {
        for (let o = 0; o < luLocus._timeOverlayList.length; o++) {
          map.removeOverlay(luLocus._timeOverlayList[o])
        }
        luLocus._pathInfo = vacuatePaths
        luLocus._vacuatePath = vacuatePaths
        luLocus._wholePathInfo = paths
        luLocus._initLinesAndMarkers()
        if (labelShow) {
          luLocus._creatTimeOverlays()
        }
        luLocus.arrowsLayer.getSource().clear()
        luLocus.createArrows()
      }
    }
  })

  return luLocus
}

export default PathSimplifier
