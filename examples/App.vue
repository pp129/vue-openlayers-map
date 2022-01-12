<template>
  <div id="app">
    <div class="tools">
      <button class="btn" @click="addLayer">新增/更新点位图层</button>
      <button class="btn" @click="removeLayer">删除点位图层</button>
      <button class="btn" @click="moveFeature">移动点位</button>
      <select id="changeLayer" class="btn" v-model="selectedTile" @change="changeTile">
        <option value="td">天地图-矢量</option>
        <option value="td_img">天地图-卫星</option>
        <option value="xyz">天地图-地形</option>
      </select>
      <div class="checkbox-group btn">
        <div v-for="(item,index) in checkbox" :key="index" class="checkbox-item">
          <span>{{item.label}}</span>
          <input type="checkbox" :value="item.value" v-model="checked" @click="setLayerVisible(item.value)">
        </div>
      </div>
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
      @click="onClick"
      @changeZoom="onChangeZoom">
    </v-map>
    <div ref="overlay" id="overlay1" class="overlay">
      <p>overlay1</p>
      <span @click="closeOverlay('overlay1')">close</span>
    </div>
    <div ref="overlay" id="overlay2" class="overlay">
      <p>overlay2</p>
      <span @click="closeOverlay('overlay2')">close</span>
    </div>
  </div>
</template>

<script>
import { VMap } from '~/index'
import mapOption from '@/mapOption.js'

import Mock from 'mockjs'

export default {
  name: 'App',
  components: {
    VMap
  },
  data () {
    return {
      mapId: 'map',
      height: '100%',
      width: '100%',
      option: mapOption,
      coder: '',
      newLayer: {
      },
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
      editor: null,
      currentZoom: 0
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
  },
  methods: {
    onClick (evt, map) {
      console.log('on map click === get coordinate', evt.coordinate)
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
              feature.update('style', feature.get('updateStyle'))
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
          // this.option.overlays[index] = _.cloneDeep(overlay)
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
        features: features
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
    setMockData () {
      const Random = Mock.Random
      return Mock.mock({
        'array|100': [
          () => [Random.float(117, 118, 6, 6), Random.float(24, 24, 6, 6)]
        ]
      })
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
    justify-content: flex-start;
    align-content: center;
    .btn{
      display: flex;
      align-items: center;
      margin-left: 20px;
      background: white;
      padding: 10px;
      &-input{
        width: 100px;
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
