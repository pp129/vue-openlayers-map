import ImageLayer from 'ol/layer/Image'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import Worker from '../utils/bd.worker.js?worker&inline'

/**
 * @openlayers叠加百度路况矢量瓦片
 */

function TrafficLayer (options) {
  options = options || {}
  this.options = options
  this.analysis = options.analysis === 'official' ? options.analysis : 'private'
  this.needWorker = options.needWorker !== undefined ? options.needWorker : false
  options.colors = options.colors || [
    'rgba(0,192,73,0.99609375)',
    'rgba(242,48,48,0.99609375)',
    'rgba(255,159,25,0.99609375)'
  ]
  const colors = options.colors
  this.map = options.map
  this.canvas = null
  this.tileType = options.tileType
  const size = this.map.getSize()
  const extent = this.map.getView().calculateExtent(size)

  const layer = new ImageLayer({
    extent,
    source: new ImageCanvasSource({
      canvasFunction: this.canvasFunction.bind(this),
      ratio: 1,
      projection: 'EPSG:4326'
    })
  })
  this.layer = layer

  options.map.on(['precompose'], (e) => {
    const size = e.target.getSize()
    const extent = e.target.getView().calculateExtent(size)
    layer.setExtent(extent)
  }, false)

  this.parseColors(colors)
  this.tileSize = 256
  // 确实参数声明
  const devicePixelRatio = 1
  this.ratio = devicePixelRatio
  this.drawTogether = false
  this.cache = {}
  this._loadCount = {}
  if (options.getTileUrl) {
    this.getTileUrl = options.getTileUrl
  }
  if (options.needWorker) {
    this.worker = new Worker()
    this.worker.onmessage = (e) => {
      if (e.data.msg === 'initTile') {
        // 方式二采用双缓存
        const ctx = this.canvaslayer.canvas.getContext('2d')
        ctx.drawImage(e.data.imageBitmap, 0, 0)
        // 增加刷新机制时，对原有对象的强制内存释放
        window.BMap && (window.BMap = null)
      } else if (e.data.msg === 'updateCanvas') {
        const orders = e.data.tilesOrder
        this.zoomUnits = e.data.zoomUnits
        this.tilesOrder = e.data.tilesOrder
        this._loadCount = {}

        // 方式1 - 进行绘制的for循环动作
        this.canvaslayer.canvas
          .getContext('2d')
          .clearRect(
            0,
            0,
            this.canvaslayer.canvas.width,
            this.canvaslayer.canvas.height
          )
        for (let i = 0; i < orders.length; i++) {
          const x = orders[i][0]
          const y = orders[i][1]
          const z = Math.round(options.map.getView().getZoom())
          this._loadCount[x + '_' + y + '_' + z] = false
          this.showTile(x, y, z)
        }
      }
    }
    this.worker.onerror = (e) => {
      console.error('路况绘制worker异常！', e)
    }
  }
}

TrafficLayer.prototype.canvasFunction = function (extent, resolution, pixelRatio, size, projection) {
  let canvas = this.canvas
  if (!canvas) {
    // const view = this.map.getView()
    canvas = document.createElement('canvas')
    this.canvas = canvas
  }

  canvas.width = size[0]
  canvas.height = size[1]
  this.update({
    resolution,
    canvas
  })

  // const ctx = canvas.getContext('2d')

  // const radius = 30
  /*
    var pixel = map.getPixelFromCoordinate(ol.proj.transform([116.403497,39.914779], 'EPSG:4326', 'EPSG:3857'));
    ctx.fillStyle = 'rgba(0, 0, 250, 0.5)';
    ctx.fillRect(pixel[0] - radius / 2, pixel[1] - radius / 2, radius, radius);
    */

  /*
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    var pixel = map.getPixelFromCoordinate([12958191.03,4825971.76]);
    ctx.fillRect(pixel[0] - radius / 2, pixel[1] - radius / 2, radius, radius);
    */
  return canvas
}

TrafficLayer.prototype.parseColors = function (colors) {
  this.arrFeatureStyles = [
    [2, colors[0] || 'rgba(79,210,125,1)', 2, 2, 0, [], 0, 0],
    [2, colors[0] || 'rgba(79,210,125,1)', 3, 2, 0, [], 0, 0],
    [2, colors[0] || 'rgba(79,210,125,1)', 3, 2, 0, [], 0, 0],
    [2, colors[0] || 'rgba(79,210,125,1)', 5, 2, 0, [], 0, 0],
    [2, colors[0] || 'rgba(79,210,125,1)', 6, 2, 0, [], 0, 0],
    [2, colors[2] || 'rgba(255,208,69,1)', 2, 2, 0, [], 0, 0],
    [2, colors[2] || 'rgba(255,208,69,1)', 3, 2, 0, [], 0, 0],
    [2, colors[2] || 'rgba(255,208,69,1)', 3, 2, 0, [], 0, 0],
    [2, colors[2] || 'rgba(255,208,69,1)', 5, 2, 0, [], 0, 0],
    [2, colors[2] || 'rgba(255,208,69,1)', 6, 2, 0, [], 0, 0],
    [2, colors[1] || 'rgba(232,14,14,1)', 2, 2, 0, [], 0, 0],
    [2, colors[1] || 'rgba(232,14,14,1)', 3, 2, 0, [], 0, 0],
    [2, colors[1] || 'rgba(232,14,14,1)', 3, 2, 0, [], 0, 0],
    [2, colors[1] || 'rgba(232,14,14,1)', 5, 2, 0, [], 0, 0],
    [2, colors[1] || 'rgba(232,14,14,1)', 6, 2, 0, [], 0, 0],
    [2, colors[3] || 'rgba(181,0,0,1)', 2, 2, 0, [], 0, 0],
    [2, colors[3] || 'rgba(181,0,0,1)', 3, 2, 0, [], 0, 0],
    [2, colors[3] || 'rgba(181,0,0,1)', 3, 2, 0, [], 0, 0],
    [2, colors[3] || 'rgba(181,0,0,1)', 5, 2, 0, [], 0, 0],
    [2, colors[3] || 'rgba(181,0,0,1)', 6, 2, 0, [], 0, 0],
    [2, 'rgba(255,255,255,1)', 4, 0, 0, [], 0, 0],
    [2, 'rgba(255,255,255,1)', 5.5, 0, 0, [], 0, 0],
    [2, 'rgba(255,255,255,1)', 7, 0, 0, [], 0, 0],
    [2, 'rgba(255,255,255,1)', 8.5, 0, 0, [], 0, 0],
    [2, 'rgba(255,255,255,1)', 10, 0, 0, [], 0, 0]
  ]
}

TrafficLayer.prototype.setColors = function (colors) {
  this.parseColors(colors)
}

TrafficLayer.prototype.initialize = function (map) {
  const me = this
  if (!this._initialize) {
    // eslint-disable-next-line no-undef
    this.canvaslayer = new CanvasLayer({
      map,
      update: function () {
        me.update(this)
      }
    })
    this._initialize = true
  }
}

TrafficLayer.prototype.clearCache = function (map) {
  this.cache = {}
}

TrafficLayer.prototype.setMap = function (map) {
  if (map) {
    this.map = map
    if (this._initialize) {
      this.canvaslayer.show()
    } else {
      this.initialize(map)
    }
  } else {
    this.canvaslayer.hide()
  }
}

TrafficLayer.prototype.draw = function (options) {
  options = options || {}
  if (options.clearCache) {
    this.clearCache()
  }
  if (options.drawTogether) {
    this.drawTogether = true
  }
  this.update()
}

TrafficLayer.prototype.clear = function () {
  const canvas = this.canvaslayer.canvas
  const ctx = canvas.getContext('2d')
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.canvas.width = w
  ctx.canvas.height = h
}

TrafficLayer.prototype.update = function (canvaslayer) {
  const map = this.map
  if (canvaslayer) {
    this.canvaslayer = canvaslayer
  } else {
    canvaslayer = this.canvaslayer
  }

  const canvas = canvaslayer.canvas
  const ctx = canvas.getContext('2d')

  if (!this.drawTogether) {
    this.clear()
  }

  const tilesOrder = []
  if (this.needWorker) {
    const size = this.map.getSize()
    const updateInfo = {
      mapZoom: Math.round(map.getView().getZoom()),
      tileType: this.tileType,
      zoomUnits: this.zoomUnits,
      center: this.map.getView().getCenter(),
      resolution: this.canvaslayer.resolution,
      tileSize: this.tileSize,
      size,
      devicePixelRatio: this.ratio,
      ratio: this.ratio
    }
    this.worker.postMessage({
      msg: 'updateCanvas',
      width: size[0],
      height: size[1],
      updateInfo
    })
  } else {
    const map = this.map
    let zoom
    let levelUnits

    // 获取当前地图的米/像素单位比例
    if (this.tileType === 'bd09') {
      zoom = Math.round(map.getView().getZoom() + 1)
      this.zoomUnits = Math.pow(2, 18 - zoom)
      levelUnits = this.zoomUnits * 256
    } else if (this.tileType === 'WGS84') {
      zoom = Math.round(map.getView().getZoom())
      this.zoomUnits = (2 * Math.PI * 6378137) / 256 / Math.pow(2, zoom)
      levelUnits = this.zoomUnits * 256
    } else {
      zoom = Math.round(map.getView().getZoom())
      this.zoomUnits = Math.pow(2.0, 2 - zoom) * 0.3515625
      levelUnits = 256 * this.zoomUnits
    }

    const center = map.getView().getCenter()

    const centerPoint = {
      x: center[0],
      y: center[1]
    }
    let row, column, fromRow, fromColumn, toRow, toColumn

    const zoomUnits = this.zoomUnits
    const diffRatio = zoomUnits / this.canvaslayer.resolution

    let width = map.getSize()[0] / diffRatio
    let height = map.getSize()[1] / diffRatio
    if (this.tileType === 'bd09') {
      row = Math.ceil(centerPoint.x / levelUnits)
      column = Math.ceil(centerPoint.y / levelUnits)

      const cell = [
        row,
        column,
        ((centerPoint.x - row * levelUnits) / levelUnits) * this.tileSize,
        ((centerPoint.y - column * levelUnits) / levelUnits) * this.tileSize
      ]
      fromRow = cell[0] - Math.ceil((width / 2 - cell[2]) / this.tileSize)
      fromColumn = cell[1] - Math.ceil((height / 2 - cell[3]) / this.tileSize)
      toRow = cell[0] + Math.ceil((width / 2 + cell[2]) / this.tileSize)
      toColumn = cell[1] + Math.ceil((height / 2 + cell[3]) / this.tileSize)
    } else if (this.tileType === 'WGS84') {
      width = map.getSize()[0]
      height = map.getSize()[1]
      row = Math.ceil(Math.round((centerPoint.x + 20037508.34) / levelUnits))
      column = Math.ceil(
        Math.round((20037508.34 - centerPoint.y) / levelUnits)
      )
      fromRow = row - Math.ceil(width / 2 / this.tileSize)
      toRow = row + Math.ceil(width / 2 / this.tileSize)
      fromColumn = column - Math.ceil(height / 2 / this.tileSize)
      toColumn = column + Math.ceil(height / 2 / this.tileSize)
    } else {
      width = map.getSize()[0]
      height = map.getSize()[1]
      row = Math.ceil(Math.round((centerPoint.x + 180.0) / levelUnits))
      column = Math.ceil(Math.round((90.0 - centerPoint.y) / levelUnits))
      fromRow = row - Math.ceil(width / 2 / this.tileSize)
      toRow = row + Math.ceil(width / 2 / this.tileSize)
      fromColumn = column - Math.ceil(height / 2 / this.tileSize)
      toColumn = column + Math.ceil(height / 2 / this.tileSize)
    }

    for (let i = fromRow; i <= toRow; i++) {
      for (let j = fromColumn; j <= toColumn; j++) {
        tilesOrder.push([i, j])
      }
    }

    this.tilesOrder = tilesOrder
    this._loadCount = {}

    const size = map.getSize()
    ctx.translate(
      (size[0] * devicePixelRatio * (1 - diffRatio)) / 2,
      (size[1] * devicePixelRatio * (1 - diffRatio)) / 2
    )

    // 根据屏幕分辨率修改坐标
    ctx.scale(this.ratio * diffRatio, this.ratio * diffRatio)

    for (let i = 0; i < tilesOrder.length; i++) {
      const x = tilesOrder[i][0]
      const y = tilesOrder[i][1]
      const z = zoom
      this._loadCount[x + '_' + y + '_' + z] = false
      this.showTile(x, y, z)
    }
  }
}
TrafficLayer.prototype.lngLatToMerc = function (point) {
  if (point === null || point === undefined) {
    return { x: 0, y: 0 }
  }

  if (point.lng > 180 || point.lng < -180 || point.lat > 90 || point.lat < -90) {
    return { x: 0, y: 0 }
  }
  if (this.tileType === 'WGS84') {
    const mercator = {}
    const earthRad = 6378137.0
    mercator.lng = ((point.lng * Math.PI) / 180) * earthRad
    const a = (point.lat * Math.PI) / 180
    mercator.lat = (earthRad / 2) * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)))
    return {
      x: Number(mercator.lng.toFixed(2)),
      y: Number(mercator.lat.toFixed(2))
    }
  }
}
TrafficLayer.prototype.isAllLoaded = function () {
  let flag = true
  for (const key in this._loadCount) {
    if (!this._loadCount[key]) {
      flag = false
      break
    }
  }
  return flag
}

TrafficLayer.prototype.showTile = function (x, y, z) {
  this._parseDataAndDraw(x, y, z)
}

TrafficLayer.prototype.drawCurrentData = function () {
  this.clear()
  let z
  if (this.tileType === 'bd09') {
    z = Math.round(this.map.getZoom() + 1)
  } else if (this.tileType === 'WGS84') {
    z = Math.round(this.map.getZoom())
  } else {
    z = Math.round(this.map.getView().getZoom())
  }
  for (let i = 0; i < this.tilesOrder.length; i++) {
    const x = this.tilesOrder[i][0]
    const y = this.tilesOrder[i][1]
    const cacheData = this.cache[this.getCacheKey(x, y, z)]
    if (cacheData) {
      this._drawFeatures(cacheData, x, y, z)
    }
  }
  this.drawTogether = false
}

TrafficLayer.prototype.getCacheKey = function (x, y, z) {
  return x + '_' + y + '_' + z
}

TrafficLayer.prototype.getTileKey = function (info, cbk) {
  cbk = cbk || {}
  // let zoom = "number" === typeof e.useZoom ? e.useZoom : t.useZoom;
  const style = info.style || 'default'
  return ('BMAP_CUSTOM_LAYER_1' + '_' + style + '_' + info.col + '_' + info.row + '_' + info.zoom + '_' + info.zoom)
}

/**
 * 解析并绘制数据
 * y: 行号
 * row: 列号
 */
TrafficLayer.prototype._parseDataAndDraw = function (x, y, z) {
  const me = this
  const cacheKey = this.getCacheKey(x, y, z)
  // _t代表traffic
  // 生成随机数
  const timeStamp = (Math.random() * 100000).toFixed(0)
  // cbkName = '_t' + parseInt(x + '' + y + '' + z).toString(36),
  let cbkName = '_cbk' + timeStamp

  if (!window.BMap) {
    window.BMap = {}
  }

  let url = ''
  const analysis = this.analysis
  if (analysis === 'private') {
    url = this.getTileUrl(x, y, z, 'BMap.' + cbkName)
    window.BMap[cbkName] = callback
  } else {
    const cbk = 'cbk' + this.getTileKey({ col: x, row: y, zoom: z })
    url = this.getTileUrl(x, y, z, 'BMap.' + cbk)
    cbkName = cbk
    window.BMap[cbkName] = callback
  }

  function callback (json) {
    me._loadCount[x + '_' + y + '_' + z] = true

    // var content = json['content'] && json['content']['tf'];

    // if (json['data']) {
    //     content = json['data'];
    // }

    const content = analysis === 'private' ? json.result && json.result.trafficData : json.content && json.content.tf

    if (content) {
      me.cache[cacheKey] = {
        traffic: content,
        precision: json.precision || 1
      }
    } else {
      me.cache[cacheKey] = null
    }

    if (me.drawTogether) {
      me.isAllLoaded() && me.drawCurrentData()
    } else {
      me._drawFeatures(me.cache[cacheKey], x, y, z)
    }

    delete window.BMap[cbkName]
  }

  if (me.cache[cacheKey] !== undefined && me.cache[cacheKey] !== null) {
    me._loadCount[x + '_' + y + '_' + z] = true
    if (me.drawTogether) {
      me.isAllLoaded() && me.drawCurrentData()
    } else {
      me._drawFeatures(me.cache[cacheKey], x, y, z)
    }
  } else {
    typeof window.BMap[cbkName] === 'function' && this.request(url)
  }
}

TrafficLayer.prototype.getTileUrl = function (x, y, z, cbkName) {
  const trafficURL = this.options.trafficURL || 'http://its.map.baidu.com:8002/traffic/?qt=vtraffic'

  const url = trafficURL +
      '&x=' + x +
      '&y=' + y +
      '&z=' + z +
      '&fn=' + cbkName + (this.analysis === 'private' ? '&t=' + new Date().getTime() : '') // '&udt='+ new Date().getTime()

  return url
}

/**
 * 绘制路况数据
 * data: 数据
 * col: 行号
 * row: 列号
 */
TrafficLayer.prototype._drawFeatures = function (json, col, row, z) {
  if (this.needWorker) {
    const size = this.map.getSize()
    const drawInfo = {
      center: this.map.getView().getCenter(),
      zoomUnits: this.zoomUnits,
      tileType: this.tileType,
      tileSize: this.tileSize,
      size,
      arrFeatureStyles: this.arrFeatureStyles
    }
    this.worker.postMessage({
      msg: 'initTile',
      json,
      col,
      row,
      width: size[0],
      height: size[1],
      traffic: drawInfo,
      zoom: z
    })
  } else {
    const map = this.map
    const canvas = this.canvaslayer.canvas
    const ctx = canvas.getContext('2d')
    // let getRgba = this.getRGBA
    const getLineCap = this.getLineCap
    const getLineJoin = this.getLineJoin
    let p = 10 // 精度

    const centerPoint = map.getView().getCenter()

    const zoomUnits = this.zoomUnits
    // const diffRatio = zoomUnits / this.canvaslayer.resolution

    const centerPixX = -centerPoint[0] / zoomUnits
    const centerPixY = centerPoint[1] / zoomUnits
    const centerPosition = [centerPixX, centerPixY]

    let posX = null
    let posY = null
    if (this.tileType === 'bd09') {
      posX = col * this.tileSize + centerPosition[0]
      posY = (-1 - row) * this.tileSize + centerPosition[1]
      posX = map.getSize()[0] / 2 + posX
      posY = map.getSize()[1] / 2 + posY
    } else if (this.tileType === 'WGS84') {
      const halfSize = Math.PI * 6378137
      posX = (col * this.tileSize * zoomUnits - halfSize) / zoomUnits + centerPosition[0]
      posY = centerPosition[1] - (halfSize - row * this.tileSize * zoomUnits) / zoomUnits
      posX = map.getSize()[0] / 2 + posX
      posY = map.getSize()[1] / 2 + posY
    } else {
      const xHalfSize = 180
      const yHalfSize = 90
      posX = (col * this.tileSize * zoomUnits - xHalfSize) / zoomUnits + centerPosition[0]
      posY = centerPosition[1] - (yHalfSize - row * this.tileSize * zoomUnits) / zoomUnits
      posX = map.getSize()[0] / 2 + posX
      posY = map.getSize()[1] / 2 + posY
    }

    ctx.save()

    ctx.translate(posX, posY)

    if (json && json.traffic) {
      const precision = json.precision || 1
      p = p * precision

      const data = json.traffic

      for (let i = 0, l = data.length; i < l; i++) {
        const item = data[i]
        const scrPts = item[1]
        const style0 = this.arrFeatureStyles[item[3]]
        // const style1 = this.arrFeatureStyles[item[4]]
        let x = scrPts[0] / p
        let y = scrPts[1] / p

        ctx.beginPath()
        ctx.moveTo(x, y)
        for (let j = 2, ll = scrPts.length; j < ll; j += 2) {
          x += scrPts[j] / p
          y += scrPts[j + 1] / p
          ctx.lineTo(x, y) // 画线
        }

        // 绘制背景色
        ctx.strokeStyle = style0[1]
        if (item[3] >= 15 && item[3] <= 19) {
          ctx.strokeStyle = 'rgba(186, 0, 0, 1)'
        }
        ctx.lineWidth = style0[2]
        ctx.lineCap = getLineCap(style0[3])
        ctx.lineJoin = getLineJoin(style0[4])
        ctx.stroke()
      }
    }
    ctx.restore()
  }
}

TrafficLayer.prototype.request = function (url, cbk) {
  if (cbk) {
    if (this.analysis === 'private') {
      // 生成随机数
      const timeStamp = (Math.random() * 100000).toFixed(0)
      // 判断专网与官网的解析格式
      const type = '_cbk' + timeStamp
      // 全局回调函数
      window.BMap._rd[type] = function (json) {
        cbk && cbk(json)
        delete window.BMap._rd[type]
      }
      url += '&callback=BMap._rd._cbk' + timeStamp
    } else {
      // \w+ 表示匹配至少一个(数字、字母及下划线), [\u4e00-\u9fa5]+ 表示匹配至少一个中文字符
      const pattern = /(\w+|[\u4e00-\u9fa5]+)=(\w+|[\u4e00-\u9fa5]+)/gi
      const result = {}
      url.replace(pattern, ($, $1, $2) => {
        result[$1] = $2
      })

      const type = result.fn
      // 全局回调函数
      window.BMap[type] = function (json) {
        cbk && cbk(json)
        delete window.BMap[type]
      }
      url += '&callback=BMap.' + type
    }
  }

  let script = document.createElement('script')
  script.type = 'text/javascript'
  script.charset = 'utf-8'
  script.src = url
  // 脚本加载完成后进行移除
  if (script.addEventListener) {
    script.addEventListener('load', function (e) {
      const t = e.target
      t.parentNode.removeChild(t)
    }, false)
  } else if (script.attachEvent) {
    script.attachEvent('onreadystatechange', function (e) {
      const t = window.event.srcElement
      if (t && (t.readyState === 'loaded' || t.readyState === 'complete')) {
        t.parentNode.removeChild(t)
      }
    })
  }

  // 使用setTimeout解决ie6无法发送问题
  setTimeout(function () {
    document.getElementsByTagName('head')[0].appendChild(script)
    script = null
  }, 1)
}

/**
 * 获取RGBA颜色值
 * nColor: 颜色数值
 */
TrafficLayer.prototype.getRGBA = function (nColor) {
  nColor = nColor >>> 0 // 先转化为无符号8位
  const r = (nColor >> 24) & 255
  const g = (nColor >> 16) & 255
  const b = (nColor >> 8) & 255
  const a = (nColor & 255) / 256
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}

/**
 * 获取线帽样式
 * n: 线帽索引值
 */
TrafficLayer.prototype.getLineCap = function (n) {
  return ['butt', 'square', 'round'][n]
}

/**
 * 获取线连接处样式
 * n: 线连接处索引值
 */
TrafficLayer.prototype.getLineJoin = function (n) {
  return ['miter', 'bevel', 'round'][n]
}

/**
 * 不需要进行图层加载时，请对worker进行销毁
 */
TrafficLayer.prototype.workerTerminate = function () {
  this.worker && this.worker.terminate()
}

export default TrafficLayer
