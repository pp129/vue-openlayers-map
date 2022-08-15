<template>
  <div id="app">
    <div class="tool">
      <select id="changeLayer" class="btn" v-model="tile" @change="changeTile">
        <option v-for="(item,index) in baseTile" :key="index" :value="item.value">{{item.name}}</option>
      </select>
      <button @click="startTrack">轨迹动画开始</button>
      <button @click="pauseTrack">轨迹动画暂停</button>
      <button @click="stopTrack">轨迹动画结束</button>
      <button @click="disposeTrack">轨迹动画清除</button>
    </div>
    <v-map
        ref="map"
        :view="view"
        :controls="controls"
        :interactions="interactions"
        @click="onClick" @contextmenu.prevent="onContextmenu" @clickfeature="onClickFeature" @dblclick="onDblClick">
      <v-tile :tile-type="tile" :xyz="xyz"></v-tile>
      <v-overview :tile-type="tile" :rotateWithView="rotateWithView" collapsible></v-overview>
      <v-vector ref="layer1" layer-id="layer1" :features="features" :modify="false"></v-vector>
      <v-vector
          :features="features2"
          :modify="modify"
          select
          @select="onselect" @modifystart="modifystart" @modifyend="modifyend" @modifychange="modifychange"></v-vector>
      <v-cluster :layer-id="cluster.id" :features="cluster.features" :distance="cluster.distance"></v-cluster>
      <v-overlay :position="position">overlay</v-overlay>
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
      view: {
        city: '厦门', // 优先级比center高
        center: [118, 24], // 预留此参数，组件监听view.center变化，触发panTo方法
        zoom: 12
      },
      controls: {
        attribution: true,
        zoom: true,
        rotate: true,
        FullScreen: true,
        ScaleLine: true,
        ZoomSlider: true
      },
      rotateWithView: true,
      interactions: {
        DragRotateAndZoom: true,
        doubleClickZoom: false
      },
      baseTile: [
        {
          name: '天地图-街道+注记',
          value: 'td'
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
          name: '高德',
          value: 'GD'
        },
        {
          name: 'OSM',
          value: 'OSM'
        }
      ],
      tile: 'bd',
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
      modify: {},
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
      features: [
        {
          id: 'point1',
          coordinates: [118.140448, 24.512917],
          convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL('./assets/img/point_6.png', import.meta.url).href
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
        },
        {
          id: 'point2',
          coordinates: [118.168742, 24.487505],
          style: {},
          properties: {
            name: 'feature1'
          }
        },
        {
          id: 'point3',
          coordinates: [118.1401534526062, 24.461376055501933],
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL('./assets/img/point_5.png', import.meta.url).href
            }
          }
        }
      ],
      position: undefined,
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
                // src: require('@/assets/img/point_red.png')
                src: new URL('./assets/img/point_red.png', import.meta.url).href
              }
            }
          },
          {
            coordinates: [117.97481324839465, 24.502306340499445],
            style: {
              icon: {
                // src: require('@/assets/img/point_blue.png')
                src: new URL('./assets/img/point_blue.png', import.meta.url).href
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
      }
    }
  },
  methods: {
    onClick (evt, map) {
      console.log(evt.coordinate)
    },
    onContextmenu (evt, map) {
    },
    onClickFeature (feature, layer, evt) {
      console.log(feature)
      console.log(layer)
      console.log(evt)
      // this.controls.ZoomSlider = false
      if (layer.get('id') === 'layer1') {
        this.position = evt.coordinate
      } else {
        this.position = undefined
      }
    },
    onDblClick (evt, map) {
      this.position = undefined
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
  position: relative;
}
.tool{
  position: absolute;
  top: 10px;
  left: 100px;
  z-index: 2;
}
</style>
