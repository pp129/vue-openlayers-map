<template>
  <div class="home">
    <div class="tools">
      <button class="btn" @click="webGlPoint">添加海量点</button>
      <button class="btn" @click="setModify">{{modifyStatus?'结束':'开始'}}编辑矢量元素</button>
      <select id="draw" class="btn" v-model="drawType" @change="changeInteractions">
        <option value="none">绘制图形</option>
        <option value="Point">Point</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <option value="Circle">Circle</option>
      </select>
      <select id="measure" class="btn" v-model="measureType" @change="measure">
        <option value="none">测量</option>
        <option value="LineString">Length (LineString)</option>
        <option value="Polygon">Area (Polygon)</option>
      </select>
      <button class="btn" @click="addLayer">新增/更新layer2</button>
      <button class="btn" @click="removeLayer">删除layer2</button>
      <button class="btn" @click="moveFeature">随机移动layer1中点位</button>
      <select id="changeLayer" class="btn" v-model="selectedTile" @change="changeTile">
        <option value="0">天地图-矢量</option>
        <option value="1">天地图-卫星</option>
        <option value="2">天地图-地形</option>
        <option value="3">自定义参数的百度地图</option>
        <option value="4">百度地图</option>
      </select>
      <div class="checkbox-group btn">
        <div v-for="(item,index) in checkbox" :key="index" class="checkbox-item">
          <span>{{item.label}}</span>
          <input type="checkbox" :value="item.value" v-model="checked" @click="setLayerVisible(item.value)">
        </div>
      </div>
      <span class="btn">点击位置经纬度：{{currentCoordinates}}</span>
      <span class="btn">当前层级：{{currentZoom}}</span>
      <span class="btn">
        <button @click="panTo">移动到</button>
        经度：<input class="btn-input" type="number" v-model="animate.center[0]">
        维度：<input class="btn-input" type="number" v-model="animate.center[1]">
        层级：<input class="btn-input" type="number" v-model="animate.zoom">
      </span>
      <button class="btn" @click="startTrack">出发</button>
    </div>
    <v-map
      ref="map"
      class="map"
      :height="height"
      :width="width"
      :option="option"
      @drawend="drawEnd"
      @measureend="measureEnd"
      @click="onClick"
      @changeZoom="onChangeZoom">
    </v-map>
    <div ref="overlay1" id="overlay1" class="overlay">
      <p>overlay1</p>
      <span @click="closeOverlay('overlay1')">close</span>
    </div>
    <div id="drawEnd">
      <button @click="save">保存</button>
      <button @click="clearDraw">删除</button>
    </div>
    <map-overlay id="overlay2" ref="overlay2" @close="closeOverlay('overlay2')"></map-overlay>
  </div>
</template>

<script>
import { VMap } from '~/index'
import mapOption from '@/utils/mapOption.js'
import MapOverlay from '@/components/overlay'
import { heatmap } from '@/utils/heatmap'

import Mock from 'mockjs'

export default {
  name: 'home',
  components: {
    VMap,
    MapOverlay
  },
  data () {
    return {
      mapId: 'map',
      height: '100%',
      width: '100%',
      option: mapOption,
      newLayer: {},
      selectedTile: '0',
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
  watch: {
    'option.layers': {
      handler (value) {
        if (value) {
          this.checkbox = []
          this.checked = []
          value.forEach(item => {
            this.checkbox.push({
              label: item.id,
              value: item.id
            })
            if (item.visible) {
              this.checked.push(item.id)
            }
          })
        }
      },
      immediate: true
    }
  },
  created () {
    this.option.overlays.push({
      id: 'overlay2',
      element: 'overlay2', // dom元素id
      position: undefined
    })
  },
  mounted () {
    this.$refs.map.panTo({ center: [118.118033, 24.478697], zoom: 12 })
    this.getHeatmapData()
  },
  methods: {
    modifyEnd (evt, map) {
      console.log('modifyEnd', evt)
    },
    drawEnd (evt) {
      console.log('on draw end', evt)
      this.drawCoors = evt.feature.getGeometry().getCoordinates()[0]
      const center = this.$refs.map.getCenterByExtent(evt.feature.getGeometry().getExtent())
      const index = this.option.overlays.findIndex(x => x.id === 'drawEnd')
      if (index > -1) {
        this.option.overlays[index].position = center
      }
    },
    measureEnd (evt) {
      console.log('on measure end', evt)
    },
    onClick (evt, map) {
      console.log('on map click === get coordinate', evt.coordinate)
      this.currentCoordinates = `${evt.coordinate[0].toFixed(6)}, ${evt.coordinate[1].toFixed(6)}`
      const pixel = map.getEventPixel(evt.originalEvent)
      const hit = map.hasFeatureAtPixel(pixel)
      const polyFeatures = map.getFeaturesByLayerId('polygon')
      if (hit) {
        const features = map.getFeaturesAtPixel(evt.pixel)
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
          overlay.properties = properties
        }
      })
    },
    closeOverlay (id) {
      const overlay = this.option.overlays.filter(item => item.id === id)
      overlay[0].position = undefined
    },
    addLayer () {
      const features = []
      const mockData = this.setMockData()
      mockData.array.forEach(val => {
        features.push({
          coordinates: val,
          style: {
            icon: {
              src: require('@/assets/img/point_red.png')
            }
          }
        })
      })
      this.newLayer = Object.assign({}, {
        id: 'layer2',
        visible: true,
        source: {
          features: features
        },
        extent: [117.882223, 24.386902, 118.373857, 24.90727]
      })
      if (this.option.updateLayers.indexOf('layer2') < 0) {
        this.option.updateLayers.push('layer2')
      }
      const index = this.option.layers.map(item => item.id).indexOf('layer2')
      if (index > -1) {
        this.option.layers.splice(index, 1)
      }
      this.option.layers.push(this.newLayer)
    },
    webGlPoint () {
      const features = []
      const mockData = this.setMockData(200000)
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
        symbol: {
          symbolType: 'image',
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
    removeLayer () {
      const index = this.option.layers.map(item => item.id).indexOf('layer2')
      if (index > -1) {
        this.option.layers.splice(index, 1)
        // this.option.updateLayers = []
      }
    },
    getMockNumber () {
      return Mock.mock({
        'a|-10-10': 10
      })
    },
    moveFeature () {
      const newFeatures = []
      this.option.layers[0].source.features.forEach(feature => {
        feature.coordinates[0] = feature.coordinates[0] + (this.getMockNumber().a / 100)
        feature.coordinates[1] = feature.coordinates[1] + (this.getMockNumber().a / 100)
        newFeatures.push(feature)
      })
      this.option.layers[0].source.features = newFeatures
    },
    changeTile () {
      this.option.visibleTile = this.option.baseTile[Number(this.selectedTile)]
    },
    setMockData (count = 100) {
      const Random = Mock.Random
      const option = {}
      option[`array|${count}`] = [
        () => [Random.float(117, 118, 6, 6), Random.float(24, 24, 6, 6)]
      ]
      return Mock.mock(option)
    },
    setLayerVisible (value) {
      this.option.updateLayers = []
      this.option.updateLayers.push(value)
      const index = this.checked.indexOf(value)
      this.option.layers.forEach(layer => {
        if (layer.id === value) {
          layer.visible = index < 0
        }
      })
    },
    changeInteractions () {
      this.option.interaction = []
      if (this.drawType !== 'none') {
        this.option.interaction.push({
          type: 'draw',
          value: this.drawType,
          freehand: true,
          clear: true,
          endRight: true,
          editable: false
        })
      }
    },
    save () {
      const index = this.option.layers.findIndex(x => x.id === 'polygon')
      if (index > -1) {
        this.option.layers[index].source.features.push({
          type: 'polygon', // 除了普通icon点位，其他元素需注明元素类型
          style: {
            fill: {
              color: 'rgba(167,26,12,0.15)'
            },
            stroke: {
              color: 'rgba(67,126,255,1)',
              width: 1,
              lineDash: [20, 10, 20, 10]
            }
          },
          coordinates: this.drawCoors
        })
      }
      this.hideOverlayById('drawEnd')
    },
    clearDraw () {
      const index = this.option.interaction.findIndex(x => x.type === 'draw')
      if (index > -1) {
        this.option.interaction.splice(index, 1)
        this.hideOverlayById('drawEnd')
        this.drawType = 'none'
      }
    },
    hideOverlayById (id) {
      this.option.overlays.forEach(overlay => {
        if (overlay.id === id) {
          overlay.position = undefined
        }
      })
    },
    setModify () {
      this.modifyStatus = !this.modifyStatus
      if (this.modifyStatus) {
        this.option.interaction = [{ type: 'select' }, { type: 'modify', selectFeature: true }]
      } else {
        this.option.interaction = []
      }
    },
    measure () {
      this.option.measure = false
      if (this.measureType !== 'none') {
        this.option.measure = {
          type: this.measureType,
          segments: true,
          clear: true
        }
      }
    },
    getHeatmapData () {
      const data = []
      heatmap.forEach(val => {
        const longitude = Number(val.coordinates.split(',')[0])
        const latitude = Number(val.coordinates.split(',')[1])
        data.push({
          coordinates: [longitude, latitude],
          weight: val.count,
          convert: 'bd-84'
        })
      })
      const index = this.option.layers.findIndex(x => x.id === 'heatmap')
      if (index > -1) {
        this.option.layers[index].source.features = data
      }
    },
    startTrack () {
      this.option.track[0].state = 'start'
    },
    panTo () {
      this.option.view.animate = {
        center: this.animate.center,
        zoom: this.animate.zoom
      }
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
