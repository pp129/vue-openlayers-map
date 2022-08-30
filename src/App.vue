<template>
  <div id="app">
    <div class="tool">
      <div class="item">
        <select id="changeLayer" class="btn" v-model="tile" @change="changeTile">
          <option v-for="(item,index) in baseTile" :key="index" :value="item.value">{{item.name}}</option>
        </select>
      </div>
      <div class="item">
        <span>轨迹动画</span>
        <button @click="startTrack">开始</button>
        <button @click="pauseTrack">暂停</button>
        <button @click="stopTrack">结束</button>
        <button @click="disposeTrack">清除</button>
      </div>
      <div class="item">
        <label>
          可编辑
        </label>
        <input type="checkbox" name="modify" v-model="modify" />
        <button v-if="modify" @click="setModify">添加编辑图案（圆）</button>
      </div>
      <div class="item">
        <button @click.prevent="addClusterFeatures()">添加点</button>
      </div>
      <div class="item">
        <label>
          聚合
        </label>
        <input type="checkbox" name="toggleCluster" v-model="toggleCluster" />
        <label>聚合距离：{{cluster.distance}}</label>
        <input type="range" step=10 min=0 max=300 v-model="cluster.distance" :disabled="!toggleCluster"/>
      </div>
     <div class="item">
       <label>是否3D：</label>
       <input type="checkbox" name="map3d" v-model="map3d" />
       <label>Y轴旋转角：{{perspectiveMap.pitch}}°</label>
       <label>X轴旋转角：{{perspectiveMap.roll}}°</label>
       <label>Z轴旋转角：{{perspectiveMap.heading}}°</label>
<!--       <input type="range" step=1 min=0 max=30 v-model="perspectiveMap.angle" />-->
       <p><span class="tag">实验性功能</span></p>
     </div>
      <div class="item">
        <p v-if="mapLoaded">当前层级：{{mapZoom}} 级</p>
      </div>
      <div class="item">
        <p>点击位置：{{currentCoordinateText}}</p>
      </div>
      <div class="item">
        <button @click="panTo">厦门</button>
        <button @click="flyTo">杭州</button>
      </div>
    </div>
    <v-map
        ref="map"
        height="95%"
        :view="view"
        :controls="controls"
        :interactions="interactions"
        :cesium="map3d"
        @load="mapLoaded = true"
        @changeZoom="changeZoom"
        @click="onClick"
        @map3dClick="map3dClick"
        @clickfeature="onClickFeature"
        @dblclick="onDblClick"
        @contextmenu.prevent="onContextmenu"  @pointermove="pointermove" @moveEnd="moveEnd">
      <v-tile :tile-type="tile" :xyz="xyz"></v-tile>
<!--      <v-tile tile-type="GDF"></v-tile>-->
<!--      <v-overview :tile-type="tile" :rotateWithView="rotateWithView" collapsible></v-overview>-->
      <v-vector
          ref="layer1"
          layer-id="layer1"
          :features="features"
          :cluster="toggleCluster?cluster:false"
          :visible="visible1"
          :z-index="3"></v-vector>
      <v-vector
          :features="features2"
          :modify="modify"
          :visible="visible2"
          select
          :z-index="4"
          @select="onselect" @modifystart="modifystart" @modifyend="modifyend" @modifychange="modifychange"></v-vector>
      <v-draw ref="drawLayer" :type="drawType" end-right @drawend="drawend"></v-draw>
      <v-measure ref="measureLayer" :type="measureType" end-right></v-measure>
      <v-overlay class="overlay" :position="positionRadius">半径：{{radius}} 米</v-overlay>
      <v-overlay class="overlay-cluster" :position="positionCluster" :offset="[15,15]">
        <ul>
          <li v-for="(item,index) in clusterFeatures" :key="item.name">
            <span>#{{ index + 1 }}</span>
            <span>{{item.name}}</span>
          </li>
        </ul>
      </v-overlay>
      <v-overlay class="overlay" :position="position">双击地图关闭弹框</v-overlay>
      <v-overlay class="overlay" :position="positionLevel">预警等级： {{ level }} 级</v-overlay>
      <v-overlay class="overlay-menu" :position="positionMenu">
        <ul>
          <li @click="closeOverlays">关闭所有弹框</li>
          <li class="group">layers-图层</li>
          <li @click="visible1 = !visible1">{{visible1?'隐藏':'显示'}}图层1（点位）</li>
          <li @click="visible2 = !visible2">{{visible2?'隐藏':'显示'}}图层2（图形）</li>
          <li @click="heatmap.visible = !heatmap.visible">{{heatmap.visible?'隐藏':'显示'}}热力图（杭州）</li>
          <li @click="echarts.visible = !echarts.visible">{{echarts.visible?'隐藏':'显示'}}飞行图</li>
          <li class="group">controls-控制</li>
          <li @click="controls.attribution = !controls.attribution">{{ controls.attribution?'关闭':'显示' }}归属说明</li>
          <li @click="controls.zoom = !controls.zoom">{{ controls.zoom?'关闭':'显示' }}层级控制按钮</li>
          <li @click="controls.rotate = !controls.rotate">{{ controls.rotate?'关闭':'显示' }}旋转控制按钮</li>
          <li @click="controls.ZoomSlider = !controls.ZoomSlider">{{ controls.ZoomSlider?'关闭':'显示' }}层级滑块</li>
          <li @click="controls.ScaleLine = !controls.ScaleLine">{{ controls.ScaleLine?'关闭':'显示' }}比例尺</li>
          <li @click="controls.FullScreen = !controls.FullScreen">{{ controls.FullScreen?'关闭':'显示' }}全屏按钮</li>
          <li class="group">draw-绘制</li>
          <li v-if="drawType" @click="drawType = ''">清除</li>
          <li @click="drawHandler('Polygon')">🔷</li>
          <li @click="drawHandler('Circle')">⭕️</li>
          <li @click="drawHandler('Star')">⭐️</li>
          <li @click="drawHandler('Star-6')">✡️</li>
          <li class="group">measure-测量</li>
          <li v-if="measureType" @click="measureType = ''">清除</li>
          <li @click="measureHandler('Polygon')">面积</li>
          <li @click="measureHandler('LineString')">线段</li>
        </ul>
      </v-overlay>
      <v-track ref="track" :id="track.id" :paths="track.paths" :options="track.options" @onLoad="onLoadTrack"></v-track>
      <v-echarts :options="echarts.options" :visible="echarts.visible"></v-echarts>
      <v-heatmap :features="heatmap.features" :visible="heatmap.visible" :radius="3" :blur="6"></v-heatmap>
    </v-map>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'App',
  data () {
    const resolutions = []
    for (let i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    return {
      mapLoaded: false,
      mapZoom: 5,
      addModify: false,
      view: {
        city: '厦门', // 优先级比center高
        // center: [118.1689, 24.6478], // 预留此参数，组件监听view.center变化，触发panTo方法
        zoom: 5,
        maxZoom: 20
      },
      controls: {
        attribution: true,
        zoom: true,
        rotate: true,
        rotateOptions: {
          className: 'ol-rotate-custom'
        },
        FullScreen: true,
        ScaleLine: true,
        ZoomSlider: true
      },
      rotateWithView: true,
      interactions: {
        DragRotateAndZoom: true,
        doubleClickZoom: false
      },
      map3d: false,
      perspectiveMap: {
        pitch: 0,
        roll: 0,
        heading: 0
      },
      baseTile: [
        {
          name: '天地图-街道+注记',
          value: 'TD'
        },
        {
          name: '天地图-影像+注记',
          value: 'TD_IMG'
        },
        {
          name: '百度',
          value: 'bd'
        },
        {
          name: '百度-暗夜',
          value: 'bd_blue'
        },
        {
          name: '百度-深色',
          value: 'bd_dark'
        },
        {
          name: 'arcgis-暗夜',
          value: 'arcgis_blue'
        },
        {
          name: 'arcgis-灰色',
          value: 'arcgis_gray'
        },
        {
          name: 'arcgis-暖色',
          value: 'arcgis_warm'
        },
        {
          name: 'arcgis-正常',
          value: 'arcgis_normal'
        },
        {
          name: '高德',
          value: 'GD'
        },
        {
          name: 'OSM',
          value: 'OSM'
        }
      ],
      tile: 'arcgis_blue',
      xyzBD: {
        projection: 'baidu',
        tileGrid: {
          origin: [0, 0], // 设置原点坐标
          resolutions // 设置分辨率
        },
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return ''
          }
          const z = tileCoord[0]
          const x = tileCoord[1]
          const y = -tileCoord[2] - 1
          return 'https://maponline1.bdimg.com/tile/?qt=vtile&x=' +
              x + '&y=' + y + '&z=' + z +
              '&styles=pl&scaler=1&udt=20220113&from=jsapi2_0'
        }
      },
      xyz: {
        attributions:
            ['custom attribution &copy; XXX Inc. ' +
            new Date().getFullYear() +
            ' <span style="white-space: nowrap;">vue openlayers map.</span>' +
            '&nbsp;&nbsp;<span style="white-space: nowrap;">' +
            '<a href="https://pp129.github.io/vue-openlayers-map/"' +
            'target="_blank">See Docs</a></span>']
      },
      modify: false,
      select: {
        style: {
          stroke: {
            color: 'red'
          }
        }
      },
      features2: [
        {
          id: 'polygon',
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
      ],
      toggleCluster: false,
      clusterOption: {
        distance: 120
      },
      positionCluster: undefined,
      clusterFeatures: [],
      visible1: true,
      visible2: true,
      features: [
        {
          id: 'point1',
          coordinates: [118.140448, 24.512917],
          convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL('./assets/img/point_3.png', import.meta.url).href
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
            name: 'feature1',
            level: 1
          },
          flash: {
            rate: 1,
            color: 'green'
          },
          noCluster: true
        },
        {
          id: 'point2',
          coordinates: [118.168742, 24.487505],
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL('./assets/img/point_4.png', import.meta.url).href
            }
          },
          properties: {
            name: 'feature1',
            level: 2
          },
          flash: {
            rate: 2,
            color: 'orange'
          },
          noCluster: true
        },
        {
          id: 'point3',
          coordinates: [118.1401534526062, 24.461376055501933],
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL('./assets/img/point_2.png', import.meta.url).href
            }
          },
          properties: {
            level: 3
          },
          flash: {
            color: 'red'
          },
          noCluster: true
        },
        {
          id: 'point4',
          coordinates: [118.102941, 24.454704],
          style: {},
          noCluster: true
        },
        {
          id: 'circleCenter',
          coordinates: [0, 0],
          style: {
            circle: {
              radius: 4,
              stroke: {
                color: 'rgba(0,0,0,0.4)',
                width: 2
              },
              fill: {
                color: 'rgba(255,255,255,0.4)'
              }
            }
          }
        },
        {
          id: 'circleEdge',
          coordinates: [0, 0],
          style: {
            circle: {
              radius: 4,
              stroke: {
                color: 'rgba(0,0,0,0.4)',
                width: 2
              },
              fill: {
                color: 'rgba(255,255,255,0.4)'
              }
            }
          }
        }
      ],
      radius: 0,
      positionRadius: undefined,
      position: undefined,
      positionLevel: undefined,
      positionMenu: undefined,
      level: undefined,
      cluster: {
        style: [
          {
            min: 0,
            max: 20,
            circle: {
              radius: 16,
              fill: {
                color: 'blue'
              },
              stroke: {
                width: 2
              }
            },
            text: {
              fill: {
                color: 'yellow'
              }
            }
          },
          {
            min: 20,
            max: 50,
            circle: {
              radius: 16,
              fill: {
                color: 'orange'
              },
              stroke: {
                width: 2
              }
            },
            text: {
              fill: {
                color: 'white'
              }
            }
          },
          {
            min: 50,
            circle: {
              radius: 16,
              fill: {
                color: 'red'
              },
              stroke: {
                width: 2
              }
            },
            text: {
              fill: {
                color: 'white'
              }
            }
          }
        ],
        distance: 120, // 要素将聚集在一起的像素距离。
        minDistance: 1// 聚合之间的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不设置最小距离。此配置可用于避免重叠图标。作为权衡，聚合要素的位置将不再是其所有要素的中心。
      },
      track: {
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
            // src: require('@/assets/img/point_start.png'),
            src: new URL('./assets/img/point_start.png', import.meta.url).href,
            scale: 0.05
          },
          endIcon: {
            // src: require('@/assets/img/point_end.png'),
            src: new URL('./assets/img/point_end.png', import.meta.url).href,
            scale: 0.05
          },
          carIcon: {
            // src: require('@/assets/img/car2.png'),
            src: new URL('./assets/img/car2.png', import.meta.url).href,
            scale: 0.1
          }, // 小车图标
          speed: 120, // 车速，设置时为匀速模式，否则为实际速度模式
          arrowPixel: 20, // 方向箭头之间的像素距离，单位是 px
          tracePlay: false, // 是否进行轨迹回放，默认为 false
          lineWidth: 5, // 轨迹线宽度，单位为像素
          lineColor: 'red', // 轨迹线颜色
          passlineColor: 'lightgreen' // 通过动画轨迹线颜色
        }
      },
      echarts: {
        options: null,
        visible: true
      },
      drawType: '',
      measureType: '',
      currentCoordinateText: '',
      heatmap: {
        features: [],
        visible: true
      }
    }
  },
  methods: {
    getRandomIntegerInRange (min, max) {
      return Math.floor((max + 1 - min) * Math.random() + min)
    },
    addClusterFeatures (count = 1000) {
      for (let i = 0; i < count; i++) {
        this.features.push({
          coordinates: [117.6 + 1 * Math.random(), 24.1 + 1 * Math.random()],
          style: {
            icon: {
              src: new URL(`./assets/img/point_${this.getRandomIntegerInRange(1, 6)}.png`, import.meta.url).href,
              scale: 0.6
            }
          },
          name: `聚合要素-${i + 1}`
        })
      }
    },
    setModify () {
      this.addModify = !this.addModify
      if (this.addModify) {
        this.features2.push({
          id: 'add',
          type: 'circle',
          center: [0, 0],
          radius: 400
        })
      }
    },
    onClick (evt, map, pick) {
      console.log(evt)
      this.currentCoordinateText = [evt.coordinate[0].toFixed(6), evt.coordinate[1].toFixed(6)].join(',')
      this.positionMenu = undefined
      if (this.addModify && !this.drawType && !this.measureType) {
        console.log(evt)
        this.features2[3].center = evt.coordinate
        this.features.forEach(feature => {
          if (feature.id === 'circleCenter') {
            feature.coordinates = evt.coordinate
          }
        })
        this.addModify = false
        // this.$refs.map.panTo({
        //   center: evt.coordinate,
        //   zoom: 15
        // })
      }
    },
    map3dClick (event, map3d, pick) {
      if (pick) {
        console.log(pick)
        const feature = pick.primitive.olFeature
        const layer = pick.primitive.olLayer
        console.log(layer)
        if (layer.get('id') === 'layer1') {
          this.positionLevel = feature.getPosition()
          const properties = feature.get('properties')
          this.level = undefined
          if (properties && Object.prototype.hasOwnProperty.call(properties, 'level')) {
            this.level = properties.level
            this.positionLevel = feature.get('coordinates')
          }
        }
      }
    },
    changeZoom (evt, map) {
      this.mapZoom = map.getView().getZoom()
      // if (this.mapZoom >= 16) {
      //   this.toggleCluster = true
      // } else {
      //   this.toggleCluster = false
      // }
    },
    onContextmenu (evt, map) {
      this.positionMenu = evt.coordinate
    },
    onClickFeature (feature, layer, evt) {
      console.log(feature)
      console.log(layer)
      console.log(evt)
      if (this.drawType || this.measureType) return
      if (layer.get('id') === 'layer1' && feature.getId() === 'point4') {
        this.position = evt.coordinate
      }
      if (layer.get('cluster')) {
        const coordinates = feature.getGeometry().getCoordinates()
        console.log(coordinates)
        this.clusterFeatures = []
        feature.get('features').forEach(feature => {
          console.log(feature)
          this.clusterFeatures.push({
            name: feature.get('name')
          })
        })
        this.positionCluster = coordinates
      }
    },
    onDblClick (evt, map) {
      this.position = undefined
    },
    pointermove (evt, map) {
      const pixel = map.getEventPixel(evt.originalEvent)
      const hit = map.hasFeatureAtPixel(pixel)
      if (hit) {
        const features = map.getFeaturesAtPixel(pixel)
        if (features.length > 0) {
          features.forEach(feature => {
            if (this.toggleCluster) {
              features.forEach(item => {
                const clusterFeatures = item.get('features')
                if (clusterFeatures && clusterFeatures.length > 0) {
                  clusterFeatures.forEach(el => {
                    const properties = el.get('properties')
                    if (properties && Object.prototype.hasOwnProperty.call(properties, 'level')) {
                      this.level = properties.level
                      this.positionLevel = el.get('coordinates')
                    }
                  })
                }
              })
            } else {
              const properties = feature.get('properties')
              if (properties && Object.prototype.hasOwnProperty.call(properties, 'level')) {
                this.level = properties.level
                this.positionLevel = feature.get('coordinates')
              }
            }
          })
        }
      }
    },
    changeTile () {
      setTimeout(() => {
        console.log(this.$refs.map.map.getLayers().getArray().filter(x => x.get('base')))
      }, 1000)
    },
    onLoadTrack (track) {
      console.log(track)
    },
    startTrack () {
      if (this.$refs.track) {
        this.$refs.track.start()
      } else {
        alert('track unload')
      }
    },
    pauseTrack () {
      if (this.$refs.track) {
        this.$refs.track.pause()
      } else {
        alert('track unload')
      }
    },
    stopTrack () {
      if (this.$refs.track) {
        this.$refs.track.stop()
      } else {
        alert('track unload')
      }
    },
    disposeTrack () {
      if (this.$refs.track) {
        // this.track.paths = []
        this.$refs.track.dispose()
      } else {
        alert('track unload')
      }
    },
    drawend (evt, map) {
      console.log('on drawend: ', evt, map)
      const feature = evt.feature
      const geometry = feature.getGeometry()
      const extent = geometry.getExtent()
      const inExtent = []
      this.$refs.layer1.layer.getSource().forEachFeatureInExtent(extent, feature => {
        if (feature.get('flash')) {
          inExtent.push(feature)
        }
      })
      this.$refs.map.updateFeature(feature, 'style', {
        text: {
          text: `范围内包含${inExtent.length}个预警点`,
          fill: {
            color: 'white'
          },
          offsetY: 20
        }
      })
    },
    onselect (evt, map) {
      console.log('on select: ', evt, map)
    },
    modifystart (evt, map) {
      console.log('modify start: ', evt, map)
    },
    modifyend (evt, map) {
      console.log('modify end: ', evt, map)
    },
    modifychange (evt, map, feature) {
      console.log('modify change: ', evt, map, feature)
      if (feature.getId() === 'add') {
        const Geometry = feature.getGeometry()
        const center = this.$refs.map.calculateCenter(Geometry)
        console.log(center)
        const radius = Geometry.getRadius() // 半径
        const metersPerUnit = map.getView().getProjection().getMetersPerUnit() // 半径以米为单位
        const extent = Geometry.getExtent()
        this.positionRadius = [extent[2], (extent[3] + extent[1]) / 2]
        this.radius = (radius * metersPerUnit).toFixed(2)
        this.features.forEach(feature => {
          if (feature.id === 'circleCenter') {
            feature.coordinates = center.center
          }
          if (feature.id === 'circleEdge') {
            feature.coordinates = this.positionRadius
          }
        })
      }
    },
    moveEnd (camera, map) {
      console.log(camera)
      console.log(window.Cesium.Math.toDegrees(camera.pitch))
      this.perspectiveMap.pitch = Math.ceil(window.Cesium.Math.toDegrees(camera.pitch))
      this.perspectiveMap.roll = Math.ceil(window.Cesium.Math.toDegrees(camera.roll))
      this.perspectiveMap.heading = Math.ceil(window.Cesium.Math.toDegrees(camera.heading))
    },
    closeOverlays () {
      this.$refs.map.closeOverlays()
    },
    drawHandler (type) {
      this.positionMenu = undefined
      if (this.drawType && this.drawType === type) {
        this.$refs.drawLayer.setActive(true)
      }
      this.drawType = type
    },
    measureHandler (type) {
      this.positionMenu = undefined
      if (this.measureType && this.measureType === type) {
        this.$refs.measureLayer.setActive(true)
      }
      this.measureType = type
    },
    setEchartsOptions () {
      const geoCoordMap = {
        上海: [121.4648, 31.2891],
        东莞: [113.8953, 22.901],
        东营: [118.7073, 37.5513],
        中山: [113.4229, 22.478],
        临汾: [111.4783, 36.1615],
        临沂: [118.3118, 35.2936],
        丹东: [124.541, 40.4242],
        丽水: [119.5642, 28.1854],
        乌鲁木齐: [87.9236, 43.5883],
        佛山: [112.8955, 23.1097],
        保定: [115.0488, 39.0948],
        兰州: [103.5901, 36.3043],
        包头: [110.3467, 41.4899],
        北京: [116.4551, 40.2539],
        北海: [109.314, 21.6211],
        南京: [118.8062, 31.9208],
        南宁: [108.479, 23.1152],
        南昌: [116.0046, 28.6633],
        南通: [121.1023, 32.1625],
        厦门: [118.11022, 24.490474],
        台州: [121.1353, 28.6688],
        合肥: [117.29, 32.0581],
        呼和浩特: [111.4124, 40.4901],
        咸阳: [108.4131, 34.8706],
        哈尔滨: [127.9688, 45.368],
        唐山: [118.4766, 39.6826],
        嘉兴: [120.9155, 30.6354],
        大同: [113.7854, 39.8035],
        大连: [122.2229, 39.4409],
        天津: [117.4219, 39.4189],
        太原: [112.3352, 37.9413],
        威海: [121.9482, 37.1393],
        宁波: [121.5967, 29.6466],
        宝鸡: [107.1826, 34.3433],
        宿迁: [118.5535, 33.7775],
        常州: [119.4543, 31.5582],
        广州: [113.5107, 23.2196],
        廊坊: [116.521, 39.0509],
        延安: [109.1052, 36.4252],
        张家口: [115.1477, 40.8527],
        徐州: [117.5208, 34.3268],
        德州: [116.6858, 37.2107],
        惠州: [114.6204, 23.1647],
        成都: [103.9526, 30.7617],
        扬州: [119.4653, 32.8162],
        承德: [117.5757, 41.4075],
        拉萨: [91.1865, 30.1465],
        无锡: [120.3442, 31.5527],
        日照: [119.2786, 35.5023],
        昆明: [102.9199, 25.4663],
        杭州: [119.5313, 29.8773],
        枣庄: [117.323, 34.8926],
        柳州: [109.3799, 24.9774],
        株洲: [113.5327, 27.0319],
        武汉: [114.3896, 30.6628],
        汕头: [117.1692, 23.3405],
        江门: [112.6318, 22.1484],
        沈阳: [123.1238, 42.1216],
        沧州: [116.8286, 38.2104],
        河源: [114.917, 23.9722],
        泉州: [118.3228, 25.1147],
        泰安: [117.0264, 36.0516],
        泰州: [120.0586, 32.5525],
        济南: [117.1582, 36.8701],
        济宁: [116.8286, 35.3375],
        海口: [110.3893, 19.8516],
        淄博: [118.0371, 36.6064],
        淮安: [118.927, 33.4039],
        深圳: [114.5435, 22.5439],
        清远: [112.9175, 24.3292],
        温州: [120.498, 27.8119],
        渭南: [109.7864, 35.0299],
        湖州: [119.8608, 30.7782],
        湘潭: [112.5439, 27.7075],
        滨州: [117.8174, 37.4963],
        潍坊: [119.0918, 36.524],
        烟台: [120.7397, 37.5128],
        玉溪: [101.9312, 23.8898],
        珠海: [113.7305, 22.1155],
        盐城: [120.2234, 33.5577],
        盘锦: [121.9482, 41.0449],
        石家庄: [114.4995, 38.1006],
        福州: [119.4543, 25.9222],
        秦皇岛: [119.2126, 40.0232],
        绍兴: [120.564, 29.7565],
        聊城: [115.9167, 36.4032],
        肇庆: [112.1265, 23.5822],
        舟山: [122.2559, 30.2234],
        苏州: [120.6519, 31.3989],
        莱芜: [117.6526, 36.2714],
        菏泽: [115.6201, 35.2057],
        营口: [122.4316, 40.4297],
        葫芦岛: [120.1575, 40.578],
        衡水: [115.8838, 37.7161],
        衢州: [118.6853, 28.8666],
        西宁: [101.4038, 36.8207],
        西安: [109.1162, 34.2004],
        贵阳: [106.6992, 26.7682],
        连云港: [119.1248, 34.552],
        邢台: [114.8071, 37.2821],
        邯郸: [114.4775, 36.535],
        郑州: [113.4668, 34.6234],
        鄂尔多斯: [108.9734, 39.2487],
        重庆: [107.7539, 30.1904],
        金华: [120.0037, 29.1028],
        铜川: [109.0393, 35.1947],
        银川: [106.3586, 38.1775],
        镇江: [119.4763, 31.9702],
        长春: [125.8154, 44.2584],
        长沙: [113.0823, 28.2568],
        长治: [112.8625, 36.4746],
        阳泉: [113.4778, 38.0951],
        青岛: [120.4651, 36.3373],
        韶关: [113.7964, 24.7028]
      }
      const BJData = [
        [{ name: '北京' }, { name: '上海', value: 95 }],
        [{ name: '北京' }, { name: '广州', value: 90 }],
        [{ name: '北京' }, { name: '大连', value: 80 }],
        [{ name: '北京' }, { name: '南宁', value: 70 }],
        [{ name: '北京' }, { name: '南昌', value: 60 }],
        [{ name: '北京' }, { name: '拉萨', value: 50 }],
        [{ name: '北京' }, { name: '长春', value: 40 }],
        [{ name: '北京' }, { name: '包头', value: 30 }],
        [{ name: '北京' }, { name: '重庆', value: 20 }],
        [{ name: '北京' }, { name: '常州', value: 10 }]
      ]
      const SHData = [
        [{ name: '上海' }, { name: '包头', value: 95 }],
        [{ name: '上海' }, { name: '昆明', value: 90 }],
        [{ name: '上海' }, { name: '广州', value: 80 }],
        [{ name: '上海' }, { name: '郑州', value: 70 }],
        [{ name: '上海' }, { name: '长春', value: 60 }],
        [{ name: '上海' }, { name: '重庆', value: 50 }],
        [{ name: '上海' }, { name: '长沙', value: 40 }],
        [{ name: '上海' }, { name: '北京', value: 30 }],
        [{ name: '上海' }, { name: '丹东', value: 20 }],
        [{ name: '上海' }, { name: '大连', value: 10 }]
      ]
      const GZData = [
        [{ name: '广州' }, { name: '福州', value: 95 }],
        [{ name: '广州' }, { name: '太原', value: 90 }],
        [{ name: '广州' }, { name: '长春', value: 80 }],
        [{ name: '广州' }, { name: '重庆', value: 70 }],
        [{ name: '广州' }, { name: '西安', value: 60 }],
        [{ name: '广州' }, { name: '成都', value: 50 }],
        [{ name: '广州' }, { name: '常州', value: 40 }],
        [{ name: '广州' }, { name: '北京', value: 30 }],
        [{ name: '广州' }, { name: '北海', value: 20 }],
        [{ name: '广州' }, { name: '海口', value: 10 }],
        [{ name: '广州' }, { name: '厦门', value: 10 }]
      ]
      const planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'
      const convertData = function (data) {
        const res = []
        for (let i = 0; i < data.length; i++) {
          const dataItem = data[i]
          const fromCoord = geoCoordMap[dataItem[0].name]
          const toCoord = geoCoordMap[dataItem[1].name]
          if (fromCoord && toCoord) {
            res.push({
              fromName: dataItem[0].name,
              toName: dataItem[1].name,
              coords: [fromCoord, toCoord]
            })
          }
        }
        return res
      }
      const color = ['#a6c84c', '#ffa022', '#46bee9']
      const series = [];
      [
        ['北京', BJData], ['上海', SHData], ['广州', GZData]].forEach(
        function (item, i) {
          series.push({
            name: item[0] + ' Top10',
            type: 'lines',
            zlevel: 1,
            effect: {
              show: true,
              period: 6,
              trailLength: 0.7,
              color: '#fff',
              symbolSize: 3
            },
            lineStyle: {
              normal: {
                color: color[i],
                width: 0,
                curveness: 0.2
              }
            },
            data: convertData(item[1])
          },
          {
            name: item[0] + ' Top10',
            type: 'lines',
            zlevel: 2,
            effect: {
              show: true,
              period: 6,
              trailLength: 0,
              symbol: planePath,
              symbolSize: 15
            },
            lineStyle: {
              normal: {
                color: color[i],
                width: 1,
                opacity: 0.4,
                curveness: 0.2
              }
            },
            data: convertData(item[1])
          },
          {
            name: item[0] + ' Top10',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: '{b}'
              }
            },
            symbolSize: function (val) {
              return val[2] / 8
            },
            itemStyle: {
              normal: {
                color: color[i]
              }
            },
            data: item[1].map(function (dataItem) {
              return {
                name: dataItem[1].name,
                value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
              }
            })
          })
        })
      return {
        tooltip: {
          trigger: 'item'
        },
        series
      }
    },
    panTo () {
      this.$refs.map.panTo({
        zoom: 13,
        center: [118.137676, 24.494068]
      })
    },
    flyTo () {
      this.$refs.map.flyTo({
        zoom: 13,
        flyZoom: 8,
        center: [120.126360, 30.230779]
      })
    },
    getHeatmapdata () {
      axios.get('/heatmap.json').then(res => {
        console.log(res)
        const points = [].concat.apply([], res.data.map(function (track) {
          return track.map(function (seg) {
            return {
              coordinates: seg.coord
            }
          })
        }))
        console.log(points)
        this.heatmap.features = points
      })
    }
  },
  mounted () {
    this.echarts.options = this.setEchartsOptions()
    this.getHeatmapdata()
  }
}
</script>

<style>
html,body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
ul,li{
  list-style: none;
  margin: 0;
  padding: 0;
}
li{
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}
.ol-rotate-custom{
  right: 5em;
  top: 0.5em;
}
.overlay{
  padding: 5px 10px;
  border-radius: 5px;
  background: rgba(0,0,0,0.5);
  color: #fff;
}
.overlay-menu{
  padding: 5px 10px;
  border-radius: 5px;
  background: white;
  color: #1a1a1a;
}
.overlay-cluster{
  padding: 5px 10px;
  border-radius: 5px;
  background: white;
  color: #1a1a1a;
  height: 200px;
  overflow-x: scroll;
}
.tool{
  width: 100%;
  height: 5%;
  z-index: 2;
  display: flex;
  align-items: center;
  padding-left: 10px;
}
.item{
  margin-right: 10px;
  display: flex;
  border-right: 1px solid #ccc;
  padding-right: 10px;
  align-items: center;
}
.group{
  background:#888888;
  color: #ffffff;
  cursor: default;
}
.tag{
  color: #fff;
  background: #f91;
  padding: 0.2em 0.5em;
  display: inline-block;
  -webkit-transform: rotate(-5deg);
  transform: rotate(-5deg);
  margin: -1em 0;
  cursor: pointer;
}
.cesium-credit-logoContainer{
  display: none !important;
}
.cesium-credit-textContainer{
  display: none !important;
}
</style>
