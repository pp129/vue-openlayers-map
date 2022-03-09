<template>
  <div class="home">
    <!-- tools -->
    <div class="tools">
      <button class="btn" @click="webGlPoint">海量点(webGl)</button>
      <button class="btn" @click="graphicLayer">海量点(canvas)</button>
      <span class="btn">当前层级：{{currentZoom}}</span>
    </div>
    <!-- map -->
    <v-map
      ref="map"
      class="map"
      :height="height"
      :width="width"
      :option="option"
      @click="onClick"
      @changeZoom="onChangeZoom">
    </v-map>
    <!-- overlays -->
    <div ref="overlay1" id="overlay1" class="overlay">
      <p>overlay1</p>
      <span @click="closeOverlay('overlay1')">close</span>
    </div>
  </div>
</template>

<script>
import { VMap } from '~/index'

import Mock from 'mockjs'

export default {
  name: 'canvasMap',
  components: {
    VMap
  },
  data () {
    return {
      mapId: 'map',
      height: '100%',
      width: '100%',
      baseTile: [
        {
          name: '天地图-街道+注记',
          value: 'td'
        },
        {
          name: '天地图-影像+注记',
          value: 'td_img'
        },
        {
          name: '百度',
          value: 'bd'
        },
        {
          name: '高德',
          value: 'gd'
        },
        {
          name: '自定义参数的百度地图',
          value: 'xyz_bd'
        }
      ],
      option: {
        view: {
          center: [118.045456, 24.567489],
          zoom: 10,
          constrainResolution: true // 设置视图是否应允许中间缩放级别。true:鼠标缩放地图,每次缩放级别为整数1
        },
        layers: [
          {
            id: 'graphicLayer',
            type: 'graphicLayer',
            source: {
              features: []
            }
          },
          {
            id: 'graphicLayer2',
            type: 'graphicLayer',
            source: {
              features: []
            }
          }
        ]
      },
      newLayer: {},
      selectedTile: 'td',
      checkbox: [
        {
          label: '点位',
          value: 'layer1'
        },
        {
          label: '聚合',
          value: 'cluster'
        },
        {
          label: '多边形',
          value: 'polygon'
        },
        {
          label: '热力图',
          value: 'heatmap'
        }
      ],
      checked: ['layer1', 'cluster', 'polygon', 'heatmap'],
      currentZoom: 0,
      currentCoordinates: '',
      drawType: 'none',
      modifyStatus: false,
      measureType: 'none',
      useCom: true,
      overlay2: 'overlay2',
      animate: {
        zoom: 0,
        center: [0, 0]
      },
      drawCoors: []
    }
  },
  methods: {
    onClick (evt, map) {
      console.log('on map click === get coordinate', evt.coordinate)
      this.currentCoordinates = `${evt.coordinate[0].toFixed(6)}, ${evt.coordinate[1].toFixed(6)}`
      const pixel = map.getEventPixel(evt.originalEvent)
      const hit = map.hasFeatureAtPixel(pixel)
      const polyFeatures = map.getFeaturesByLayerId('polygon')
      if (hit) {
        const features = map.getFeaturesAtPixel(evt.pixel)
        console.log(features)
        if (features && features.length > 0) {
          let item = null
          let polygon = null
          let type = ''
          features.forEach(feature => {
            item = feature.get('properties')
            type = feature.get('type')
            if (type && type === 'polygon') {
              if (feature.get('updateStyle')) {
                feature.update('style', feature.get('updateStyle'))
              }
              polygon = {
                type: 'polygon'
              }
            }
          })
          if (item && Object.prototype.hasOwnProperty.call(item, 'name')) {
            this.showOverlay(item, 'overlay1', 'overlay1', evt.coordinate)
          }
          if (polygon) {
            this.showOverlay(polygon, 'overlay2', 'overlay2', evt.coordinate)
          }
        }
      } else {
        if (polyFeatures) {
          polyFeatures.forEach(feature => {
            if (feature.get('type') === 'polygon') {
              feature.update('style', feature.get('style'))
            }
          })
        }
      }
    },
    onChangeZoom (evt) {
      this.currentZoom = evt.map.getView().getZoom()
    },
    showOverlay (properties, id, element, coordinate) {
      this.option.overlays.forEach((overlay, index) => {
        if (overlay.id === id) {
          overlay.position = coordinate
          overlay.offset = [20, -50]
          overlay.properties = properties
        }
      })
    },
    closeOverlay (id) {
      const overlay = this.option.overlays.filter(item => item.id === id)
      overlay[0].position = undefined
    },
    webGlPoint () {
      const features = []
      const mockData = this.setMockData(60000)
      mockData.array.forEach(val => {
        features.push({
          coordinates: val,
          text: {
            text: 'webGLPoints',
            font: '13px sans-serif',
            fill: {
              color: '#3d73e8'
            },
            backgroundFill: {
              color: '#ffffff'
            },
            stroke: {
              color: '#ffffff',
              width: 1
            },
            backgroundStroke: {
              color: '#000000',
              width: 1
            },
            offsetX: 0,
            offsetY: 30
          }
        })
      })
      const option = {
        id: 'webGLPoints',
        type: 'webGLPoints',
        visible: true,
        source: {
          features: features
        },
        // disableHitDetection: true,
        symbol: {
          symbolType: 'circle',
          src: require('@/assets/img/car.png'),
          size: [18, 28],
          color: 'lightyellow',
          rotateWithView: false,
          offset: [0, 9]
        }
      }
      if (this.option.updateLayers.indexOf('webGLPoints') < 0) {
        this.option.updateLayers.push('webGLPoints')
      }
      const index = this.option.layers.map(item => item.id).indexOf('webGLPoints')
      if (index > -1) {
        this.option.layers.splice(index, 1)
      }
      this.option.layers.push(option)
    },
    graphicLayer () {
      const features = []
      const mockData = this.setMockData(41122)
      mockData.array.forEach(val => {
        features.push({
          coordinates: val
        })
      })
      console.log(features)
      const index = this.option.layers.map(item => item.id).indexOf('graphicLayer')
      if (index > -1) {
        this.option.layers[index] = Object.assign(this.option.layers[index], {
          // maxZoom: 15,
          source: {
            features: features
          },
          style: {
            icon: {
              src: require('@/assets/img/point_red.png'),
              scale: 1
            }
          }
        })
      }
      // const index2 = this.option.layers.map(item => item.id).indexOf('graphicLayer2')
      // if (index2 > -1) {
      //   this.option.layers[index2] = Object.assign(this.option.layers[index2], {
      //     mimZoom: 16,
      //     source: {
      //       features: featuresCircle
      //     }
      //   })
      // }
    },
    setMockData (count = 600) {
      const Random = Mock.Random
      const option = {}
      option[`array|${count}`] = [
        () => [Random.float(117, 118, 6, 6), Random.float(24, 24, 6, 6)]
      ]
      return Mock.mock(option)
    }
  }
}
</script>

<style lang="scss">
.home{
  width: 100%;
  height: 100%;
  .tools{
    z-index: 2;
    position: absolute;
    top: 10px;
    right: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: center;
    button,select{
      cursor: pointer;
    }
    .btn{
      display: flex;
      align-items: center;
      margin-left: 20px;
      margin-bottom: 10px;
      background: white;
      padding: 10px;
      font-size: 12px;
      &-input{
        width: 85px;
        margin-right: 10px;
      }
    }
    .checkbox-group{
      padding: 5px;
      .checkbox-item{
        margin-right: 10px;
        input{
          cursor: pointer;
        }
      }
    }
  }
  .map{
    z-index: 1;
    position: absolute;
    top: 0;
    right: 0;
  }
  .overlay{
    width: 100px;
    height: 100px;
    background: white;
  }
}
</style>
