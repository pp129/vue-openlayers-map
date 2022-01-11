<template>
  <div id="app">
    <div class="tools">
      <button class="btn" @click="addLayer">新增/更新点位图层</button>
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
    </div>
    <div class="code">
      <button class="btn-run" @click="runCode">运行</button>
      <textarea ref="code" id="code" name="code"></textarea>
    </div>
    <v-map ref="map" class="map" :height="height" :width="width" :option="option" @click="onClick" @changeZoom="onChangeZoom"></v-map>
    <div ref="overlay" id="overlay" class="overlay">
      <p>{{overlayName}}</p>
      <span @click="closeOverlay">close</span>
    </div>
  </div>
</template>

<script>
import { VMap } from '~/index'
import mapOption from '@/mapOption.js'

import Mock from 'mockjs'

import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/theme/mdn-like.css'
import CodeMirror from 'codemirror'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/indent-fold'
import 'codemirror/mode/javascript/javascript.js'

export default {
  name: 'App',
  components: {
    VMap
  },
  data () {
    return {
      height: '100%',
      width: '70%',
      option: mapOption,
      coder: '',
      newLayer: {
      },
      selectedTile: 'td',
      overlayName: '',
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
  created () {
    this.coder = JSON.stringify(mapOption, null, 4)
  },
  mounted () {
    this.editor = CodeMirror.fromTextArea(this.$refs.code, {
      mode: 'javascript',
      theme: 'mdn-like',
      lineNumbers: true,
      lineWrapping: false,
      extraKeys: { 'Ctrl-Q': function (cm) { cm.foldCode(cm.getCursor()) } },
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    })
    this.editor.setOption('value', this.coder)
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
          let type = ''
          features.forEach(feature => {
            item = feature.get('properties')
            type = feature.get('type')
            if (type && type === 'polygon') {
              feature.update('style', feature.get('updateStyle'))
            }
          })
          if (item && Object.prototype.hasOwnProperty.call(item, 'name')) {
            this.showOverlay(item, 'overlay', 'overlay', evt.coordinate)
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
      this.overlayName = properties.name
      this.option.overlays.forEach(overlay => {
        if (overlay.id === id) {
          overlay.position = coordinate
          overlay.properties = properties
        }
      })
      this.option = Object.assign({}, this.option)
    },
    closeOverlay () {
      const overlay = this.option.overlays.filter(item => item.id === 'overlay')
      overlay[0].position = undefined
      this.option = Object.assign({}, this.option)
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
    },
    runCode () {
      this.option = JSON.parse(this.editor.getValue())
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
  .code{
    height: 100%;
    width: 30%;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
    left: 0;
    .btn-run{
      position: absolute;
      top: 12px;
      right: 28px;
      z-index: 4;
    }
    .CodeMirror{
      height: 100%;
      z-index: 3;
    }
  }
  .overlay{
    width: 100px;
    height: 100px;
    background: white;
  }
}
</style>
