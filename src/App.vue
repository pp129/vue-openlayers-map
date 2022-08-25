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
          是否可编辑
        </label>
        <input type="checkbox" name="modify" v-model="modify" />
        <button v-if="modify" @click="setModify">添加编辑图案（圆）</button>
      </div>
      <div class="item">
        <button @click.prevent="addClusterFeatures()">添加点</button>
      </div>
      <div class="item">
        <label>
          切换是否聚合
        </label>
        <input type="checkbox" name="toggleCluster" v-model="toggleCluster" />
        <label>聚合距离：{{cluster.distance}}</label>
        <input type="range" step=10 min=0 max=300 v-model="cluster.distance" :disabled="!toggleCluster"/>
      </div>
     <div class="item">
       <label>透视角度：{{perspectiveMap.angle}}</label>
       <input type="range" step=1 min=0 max=30 v-model="perspectiveMap.angle" />
       <p><span class="tag" title="在 Chrome 和 Edge 上测试。不适用于火狐。">实验性功能</span></p>
     </div>
      <div class="item">
        <p v-if="mapLoaded">当前层级：{{mapZoom}} 级</p>
      </div>
    </div>
    <v-map
        ref="map"
        height="95%"
        :view="view"
        :controls="controls"
        :interactions="interactions"
        :perspectiveMap="perspectiveMap"
        @load="mapLoaded = true"
        @changeZoom="changeZoom"
        @click="onClick"
        @clickfeature="onClickFeature"
        @dblclick="onDblClick"
        @contextmenu.prevent="onContextmenu"  @pointermove="pointermove">
      <v-tile :tile-type="tile" :xyz="xyz"></v-tile>
<!--      <v-tile tile-type="GDF"></v-tile>-->
<!--      <v-overview :tile-type="tile" :rotateWithView="rotateWithView" collapsible></v-overview>-->
      <v-vector
          ref="layer1"
          layer-id="layer1"
          :features="features"
          :cluster="toggleCluster?cluster:false"
          :z-index="3"></v-vector>
      <v-vector
          :features="features2"
          :modify="modify"
          select
          :z-index="4"
          @select="onselect" @modifystart="modifystart" @modifyend="modifyend" @modifychange="modifychange"></v-vector>
      <v-draw ref="drawLayer" :type="drawType" end-right></v-draw>
      <v-measure ref="measureLayer" :type="measureType" end-right></v-measure>
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
    </v-map>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    const resolutions = []
    for (let i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    return {
      mapLoaded: false,
      mapZoom: 12,
      addModify: false,
      view: {
        city: '厦门', // 优先级比center高
        center: [118, 24], // 预留此参数，组件监听view.center变化，触发panTo方法
        zoom: 12,
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
      perspectiveMap: {
        angle: 0
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
      tile: 'TD',
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
          }
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
          }
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
          }
        },
        {
          id: 'point4',
          coordinates: [118.102941, 24.454704],
          style: {}
        }
      ],
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
      drawType: '',
      measureType: ''
    }
  },
  methods: {
    addClusterFeatures (count = 1000) {
      for (let i = 0; i < count; i++) {
        this.features.push({
          coordinates: [117.5 + 1 * Math.random(), 24.1 + 1 * Math.random()],
          style: {
            icon: {
              src: new URL('./assets/img/point_1.png', import.meta.url).href,
              scale: 0.6
            }
          },
          name: `聚合要素-${i + 1}`
        })
      }
      console.log(this.features)
    },
    setModify () {
      this.addModify = !this.addModify
      if (this.addModify) {
        this.features2.push({
          id: 'add',
          type: 'circle',
          center: [],
          radius: 100
        })
      }
    },
    onClick (evt, map) {
      console.log(evt)
      this.positionMenu = undefined
      if (this.addModify && !this.drawType && !this.measureType) {
        this.features2[3].center = evt.coordinate
        this.addModify = false
        this.$refs.map.panTo({
          center: evt.coordinate,
          zoom: 15
        })
      }
    },
    changeZoom (evt, map) {
      this.mapZoom = map.getView().getZoom()
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
      console.log(feature.getGeometry())
      const Geometry = feature.getGeometry()
      const center = this.$refs.map.calculateCenter(Geometry)
      console.log(center)
      // this.$refs.layer1.updateFeatureById('point3', {
      //   position: center.center
      // })
      this.features.forEach(feature => {
        if (feature.id === 'point3') {
          feature.coordinates = center.center
        }
      })
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
    }
  },
  mounted () {
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
</style>
