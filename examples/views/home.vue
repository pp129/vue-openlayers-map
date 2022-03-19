<template>
  <div class="home">
    <!-- tools -->
    <div class="tools">
<!--      <button class="btn" @click="webGlPoint">海量点(webGl)</button>-->
      <button class="btn" @click="graphicLayer">海量点</button>
      <button class="btn" @click="removeGraphicLayer">删除海量点</button>
      <button class="btn" @click="clusterLayer">海量点聚合</button>
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
      <button class="btn" @click="addTileLayer">新增切片图层</button>
      <button class="btn" @click="toggleLayer">显示、隐藏图层1</button>
      <button class="btn" @click="moveFeature">随机移动layer1中点位</button>
      <button class="btn" @click="addLayer">新增/更新layer2</button>
      <button class="btn" @click="removeLayer">删除layer2</button>
      <select id="changeLayer" class="btn" v-model="selectedTile" @change="changeTile">
        <option v-for="(item,index) in baseTile" :key="index" :value="item.value">{{item.name}}</option>
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
        经度：<input class="btn-input" type="number" v-model="animate.center[0]">
        纬度：<input class="btn-input" type="number" v-model="animate.center[1]">
        层级：<input class="btn-input" type="number" v-model="animate.zoom">
        <button @click="panTo">移动到</button>
      </span>
      <button class="btn" @click="setTrack">新增轨迹</button>
      <button class="btn" @click="startTrack('track1')">出发</button>
      <button class="btn" @click="pauseTrack('track1')">暂停</button>
      <button class="btn" @click="stopTrack('track1')">停止</button>
      <button class="btn" @click="disposeTrack('track1')">清除轨迹</button>
      <button class="btn" @click="initAnimateIcons()">动画弹框</button>
    </div>
    <!-- map -->
    <v-map
      ref="map"
      class="map"
      :height="height"
      :width="width"
      :view="option.view"
      :base-tile="option.baseTile"
      :visible-tile="option.visibleTile"
      :interaction="option.interaction"
      :measure="option.measure"
      @load="onLoad"
      @drawend="drawEnd"
      @measureend="measureEnd"
      @click="onClick"
      @onClickFeature="onClickFeature"
      @changeZoom="onChangeZoom">
      <!-- 鹰眼 -->
      <v-overview :view="overview.view" :layers="overview.layers"></v-overview>
      <!-- 矢量图层 -->
      <v-vector-layer v-for="layer in layers" :key="layer.id" :ref="layer.id" :layer-id="layer.id"  :visible="layer.visible" :features="layer.features"></v-vector-layer>
      <!-- 图形图层 渲染海量点 -->
      <v-graphic-layer v-if="comGraphic.show" :layer-id="comGraphic.id" :features="comGraphic.features"></v-graphic-layer>
      <!-- 热力图 -->
      <v-heatmap-layer :layer-id="heatmap.id" :features="heatmap.features"></v-heatmap-layer>
      <!-- 聚合 -->
      <v-cluster-layer :layer-id="cluster.id" :features="cluster.features" :distance="cluster.distance"></v-cluster-layer>
      <!-- 遮罩层 -->
      <v-overlay :id="overlays[0].id" :element="overlays[0].element" :position="overlays[0].position" :auto-pan="true" class="overlay">
        <!-- overlays -->
        <template v-slot="slotProps">
          <p>{{ slotProps.position }}</p>
          <span @click="closeOverlay('overlay1')">close</span>
        </template>
      </v-overlay>
      <v-overlay :id="overlays[1].id" :element="overlays[1].element" :position="overlays[1].position">
        <map-overlay @close="closeOverlay('overlay2')"></map-overlay>
      </v-overlay>
      <v-overlay :id="overlays[2].id" :element="overlays[2].element" :position="overlays[2].position">
        <button @click="save">保存</button>
        <button @click="clearDraw">删除</button>
      </v-overlay>
      <!-- 动画弹框案例 -->
      <v-vector-layer :features="animateIcons.features"></v-vector-layer>
      <v-overlay :position="animateIcons.position" :offset="[10,-17]">
        <transition mode="out-in" name="fade-right">
          <div v-show="animateIcons.showText" class="text">6102湖滨东</div>
        </transition>
      </v-overlay>
      <!-- 轨迹动画 -->
      <v-track v-for="track in option.track" :key="track.id" :ref="track.id" :id="track.id" :paths="track.paths" :options="track.options" @onLoad="onLoadTrack"></v-track>
    </v-map>
  </div>
</template>

<script>
import { VClusterLayer, VGraphicLayer, VHeatmapLayer, VMap, VOverlay, VOverview, VTrack, VVectorLayer } from '~/index'
import mapOption from '@/utils/mapOption.js'
import MapOverlay from '@/components/overlay'
import { heatmap } from '@/utils/heatmap'

import Mock from 'mockjs'

export default {
  name: 'home',
  components: {
    VMap,
    VVectorLayer,
    VGraphicLayer,
    VHeatmapLayer,
    VClusterLayer,
    VOverlay,
    VOverview,
    VTrack,
    MapOverlay
  },
  data () {
    return {
      animateIcons: {
        features: [],
        showText: false,
        position: undefined
      },
      overlays: [
        {
          id: 'overlay1',
          element: 'overlay1',
          position: undefined
        },
        {
          id: 'overlay2',
          element: 'overlay2',
          position: undefined
        },
        {
          id: 'drawEnd',
          element: 'drawEnd',
          position: undefined
        }
      ],
      comGraphic: {
        show: false,
        features: []
      },
      layers: [
        {
          id: 'layer1',
          visible: true,
          features: [
            {
              id: 'point1',
              coordinates: [118.140448, 24.512917],
              convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
              style: {
                icon: {
                  scale: 0.6,
                  src: require('@/assets/img/point_6.png')
                },
                text: {
                  text: '百度转84',
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
                },
                styleFunction: function (feature, resolution, map, style) {
                  const viewZoom = map.getView().getZoom()
                  const minZoom = 12
                  const maxZoom = 16
                  const textStyle = style.getText()
                  if (viewZoom >= 14) {
                    textStyle.setText('百度转84')
                  }
                  if (viewZoom >= 15) {
                    textStyle.setText('根据层级显示不同内容')
                  }
                  style.setText(textStyle)
                  return minZoom <= viewZoom && viewZoom <= maxZoom ? style : null
                }
              },
              properties: {
                name: 'feature1'
              }
            }
          ]
        },
        {
          id: 'layer2',
          visible: true,
          features: []
        },
        {
          id: 'polygon',
          visible: true,
          features: [
            {
              type: 'polygon', // 除了普通icon点位，其他元素需注明元素类型
              style: {
                fill: {
                  color: 'rgba(67,126,152,0.15)'
                },
                stroke: {
                  color: 'rgba(67,126,255,1)',
                  width: 1,
                  lineDash: [20, 10, 20, 10]
                },
                text: {
                  text: '多边形',
                  font: '13px sans-serif',
                  fill: {
                    color: '#3d73e8'
                  }
                }
              },
              updateStyle: {
                fill: {
                  color: 'rgba(4,3,43,0.5)'
                }
              },
              coordinates: [
                [118.23048075355373, 24.587052571002776], [118.25051461705989, 24.592192894082423],
                [118.24383041710121, 24.561810933485354], [118.23048075355373, 24.587052571002776]
              ]
            },
            {
              type: 'polyline',
              style: {
                stroke: {
                  color: 'rgba(220,171,119,1)',
                  width: 2
                  // lineDash: [20, 10, 20, 10]
                },
                text: {
                  text: 'line'
                }
              },
              coordinates: [[118.20513460817911, 24.6005204040184], [118.22511304202654, 24.607323827184675], [118.22998527470209, 24.627570481933592]]
            },
            {
              type: 'circle',
              center: [118.25945470514871, 24.608883531726836],
              radius: 500,
              style: {
                text: {
                  text: '圆形'
                }
              }
            }
          ]
        }
      ],
      heatmap: {
        id: 'heatmap',
        features: [],
        blur: 15, // 模糊大小 控制热力图热度深浅
        radius: 5, // 半径大小 点扩散的范围
        weight: 'weight'
      },
      cluster: {
        id: 'cluster',
        visible: true,
        minZoom: 10,
        maxZoom: 16,
        features: [
          {
            coordinates: [117.96768937292673, 24.51616895381355],
            style: {
              icon: {
                src: require('@/assets/img/point_red.png')
              }
            }
          },
          {
            coordinates: [117.97481324839465, 24.502306340499445],
            style: {
              icon: {
                src: require('@/assets/img/point_blue.png')
              }
            }
          }
        ],
        distance: 120, // 要素将聚集在一起的像素距离。
        minDistance: 1// 聚合之间的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不设置最小距离。此配置可用于避免重叠图标。作为权衡，聚合要素的位置将不再是其所有要素的中心。
      },
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
      overview: {
        view: {
          center: [118.045456, 24.567489],
          zoom: 10
        },
        layers: [
          'td'
        ]
      },
      option: mapOption,
      tracks: [],
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
      animate: {
        zoom: 0,
        center: [0, 0]
      },
      drawCoors: []
    }
  },
  mounted () {
    console.log('on mounted')
    console.log(this.$refs.map.map.getLayers().getArray())
  },
  methods: {
    modifyEnd (evt, map) {
      console.log('modifyEnd', evt)
    },
    onLoad () {
      console.log('on load')
      console.log(this.$refs.map.map.getLayers().getArray())
      this.$refs.map.panTo({ center: [118.118033, 24.478697], zoom: 12 })
      this.getHeatmapData()
      const distance = this.$refs.map.getDistancePoint([118.118033, 24.478697], [118.136562, 24.500419])
      console.log(distance)
    },
    onLoadTrack (track) {
      console.log(track)
    },
    drawEnd (evt) {
      console.log('on draw end', evt)
      this.drawCoors = evt.feature.getGeometry().getCoordinates()[0]
      const center = this.$refs.map.getCenterByExtent(evt.feature.getGeometry().getExtent())
      const index = this.overlays.findIndex(x => x.id === 'drawEnd')
      if (index > -1) {
        this.overlays[index].position = center
      }
    },
    measureEnd (evt) {
      console.log('on measure end', evt)
    },
    onClick (evt, map) {
      this.animateIcons.showText = false
      // this.animateIcons.position = undefined
      console.log('on map click === get coordinate', evt.coordinate)
      this.currentCoordinates = `${evt.coordinate[0].toFixed(6)}, ${evt.coordinate[1].toFixed(6)}`
      const pixel = map.getEventPixel(evt.originalEvent)
      const hit = map.hasFeatureAtPixel(pixel)
      const polyFeatures = map.getFeaturesByLayerId('polygon')
      console.log(polyFeatures)
      if (hit) {
        const features = map.getFeaturesAtPixel(evt.pixel)
        console.log(features)
        if (features && features.length > 0) {
          let item = null
          let polygon = null
          let type = ''
          features.forEach(feature => {
            if (feature.get('properties')) {
              item = feature.get('properties')
            }
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
      this.overlays.forEach((overlay, index) => {
        if (overlay.id === id) {
          overlay.position = coordinate
          overlay.offset = [20, -50]
          overlay.properties = properties
        }
      })
      // this.overlay.position = coordinate
    },
    closeOverlay (id) {
      const overlay = this.overlays.find(item => item.id === id)
      overlay.position = undefined
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
      const layer = this.layers.find(x => x.id === 'layer2')
      if (layer) {
        layer.features = features
      }
      // this.$refs.map.updateFeatures('layer2', features)
    },
    addTileLayer () {
      const index = this.tiles.map(item => item.id).indexOf('tile')
      if (index > -1) {
        this.tiles.splice(index, 1)
      } else {

      }
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
    VectorImageLayer () {
      const features = []
      const mockData = this.setMockData(20000)
      mockData.array.forEach(val => {
        features.push({
          coordinates: val
        })
      })
      console.log(features)
      const index = this.option.layers.map(item => item.id).indexOf('VectorImageLayer')
      if (index > -1) {
        this.option.layers[index].source.features = features
      }
    },
    graphicLayer () {
      const features = []
      const mockData = this.setMockData(31548)
      mockData.array.forEach(val => {
        const randomNum = Mock.mock({
          'number|1-6': 3
        })
        // console.log(randomNum)
        const pic = require(`@/assets/img/point_${randomNum.number}.png`)
        const image = new Image()
        image.src = pic
        features.push({
          style: {
            icon: {
              img: image,
              imgSize: [40, 40]
            }
          },
          coordinates: val
        })
      })
      this.comGraphic.features = features
      this.comGraphic.show = true
    },
    removeGraphicLayer () {
      this.comGraphic.show = !this.comGraphic.show
      // this.comGraphic.features = []
    },
    onClickFeature (feature, layer) {
      console.log(feature, layer)
      if (feature && feature.get('overlay') === 'animate') {
        this.animateIcons.position = feature.get('coordinates')
        this.animateIcons.showText = true
      }
    },
    clusterLayer () {
      const features = []
      const mockData = this.setMockData(41122)
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
      this.cluster.features = features
    },
    removeLayer () {
      const index = this.layers.map(item => item.id).indexOf('layer2')
      if (index > -1) {
        this.layers[index].features = []
        // this.option.updateLayers = []
      }
    },
    toggleLayer () {
      this.layers[0].visible = !this.layers[0].visible
    },
    getMockNumber () {
      return Mock.mock({
        'a|-10-10': 10
      })
    },
    moveFeature () {
      setInterval(() => {
        this.layers[0].features.forEach((feature, index) => {
          const position = [feature.coordinates[0] + (this.getMockNumber().a / 100), feature.coordinates[1] + (this.getMockNumber().a / 100)]
          // this.$refs.map.updateFeatureById('layer1', feature.id, { position: position })
          console.log(this.$refs.layer1)
          this.$refs.layer1[0].updateFeatureById(feature.id, { position: position })
        })
      }, 1000)
    },
    changeTile () {
      if (typeof this.selectedTile === 'string') {
        this.option.visibleTile = this.selectedTile
      } else if (typeof this.selectedTile === 'object') {
        this.option.visibleTile = this.selectedTile.value
      }
    },
    setMockData (count = 600) {
      const Random = Mock.Random
      const option = {}
      option[`array|${count}`] = [
        () => [Random.float(117, 118, 6, 6), Random.float(24, 24, 6, 6)]
      ]
      return Mock.mock(option)
    },
    setLayerVisible (value) {
      const index = this.checked.indexOf(value)
      const visible = index < 0
      this.$refs.map.setLayerVisibleById(value, visible)
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
      this.overlays.forEach(overlay => {
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
      this.heatmap.features = data
    },
    setTrack () {
      this.option.track.push({
        id: 'track1',
        paths: [
          {
            longitude: 118.15450000867712,
            latitude: 24.50164504684645,
            id: 1,
            info: '起点',
            time: '2018-08-20 08:21:00'
          },
          {
            longitude: 118.16383838653563,
            latitude: 24.505768746466842,
            id: 2,
            info: '35 号工业园',
            time: '2018-08-20 08:21:10'
          },
          {
            longitude: 118.16205310926304,
            latitude: 24.535005617443176,
            id: 5,
            info: '不清楚',
            time: '2018-08-20 08:21:30'
          },
          {
            longitude: 118.15062904357909,
            latitude: 24.543125760364646,
            id: 6,
            info: '厦门敦上加油站',
            time: '2018-08-20 08:21:40'
          },
          {
            longitude: 118.1449985525105,
            latitude: 24.539877767388717,
            id: 7,
            info: '宝立达汽车',
            time: '2018-08-20 08:21:50'
          },
          {
            longitude: 118.1348361968994,
            latitude: 24.53662968915482,
            id: 8,
            info: '航空商务广场 9 号楼',
            time: '2018-08-20 08:22:00'
          },
          {
            longitude: 118.12357520952354,
            latitude: 24.52800937789857,
            id: 10,
            info: '终点',
            time: '2018-08-20 08:22:20'
          }
        ],
        options: {
          // showInfoWin: false,
          overlay: {
            id: 'carOverlay',
            element: 'carOverlay'
          },
          startIcon: {
            src: require('@/assets/img/point_start.png'),
            scale: 0.05
          },
          endIcon: {
            src: require('@/assets/img/point_end.png'),
            scale: 0.05
          },
          carIcon: {
            src: require('@/assets/img/car2.png'),
            scale: 0.1
          }, // 小车图标
          speed: 120, // 车速，设置时为匀速模式，否则为实际速度模式
          arrowPixel: 20, // 方向箭头之间的像素距离，单位是 px
          tracePlay: false, // 是否进行轨迹回放，默认为 false
          lineWidth: 5, // 轨迹线宽度，单位为像素
          lineColor: 'red', // 轨迹线颜色
          passlineColor: 'lightgreen' // 通过动画轨迹线颜色
        }
      })
    },
    startTrack () {
      if (this.$refs.track1) {
        this.$refs.track1[0].start()
      } else {
        alert('track unload')
      }
    },
    pauseTrack () {
      if (this.$refs.track1) {
        this.$refs.track1[0].pause()
      } else {
        alert('track unload')
      }
    },
    stopTrack () {
      if (this.$refs.track1) {
        this.$refs.track1[0].stop()
      } else {
        alert('track unload')
      }
    },
    disposeTrack () {
      if (this.$refs.track1) {
        this.option.track = []
      } else {
        alert('track unload')
      }
    },
    panTo () {
      this.$refs.map.panTo({
        center: this.animate.center,
        zoom: this.animate.zoom
      })
    },
    initAnimateIcons () {
      this.animateIcons.features = []
      const mockData = this.setMockData()
      mockData.array.forEach((val, i) => {
        this.animateIcons.features.push({
          coordinates: val,
          style: {
            icon: {
              src: require('@/assets/img/camera.png')
            }
          },
          overlay: 'animate'
        })
      })
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
  .animate-icon{
    height: 40px;
    display: flex;
    position: relative;
  }
  .icon{
    width: 40px;
    height: 40px;
    background: url("../assets/img/camera.png") no-repeat;
    background-size: 100% 100%;
    cursor: pointer;
    z-index: 2;
  }
  .text{
    height: 34px;
    /* width: 100%; */
    /* line-height: 28px; */
    /* position: absolute; */
    /* top: 3px; */
    /* left: 25px; */
    padding-left: 20px;
    padding-right: 10px;
    box-shadow: 0 1px 13px #6695ff inset;
    z-index: 1;
    color: #6695FF;
    border-radius: 4px;
    display: flex;
    align-items: center;
    font-size: 24px;
    //margin-left: -15px;
    //margin-top: 3px;
  }
  .slide-fade-enter-active {transition: all .2s ease;}
  .slide-fade-leave-active {transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);}
  .slide-fade-enter, .slide-fade-leave-to{transform: translateX(5px);opacity: 0;}
  .fade-left-enter-active,.fade-right-enter-active{
    transition: all 0.8s ease;
  }
  .fade-left-leave-active, .fade-right-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0)
  }
  .fade-left-leave-to, .fade-right-enter{
    transform: translate3d(-10%, 0, 0);
    opacity: 0
  }
  .fade-left-enter, .fade-right-leave-to{
    transform: translate3d(-10%, 0, 0);
    opacity: 0
  }
}
</style>
