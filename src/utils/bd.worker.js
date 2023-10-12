let offscreen, ctx
// let drawTask = []
const offscreenTemp = new OffscreenCanvas(256, 256)
const ctxTemp = offscreenTemp.getContext('2d')
// 监听主线程发的信息
self.onmessage = function (e) {
  // 监听通行内容
  !ctx && init(e.data.width, e.data.height)
  if (e.data.msg === 'initTile') {
    const result = e.data

    BdRouteDraw(result.json, result.col, result.row, result.traffic, result.zoom)
  } else if (e.data.msg === 'updateCanvas') {
    ctx.clearRect(0, 0, offscreen.width, offscreen.height)
    e.data.updateInfo && BdRouteUpdate(e.data.updateInfo)
  }
}

function init (width, height) {
  offscreen = new OffscreenCanvas(width, height)
  ctx = offscreen.getContext('2d')
}

/**
 * 百度路况解析结果绘制
 * json 解析结果数据
 * col 行号
 * row 列号
 * traffic 为layer本体对象，之传输部分关键数据
 ************************************************
 * traffic：
 * - center
 * - zoomUnits
 * - tileType
 * - tileSize
 * - size
 * - arrFeatureStyles
 */
function BdRouteDraw (json, col, row, trafficLayer, zoom) {
  // console.time('initTime');
  // ctx.clearRect(0, 0, 256, 256)

  ctxTemp.clearRect(0, 0, 256, 256)

  // const canvas = trafficLayer.canvaslayer.canvas
  // const ctx2 = canvas.getContext('2d')

  // let getRgba = trafficLayer.getRGBA
  // const getLineCap = trafficLayer.getLineCap
  // const getLineJoin = trafficLayer.getLineJoin
  let p = 10 // 精度

  const centerPoint = trafficLayer.center

  const zoomUnits = trafficLayer.zoomUnits
  // const diffRatio = zoomUnits / trafficLayer.canvaslayer.resolution

  const centerPixX = -centerPoint[0] / zoomUnits
  const centerPixY = centerPoint[1] / zoomUnits
  const centerPosition = [centerPixX, centerPixY]

  const xHalfSize = 180
  const yHalfSize = 90

  let posX = null
  let posY = null
  if (trafficLayer.tileType === 'bd09') {
    posX = col * trafficLayer.tileSize + centerPosition[0]
    posY = (-1 - row) * trafficLayer.tileSize + centerPosition[1]

    posX = trafficLayer.size[0] / 2 + posX
    posY = trafficLayer.size[1] / 2 + posY
  } else if (trafficLayer.tileType === 'WGS84') {
    const halfSize = Math.PI * 6378137
    posX = (col * trafficLayer.tileSize * zoomUnits - halfSize) / zoomUnits + centerPosition[0]
    posY = centerPosition[1] - (halfSize - row * trafficLayer.tileSize * zoomUnits) / zoomUnits

    posX = trafficLayer.size[0] / 2 + posX
    posY = trafficLayer.size[1] / 2 + posY
  } else {
    posX = (col * trafficLayer.tileSize * zoomUnits - xHalfSize) / zoomUnits + centerPosition[0]
    posY = centerPosition[1] - (yHalfSize - row * trafficLayer.tileSize * zoomUnits) / zoomUnits

    posX = trafficLayer.size[0] / 2 + posX
    posY = trafficLayer.size[1] / 2 + posY
  }

  // ctxTemp.save()

  // ctxTemp.translate(posX, posY)

  if (json && json.traffic) {
    const precision = json.precision || 1
    p = p * precision

    const data = json.traffic

    for (let i = 0, l = data.length; i < l; i++) {
      const item = data[i]
      const scrPts = item[1]
      const style0 = trafficLayer.arrFeatureStyles[item[3]]
      // const style1 = trafficLayer.arrFeatureStyles[item[4]]
      let x = scrPts[0] / p
      let y = scrPts[1] / p

      ctxTemp.beginPath()
      ctxTemp.moveTo(x, y)
      for (let j = 2, ll = scrPts.length; j < ll; j += 2) {
        x += scrPts[j] / p
        y += scrPts[j + 1] / p
        ctxTemp.lineTo(x, y) // 画线
      }

      // 绘制背景色
      ctxTemp.strokeStyle = style0[1]
      if (item[3] >= 15 && item[3] <= 19) {
        ctxTemp.strokeStyle = 'rgba(186, 0, 0, 1)'
      }
      ctxTemp.lineWidth = style0[2]
      ctxTemp.lineCap = getLineCap(style0[3])
      ctxTemp.lineJoin = getLineJoin(style0[4])
      ctxTemp.stroke()
    }
  }

  // ctxTemp.restore()

  ctx.drawImage(offscreenTemp, posX, posY)

  const imageBitmap = offscreen.transferToImageBitmap()
  // const imageBitmap = offscreenTemp.transferToImageBitmap()
  // 传送给主线程
  postMessage({
    imageBitmap,
    msg: 'initTile',
    canvasPoint: [posX, posY],
    zoom,
    x: col,
    y: row
  })
  // console.timeEnd('initTime');
}

/**
 * 百度数据刷新机制
 *
 ***************************************
 * trafficUpdate
 * - mapZoom
 * - tileType
 * - zoomUnits
 * - center
 * - resolution  canvaslayer.resolution
 * - tileSize
 * - size
 * - devicePixelRatio  this.ratio
 * - ratio
 */
function BdRouteUpdate (trafficUpdate) {
  let zoom, levelUnits
  const size = trafficUpdate.size

  // 获取当前地图的米/像素单位比例
  if (trafficUpdate.tileType == 'bd09') {
    zoom = Math.round(trafficUpdate.mapZoom + 1)
    trafficUpdate.zoomUnits = Math.pow(2, (18 - zoom))
    levelUnits = trafficUpdate.zoomUnits * 256
  } else if (trafficUpdate.tileType == 'WGS84') {
    zoom = Math.round(trafficUpdate.mapZoom)
    trafficUpdate.zoomUnits = 2 * Math.PI * 6378137 / 256 / Math.pow(2, zoom)
    levelUnits = trafficUpdate.zoomUnits * 256
  } else {
    zoom = Math.round(trafficUpdate.mapZoom)
    trafficUpdate.zoomUnits = Math.pow(2.0, 2 - zoom) * 0.3515625
    levelUnits = 256 * trafficUpdate.zoomUnits
  }

  const center = trafficUpdate.center

  const centerPoint = {
    x: center[0],
    y: center[1]
  }
  let row, column, fromRow, fromColumn, toRow, toColumn

  const zoomUnits = trafficUpdate.zoomUnits
  const diffRatio = zoomUnits / trafficUpdate.resolution

  let width = size[0] / diffRatio
  let height = size[1] / diffRatio
  if (trafficUpdate.tileType === 'bd09') {
    row = Math.ceil(centerPoint.x / levelUnits)
    column = Math.ceil(centerPoint.y / levelUnits)

    const cell = [
      row, column, (centerPoint.x - row * levelUnits) / levelUnits * trafficUpdate.tileSize,
      (centerPoint.y - column * levelUnits) / levelUnits * trafficUpdate.tileSize
    ]
    fromRow = cell[0] - Math.ceil((width / 2 - cell[2]) / trafficUpdate.tileSize)
    fromColumn = cell[1] - Math.ceil((height / 2 - cell[3]) / trafficUpdate.tileSize)
    toRow = cell[0] + Math.ceil((width / 2 + cell[2]) / trafficUpdate.tileSize)
    toColumn = cell[1] + Math.ceil((height / 2 + cell[3]) / trafficUpdate.tileSize)
  } else if (trafficUpdate.tileType == 'WGS84') {
    width = size[0]
    height = size[1]
    row = Math.ceil(Math.round((centerPoint.x + 20037508.34) / levelUnits))
    column = Math.ceil(Math.round((20037508.34 - centerPoint.y) / levelUnits))
    fromRow = row - Math.ceil(width / 2 / trafficUpdate.tileSize)
    toRow = row + Math.ceil(width / 2 / trafficUpdate.tileSize)
    fromColumn = column - Math.ceil(height / 2 / trafficUpdate.tileSize)
    toColumn = column + Math.ceil(height / 2 / trafficUpdate.tileSize)
  } else {
    width = size[0]
    height = size[1]
    row = Math.ceil(Math.round((centerPoint.x + 180.0) / levelUnits))
    column = Math.ceil(Math.round((90.0 - centerPoint.y) / levelUnits))
    fromRow = row - Math.ceil(width / 2 / trafficUpdate.tileSize)
    toRow = row + Math.ceil(width / 2 / trafficUpdate.tileSize)
    fromColumn = column - Math.ceil(height / 2 / trafficUpdate.tileSize)
    toColumn = column + Math.ceil(height / 2 / trafficUpdate.tileSize)
  }

  const tilesOrder = []
  for (let i = fromRow; i <= toRow; i++) {
    for (let j = fromColumn; j <= toColumn; j++) {
      tilesOrder.push([i, j])
    }
  }

  // *****进行全副画布绘制，若进行瓦片的绘制可以不考虑*****
  const pixelRatio = trafficUpdate.devicePixelRatio // window.devicePixelRatio === undefined ? devicePixelRatio : 1
  ctx.translate(size[0] * pixelRatio * (1 - diffRatio) / 2, size[1] * pixelRatio * (1 - diffRatio) / 2)

  // 根据屏幕分辨率修改坐标
  ctx.scale(trafficUpdate.ratio * diffRatio, trafficUpdate.ratio * diffRatio)

  // 传送给主线程
  postMessage({
    tilesOrder,
    zoomUnits,
    msg: 'updateCanvas'
  })
  // this.tilesOrder = tilesOrder;
  // this._loadCount = {};
}

/**
 * 获取线帽样式
 * n: 线帽索引值
 */
function getLineCap (n) {
  return ['butt', 'square', 'round'][n]
}

/**
 * 获取线连接处样式
 * n: 线连接处索引值
 */
function getLineJoin (n) {
  return ['miter', 'bevel', 'round'][n]
};

/**
 * 清除瓦片处理
 */
function clearCanvas () {
  const ctx = offscreen.getContext('2d')
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.canvas.width = w
  ctx.canvas.height = h
};
