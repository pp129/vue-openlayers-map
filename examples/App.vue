<template>
  <div id="app">
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
        <option value="td">天地图-矢量</option>
        <option value="td_img">天地图-卫星</option>
        <option value="xyz">天地图-地形</option>
        <option value="bd">百度地图</option>
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
        移动到 ---
        经度：<input class="btn-input" type="number" v-model="option.view.animate.center[0]">
        维度：<input class="btn-input" type="number" v-model="option.view.animate.center[1]">
        层级：<input class="btn-input" type="number" v-model="option.view.animate.zoom">
      </span>
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
    <div ref="overlay" id="overlay1" class="overlay">
      <p>overlay1</p>
      <span @click="closeOverlay('overlay1')">close</span>
    </div>
    <map-overlay v-if="useCom" :id="overlay2" ref="overlay2" @close="closeOverlay('overlay2')"></map-overlay>
    <div v-else ref="overlay2" :id="overlay2" class="overlay">
      <p>overlay2</p>
      <span @click="closeOverlay('overlay2')">close</span>
    </div>
  </div>
</template>

<script>
import { VMap } from '~/index'
import mapOption from '@/mapOption.js'
import MapOverlay from '@/components/overlay'
import { heatmap } from '@/heatmap'

import Mock from 'mockjs'

export default {
  name: 'App',
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
      useCom: false,
      overlay2: 'overlay2'
    }
  },
  watch: {
    'option.layers': {
      handler (value) {
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
      },
      immediate: true
    }
  },
  created () {
  },
  mounted () {
    this.getHeatmapData()
  },
  methods: {
    modifyEnd (evt, map) {
      console.log('modifyEnd', evt)
    },
    drawEnd (evt) {
      console.log('on draw end', evt)
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
        console.log(overlay)
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
        features: features,
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
          coordinates: val
        })
      })
      const option = Object.assign({}, {
        id: 'webGLPoints',
        type: 'webGLPoints',
        visible: true,
        features: features
      })
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
      this.option.layers[0].features.forEach(feature => {
        feature.coordinates[0] = feature.coordinates[0] + (this.getMockNumber().a / 100)
        feature.coordinates[1] = feature.coordinates[1] + (this.getMockNumber().a / 100)
        newFeatures.push(feature)
      })
      this.option.layers[0].features = newFeatures
    },
    changeTile () {
      this.option.visibleTile = this.selectedTile
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
          freehand: true
        })
      }
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
    }
  }
}
</script>

<style lang="scss">
html,body,#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  overflow: hidden;
  pre{
    margin: 0;
    padding: 0;
  }
}
#app{
  position: relative;
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
