<template>
  <div id="app">
    <div class="tool">
      <div class="item">
        <span class="label">选择底图</span>
        <select id="changeLayer" class="btn" v-model="tile" @change="changeTile">
          <option v-for="(item,index) in baseTile" :key="index" :value="item.value">{{item.name}}</option>
        </select>
      </div>
      <div class="item">
        <span class="label">轨迹动画</span>
        <button @click="loadTrack">加载</button>
        <button @click="startTrack">开始</button>
        <button @click="pauseTrack">暂停</button>
        <button @click="resumeTrack">恢复</button>
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
        <label>基于super-cluster聚合图层</label>
        <button @click.prevent="addClusterFeatures()">添加5w个点</button>
        <button @click.prevent="removeFeatures()">清除点</button>
      </div>
      <div class="item">
        <label>基于ol聚合图层</label>
        <label> <input type="checkbox" name="toggleCluster" v-model="toggleCluster" style="margin-right: 10px;" />聚合距离：{{cluster.distance}}</label>
        <input type="range" step=10 min=0 max=300 v-model="cluster.distance" :disabled="!toggleCluster"/>
      </div>
      <div class="item">
        <p v-if="mapLoaded">当前层级：{{mapZoom}} 级</p>
      </div>
      <div class="item">
        <label>点击位置（经纬度）</label>
        <p>{{currentCoordinateText}}</p>
        <button @click="getExtent">获取视窗边界</button>（控制台输出）
      </div>
      <div class="item">
        <label>视图移动</label>
        <button @click="panTo">厦门</button>
        <button @click="flyTo">杭州</button>
      </div>
      <div class="item">
        <span class="label">图片图层</span>
        <button @click="changeImage('xiangan',true)">翔安</button>
        <button @click="changeImage('siming',false)">思明</button>
        <button @click="imageVisible = false">清除</button>
      </div>
    </div>
    <v-map
        class="map"
        ref="map"
        :view="view"
        :controls="controls"
        :interactions="interactions"
        @click="onClick"
        @dblclick="onDblClick"
        @contextmenu.prevent="onContextmenu"
        @load="onLoad"
        @changeZoom="changeZoom"
    >
      <v-tile :tile-type="tile" :xyz="xyz" :z-index="1" :mask="tileFilter"></v-tile>
      <v-tile ref="wms" tile-type="WMS" :wms="wms" :z-index="2"></v-tile>
      <!-- 图片图层 -->
      <v-image :source="imageSource2" :geo-image="imageSource2.geoImage" :opacity="imageOpacity" :z-index="9" :visible="imageVisible"></v-image>
<!--      <v-overview :tile-type="tile" :rotateWithView="rotateWithView" collapsible></v-overview>-->
      <!-- 路况图层 -->
      <v-tile ref="trafficLayer" :visible="trafficLayer.visible" :xyz="trafficLayer.xyz" :z-index="1" layer-id="traffic" tile-type="XYZ"></v-tile>
      <!-- 海量点聚合 -->
      <v-super-cluster ref="clusterLayer" :features="clusterFeatures" :cluster="cluster" :z-index="99" @singleclick="onClickCluster">
        <v-overlay v-if="clusterOverlay.cluster" :position="clusterOverlay.position">
          <ul>
            <li v-for="item in clusterOverlay.list" :key="item.id" @click="showClusterItem(item.id)">{{ item.id }}</li>
          </ul>
        </v-overlay>
        <v-overlay v-else :position="clusterOverlay.position">
          {{ clusterOverlay.info.name }}
        </v-overlay>
      </v-super-cluster>
      <!--矢量图层-->
      <v-vector
          ref="layer1"
          layer-id="layer1"
          :features="features"
          :cluster="toggleCluster?cluster:false"
          :visible="visible1"
          :flash-time="1500"
          :overlay="overlay"
          :z-index="3" @featuresChange="featuresChange" @singleclick="onClickFeatures" @pointermove="pointermove">
        <v-overlay :position="position">{{ overlay.name }}双击地图关闭弹框</v-overlay>
      </v-vector>
      <!--可编辑图层-->
      <v-vector
          :features="features2"
          modify
          :visible="visible2"
          select
          :z-index="4"
          @select="onselect" @modifystart="modifystart" @modifyend="modifyend" @modifychange="modifychange"></v-vector>
      <!-- 绘制图层 -->
      <v-draw ref="drawLayer" :type="drawType" :arrow="arrow" :feature-style="drawFeatureStyle" :end-right="true" :clear="true" draw-once editable @drawend="drawend" :z-index="99"></v-draw>
      <!-- 测量图层 -->
      <v-measure ref="measureLayer" :type="measureType" :feature-style="measureStyle" :label-style="measureLabelStyle" :tip-style="measureTipStyle" :modify-style="measureModifyStyle" :modifiable="true"></v-measure>
      <v-overlay class="overlay" :position="positionRadius">半径：{{radius}} 米</v-overlay>
      <!--      <v-overlay class="overlay" :position="position">双击地图关闭弹框</v-overlay>-->
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
          <li v-if="drawType" @click="removeDraw">清除</li>
          <li @click="drawHandler('Polygon')">多边形</li>
          <li @click="drawHandler('LineString')">线</li>
          <li @click="drawHandler('Circle')">圆</li>
          <li @click="drawHandler('Star')">五角星</li>
          <li @click="drawHandler('Star-6')">六芒星</li>
          <li class="group">measure-测量</li>
          <li v-if="measureType" @click="measureType = ''">清除</li>
          <li @click="measureHandler('Polygon')">面积</li>
          <li @click="measureHandler('LineString')">线段</li>
        </ul>
      </v-overlay>
      <!-- 轨迹 -->
      <v-path v-if="showTrack" ref="track" :id="track.id" :path="track.path" :options="track.options" :trace-points-mode-play="track.mode"></v-path>
      <v-heatmap :features="heatmap.features" :visible="heatmap.visible" :radius="3" :blur="6" :z-index="2"></v-heatmap>
      <v-traffic :url="trafficUrl" tile-type="bd09" :timeout="5000" :clear-cache="false" visible></v-traffic>
    </v-map>
  </div>
</template>

<script>
import axios from 'axios'
import { getCentroid } from '@/utils'

export default {
  name: 'HomePage',
  data () {
    return {
      mapLoading: false,
      mapLoaded: false,
      mapZoom: 5,
      addModify: false,
      view: {
        city: '厦门', // 优先级比center高
        // center: [118.1689, 24.6478], // 预留此参数，组件监听view.center变化，触发panTo方法
        zoom: 12
        // maxZoom: 12
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
        doubleClickZoom: false,
        dragPan: true,
        mouseWheelZoom: true
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
          value: 'BD_BLUE'
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
          name: '高德卫星',
          value: 'GD_IMG'
        },
        {
          name: 'OSM',
          value: 'OSM'
        },
        {
          name: '福建省深色',
          value: 'FJ_BLUE'
        }
      ],
      tile: 'bd',
      xyz: {
        attributions:
            ['custom attribution &copy; XXX Inc. ' +
            new Date().getFullYear() +
            ' <span style="white-space: nowrap;">vue openlayers map.</span>' +
            '&nbsp;&nbsp;<span style="white-space: nowrap;">' +
            '<a href="https://pp129.github.io/vue-openlayers-map/"' +
            'target="_blank">See Docs</a></span>']
      },
      PGis: {
        projection: 'EPSG:4326',
        tileUrlFunction: function (tileCoord) {
          if (!tileCoord) {
            return ''
          }
          const z = tileCoord[0]
          const x = tileCoord[1]
          const y = -tileCoord[2] - 1
          return `44.64.18.11/Tile_sl2019/40219e3adef540b4b3d0b9b5e1d66c53/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col=${x}&Row=${y}&Zoom=${z}&V=1.0.00.0`
        },
        crossOrigin: 'anonymous'
      },
      tileFilter: undefined,
      wms: {
        url: 'http://218.5.80.6:6600/geoserver/nd/wms',
        params: {
          VERSION: '1.1.1',
          FORMAT: 'image/png',
          STYLES: '',
          LAYERS: 'nd:nd_layer',
          TILED: true
        },
        serverType: 'geoserver'
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
          type: 'polyline',
          style: {
            stroke: {
              // color: 'rgba(220,171,119,1)',
              color: 'rgba(51, 181, 94, 1)',
              width: 6
              // lineDash: [20, 10, 20, 10]
            },
            text: {
              text: 'line'
            }
          },
          coordinates: [[118.20513460817911, 24.6005204040184], [118.22511304202654, 24.607323827184675], [118.22998527470209, 24.627570481933592]],
          arrow: {
            icon: {
              src: new URL('../../assets/img/road-arrow.png', import.meta.url).href,
              scale: 1
            },
            pixel: 60 // 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集
          }
        },
        {
          type: 'LineString',
          style: {
            stroke: {
              // color: 'rgba(220,171,119,1)',
              color: 'rgba(51, 181, 94, 1)',
              width: 6
              // lineDash: [20, 10, 20, 10]
            },
            text: {
              text: 'line'
            }
          },
          coordinates: [[118.25156700065546, 24.6221373022732], [118.25156700065546, 24.6221373022732], [118.25002070715837, 24.61987888228266], [118.24817735901289, 24.617151746266767], [118.24632663479261, 24.614808166140005], [118.24326958706789, 24.61118517231314], [118.24051495840959, 24.60785319816439], [118.23908802321367, 24.606357866638586], [118.23849793723039, 24.605842211955473], [118.23570441654138, 24.603383967393324], [118.2325206344407, 24.601446071380064], [118.23193054845743, 24.60100417744486], [118.23069337954931, 24.600246453398153], [118.23022600462846, 24.599913188928053], [118.22946693947725, 24.59947867106764], [118.22848390987329, 24.598636457436964], [118.2271622513812, 24.597646051758215], [118.22660032859258, 24.597295352929518], [118.22519820383005, 24.59642966996996], [118.22445322027616, 24.5960581840214], [118.22297800531797, 24.595690721386358], [118.22213445058279, 24.595305153840467], [118.22192322662286, 24.595199877136633], [118.22145585170202, 24.594933667891905], [118.22033200612478, 24.59423227023451], [118.22012078216486, 24.594126993530676], [118.219471017031, 24.593548306935713], [118.21915451636724, 24.59316944491236], [118.21899626603536, 24.593011865132734], [118.21866233101301, 24.592545160764143], [118.21806151619367, 24.591798165553495], [118.21789253702573, 24.59151787471144], [118.21744997253828, 24.590854698532507], [118.21683842888288, 24.589984992259428], [118.216680178551, 24.589827412479803], [118.21627181222848, 24.588894674294874], [118.21565356305055, 24.587410742157385], [118.21527335992269, 24.58595094990103], [118.21512919118814, 24.58449786316721], [118.21498837521486, 24.583866202944204], [118.2148790751975, 24.58336127709715], [118.21481939604692, 24.583003872745916], [118.21481939604692, 24.582793319338247], [118.21481939604692, 24.582014808171675], [118.21476977518014, 24.581867286675855], [118.21476977518014, 24.581825712436125]],
          arrow: {
            icon: {
              src: new URL('../../assets/img/road-arrow.png', import.meta.url).href,
              scale: 1
            },
            pixel: 30 // 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集
          }
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
        },
        {
          type: 'polygon',
          coordinates: [
            [118.23048075355373, 24.587052571002776], [118.25051461705989, 24.592192894082423],
            [118.257872, 24.573517], [118.24383041710121, 24.561810933485354], [118.23048075355373, 24.587052571002776]
          ]
        }
      ],
      arrow: {
        icon: {
          src: new URL('../../assets/img/arrow.png', import.meta.url).href,
          scale: 0.6
        },
        pixel: 30 // 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集
      },
      drawStyle: {
        stroke: {
          width: 4,
          color: 'green'
        }
      },
      drawFeatureStyle: {
        stroke: {
          width: 4,
          color: 'green'
        }
      },
      toggleCluster: true,
      clusterOverlay: {
        cluster: false,
        list: [],
        info: {
          id: ''
        },
        position: undefined
      },
      clusterOption: {
        distance: 120
      },
      positionCluster: undefined,
      clusterFeatures: [],
      visible1: true,
      overlay: {
        name: '',
        showOnClick: true,
        positionOrigin: 'feature',
        position: undefined,
        data: [],
        close: () => {
          this.overlayClose()
        }
      },
      overlayIndex: 0,
      visible2: true,
      features: [
        {
          id: 'point1',
          coordinates: [118.140448, 24.512917],
          convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL('../../assets/img/point_1.png', import.meta.url).href,
              anchor: [0.5, 1]
            },
            text: {
              text: '百度转8411',
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
              // const minZoom = 12
              // const maxZoom = 16
              const textStyle = style.getText()
              const image = style.getImage()
              image.setScale((viewZoom / 12))
              if (viewZoom >= 14) {
                textStyle.setText('百度转84')
                // image.setScale(2)
              }
              if (viewZoom >= 15) {
                textStyle.setText('根据层级显示不同内容')
                // image.setScale(5)
              }
              style.setText(textStyle)
              style.setImage(image)
              return style
              // return minZoom <= viewZoom && viewZoom <= maxZoom ? style : null
            }
          },
          properties: {
            name: 'feature1',
            level: 1
          },
          flash: {
            radius: 40,
            rate: 3,
            color: 'green',
            timeout: 2000
          },
          noCluster: true
        },
        // 118.101962,24.513600
        // {
        //   id: 'point-gif',
        //   coordinates: [118.197339, 24.543658],
        //   style: {
        //     gif: {
        //       src: new URL('./assets/img/18.gif', import.meta.url).href
        //     }
        //   }
        // },
        {
          id: 'point11',
          coordinates: [118.111760, 24.511762],
          convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL('../../assets/img/point_3.png', import.meta.url).href
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
            name: 'feature11',
            level: 1
          },
          flash: {
            radius: 50,
            rate: 1,
            // color: 'green',
            timeout: 3000
          },
          noCluster: true
        },
        {
          id: 'point2',
          coordinates: [118.168742, 24.487505],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL('../../assets/img/point_4.png', import.meta.url).href
            }
          },
          flash: {
            // radius: 40,
            rate: 1,
            color: 'blue',
            timeout: 0
          },
          properties: {
            name: 'feature2',
            level: 2
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
              src: new URL('../../assets/img/point_2.png', import.meta.url).href
            }
          },
          properties: {
            level: 3,
            name: 'point3'
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
      overlayCluster: {
        trigger: 'pointermove',
        // autoHide: true,
        position: undefined
      },
      cluster: {
        style: {
          // min: 0,
          // max: 200,
          icon: {
            scale: 0.8,
            // src: require('@/assets/img/point_6.png')
            src: new URL('../../assets/img/point_3.png', import.meta.url).href
          },
          text: {
            fill: {
              color: 'white'
            }
          }
        },
        radius: 120, // supercluster radius
        distance: 120, // 要素将聚集在一起的像素距离。
        minDistance: 1// 聚合之间的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不设置最小距离。此配置可用于避免重叠图标。作为权衡，聚合要素的位置将不再是其所有要素的中心。
      },
      showTrack: false,
      track: {
        id: 'track1',
        mode: 'animation',
        path: [],
        options: {
          timeStep: 1, // skip动画的播放间隔,单位秒
          speed: 60 // animation动画播放的速度设置,单位 km/h
        }
      },
      echarts: {
        options: null,
        visible: true
      },
      drawType: '',
      measureType: '',
      measureStyle: {
        fill: {
          color: 'rgba(74,226,199,0.15)'
        },
        stroke: {
          color: '#4AE2C7',
          lineDash: [10, 10],
          width: 2
        },
        circle: {
          radius: 5,
          fill: {
            color: '#4AE2C7'
          }
        }
      },
      measureLabelStyle: {
        text: {
          fill: {
            color: '#4AE2C7'
          },
          backgroundFill: {
            color: 'rgba(74,226,199,0.15)'
          },
          backgroundStroke: {
            color: 'rgba(74,226,199,1)'
          },
          padding: [3, 3, 3, 3],
          textBaseline: 'bottom',
          offsetY: -15
        },
        shape: {
          radius: 8,
          points: 3,
          angle: Math.PI,
          displacement: [0, 8],
          fill: {
            color: 'rgba(74,226,199,1)'
          }
        }
      },
      measureTipStyle: {
        text: {
          fill: {
            color: '#4AE2C7'
          },
          backgroundFill: {
            color: 'rgba(74,226,199,0.15)'
          },
          padding: [2, 2, 2, 2],
          textAlign: 'left',
          offsetX: 15
        }
      },
      measureModifyStyle: {
        circle: {
          radius: 5,
          stroke: {
            color: '#4AE2C7'
          },
          fill: {
            color: 'rgba(74,226,199,0.15)'
          }
        },
        text: {
          text: '编辑测量',
          font: '12px Calibri,sans-serif',
          fill: {
            color: 'rgba(74,226,199,1)'
          },
          backgroundFill: {
            color: 'rgba(74,226,199,0.15)'
          },
          padding: [2, 2, 2, 2],
          textAlign: 'left',
          offsetX: 15
        }
      },
      currentCoordinateText: '',
      heatmap: {
        features: [],
        visible: true
      },
      imageSource: {
        url: '',
        imageExtent: [118.0531, 24.423728, 118.197989, 24.502344]
      },
      imageSource2: {
        geoImage: false,
        url: '',
        imageCenter: [118.213269, 24.569244],
        imageScale: [0.00004, 0.00004],
        imageExtent: [118.0531, 24.423728, 118.197989, 24.502344]
      },
      imageOpacity: 0.5,
      imageVisible: false,
      textFeatures: [
        {
          coordinates: [118.057099, 24.500103],
          style: {
            text: {
              text: '滨北',
              font: '24px sans-serif',
              fill: {
                color: '#FFFFFF'
              }
            }
          }
        },
        {
          coordinates: [118.07076307714804, 24.49984086168768],
          style: {
            text: {
              text: '50',
              font: '28px sans-serif',
              fill: {
                color: '#FF9D2F'
              }
            }
          }
        },
        {
          coordinates: [118.108984, 24.464809],
          style: {
            circle: {
              radius: 5,
              fill: {
                color: 'red'
              },
              stroke: {
                width: 0,
                color: 'red'
              }
            }
          }
        },
        {
          type: 'polyline',
          style: {
            stroke: {
              color: '#34D1FE',
              width: 2
            }
          },
          coordinates: [[118.085664, 24.482754], [118.07431, 24.495718], [118.05317343756677, 24.49607713463211]]
        },
        {
          type: 'polyline',
          style: {
            stroke: {
              color: '#34D1FE',
              width: 2
            }
          },
          coordinates: [[118.071986, 24.4628], [118.058538, 24.472773], [118.0380779141473, 24.472963941494164]]
        }
      ],
      trafficLayer: {
        visible: true,
        xyz: {
          url: 'http://its.map.baidu.com:8002/traffic/TrafficTileService?x={x}&y={y}&level={z}&time=' + (new Date()).getTime() + '&label=web2D&v=017',
          // url: 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + (new Date()).getTime(),
          // projection: 'GCJ02'
          projection: 'BD09'
          // url: 'http://rtt2b.map.qq.com/rtt/?z={z}&x={x}&y={reverseY}&time=' + (new Date()).getTime() + '&times=1'
        }
      },
      // https://its.map.baidu.com/traffic/?qt=vtraffic&z=12&x=791&y=296&udt=20230510&fn=BMapGL.cbkBMAP_CUSTOM_LAYER_0_default_791_296_12_12&v=gl
      // https://its.map.baidu.com/traffic/v1/traffic?&ApiAuthorization=eYSfK7oo7MVRcD6bbhAOZQRglX3c3H5K
      trafficUrl: 'http://its.map.baidu.com:8002/traffic/?qt=vtraffic',
      // trafficUrl: '',
      showTraffic: true
    }
  },
  methods: {
    onLoad () {
      this.mapLoaded = true
      // setTimeout(() => {
      //   this.trafficUrl = 'https://its.map.baidu.com/traffic/'
      //   this.showTraffic = true
      // }, 1000)
    },
    getRandomIntegerInRange (min, max) {
      return Math.floor((max + 1 - min) * Math.random() + min)
    },
    removeFeatures () {
      this.clusterFeatures = []
    },
    addClusterFeatures (count = 50000) {
      for (let i = 0; i < count; i++) {
        this.clusterFeatures.push({
          coordinates: [117.6 + Math.random(), 24.1 + Math.random()],
          style: {
            icon: {
              src: new URL(`../../assets/img/point_${this.getRandomIntegerInRange(1, 6)}.png`, import.meta.url).href,
              scale: 0.6
            }
          },
          id: `random-${i + 1}`,
          name: `聚合要素-${i + 1}`,
          flash: {
            color: 'purple',
            radius: 40,
            rate: 3,
            timeout: 2000
          },
          properties: {
            id: `random-${i + 1}`,
            name: `聚合要素-${i + 1}`
          }
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
    onClick (evt, map) {
      console.log(evt)
      // console.log(this.$refs.layer1.getFeatures())
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
      const wmsSource = this.$refs.wms.layer.getSource()
      const viewResolution = map.getView().getResolution()
      const projection = map.getView().getProjection()
      const url = wmsSource.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        projection,
        { INFO_FORMAT: 'application/json', FEATURE_COUNT: 50 }
      )
      if (url) {
        axios.get(url).then(res => {
          console.log(res.data.features)
        })
      }
    },
    changeZoom (evt, map) {
      this.mapZoom = map.getView().getZoom()
      // if (this.mapZoom >= 14) {
      //   this.tileFilter = {
      //     feature: {
      //       type: 'polygon',
      //       coordinates: [
      //         [118.23048075355373, 24.587052571002776], [118.25051461705989, 24.592192894082423],
      //         [118.24383041710121, 24.561810933485354], [118.23048075355373, 24.587052571002776]
      //       ]
      //     },
      //     shadowWidth: 50,
      //     fill: 'rgba(0,0,0,0.8)'
      //   }
      // } else {
      //   this.tileFilter = undefined
      // }
    },
    onContextmenu (evt, map) {
      this.positionMenu = evt.coordinate
    },
    onClickFeatures (evt, feature) {
      console.log(evt, feature)
      // const feature = features.length ? features[0] : undefined
      if (feature) {
        console.log(feature)
        if (this.toggleCluster) {
          if (feature.get('features') && feature.get('features').length <= 1) {
            const data = feature.get('features')[0]
            this.overlay.name = data.get('properties')?.name || ''
            this.position = data.get('coordinates') || evt.coordinate
          } else {
            console.log(feature.get('features'))
          }
        } else {
          this.overlay.name = feature.get('properties')?.name || ''
          this.position = feature.get('coordinates') || evt.coordinate
        }
      }
    },
    onDblClick (evt, map) {
      this.$refs.map.closeOverlays()
    },
    pointermove (evt, feature) {
      if (feature) {
        if (this.toggleCluster) {
          // console.log(feature)
          if (feature.get('features') && feature.get('features').length <= 1) {
            const data = feature.get('features')[0]
            this.level = data.get('properties')?.level || ''
            this.positionLevel = data.get('coordinates') || evt.coordinate
          }
        } else {
          console.log(feature)
          this.level = feature.get('properties')?.level || ''
          this.positionLevel = feature.get('coordinates') || evt.coordinate
        }
        // console.log(this.level)
        // console.log(this.positionLevel)
      }
    },
    changeTile () {
      setTimeout(() => {
        console.log(this.$refs.map.map.getLayers().getArray().filter(x => x.get('base')))
      }, 1000)
    },
    loadTrack () {
      fetch('data-6k.json').then(res => res.json()).then(path => {
        console.log(path)
        this.track.path = path
        this.showTrack = true
      })
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
    resumeTrack () {
      if (this.$refs.track) {
        this.$refs.track.resume()
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
      this.showTrack = false
    },
    drawend (evt, map) {
      console.log('on drawend: ', evt, map)
      console.log('sketchCoords_--', JSON.stringify(evt.target.sketchCoords_))
      if (this.drawType !== 'Polygon') return
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
        stroke: {
          color: 'red',
          width: 8
        },
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
      const feature = evt.selected[0]
      console.log(feature)
      // const geometry = feature.getGeometry()
      // console.log(geometry.getCoordinates())
    },
    modifystart (evt, map) {
      console.log('modify start: ', evt, map)
    },
    modifyend (evt, map) {
      console.log('modify end: ', evt, map)
      const feature = evt.features.getArray()[0]
      const geometry = feature.getGeometry()
      console.log(geometry.getCoordinates())
    },
    modifychange (evt, map, feature) {
      // console.log('modify change: ', evt, map, feature)
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
    closeOverlays () {
      this.$refs.map.closeOverlays()
    },
    removeDraw () {
      this.drawType = ''
      // this.$refs.drawLayer.remove()
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
    getExtent () {
      const extent = this.$refs.map.map.getView().calculateExtent(this.$refs.map.map.getSize())
      console.log(extent)
    },
    changeImage (url, geoImage) {
      this.imageSource2.geoImage = geoImage
      this.imageSource2.url = new URL(`../../assets/img/${url}.jpg`, import.meta.url).href
      this.imageOpacity = 0.9
      this.imageVisible = true
    },
    getHeatmapData () {
      axios.get('/heatmap.json').then(res => {
        console.log(res)
        const points = [].concat.apply([], res.data.map(function (track) {
          return track.map(function (seg) {
            return {
              coordinates: seg.coord,
              convert: 'bd-84'
            }
          })
        }))
        console.log(points)
        this.heatmap.features = points
      })
    },
    textLayerModifyEnd (params) {
      const coordinates = params.features.getArray()[0].getGeometry().getCoordinates()
      console.log(JSON.stringify(coordinates))
    },
    featuresChange (features) {
      console.log('features change', features)
    },
    showItem (index) {
      this.clusterOverlay = false
      this.overlayIndex = index
    },
    overlayClose () {
      if (this.toggleCluster) {
        this.clusterOverlay = true
      }
    },
    showClusterItem (id) {
      console.log(id)
      const { properties } = this.clusterFeatures.find(x => x.id === id)
      this.clusterOverlay.info = properties
      this.clusterOverlay.cluster = false
    },
    onmovestart () {
      console.log('on move start')
      this.mapLoading = true
    },
    onMoveend () {
      console.log('on move end')
      this.mapLoading = false
    },
    onChangeResolution () {
      console.log('on change Resolution')
    },
    onClickCluster (evt, feature) {
      console.log(feature)
      // const feature = features.length ? features[0] : undefined
      if (feature) {
        this.clusterOverlay.cluster = feature.get('cluster')
        if (this.clusterOverlay.cluster) {
          const id = feature.get('cluster_id')
          const count = feature.get('point_count')
          if (count <= 10) {
            const children = this.$refs.clusterLayer.getLeaves(id, Infinity)
            this.clusterOverlay.list = children.map(child => { return child.properties })
            this.clusterOverlay.position = feature.get('coordinates') || evt.coordinate
          }
        } else {
          console.log(feature.get('properties'))
          this.clusterOverlay.info = feature.get('properties')
          this.clusterOverlay.position = feature.get('coordinates') || evt.coordinate
        }
      }
    },
    getCentroid () {
      const coordinates = [
        [118.23048075355373, 24.587052571002776], [118.25051461705989, 24.592192894082423],
        [118.257872, 24.573517], [118.24383041710121, 24.561810933485354], [118.23048075355373, 24.587052571002776]
      ]
      const feature = getCentroid([coordinates])
      console.log(feature)
      this.features2.push(feature.geometry)
    }
  },
  mounted () {
    this.echarts.options = this.setEchartsOptions()
    this.getHeatmapData()
    this.getCentroid()
  }
}
</script>

<style>
.ol-rotate-custom{
  right: 5em;
  top: 0.5em;
}
.mask {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.3);
  z-index: 999;
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
.map {
  position: absolute;
  left: 0;
  top: 0;
}
.tool{
  width: 10%;
  z-index: 2;
  position: absolute;
  right: 10px;
  top: 5%;
  display: flex;
  justify-content: flex-start;
  align-items: start;
  padding-left: 10px;
  flex-direction: column;
//background: #ffffff;
}
.item{
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 10px;
  background: rgba(0,0,0,0.2);
}
.label {
  width: 100%;
}
.group{
  background:#888888;
  color: #ffffff;
  cursor: default;
}
.tag{
  color: #fff;
  background: #f91;
  padding: 0.1em 0.3em;
  display: inline-block;
  -webkit-transform: rotate(-5deg);
  transform: rotate(-5deg);
  margin: -1em 0;
  cursor: pointer;
}
</style>
