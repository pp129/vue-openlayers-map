import { Fill, Icon, Stroke, Style, Text } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import VectorLayer from 'ol/layer/Vector'
import Vector from 'ol/source/Vector'
import * as olLoadingstrategy from 'ol/loadingstrategy'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { Group } from 'ol/layer'
import simplify from 'simplify-js'
import { fromLonLat, toLonLat } from 'ol/proj'
import { containsCoordinate } from 'ol/extent'
import AvoidanceLayer from '@/utils/avoidance'
// import { getVectorContext } from 'ol/render'
import { unByKey } from 'ol/Observable'
import { lineSliceAlong } from '@turf/turf'

export default class vzPath {
  _operators
  _carIcon
  _direction
  _map
  _status
  _pathInfo
  _bubble
  _moving
  _tracePointsModePlay
  _lineLayer
  // 播放进度路径信息
  _movePath
  // 展示轨迹信息路径
  _originPath
  // 展示路径优化结果 - simplifyjs
  //  _beforeSimplify: Geometry | null
  _revealLayer
  _showTracePoint
  _nodesLayer
  _moveNodes
  // 节点播放动画间隔时间，单位秒
  _timeStep
  _speed
  _speedUp
  _nowTime
  _moveIdx
  _animateLayer
  _animateLine
  _group
  // 轨迹回放事件监听处理
  _tracekEvent
  // 视图信息监听简化数据展示
  _simplifyEvent
  _eventType
  _animateStart
  _textLayer
  _moveListener
  _step
  _viewCode // 初始化时设置对应初始化投影
  // 默认内容样式设置
  _defaultStyles
  _nodesCollection
  // 默认排序数据设置
  _nodeInfos
  constructor (options) {
    options = options || {}

    const bubble = options.bubble !== undefined ? options.bubble : false // 事件触发是否穿透
    const showTracePoint = options.showTracePoint
      ? options.showTracePoint
      : false
    const tracePointsModePlay = options.tracePointsModePlay
      ? options.tracePointsModePlay
      : 'animation'
    const mapObj = options.mapObj !== undefined ? options.mapObj : null

    const path = options.path !== undefined ? options.path : []
    const pathOpts = options.options || {}
    // 对象创建时间
    const vzTime = Date.now()

    if (!options.path || options.path.length < 1) {
      console.warn('未进行线路信息的设置！')
      // return;
    }

    // 默认值动作设置
    this._operators = {
      carIcon:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAVCAYAAADfLRcdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ0RkExMTQ2Rjc4NzExRTQ4QkI3QTA2OTk3QzQ4M0IzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ0RkExMTQ3Rjc4NzExRTQ4QkI3QTA2OTk3QzQ4M0IzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDRGQTExNDRGNzg3MTFFNDhCQjdBMDY5OTdDNDgzQjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDRGQTExNDVGNzg3MTFFNDhCQjdBMDY5OTdDNDgzQjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz62sMp6AAAFiklEQVR42tRXW2wUVRj+zpmZvc4uS2mhhQK21FLshoKGWkBMSAwQSVBf0QfiJciDLya+8KAx8RJfeJV440GJaDAmGGKUmAASI+GhDQ1a7t1Kb1tot7s7uzvX4z8zC+12bdHVkDjJn5md/c853/nO918GeEDXkfe2f5+9+KzxxeuQap2D/RPn5BO7Aowxns/n9Ju958Q8PjL5yIxz4+KZk86spRLG5Y1T/Zfbf31sz7HN/xqsuIo4THwgStgr8lBtDcwxwQxa0rKB4WkFBcOGpgNSwIFusYoJjv0ATOQYdm9lWBQX4Iz2I8iDxhsGMDSm4mx/FJ3LR/HWi4ASokEmmeYj4UG6K/Tock9jSjxRjG/PRCrADn4SHVi8ttTOGM0sHAguIRKyCSlgF4HsOPDxKY7T4zvQ3NqFYmYSsbp6BEKhe0Bt08LR41/CsSzse34fZEWBbdPGtCxKWhoxeQiNketIhHOYyEgYGAqgc/UU3n5VgbA5iBQyAccWYLKCYLOCnLmLNrhNJHte5h7Ys/ubIlsPjGp3F/3tViOefEVCOCJjSYKjqZ6jdTnwdI+Fp5IppCaAvmsKxiZlondGCYQLJ34S2Ngp0LMBqFMFHmmxUb+U4+DhNpz4WYIlhWgTAWKIAHGOyVQKR98dx45uYoXTKZGRA/S0BT1n+6cd74G8qNlRO76WmNXLHI/R8nXom7U4eqENJdNAUSczdJR0HW/s1HDwhavehMIDx2BbtChj4Ip7hvDeuyYp7pHSe9l//8yBNTh/MwhOALnrf/fu2GhWBnDms+IMWMk1eOM8IxVYsV2QMl9F+Wyg7tV3hTxZZdw5BHZLlzEjdJpEJn0FVeaZEvYtEPF/yyECMivm9+6hDdoOLJKKSTIxPLNh0USXLnN6XiCqluiQE9Ok5dXTfO5/wxN2lb9D7LYtz9ectjat1wioQSdhklmkTdN7NuguB6O4cInhdobPM9oNnAFg1UtSlUc2J+5FuEuw+yyIBTVUqBnsyiYNsUiUpOOza7msEmg3KCUKxOvDAvUJZ/4JBKUlnmdVYHXzL9KnEEioVs1gFbmIjofbEVdjPleOQ8zaHruCIIxO3C/du/nNgDz3tUWpIzAnATNKZ6SFKi3/7UuYXgA9vqkbBun/xuAgbo0OwyESbLKcJhauT+765FIFVuaiapi7e/CAv2hNpUchEhxkclliWcGa1lY82rXBA/Hdt8cxli5XgXnHc28vVWCDgWqhu+kpk5eRiNYG1rTCsOjohRtYrgQoZVmZKciyjKYlDejZOHyfyk+5kM67CllcZeWBvrlAGU2aL0Vq1uwfo1EPbIlqrmGY0F0z3WfK41oOHQ8tlA1cGFE6BFVUeaxcVj2IB4O4NqLWDPb8RZU2WyKAZZBkJQJsUoAVs5Po7lwoGxAeaR01Fp/aXAhWEf5d7Y4X/XPBnusLVOjdomZGzwvPzKJvRsH/bZXcGj8z/sPjEeSKBWJU98B6DNN9enwMmzflEJDn32hxiMOciJKWUovkXw43qrN7g53dWbx/pB/hsIS6ONBRz9DSBGxoc+u1QCot0HtNxshtmbojp6I3OHmaoWudg571lOpiDpKtDhoaOVqWljB+I0xlWYFpu5o1vPSlpdM49OYcRnkchdQUrHLBVBq2UOgpDu9Cwe+6Dsf765Jap9fPubRJ1MgEK7uuj04xfN6XBFOXUe9WBAuGPS3fY5vQ3kmPeRVq6YqVVG4l74Qc26Tw0NCcyCC54g4a4yZ+H4njythibGm5gndeo+ChVtM2yl0XrRmKUC1vYDD4Hmjmc6Ju1W5eUz+rUT9bmK+f/ZH62eycfrbsQRL1+9le6mebqZ/dT6xF3XMmm/KlyWNelvMbGPK3pfpieNvtyP/yS+GBXf/FN9ifAgwAIOzB+qcKmLcAAAAASUVORK5CYII=',
      speed: 1000,
      timeStep: 1,
      startIcon:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADb0lEQVRYR8WWW4jcZBzFz8lukn1Si5fOjKK20NmEKtoFL+C1IBX0RQQFQeoiIipeHnxQCioURPBJhQo+yFJFEfRFKIKIN1wKFZGqtJPZbgtFTWa7i1LFy+bbyZHsztJ1MpkkI9I85vufc375/798CXGWL57lfFQDENgw/g4Qt0loQroE5CKl410r+WphPJkF55erPFQ5AMFuGO8RiU+TuCwvQNAioWdDuz0DQmVACgE2aeu5E8Y9QODGMoZpjaSP6fx2d8jwzyLNcADBrht/lsC1RUYD1g//ZS/f+itPnB6mHQpQj71XCT45QnhPooOhHdwEIsnzyAXYrMktluExgmODxJIiED8D2JFXszaO5P7Ibb9TGaAee28QfLhfKGhJ1L0du/15ura2R+xpgHsJnpMJkuZCN5isBiCMNYy/mPr3CeNEnOq4R4/0G9bi5jWEdYhgpquJzPaOO390EMTAEVwgr+kYtrMC7Qud4PG8p6nH3rsE7+tfT5A82HHaM6UB6sa/mcKX2fZjd+S03s4DqMXetAVmgkTtiezgpdIANTO505L12QDBQ6HTejMfwN9tAfsz4FUBGtp6KYx7csAI3gudINPi9bpa7L1mgU9kRmDhzs5466PSHUgLG8v+HIhtG0WC1JWuPuW2v+836+2bHwA4/9bAJPYvmxa48EclgLrx9lB8cUAXTgt6/m/b7F8/5WrGu4XC+wQvzLRf+DByW3dVew0BXKQtm8fMxE8ExgceRFAXwGEIDZL1vIAE3es6ztzXlQFWxxB7MwCn88RF9wV9EjnBrmF1Q78F6WaUcU4MO2qHmXexcv2Cc+zQyABrXfD3AXis6Gmzs9cHkRvcU6Qr/B+4WN75MpwHcF6R2Zl1LcM220Ie/7FIUwiQGtTiyUctWK8Xma2vJ9QLHTvYW6a+FAAE1o33DcGpQlOpHTrBFSBWCmuB8j+ljdifEpRCDIVOqJ0dO/iiTHhaU64DPbd67L9C4Kk8c0FvRU7wQNnwygDQ5RONeOI7kM0BJ95J4yRXLrH9+/8HkJ6QcfOqMVjfErQ2Bq1QN5yyg4NVwqt3oOdeM/5zlnBmlwsvh27rmarhIwOsvhWxf4DEHQA+De3W7SDSb0Plq9Im3Oi+9jPqzBqbu5bYiion9wQjA6zqtd0Bj8Sjho8+gv+S2Kf9B1+VRDBEEbAnAAAAAElFTkSuQmCC',
      endIcon:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADdElEQVRYR8WWXYjcVBiG3zfJGb1oq4todXZnVOpsMlbRLtQK1p+CVNAbERQEqUVEVPy58EIpqFAQwasqVOhFWdrSIuiNUAQR/3ApVIr0hzozu93KJtktsgWRxeLmJPlKho52JzOTZIo2t+d7v/c5b76cHOIqP7zK/igEIADPlNWGyJBHQY4DHANlUcBZI4p/MubDqRqwXGRTuQAEUM0x9TIMvkXg1r4GIosA3rE9PUlA8oBkAsyO4Dq9Sh0GuTlPw3aN4Os1UfBUeQEXsjQDAZKdtypqCuR9WY3S63JcLelH1v2BPwdpBwI0q+pjgG8UN+8o5Ijt6gcJxP169AVorsXtKKkZkGYvsQDnKDIPYEO/mrYuxnOOHxwsDNCoqj0EX0oJRc4jlmec+fD7ZK09I6vVdgA7Aa7prhfBdN0L7EIAApjNqlokOHK5UCCBBU7U3OB0d8NWRW0U4CjIVKomsL7mBr/2guj5ChqjGKdZaqV3I7vrnn6t324aFXWI5LM9UnvB8fRkboDpivVQTOPHbgEh22xXHxgAsJ1kykgQ76i74Ye5AZqj1haYxncpQSwvOr7e2w+gVVXbBNyXSq4owGwZVW2V5nq8gs/qnk5HfKmwVVWfCPh6Krk4esL2o69yJ5AUNiqlaRK1FSIRgfBexw9OdjdL5gamOkWw1DW4emRZj9z8O/4qCGDtII0P0iJJTrb31JLe1znlZsashyPyc5A3pgcQXzpe8GShzzApPnsT1i5fo3ySVk+xSCTEcYBlArf0NYhlk+3rnwsDJIJWRU0KmRwyQz0i8k3d01sHiQf+C9rDaKqzA4/aAd2NWO4f9/XRoQESYbOidoN8dYgIvnDc4OksXeZ9oDGKG2iqMwCvz2r277osW6Gu3bEAL0uTCXAphVdAfprVrLPOOH7f9sOdeepzASR3wWZVHSM4kaNpy3aDuwiEOWrzX0pnymoiMnGs199uxcETx1vqfvhDHvOkJlcCnWbNMbULBt/s11xE9tc9/Xxe88IAv92Ga/+OSidIjHebCDDHC8Hdznks/WcA7cNpVN0jBn4BaayIPowfqC+ER4qYF07gn1dRsd4Fjcun/CPHDd4uaj40QPJVtKqlwwAeB+Rb29WPEYj+N4DEKLmMBqvUlBh6651zODeM+dAJdMxOA6X1QDCs+RUDXIlxR3sRcjswMD6XvKYAAAAASUVORK5CYII=',
      showInfoWin: false,
      arrowPixel: 0.2,
      textStyle: {}
    }

    // 默认值设置
    for (const key of Object.keys(this._operators)) {
      pathOpts[key] && (this._operators[key] = pathOpts[key])
    }

    // ol默认样式
    const defaultFill = new Fill({
      color: 'rgba(255,255,255,0.4)'
    })
    const defaultStroke = new Stroke({
      color: '#3399CC',
      width: 1.25
    })
    this._defaultStyles = [
      new Style({
        image: new CircleStyle({
          fill: defaultFill,
          stroke: defaultStroke,
          radius: 5
        }),
        fill: defaultFill,
        stroke: defaultStroke
      })
    ]
    this._nodesCollection = null
    this._nodeInfos = []

    // 车辆动画图标
    const imageLoad = new Icon({
      src: this._operators.carIcon,
      scale: 1.0,
      // snapToPixel: false,
      anchor: [0.5, 0.5],
      offset: [0, 0]
    })
    imageLoad.load()
    this._carIcon = new Style({
      image: imageLoad
    })
    this._direction = 0

    // 容器对象
    mapObj && (this._map = mapObj)
    // 投影定义
    this._viewCode = this._map?.getView().getProjection().getCode()
    // 对象状态内容记录
    this._status = 'stop'
    // 轨迹点集合
    this._pathInfo = path
    this._bubble = bubble
    // 点集合抽稀结果
    // this._vacuatePath = vacuatePath;
    this._moving = false
    // 轨迹动画播放模式
    this._tracePointsModePlay = tracePointsModePlay

    // 轨迹线【展示用】
    this._lineLayer = new VectorLayer({
      source: new Vector({
        features: [],
        // 减少加载量的方式优于加载策略的使用，量级过千需要使用
        strategy: olLoadingstrategy.bbox
      }),
      properties: {
        vzBelong: 'vzTrackPath',
        vzTime
      }
      // renderMode: 'image'
    })
    this._lineLayer.set('projection', this._viewCode, true)
    this._lineLayer.set('track-type', 'trackPath')
    // 交互数据获取内容
    this._movePath = []
    // 地理线段对象
    this._originPath = null
    // this._beforeSimplify = null;

    // 起终点显示
    this._revealLayer = new VectorLayer({
      source: new Vector({
        features: [],
        // 减少加载量的方式优于加载策略的使用，量级过千需要使用
        strategy: olLoadingstrategy.bbox
      }),
      properties: {
        vzBelong: 'vzTrackPath',
        vzTime
      }
    })
    this._revealLayer.set('projection', this._viewCode, true)
    this._revealLayer.set('track-type', 'trackReveal')

    // 是否显示轨迹点
    this._showTracePoint = showTracePoint
    // 轨迹点图层 【展示、交互】
    this._nodesLayer = new VectorLayer({
      source: new Vector({
        features: [],
        // overlaps: false,
        // 减少加载量的方式优于加载策略的使用，量级过千需要使用
        strategy: olLoadingstrategy.bbox
      }),
      // 方便设置单独feature的样式内容
      style: null,
      properties: {
        vzBelong: 'vzTrackPath',
        vzTime
      }
    })
    this._nodesLayer.set('projection', this._viewCode, true)
    this._nodesLayer.set('track-type', 'trackNodes')
    this._nodesLayer.setVisible(this._showTracePoint)
    // this._nodesLayer.setOpacity(0)
    // 交互数据获取内容
    this._moveNodes = []

    // 运动速度
    this._speed = this._operators.speed
    // 点播放动画运动间隔
    this._timeStep = this._operators.timeStep
    // 加速倍数
    this._speedUp = 1
    // 运动动画开始时间
    this._nowTime = null
    // 动画运动索引信息
    this._moveIdx = 1
    // 动画车辆-通过线
    this._animateLayer = new VectorLayer({
      source: new Vector({
        features: [],
        // 减少加载量的方式优于加载策略的使用，量级过千需要使用
        strategy: olLoadingstrategy.bbox
      }),
      style: new Style({
        stroke: new Stroke({
          color: 'red', // '#ec0404',
          width: 2
        })
      }),
      properties: {
        vzBelong: 'vzTrackPath',
        vzTime
      }
    })
    this._animateLayer.set('projection', this._viewCode, true)
    this._animateLayer.set('track-type', 'trackAnimate')
    this._animateLine = new Feature({
      geometry: new LineString([])
    })

    // 图层组控制对象
    this._group = new Group({
      layers: [
        this._lineLayer,
        this._revealLayer,
        this._nodesLayer,
        this._animateLayer
      ],
      zIndex: 99,
      properties: {
        type: 'vzTrackPath',
        vzTime
      }
    })

    console.log(this._group)

    mapObj?.addLayer(this._group)
    // 监听内容控制 ['singleclick', 'pointermove']
    this._tracekEvent = mapObj?.on(['singleclick', 'pointermove'], (eve) => {
      this.eventListener(eve)
    })

    /**
     * 基础图层监听事件内容处理 - nodeClick/nodeMouseover/nodeMouseout || pathClick/pathMouseover/pathMouseout
     */

    // 触发声明内容 自定义监听
    this._eventType = [
      'nodeClick',
      'nodeMouseover',
      'nodeMouseout',
      'pathClick',
      'pathMouseover',
      'pathMouseout',
      'move'
    ]

    // 试用simplify进行线型数据的简化
    this._simplifyEvent = mapObj?.getView().on('change:resolution', (eve) => {
      Number.isInteger(eve.target.getZoom()) && this.simplifyOpera(eve)
    })
    // 执行初始化
    this.initLinesAndMarkers()
  }

  /**
   *
   * @param eve 监听事件 ObjectEvent
   */
  simplifyOpera (eve) {
    /**
     * points [Array]
     * An array of points of {x: Number, y: Number} format.
     * Configurability of point format would draw a significant performance overhead, so if you use a different format, e.g.
     * [Number, Number], just run search/replace of .x and .y through the source of the library to suite it to your application.
     * For a version that works with 3D points, check out the 3d branch.
     *
     * tolerance [Number] (optional, 1 by default)
     * Affects the amount of simplification (in the same metric as the point coordinates).
     *
     * highQuality [Boolean] (optional, false by default)
     * Excludes distance-based preprocessing step which leads to highest quality simplification but runs ~10-20 times slower.
     */
    let path = []
    // let passPath: any[] = [];
    const code = eve.target.getProjection().getCode()

    const isTransfer = this._viewCode !== code
    const resolution = eve.target.getResolution()

    // 节点数据情况
    path = this._nodesCollection.map((item) => {
      if (isTransfer && item.get('isSimplify') === false) {
        const setting = item.getGeometry()?.transform(this._viewCode, code)
        setting instanceof Point && item.setGeometry(setting)
      }
      const coord = item.getGeometry().getCoordinates()
      return { x: coord[0] / resolution, y: coord[1] / resolution, idx: item.get('node_idx') }
    })
    // 同步投影信息
    isTransfer && (this._viewCode = code)

    // 简化控制参数暂定2
    const res = simplify(path, 2, false)
    const reShape = []
    const reNode = []
    res.forEach((item) => {
      reShape.push([item.x * resolution, item.y * resolution])
      reNode.push(item.idx)
    })

    // 5w以上数据量重新绘制的性能下载，还是需要进行数据的simplify
    this._originPath instanceof LineString && this._originPath.setCoordinates(reShape)
    // this._animateLine instanceof LineString && this._animateLine.setCoordinates(reShape2);

    // 通过线信息内容补充
    // if (this._tracePointsModePlay === 'skip' && this._originPath instanceof LineString) {
    //   this._animateLine.getGeometry()?.setCoordinates(reShape.slice(0, this._moveIdx));
    // } else
    if (!this._moving && this._status !== 'moving' && this._moveListener !== null && this._tracePointsModePlay === 'animation' && this._originPath instanceof LineString) {
      this._animateLine.getGeometry()?.setCoordinates(reShape.slice(0, reNode.indexOf(this._moveIdx) + 1).concat([this._animateStart.getGeometry().getCoordinates()]))
    }

    // 节点展示图层信息处理 - 异步
    this._nodesLayer.getSource()?.clear()
    const renderPromise = new Promise((resolve, reject) => {
      this._nodeInfos = []
      this._nodesLayer.getVisible() && this._nodesCollection?.forEach((ele, idx) => {
        // const geo = ele.getGeometry();
        ele.set('isSimplify', false)
        // @ts-ignore 样式内容重置
        ele.setStyle(null)
        // 判断范围数据 && geo instanceof Point && containsCoordinate(extent, geo.getCoordinates())
        if (reNode.includes(idx + 1)) {
          ele.set('isSimplify', true)
          ele.setStyle(this._defaultStyles)
          this._nodeInfos.push(ele)
        }
      })
      resolve(this._nodeInfos)
    })
    // 结束后进行数据的渲染
    renderPromise.then((res) => {
      // addFeature后会对数据进行重排序，getfeatures时无法获取原顺序
      this._nodesLayer.getSource()?.addFeatures(res)
    })
  }

  /**
   * 图层事件监听信息内容
   * @param mbEvent
   */
  eventListener (mbEvent) {
    // mapBrowerEvent  this为layer对象

    // 轨迹点事件监听处理
    const hasFlag = this._map?.hasFeatureAtPixel(mbEvent.pixel, {
      layerFilter: function (layer) {
        return (
          layer instanceof VectorLayer &&
            (layer.get('track-type') === 'trackPath' ||
                layer.get('track-type') === 'trackNodes')
        )
      },
      hitTolerance: 0
    })
    if (hasFlag) {
      // 设置数据数组，触发moveover/nodeClick
      this._moveNodes =
          this._map?.getFeaturesAtPixel(mbEvent.pixel, {
            layerFilter: function (layer) {
              return (
                layer instanceof VectorLayer &&
                  layer.get('track-type') === 'trackNodes'
              )
            },
            hitTolerance: 0
          }) || []

      this._movePath =
          this._map?.getFeaturesAtPixel(mbEvent.pixel, {
            layerFilter: function (layer) {
              return (
                layer instanceof VectorLayer &&
                  layer.get('track-type') === 'trackPath'
              )
            },
            hitTolerance: 0
          }) || []

      // 点集合信息
      const infos = this._moveNodes.map((item) => {
        return item.getProperties()
      })

      // 线集合信息
      const poatInfos = this._movePath.map((item) => {
        return item
      })

      // 点击获取到要素设置的属性
      switch (mbEvent.type) {
        case 'singleclick':
          // 节点点击
          infos.length >= 1 && this._map?.dispatchEvent({
            type: 'nodeClick',
            target: this._bubble ? [infos[0]] : infos,
            propagationStopped: false,
            defaultPrevented: false,
            preventDefault: function () {
              throw new Error('Function not implemented.')
            },
            stopPropagation: function () {
              throw new Error('Function not implemented.')
            }
          })

          // {
          //   type: 'nodeClick',
          //   // @ts-ignore
          //   feature: this._bubble ? [infos[0]] : infos,
          // }

          // 轨迹点击
          poatInfos.length >= 1 && this._map?.dispatchEvent({
            type: 'pathClick',
            target: this._bubble ? [poatInfos[0]] : poatInfos,
            propagationStopped: false,
            defaultPrevented: false,
            preventDefault: function () {
              throw new Error('Function not implemented.')
            },
            stopPropagation: function () {
              throw new Error('Function not implemented.')
            }
          })
          // {
          //   type: 'pathClick',
          //   // @ts-ignore
          //   feature: this._bubble ? [poatInfos[0]] : poatInfos,
          // }
          break
        case 'pointermove':
          // 触发nodeMouseover
          infos.length >= 1 && this._map?.dispatchEvent({
            type: 'nodeMouseover',
            target: this._bubble ? [infos[0]] : infos,
            propagationStopped: false,
            defaultPrevented: false,
            preventDefault: function () {
              throw new Error('Function not implemented.')
            },
            stopPropagation: function () {
              throw new Error('Function not implemented.')
            }
          })

          // {
          //   type: 'nodeMouseover',
          //   // @ts-ignore
          //   feature: this._bubble ? [infos[0]] : infos,
          // }
          // 触发pathMouseover
          poatInfos.length >= 1 && this._map?.dispatchEvent({
            type: 'pathMouseover',
            target: this._bubble ? [poatInfos[0]] : poatInfos,
            propagationStopped: false,
            defaultPrevented: false,
            preventDefault: function () {
              throw new Error('Function not implemented.')
            },
            stopPropagation: function () {
              throw new Error('Function not implemented.')
            }
          })
          // {
          //   type: 'pathMouseover',
          //   // @ts-ignore
          //   feature: this._bubble ? [poatInfos[0]] : poatInfos,
          // }
          break
      }
    } else {
      // 节点数据处理
      const infos = this._moveNodes.map((item) => {
        return item.getProperties()
      })
      // 清空数据数组，触发moveout
      this._moveNodes.length > 0 &&
      this._moveNodes.splice(0, this._moveNodes.length)
      // console.log(mbEvent.type + ':node要素配置', moveNodes)

      mbEvent.type === 'pointermove' &&
      infos.length > 0 && this._map?.dispatchEvent({
        type: 'nodeMouseout',
        target: this._bubble ? [infos[0]] : infos,
        propagationStopped: false,
        defaultPrevented: false,
        preventDefault: function () {
          throw new Error('Function not implemented.')
        },
        stopPropagation: function () {
          throw new Error('Function not implemented.')
        }
      })

      // {
      //   type: 'nodeMouseout',
      //   // @ts-ignore
      //   outFeature: this._bubble ? [infos[0]] : infos,
      // }
      // 轨迹线数据处理
      const poatInfos = this._movePath.map((item) => {
        return item
      })
      // 清空数据数组，触发moveout
      this._movePath.length > 0 &&
      this._movePath.splice(0, this._movePath.length)

      mbEvent.type === 'pointermove' &&
      poatInfos.length > 0 && this._map?.dispatchEvent({
        type: 'pathMouseout',
        target: this._bubble ? [poatInfos[0]] : poatInfos,
        propagationStopped: false,
        defaultPrevented: false,
        preventDefault: function () {
          throw new Error('Function not implemented.')
        },
        stopPropagation: function () {
          throw new Error('Function not implemented.')
        }
      })
    }
  }

  initLinesAndMarkers () {
    // 数据格式转换
    const path = this._pathInfo?.map((item) => {
      return [item.longitude, item.latitude]
    })

    const basePaths = []
    // 分段拆解渲染
    const nodes = []
    let nodeIndex = 0
    // const idx = 0
    for (const poi of path) {
      // 轨迹点数据
      const node = new Feature({
        geometry: new Point(fromLonLat(poi, this._viewCode))
      })
      let nodeItem = null
      this._pathInfo && (nodeItem = this._pathInfo[nodeIndex])
      if (nodeItem) {
        nodeItem.node_idx = nodeIndex + 1
        nodeItem.isSimplify = false
        node.setProperties(nodeItem, true)
        node.setId('tackNode-' + nodeItem.node_idx)
      }

      // 起终点样式内容设置
      if (nodeIndex === 0) {
        const start = node.clone()
        this._animateStart = node.clone()
        this._animateStart.setId('moveCarFeature')
        start.setStyle(
          new Style({
            image: new Icon({
              src: this._operators.startIcon,
              // scale: scale ? scale: 1.0,
              anchor: [0.5, 1]
              // offset: offset ? offset: [0, 0],
            }),
            text: new Text({
              text: ''
            })
          })
        )
        this._revealLayer.getSource()?.addFeature(start)
      } else if (this._pathInfo && nodeIndex === this._pathInfo.length - 1) {
        const end = node.clone()
        end.setStyle(
          new Style({
            image: new Icon({
              src: this._operators.endIcon,
              // scale: scale ? scale: 1.0,
              anchor: [0.5, 1]
              // offset: offset ? offset: [0, 0],
            }),
            text: new Text({
              text: ''
            })
          })
        )
        this._revealLayer.getSource()?.addFeature(end)
      }
      nodes.push(node)
      nodeIndex++
      // if (idx < path.length) {
      //   // 轨迹线数据
      //   const basePath = new ol.Feature({
      //     geometry: new ol.geom.LineString(path.slice(idx - 1, idx + 100)),
      //   });
      //   basePath.setStyle(this.lineStyles);
      //   basePaths.push(basePath);
      //   idx += 100;
      // }
    }

    // 整体内容渲染
    const originGeo = new LineString(path)
    this._originPath = originGeo.transform('EPSG:4326', this._viewCode)
    // this._beforeSimplify = this._originPath.clone();
    const arrowPath = new Feature({
      geometry: this._originPath
    })
    const arrowStyle = new Style({
      image: new Icon({
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABfUlEQVQ4T3WTTSvFYRDFf8dLKIqytFckthTpJkQWlyhF2fgEVr6BheytpChEsqB08xbZWPgOJAs7ieRlNMzV//75P7vnmZkz58ycR2ZWD7QBF5KM1DGzTuBO0k065neZ2S3QBGwAU5I+iolmNgrsAI9An6SrNIgDnAE9EdgFJiS9+93MuoEToBx4AgYkXSZBHKAWOAS6IrAP5CW9BUge2AIqgJdg8guiSKoBDoDeDJBhwNlVBsiQpNPvGST0VgF7TjPeCsCIpNdo0g84O2fibx4r/AJEUjVwlJDjXbybU/eZjAGbMROXmC8BiKQ64BxoDyYLkuYTTCeB9WD/9B9AA3AMdGQAzALLAfCcluDF3r01itMS5oDFiP3MIUHNi90T7ko/XjyYGOIMsFJSXByimTVGQbFzegOuew0o+7PGKL4AmjM8MA2shua/RjIzX1suw8pucZfiUjOt/AC4BHfaeOoz+d63oziX9Zla3CzAkqTP9G8zM4/dS7r+7zt/Aaattn1kX8VgAAAAAElFTkSuQmCC',
        anchor: [0.75, 0.5],
        scale: 0.7,
        rotateWithView: false
      })
    })
    arrowPath.set('arrow', [
      new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 0.6)',
          width: 10
        })
      }),
      arrowStyle
    ])
    arrowPath.set('mainView', this._map?.getView())
    // arrowPath.setStyle(lineRbush);
    arrowPath.setStyle(lineStyles)
    //   basePaths = [arrowPath].concat(basePaths);
    basePaths.push(arrowPath)

    // 起终点
    this._lineLayer.getSource()?.addFeatures(basePaths)
    // this._nodesLayer.getSource()?.addFeatures(nodes);
    this._nodesCollection = nodes
    // 动画线数据添加
    this._animateLayer.getSource()?.addFeature(this._animateLine)

    // 进行展示优化
    arrowPath.get('mainView') !== undefined && arrowPath.get('mainView').dispatchEvent('change:resolution')
  }

  labelVisible (flag) {
    if (flag && this._textLayer === 0) {
      // 文字标注信息设置
      const pathText = this._pathInfo?.map((item) => {
        return {
          position: [item.longitude, item.latitude],
          text: item.gnssTime
        }
      })
      this._textLayer = new AvoidanceLayer({
        map: this._map,
        pointsArr: pathText,
        zoom: 12
      })
      this._textLayer.set('id', 'lushuText' + new Date().getTime())
      // this._map?.addLayer(this._textLayer);
      this._group.getLayers().push(this._textLayer)
    } else {
      this._textLayer?.setVisible(flag)
    }
  }

  start (moveIdx) {
    console.log('start')
    if (this._pathInfo && this._pathInfo.length < 1) {
      return
    }
    // 默认清除进行重新播放
    (this._moving || (this._status === 'pause')) && this.stop()

    this._moveIdx = moveIdx || 1
    this._moving = true
    this._status = 'moving'
    this._nowTime = Date.now()

    // 重新进行数据的解绑
    // this._moveListener && (unByKey(this._moveListener), this._animateLayer.getSource()?.clear());

    // 轨迹点模式和轨迹时间模式
    if (this._tracePointsModePlay === 'skip') {
      // 接口触发事件内容修改为postrender
      this._moveListener = this._lineLayer.on('postrender', (eve) => {
        // 依据道路节点进行动画
        this.tracePointsPlay(eve)
      })
      this._map?.render()
    } else if (this._tracePointsModePlay === 'animation') {
      this._step = 0
      // 接口触发事件内容修改为postrender
      this._moveListener = this._lineLayer.on('postrender', (eve) => {
        // 根据路径运动长度进行动画
        this.animationPlay(eve)
      })
      this._map?.render()
    }
  }

  stop (ended) {
    this._moveIdx = 1
    this._status = 'stop'
    this._moving = false
    this._step = 0
    if (this._moveListener !== null) {
      // 解除事件的监听 remove listener
      unByKey(this._moveListener)
      // 信息内容重置
      this._moveListener = null
    }
    // 数据清除
    const car = this._animateLayer.getSource()?.getFeatureById('moveCarFeature')
    car && this._animateLayer.getSource()?.removeFeature(car)
    this._animateLine.getGeometry()?.setCoordinates([])
    this._originPath instanceof LineString && this._animateStart.getGeometry()?.setCoordinates(this._originPath.getFirstCoordinate())
  }

  pause () {
    this._status = 'pause'
    this._moving = false
    // 设置图标展示内容
    // this._animateStart.setStyle(this._carIcon);
    // const car = this._animateLayer.getSource()?.getFeatureById('moveCarFeature')
    // car ? car.setGeometry(this._animateStart.getGeometry()) : this._animateLayer.getSource()?.addFeature(this._animateStart);
  }

  resume () {
    this._status = 'moving'
    this._moving = true
  }

  /**
   * 按节点内容进行动画播放
   * @param event
   * @returns
   */
  tracePointsPlay (event) {
    // 接口内容变化，map不触发获取改内容
    // const vectorContext = getVectorContext(event); // event.vectorContext;
    const frameState = event.frameState

    const path = this._nodesCollection.map((item) => {
      return item.getGeometry().getCoordinates()
    })
    // this._originPath instanceof LineString ? this._originPath?.getCoordinates() : [];
    const passTime = ((frameState.time - this._nowTime) / 1000) % 60 // 间隔秒,最小到小数据后三位  Math.floor
    if (this._moving && (this._moveIdx === 1 || passTime >= this._timeStep)) {
      this._nowTime = frameState.time
      // const elapsedTime = this._nowTime ? frameState.time - this._nowTime : frameState.time;
      // const index = Math.round((this._speed * elapsedTime) / 1000) * this._speedUp;
      let index = this._moveIdx === 1 ? this._speedUp : this._moveIdx + this._speedUp
      let feature = null
      const PASS_LINE = this._animateLine.getGeometry()

      // 结束进行操作
      if (path && this._moveIdx === path.length) {
        this.stop(true)
        return
      }

      if (index >= path.length && this._moveIdx < path.length) {
        // 结束点位信息进行处理补充
        index = path.length

        let currentPoint = null
        // 线数据已进行转换，此处无需再做处理
        path && (currentPoint = new Feature(new Point(path[index - 1])))
        feature = currentPoint

        // 旋转角度设置
        const dx = path[index - 1][0] - path[index - 2][0]
        const dy = path[index - 1][1] - path[index - 2][1]
        const rotation = Math.atan2(dy, dx)
        this._direction !== rotation && (this._direction = rotation)
        this._carIcon.getImage().setRotation(-this._direction + 2 * Math.PI)

        // 节点信息补充，speedup变化时
        for (let i = (path.length - this._moveIdx); i > 0; --i) {
          index !== 0 && (index - i) <= (path.length - 1) && PASS_LINE?.appendCoordinate(path[index - i])
        }
      } else if (index < path.length && this._moveIdx < path.length) {
        let currentPoint = null
        // 线数据已进行转换，此处无需再做处理
        path && (currentPoint = new Feature(new Point(path[index - 1])))
        feature = currentPoint

        // 旋转角度设置
        if (path && index !== path.length - 1) {
          const dx = path[index][0] - path[index - 1][0]
          const dy = path[index][1] - path[index - 1][1]
          const rotation = Math.atan2(dy, dx)
          this._direction !== rotation && (this._direction = rotation)
          this._carIcon.getImage().setRotation(-this._direction + 2 * Math.PI)
        }

        // 节点信息补充，speedup变化时
        for (let i = this._speedUp; i > 0; --i) {
          index !== 0 && (index - i) <= (path.length - 1) && PASS_LINE?.appendCoordinate(path[index - i])
        }
      }

      // vectorContext.setStyle(this._carIcon)
      // 增加时间间隔够不再进行context的绘制动作
      // feature !== null && vectorContext.drawFeature(feature, this._carIcon);
      // this._map.getView().fit(currentPoint)

      // 动画运动图标内容绘制
      this._animateStart.setStyle(this._carIcon)
      this._animateStart.getGeometry().setCoordinates(feature?.getGeometry()?.getCoordinates())
      // 图层内容定义添加
      const car = this._animateLayer.getSource()?.getFeatureById('moveCarFeature')
      // car ? void 0 : this._animateLayer.getSource()?.addFeature(this._animateStart);
      if (!car || car.length <= 0) {
        this._animateLayer.getSource()?.addFeature(this._animateStart)
      }

      this._moveIdx = index // this._nodeInfos[index].get('node_idx')

      // 避免运动监听动作影响，获取code出现不一致的情况
      const code = this._map?.getView().getProjection().getCode()
      // 事件内容触发
      const moveInfo = {
        index: this._moveIdx,
        // step: this._step,
        status: this._status,
        // speed: this._speed,
        // 动画实际点位置信息
        position: path[index - 1],
        lngLat: toLonLat(this._animateStart.getGeometry().getCoordinates(), code),
        passNode: this._nodesCollection[index - 1], // _nodeInfos
        // passLine: PASS_LINE,
        length: PASS_LINE?.getLength()
      }

      this._animateLayer.dispatchEvent({
        type: 'move',
        target: moveInfo,
        propagationStopped: false,
        defaultPrevented: false,
        preventDefault: function () {
          throw new Error('Function not implemented.')
        },
        stopPropagation: function () {
          throw new Error('Function not implemented.')
        }
      })
    }

    this._map?.render()
    // tell OpenLayers to continue the postcompose animation - 设置无效
    // setTimeout(() => {
    //   this._map?.render();
    // }, this._timeStep * 1000);
  }

  /**
   * 根据长度进行动画播放
   * @param event
   * @returns
   */
  animationPlay (event) {
    // 接口内容变化，map不触发获取改内容
    // const vectorContext = getVectorContext(event) // event.vectorContext;
    // console.log('animation');
    let appendLength = 0
    // 判断渲染帧问题，避免阻塞渲染
    // const passTime = event.frameState.time - this._nowTime
    this._nowTime = event.frameState.time
    // if (passTime >= 16.6) {
    //   return
    // }
    if (this._originPath instanceof LineString && this._moving && this._step !== undefined && this._step <= 1) {
      const originLength = this._originPath.getLength()
      const PASS_LINE = this._animateLine.getGeometry()

      const geoline = this._originPath.clone()
      geoline.transform(this._viewCode, 'EPSG:4326')
      if (geoline instanceof LineString && this._step !== 0) {
        // 使用geojson进行数据构造
        const geojson = {
          geometry: {
            coordinates: geoline.getCoordinates(),
            type: 'LineString'
          },
          properties: {},
          type: 'Feature'
        }
        appendLength = originLength * this._step
        const passCoord = lineSliceAlong(geojson, 0, appendLength / 1000, { units: 'kilometers' })
        // 进行投影信息的转换
        geoline.setCoordinates(passCoord.geometry.coordinates)
        geoline.transform('EPSG:4326', this._viewCode)
        const lineCoords = geoline.getCoordinates()

        PASS_LINE?.setCoordinates(lineCoords)

        let dx = 0; let dy = 0
        if (lineCoords.length > 2) {
          const poi1 = lineCoords[lineCoords.length - 2]
          const poi2 = lineCoords[lineCoords.length - 1]
          dx = poi1[0] - poi2[0]
          dy = poi1[1] - poi2[1]
          const rotation = Math.atan2(dy, dx)
          this._direction !== rotation && (this._direction = rotation)
          this._carIcon.getImage().setRotation(-this._direction + Math.PI)
        }

        // 动画运动图标内容绘制
        this._animateStart.setStyle(this._carIcon)
        // console.log(geoline.getLastCoordinate())
        // console.log(this._animateStart)
        this._animateStart.getGeometry().setCoordinates(geoline.getLastCoordinate())
        // 图层内容定义添加
        const car = this._animateLayer.getSource()?.getFeatureById('moveCarFeature')
        if (!car || car.length <= 0) {
          this._animateLayer.getSource()?.addFeature(this._animateStart)
        }
        // car ? void 0 : this._animateLayer.getSource()?.addFeature(this._animateStart)
        // vectorContext.drawFeature(this._animateStart, this._carIcon);
      }

      const passLength = PASS_LINE?.getLength()
      let countIdx = 0; let countLen = 0
      const templine = new LineString([])
      // 获取当前运动节点
      this._originPath.forEachSegment(function (start, end) {
        // 计算长度
        templine.setCoordinates([start, end])
        if (countLen <= passLength) {
          countLen += templine.getLength()
          countIdx++
        }
      })
      // 索引为通过点的信息
      this._moveIdx = this._nodeInfos[countIdx - 1].get('node_idx')
      this._step += 5 * 1e-7 * this._speed

      // 避免运动监听动作影响，获取code出现不一致的情况
      const code = this._map?.getView().getProjection().getCode()
      // 事件信息回调
      const moveInfo = {
        index: this._moveIdx,
        // step: this._step,
        status: this._status,
        speed: this._speed,
        position: this._animateStart.getGeometry().getCoordinates(),
        lngLat: toLonLat(this._animateStart.getGeometry().getCoordinates(), code),
        passNode: this._nodesCollection[this._moveIdx - 1],
        // passLine: PASS_LINE,
        length: passLength
      }

      this._animateLayer.dispatchEvent({
        type: 'move',
        target: moveInfo,
        propagationStopped: false,
        defaultPrevented: false,
        preventDefault: function () {
          throw new Error('Function not implemented.')
        },
        stopPropagation: function () {
          throw new Error('Function not implemented.')
        }
      })
    }
    // 结束进行操作
    if (this._moving && this._step && this._step >= 1) {
      this.stop(true)
      return
    }
    // tell OpenLayers to continue the postcompose animation
    this._map?.render()
    // setTimeout(() => {
    //   this._map?.render();
    // }, this._speed * 1000 / 3600 / appendLength * 1000);
  }

  setFitView (flag) {
    // 是否需要对路线进行剧中显示
    this._originPath !== null && this._originPath instanceof LineString && flag && this._map?.getView().fit(this._originPath)
  }

  getPaths () {
    return this._pathInfo
  }

  setPaths (arr) {
    // 验证数据信息
    // const validate = arr.length > 0 ? arr[0] : {}
    // 清除原有数据
    this.clearPaths()
    this._pathInfo = arr
    this.initLinesAndMarkers()
  }

  clearPaths () {
    // 若处于动画种进行停止
    this._moving && this.stop()
    this._group.getLayersArray().forEach((element) => {
      element instanceof VectorLayer && element.getSource().clear()
    })
  }

  destroy () {
    // 若处于动画种进行停止
    this._moving && this.stop()
    // 清除数据
    this.clearPaths()
    // 清除其他监听
    unByKey(this._tracekEvent)
    // 存在投影变化的情况，去除影响内容监听
    this._map?.getView().removeEventListener('change:resolution', this._simplifyEvent.listener)
  }

  getSpeed () {
    return this._speed
  };

  setSpeed (num) {
    this._speed = num
  };

  getSpeedUp () {
    return this._speedUp
  };

  setSpeedUp (num) {
    this._speedUp = num
    this._speed = this._speed * num
  };

  getPercentnum () {
    return typeof this._step === 'number' ? this._step.toPrecision(3) : 0
  }

  setPercentnum (percent) {
    if (typeof percent === 'number' && percent <= 1 && percent >= 0) {
      this._step = percent
    }
  }

  /**
   *
   * @param opts 设置轨迹线内容样式
   */
  setTraceLineStyle (opts) {
    opts = opts || {}
    const lineColor = opts.lineColor ? opts.lineColor : 'rgba(0, 0, 255, 0.6)'
    const lineWidth = opts.lineWidth ? opts.lineWidth : 10

    const basePaths = this._lineLayer.getSource()?.getFeatures()
    basePaths?.forEach(ele => {
      const defaultStyle = ele.get('arrow')
      // 设置线内容样式
      defaultStyle[0].setStroke(new Stroke({
        color: lineColor,
        width: lineWidth
      }))
    })
    this._lineLayer.changed()
  }

  /**
   *
   * @param opts 设置通过线内容样式
   */
  setPassLineStyle (opts) {
    opts = opts || {}
    const lineColor = opts.lineColor ? opts.lineColor : 'red'
    const lineWidth = opts.lineWidth ? opts.lineWidth : 2

    const lineStyle = new Style({
      stroke: new Stroke({
        color: lineColor,
        width: lineWidth
      })
    })
    this._animateLayer.setStyle(lineStyle)
    this._animateLayer.changed()
  }

  /**
   *
   * @param opts 设置轨迹线内容样式
   */
  setTraceNodeStyle (opts) {
    opts = opts || {}
    const fillColor = opts.fillColor ? opts.fillColor : 'rgba(255,255,255,0.4)'
    const lineColor = opts.lineColor ? opts.lineColor : '#3399CC'
    const lineWidth = opts.lineWidth ? opts.lineWidth : 1.25
    const size = opts.size ? opts.size : 5

    const defaultFill = new Fill({
      color: fillColor
    })
    const defaultStroke = new Stroke({
      color: lineColor,
      width: lineWidth
    })
    this._defaultStyles = [
      new Style({
        image: new CircleStyle({
          fill: defaultFill,
          stroke: defaultStroke,
          radius: size
        }),
        fill: defaultFill,
        stroke: defaultStroke
      })
    ]
    // this._nodesLayer.changed();
    this._nodesLayer.getSource()?.getFeatures().forEach(ele => {
      ele.setStyle(this._defaultStyles)
      ele.changed()
    })
  }

  /**
   *
   * @param type
   * @param callback
   * @returns
   */
  on (type, callback) {
    const eventFlag = this._eventType.includes(type)
    if (eventFlag) {
      return type === 'move'
        ? this._animateLayer.on(type, callback) // apply
        : this._map?.on(type, callback) // apply
    }
  }

  /**
   *
   * @param type
   * @param callback
   * @returns
   */
  once (type, callback) {
    const eventFlag = this._eventType.includes(type)
    if (eventFlag) {
      return type === 'move'
        ? this._animateLayer.once(type, callback) // apply
        : this._map?.once(type, callback) // apply
    }
  }

  /**
   *
   * @param type
   * @param callback
   * @returns
   */
  un (type, callback) {
    const eventFlag = this._eventType.includes(type)
    if (eventFlag) {
      return type === 'move'
        ? this._animateLayer.un(type, callback) // apply
        : this._map?.un(type, callback) // apply
    }
  }
}
/**
 * 轨迹线的样式内容设置
 * @param feature 要素
 * @param resolution view的resolution数值
 * @returns
 */
function lineStyles (feature, resolution) {
  // 此处this为Feature line对象
  const defaultStyle = feature.get('arrow')
  const defaultView = feature.get('mainView')
  const styles = [defaultStyle[0]]
  const geometry = feature.getGeometry()
  if (geometry && geometry instanceof LineString) {
    const length = geometry.getLength() // 获取线段长度
    const radio = (200 * resolution) / length
    // const dradio = 1; //投影坐标系，如3857等，默认设置dradio=1，在EPSG:4326下可以设置dradio=10000，转换成米制

    for (let i = 0; i <= 1; i += radio) {
      const arrowLocation = geometry.getCoordinateAt(i)
      const containFlag = containsCoordinate(
        defaultView.calculateExtent(),
        arrowLocation
      )
      if (containFlag) {
        const dirPosition = geometry.getCoordinateAt(i + 0.00005)
        const dx = dirPosition[0] - arrowLocation[0] // floatObj.subtract(dirPosition[0], arrowLocation[0]); // base2[0] - base[0];
        const dy = dirPosition[1] - arrowLocation[1] // floatObj.subtract(dirPosition[1], arrowLocation[1]); // base2[1] - base[1];

        // 反三角函数计算耗时
        const rotation = Math.atan2(dy, dx)

        if (i !== 0) {
          const arrow = defaultStyle[1].clone()
          // 经过转换设置的点，不需要再做转换
          arrow.setGeometry(new Point(arrowLocation))
          arrow.getImage().setRotation(-rotation + 2 * Math.PI)
          styles.push(arrow)
        }
      }
    }
  }

  return styles
}
