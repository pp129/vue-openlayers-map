import VectorLayer from 'ol/layer/Vector'
import { fromLonLat, transform } from 'ol/proj'
import { containsCoordinate } from 'ol/extent'
import { Polygon, LineString } from 'ol/geom'
import { Fill } from 'ol/style'

class Bounds {
  min = { x: 0, y: 0 }
  max = { x: 0, y: 0 }
  constructor (min, max) {
    this.min = min
    this.max = max
  }

  intersects (bounds) {
    const min = this.min
    const max = this.max
    const min2 = bounds.min
    const max2 = bounds.max
    return max2.x <= min.x || min2.x >= max.x || max2.y <= min.y || min2.y >= max.y
  }
}

export default class AvoidanceLayer extends VectorLayer {
  getLayerStatesArray (states) {
    return undefined
  }

  getLayersArray (array) {
    return undefined
  }

  getSourceState () {
    return undefined
  }

  map = null
  pointsArr = []
  zoom = 1
  textBounds = []

  styleOptions = {
    fillColor: 'rgb(26,58,91)',
    strokeColor: 'rgb(26,58,91)',
    textColor: 'white',
    fontCss: 'bolder 15px sans-serif',
    boxWidth: 50
  }

  textViewCom = []

  constructor (options) {
    const baseOptions = Object.assign({}, options)
    delete baseOptions.map
    super(baseOptions)
    this.map = options.map ? options.map : this.map
    this.pointsArr = options.pointsArr ? options.pointsArr : this.pointsArr
    this.zoom = options.zoom ? options.zoom : this.zoom
    this.styleOptions = options.styleOptions ? options.styleOptions : this.styleOptions
    if ((this.map?.getView().getZoom()) >= this.zoom) {
      this.drawText()
    }
    const that = this
    this.map?.on('moveend', (eve) => {
      if ((that.map?.getView().getZoom()) >= that.zoom) {
        that.drawText()
        that.keepVisible()
      } else {
        that.clear()
      }
    })
  }

  drawText () {
    const style = this.styleOptions
    this.getSource().clear()
    const textCanvas = document.createElement('canvas')
    const textContext = textCanvas.getContext('2d')
    style.fontCss && (textContext.font = style.fontCss)
    const textComponent = []
    this.map?.once('postrender', () => {
      this.pointsArr.forEach(element => {
        const transCor = fromLonLat(element.position, 'EPSG:3857')
        const pixel = this.map?.getPixelFromCoordinate(transCor)
        if (containsCoordinate(this.map?.getView().calculateExtent(), transCor)) {
          element.text = element.text || ''
          // --兼容特殊字符或较长字符的情况
          let textPixel = style.boxWidth || Math.ceil(textContext.measureText(element.text).width)
          textPixel += 30

          // 在点右上侧
          const rightTopMinx = pixel[0] + 10
          const rightTopMaxx = pixel[0] + textPixel
          const rightTopMiny = pixel[1] - 40
          const rightTopMaxy = pixel[1] - 10
          const rightTopCenter = [rightTopMinx, Number(((rightTopMiny + rightTopMaxy) / 2).toFixed(0))]
          const rightTopMin = {
            x: rightTopMinx,
            y: rightTopMiny
          }
          const rightTopMax = {
            x: rightTopMaxx,
            y: rightTopMaxy
          }
          const rightTopBounds = new Bounds(rightTopMin, rightTopMax)

          // 在点左上侧
          const leftTopMinx = pixel[0] - textPixel
          const leftTopMaxx = pixel[0] - 10
          const leftTopMiny = pixel[1] - 40
          const leftTopMaxy = pixel[1] - 10
          const leftTopCenter = [leftTopMaxx, Number(((leftTopMiny + leftTopMaxy) / 2).toFixed(0))]
          const leftTopMin = {
            x: leftTopMinx,
            y: leftTopMiny
          }
          const leftTopMax = {
            x: leftTopMaxx,
            y: leftTopMaxy
          }
          const leftTopBounds = new Bounds(leftTopMin, leftTopMax)

          // 在点左下侧
          const leftBomMinx = pixel[0] - textPixel
          const leftBomMaxx = pixel[0] - 10
          const leftBomMiny = pixel[1] + 10
          const leftBomMaxy = pixel[1] + 40
          const leftBomCenter = [leftBomMaxx, Number(((leftBomMiny + leftBomMaxy) / 2).toFixed(0))]
          const leftBomMin = {
            x: leftBomMinx,
            y: leftBomMiny
          }
          const leftBomMax = {
            x: leftBomMaxx,
            y: leftBomMaxy
          }
          const leftBomBounds = new Bounds(leftBomMin, leftBomMax)

          // 在点右下侧
          const rightBomMinx = pixel[0] + 10
          const rightBomMaxx = pixel[0] + textPixel
          const rightBomMiny = pixel[1] + 10
          const rightBomMaxy = pixel[1] + 40
          const rightBomCenter = [rightBomMinx, Number(((rightBomMiny + rightBomMaxy) / 2).toFixed(0))]
          const rightBomMin = {
            x: rightBomMinx,
            y: rightBomMiny
          }
          const rightBomMax = {
            x: rightBomMaxx,
            y: rightBomMaxy
          }

          // bounds 为该文字在 canvas 中所占据的范围
          const rightBomBounds = new Bounds(rightBomMin, rightBomMax)
          const RT = {
            bound: rightTopBounds,
            minx: rightTopMinx,
            miny: rightTopMiny,
            maxx: rightTopMaxx,
            maxy: rightTopMaxy,
            polylineCenter: rightTopCenter
          }
          const LT = {
            bound: leftTopBounds,
            minx: leftTopMinx,
            miny: leftTopMiny,
            maxx: leftTopMaxx,
            maxy: leftTopMaxy,
            polylineCenter: leftTopCenter
          }
          const LB = {
            bound: leftBomBounds,
            minx: leftBomMinx,
            miny: leftBomMiny,
            maxx: leftBomMaxx,
            maxy: leftBomMaxy,
            polylineCenter: leftBomCenter
          }
          const RB = {
            bound: rightBomBounds,
            minx: rightBomMinx,
            miny: rightBomMiny,
            maxx: rightBomMaxx,
            maxy: rightBomMaxy,
            polylineCenter: rightBomCenter
          }

          const Directs = new Map([
            ['rightTopBounds', RT],
            ['leftTopBounds', LT],
            ['leftBomBounds', LB],
            ['rightBomBounds', RB]
          ])
          // 标识名称弹框放在右上侧还是左上侧
          let isCollision = true
          let minx = 0; let miny = 0; let maxx = 0; let maxy = 0
          let PLCenter = [0, 0]
          let flag = ''

          for (const [key, values] of Directs) {
            for (let i = 0; i < this.textBounds.length; i++) {
              const pointBounds = this.textBounds[i]
              isCollision = pointBounds.intersects(values.bound)
              if (!isCollision) {
                break
              }
            }
            if (isCollision) {
              flag = key
            }
          }

          // 如果没有与已绘制文字碰撞，则将该文字的范围添加到数组中，并进行绘制操作
          if (!isCollision) {
            return
          }
          for (const [key, value] of Directs) {
            if (key === flag) {
              this.textBounds.push(value.bound)
              PLCenter = value.polylineCenter
              minx = value.minx
              miny = value.miny
              maxx = value.maxx
              maxy = value.maxy
            }
          }
          const leftTop = transform(this.map?.getCoordinateFromPixel([minx, miny]), 'EPSG:3857', 'EPSG:4326')
          const rightTop = transform(this.map?.getCoordinateFromPixel([maxx, miny]), 'EPSG:3857', 'EPSG:4326')
          const rightBom = transform(this.map?.getCoordinateFromPixel([maxx, maxy]), 'EPSG:3857', 'EPSG:4326')
          const leftBom = transform(this.map?.getCoordinateFromPixel([minx, maxy]), 'EPSG:3857', 'EPSG:4326')
          // 绘制文字标签背景框
          const textBack = new Polygon({
            path: [leftTop, rightTop, rightBom, leftBom],
            strokeColor: style.strokeColor,
            fillColor: style.fillColor
          });
          // 框体文字填充 - 设置竖直方向做些许偏移
          (textBack.getStyle()).setText(new Text({
            font: style.fontCss,
            fill: new Fill({
              color: style.textColor
            }),
            offsetY: 0.5,
            text: element.text
          }))
          this.addFeature(textBack)
          // 绘制文字箭头指向
          const polylineCenter_ = transform(this.map?.getCoordinateFromPixel(PLCenter), 'EPSG:3857', 'EPSG:4326')
          const polyline = new LineString({
            path: [element.position, polylineCenter_],
            strokeColor: style.strokeColor
          })
          // polyline.setVisible(true)
          this.addFeature(polyline)
          // 设置标签组合对象
          textComponent.push({
            textBack,
            polyline,
            text: element.text
          })
        }
        this.set('textComponent', textComponent)
      })
    })
  }

  keepVisible () {
    this.textViewCom = this.get('invisible')
    if (this.textViewCom instanceof Array) {
      for (let i = this.textViewCom?.length - 1; i >= 0; i--) {
        const object = this.textViewCom[i]
        this.textVisibility(object.text, false)
      };
    }
  }

  textVisibility (textContent, visible) {
    const res = this.getObjectByText(textContent)
    this.textViewCom = this.get('invisible')
    let isContains = false
    let index = 0
    if (this.textViewCom instanceof Array) {
      for (let i = this.textViewCom?.length - 1; i >= 0; i--) {
        const obj = this.textViewCom[i]
        // eslint-disable-next-line no-unused-expressions
        textContent === obj.text && (isContains = true, index = i)
      };
    }

    if (res.length > 0) {
      for (let i = res.length - 1; i >= 0; i--) {
        const textComponent = res[i]

        if (!visible) {
          if (this.textViewCom instanceof Array) {
            !isContains && this.textViewCom.push(textComponent)
          } else {
            this.set('invisible', [textComponent])
          }
          textComponent.textBack?.setVisible(visible)
          textComponent.polyline?.setVisible(visible)
        } else {
          if (this.textViewCom instanceof Array && isContains) {
            this.textViewCom.splice(index, 1)
            const tmp = this.getObjectByText(textComponent.text)
            for (let i = tmp.length - 1; i >= 0; i--) {
              tmp[i].textBack?.setVisible(visible)
              tmp[i].polyline?.setVisible(visible)
            };
          }
        }
      }
    } else {
      if (!visible) {
        if (this.textViewCom instanceof Array) {
          !isContains && this.textViewCom.push({ text: textContent })
        } else {
          this.set('invisible', [{
            text: textContent
          }])
        }
      } else {
        isContains && this.textViewCom.splice(index, 1)
      }
    }
  }

  getObjectByText (text) {
    const textCom = this.get('textComponent')
    console.log('textCom', textCom, this.get('textComponent'))
    const result = []
    for (let i = textCom?.length - 1; i >= 0; i--) {
      const object = textCom[i]
      if (object.text === text) {
        console.log('object', object)
        result.push(object)
      }
    };
    return result
  }
}
