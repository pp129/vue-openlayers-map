<template>
  <div id="home">
    <div class="tool">
      <div class="item">
        <span class="label">选择底图</span>
        <select id="changeLayer" class="btn" v-model="tile" @change="changeTile">
          <option v-for="(item, index) in baseTile" :key="index" :value="item.value">{{ item.name }}</option>
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
        <label> 可编辑 </label>
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
        <label>
          <input type="checkbox" name="toggleCluster" v-model="toggleCluster" style="margin-right: 10px" />聚合距离：{{
            cluster.distance
          }}</label
        >
        <input type="range" step="10" min="0" max="300" v-model="cluster.distance" :disabled="!toggleCluster" />
      </div>
      <div class="item">
        <p v-if="mapLoaded">当前层级：{{ mapZoom }} 级</p>
      </div>
      <div class="item">
        <label>点击位置（经纬度）</label>
        <p>{{ currentCoordinateText }}</p>
        <button @click="getExtent">获取视窗边界</button>（控制台输出）
      </div>
      <div class="item">
        <label>视图移动</label>
        <button @click="panTo">厦门</button>
        <button @click="flyTo">杭州</button>
      </div>
      <div class="item">
        <span class="label">图片图层</span>
        <button @click="changeImage('xiangan', true)">翔安</button>
        <button @click="changeImage('siming', false)">思明</button>
        <button @click="imageVisible = false">清除</button>
      </div>
      <div class="item">
        <span class="label">遮罩图层</span>
        <button @click="setTileFilter(true)">展示</button>
        <button @click="setTileFilter(false)">隐藏</button>
      </div>
      <div class="item">
        <span class="label">wfs图层</span>
        <button @click="setWFSVisible(true)">展示</button>
        <button @click="setWFSVisible(false)">隐藏</button>
      </div>
      <div class="item">
        <span class="label">wms图层</span>
        <button @click="wmsVisible = true">展示</button>
        <button @click="wmsVisible = false">隐藏</button>
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
      <v-tile
        :tile-type="tileType"
        :xyz="xyz"
        :z-index="0"
        :mask="tileFilter"
        :overview-map="{ target: 'home', className: 'ol-overviewmap overview-map-customer', collapsed: false, view: view }"
      ></v-tile>
      <v-tile ref="wms" tile-type="WMS" :wms="wms" :z-index="9" :visible="wmsVisible"></v-tile>
      <!-- 图片图层 -->
      <v-image
        :source="imageSource2"
        :geo-image="imageSource2.geoImage"
        :opacity="imageOpacity"
        :z-index="9"
        :visible="imageVisible"
      ></v-image>
      <!-- <v-tile tile-type="GeoTIFF" :z-index="9" :geo-tiff="GeoTIFF" visible></v-tile> -->
      <!-- <v-overview
        :tile-type="tile"
        :rotateWithView="rotateWithView"
        target="home"
        collapsible
        className="ol-overviewmap overview-map-customer"
      ></v-overview> -->
      <!-- 海量点聚合 -->
      <v-super-cluster
        ref="clusterLayer"
        :features="clusterFeatures"
        :cluster="cluster"
        :z-index="99"
        @singleclick="onClickCluster"
      >
      </v-super-cluster>
      <v-overlay v-if="clusterOverlay.cluster" :position="clusterOverlay.position">
        <ul>
          <li v-for="item in clusterOverlay.list" :key="item.id" @click="showClusterItem(item.id)">{{ item.id }}</li>
        </ul>
      </v-overlay>
      <v-overlay v-else :position="clusterOverlay.position">
        {{ clusterOverlay.info.name }}
      </v-overlay>
      <!--矢量图层-->
      <v-vector
        ref="layer1"
        layer-id="layer1"
        :features="features"
        :cluster="toggleCluster ? cluster : false"
        :visible="visible1"
        :flash-time="1500"
        :overlay="overlay"
        :z-index="3"
        @featuresChange="featuresChange"
        @singleclick="onClickFeatures"
        @pointermove="pointermove"
      >
      </v-vector>
      <v-overlay :position="position">{{ overlay.name }}双击地图关闭弹框</v-overlay>
      <!--可编辑图层-->
      <v-vector
        :features="features2"
        modify
        :visible="visible2"
        select
        :z-index="4"
        @select="onselect"
        @modifystart="modifystart"
        @modifyend="modifyend"
        @modifychange="modifychange"
      ></v-vector>
      <!-- 绘制图层 -->
      <v-draw
        ref="drawLayer"
        :type="drawType"
        :arrow="arrow"
        :feature-style="drawFeatureStyle"
        :end-right="true"
        :clear="true"
        draw-once
        editable
        @drawend="drawend"
        :z-index="99"
      ></v-draw>
      <!-- 测量图层 -->
      <v-measure
        ref="measureLayer"
        :type="measureType"
        :feature-style="measureStyle"
        :label-style="measureLabelStyle"
        :tip-style="measureTipStyle"
        :modify-style="measureModifyStyle"
        :modifiable="true"
      ></v-measure>
      <!-- echarts图层 -->
      <v-echarts :visible="echarts.visible" :chart-options="echarts.options"></v-echarts>
      <v-overlay class="overlay" :position="positionRadius">半径：{{ radius }} 米</v-overlay>
      <!--      <v-overlay class="overlay" :position="position">双击地图关闭弹框</v-overlay>-->
      <v-overlay class="overlay" :position="positionLevel">预警等级： {{ level }} 级</v-overlay>
      <v-overlay class="overlay-menu" :position="positionMenu">
        <ul>
          <li @click="closeOverlays">关闭所有弹框</li>
          <li class="group">layers-图层</li>
          <li @click="visible1 = !visible1">{{ visible1 ? "隐藏" : "显示" }}图层1（点位）</li>
          <li @click="visible2 = !visible2">{{ visible2 ? "隐藏" : "显示" }}图层2（图形）</li>
          <li @click="heatmap.visible = !heatmap.visible">{{ heatmap.visible ? "隐藏" : "显示" }}热力图（杭州）</li>
          <li @click="echarts.visible = !echarts.visible">{{ echarts.visible ? "隐藏" : "显示" }}飞行图</li>
          <li class="group">controls-控制</li>
          <li @click="controls.attribution = !controls.attribution">{{ controls.attribution ? "关闭" : "显示" }}归属说明</li>
          <li @click="controls.zoom = !controls.zoom">{{ controls.zoom ? "关闭" : "显示" }}层级控制按钮</li>
          <li @click="controls.rotate = !controls.rotate">{{ controls.rotate ? "关闭" : "显示" }}旋转控制按钮</li>
          <li @click="controls.ZoomSlider = !controls.ZoomSlider">{{ controls.ZoomSlider ? "关闭" : "显示" }}层级滑块</li>
          <li @click="controls.ScaleLine = !controls.ScaleLine">{{ controls.ScaleLine ? "关闭" : "显示" }}比例尺</li>
          <li @click="controls.FullScreen = !controls.FullScreen">{{ controls.FullScreen ? "关闭" : "显示" }}全屏按钮</li>
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
      <v-path
        v-if="showTrack"
        ref="track"
        :id="track.id"
        :path="track.path"
        :options="track.options"
        :trace-points-mode-play="track.mode"
      ></v-path>
      <!-- 不用wfs图层也可以这样加载返回geojson格式的图层 -->
      <!-- <v-vector :source="geoJSONSource" :z-index="1" :layer-style="geoJsonStyle" @singleclick="onClickWFS"></v-vector> -->
      <!-- wfs -->
      <!-- <v-wfs
        :options="wfsOptions"
        :z-index="1"
        :layer-style="wfsLayerStyle"
        :visible="wfsLayerVisible"
        @singleclick="onClickWFS"
      ></v-wfs> -->
      <v-overlay class="overlay" :position="positionWFS">
        {{ wfsInfo }}
      </v-overlay>
      <v-heatmap :features="heatmap.features" :visible="heatmap.visible" :radius="3" :blur="6" :z-index="9"></v-heatmap>
    </v-map>
  </div>
</template>

<script>
import axios from "axios";
import { calculateCenter, getCentroid } from "@/utils";

export default {
  name: "HomePage",
  data() {
    return {
      mapLoading: false,
      mapLoaded: false,
      mapZoom: 5,
      addModify: false,
      view: {
        city: "厦门", // 优先级比center高
        // center: [118.1689, 24.6478], // 预留此参数，组件监听view.center变化，触发panTo方法
        zoom: 12,
        // maxZoom: 12
      },
      controls: {
        attribution: true,
        zoom: true,
        rotate: true,
        rotateOptions: {
          className: "ol-rotate-custom",
        },
        FullScreen: true,
        ScaleLine: true,
        ZoomSlider: true,
      },
      rotateWithView: true,
      interactions: {
        DragRotateAndZoom: true,
        doubleClickZoom: false,
        dragPan: true,
        mouseWheelZoom: true,
      },
      map3d: false,
      perspectiveMap: {
        pitch: 0,
        roll: 0,
        heading: 0,
      },
      baseTile: [
        {
          name: "天地图-街道+注记",
          value: "TD",
        },
        {
          name: "天地图-影像+注记",
          value: "TD_IMG",
        },
        {
          name: "百度",
          value: "bd",
        },
        {
          name: "百度-暗夜",
          value: "BD_BLUE",
        },
        {
          name: "百度-深色",
          value: "bd_dark",
        },
        {
          name: "arcgis-暗夜",
          value: "arcgis_blue",
        },
        {
          name: "arcgis-灰色",
          value: "arcgis_gray",
        },
        {
          name: "arcgis-暖色",
          value: "arcgis_warm",
        },
        {
          name: "arcgis-正常",
          value: "arcgis_normal",
        },
        {
          name: "高德",
          value: "GD",
        },
        {
          name: "高德卫星",
          value: "GD_IMG",
        },
        {
          name: "OSM",
          value: "OSM",
        },
        {
          name: "福建省深色",
          value: "FJ_BLUE",
        },
        {
          name: "集恩厦门卫星2022",
          value: "XYZ_1",
        },
        {
          name: "集恩厦门卫星2022_2",
          value: "XYZ_2",
        },
      ],
      XYZMix: {
        XYZ_1: {
          url:
            "http://demo1.jointsurvey.com.cn:9901/Maps/XM_ic_2022/JointMap?service=GetImage&ak=a180e97163bf4e31ba1d2293c80a49b0&col={x}&row={y}&zoom={z}",
          projection: "EPSG:4490",
        },
        XYZ_2: {
          url:
            "http://27.154.234.238:3398/admin-api/Maps/xm_pgis_20241223/JointMap?service=GetImage&ak=2587aa1916cf48e0bf350777e672484d&col={x}&row={y}&zoom={z}",
          projection: "EPSG:4490",
        },
      },
      tile: "bd",
      tileType: "bd",
      xyz: {
        attributions: [
          "custom attribution &copy; XXX Inc. " +
            new Date().getFullYear() +
            ' <span style="white-space: nowrap;">vue openlayers map.</span>' +
            '&nbsp;&nbsp;<span style="white-space: nowrap;">' +
            '<a href="https://pp129.github.io/vue-openlayers-map/"' +
            'target="_blank">See Docs</a></span>',
        ],
      },
      PGis: {
        projection: "EPSG:4326",
        tileUrlFunction: function (tileCoord) {
          if (!tileCoord) {
            return "";
          }
          const z = tileCoord[0];
          const x = tileCoord[1];
          const y = -tileCoord[2] - 1;
          return `44.64.18.11/Tile_sl2019/40219e3adef540b4b3d0b9b5e1d66c53/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col=${x}&Row=${y}&Zoom=${z}&V=1.0.00.0`;
        },
        crossOrigin: "anonymous",
      },
      tileFilter: undefined,
      wmsVisible: false,
      wms: {
        url: "http://172.16.34.132:8222/geoserver/test/wms",
        params: {
          VERSION: "1.3.0",
          FORMAT: "image/png",
          STYLES: "",
          LAYERS: "test:camera_30w",
        },
        serverType: "geoserver",
        ratio: 1,
        crossOrigin: "anonymous",
      },
      modify: false,
      select: {
        style: {
          stroke: {
            color: "red",
          },
        },
      },
      features2: [
        {
          type: "polyline",
          style: {
            stroke: {
              // color: 'rgba(220,171,119,1)',
              color: "rgba(51, 181, 94, 1)",
              width: 6,
              // lineDash: [20, 10, 20, 10]
            },
            text: {
              text: "line",
            },
          },
          coordinates: [
            [118.20513460817911, 24.6005204040184],
            [118.22511304202654, 24.607323827184675],
            [118.22998527470209, 24.627570481933592],
          ],
          arrow: {
            icon: {
              src: new URL("../../assets/img/road-arrow.png", import.meta.url).href,
              scale: 1,
            },
            pixel: 60, // 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集
          },
        },
        {
          type: "LineString",
          style: {
            stroke: {
              // color: 'rgba(220,171,119,1)',
              color: "rgba(51, 181, 94, 1)",
              width: 6,
              // lineDash: [20, 10, 20, 10]
            },
            text: {
              text: "line",
            },
          },
          coordinates: [
            [118.25156700065546, 24.6221373022732],
            [118.25156700065546, 24.6221373022732],
            [118.25002070715837, 24.61987888228266],
            [118.24817735901289, 24.617151746266767],
            [118.24632663479261, 24.614808166140005],
            [118.24326958706789, 24.61118517231314],
            [118.24051495840959, 24.60785319816439],
            [118.23908802321367, 24.606357866638586],
            [118.23849793723039, 24.605842211955473],
            [118.23570441654138, 24.603383967393324],
            [118.2325206344407, 24.601446071380064],
            [118.23193054845743, 24.60100417744486],
            [118.23069337954931, 24.600246453398153],
            [118.23022600462846, 24.599913188928053],
            [118.22946693947725, 24.59947867106764],
            [118.22848390987329, 24.598636457436964],
            [118.2271622513812, 24.597646051758215],
            [118.22660032859258, 24.597295352929518],
            [118.22519820383005, 24.59642966996996],
            [118.22445322027616, 24.5960581840214],
            [118.22297800531797, 24.595690721386358],
            [118.22213445058279, 24.595305153840467],
            [118.22192322662286, 24.595199877136633],
            [118.22145585170202, 24.594933667891905],
            [118.22033200612478, 24.59423227023451],
            [118.22012078216486, 24.594126993530676],
            [118.219471017031, 24.593548306935713],
            [118.21915451636724, 24.59316944491236],
            [118.21899626603536, 24.593011865132734],
            [118.21866233101301, 24.592545160764143],
            [118.21806151619367, 24.591798165553495],
            [118.21789253702573, 24.59151787471144],
            [118.21744997253828, 24.590854698532507],
            [118.21683842888288, 24.589984992259428],
            [118.216680178551, 24.589827412479803],
            [118.21627181222848, 24.588894674294874],
            [118.21565356305055, 24.587410742157385],
            [118.21527335992269, 24.58595094990103],
            [118.21512919118814, 24.58449786316721],
            [118.21498837521486, 24.583866202944204],
            [118.2148790751975, 24.58336127709715],
            [118.21481939604692, 24.583003872745916],
            [118.21481939604692, 24.582793319338247],
            [118.21481939604692, 24.582014808171675],
            [118.21476977518014, 24.581867286675855],
            [118.21476977518014, 24.581825712436125],
          ],
          arrow: {
            icon: {
              src: new URL("../../assets/img/road-arrow.png", import.meta.url).href,
              scale: 1,
            },
            pixel: 30, // 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集
          },
        },
        {
          type: "circle",
          center: [118.25945470514871, 24.608883531726836],
          radius: 500,
          style: {
            text: {
              text: "圆形",
            },
          },
        },
        {
          type: "polygon",
          coordinates: [
            [118.23048075355373, 24.587052571002776],
            [118.25051461705989, 24.592192894082423],
            [118.257872, 24.573517],
            [118.24383041710121, 24.561810933485354],
            [118.23048075355373, 24.587052571002776],
          ],
        },
      ],
      arrow: {
        icon: {
          src: new URL("../../assets/img/arrow.png", import.meta.url).href,
          scale: 0.6,
        },
        pixel: 30, // 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集
      },
      drawStyle: {
        stroke: {
          width: 4,
          color: "green",
        },
      },
      drawFeatureStyle: {
        stroke: {
          width: 4,
          color: "green",
        },
      },
      toggleCluster: true,
      clusterOverlay: {
        cluster: false,
        list: [],
        info: {
          id: "",
        },
        position: undefined,
      },
      clusterOption: {
        distance: 120,
      },
      positionCluster: undefined,
      clusterFeatures: [],
      visible1: true,
      overlay: {
        name: "",
        showOnClick: true,
        positionOrigin: "feature",
        position: undefined,
        data: [],
        close: () => {
          this.overlayClose();
        },
      },
      overlayIndex: 0,
      visible2: true,
      features: [
        {
          id: "point1",
          coordinates: [118.140448, 24.512917],
          convert: "bd-84", // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL("../../assets/img/point_1.png", import.meta.url).href,
              anchor: [0.5, 1],
            },
            text: {
              text: "百度转8411",
              font: "13px sans-serif",
              fill: {
                color: "#3d73e8",
              },
              backgroundFill: {
                color: "#ffffff",
              },
              stroke: {
                color: "#ffffff",
                width: 1,
              },
              backgroundStroke: {
                color: "#000000",
                width: 1,
              },
              offsetX: 0,
              offsetY: 30,
            },
            styleFunction: function (feature, resolution, map, style) {
              const viewZoom = map.getView().getZoom();
              // const minZoom = 12
              // const maxZoom = 16
              const textStyle = style.getText();
              const image = style.getImage();
              image.setScale(viewZoom / 12);
              if (viewZoom >= 14) {
                textStyle.setText("百度转84");
                // image.setScale(2)
              }
              if (viewZoom >= 15) {
                textStyle.setText("根据层级显示不同内容");
                // image.setScale(5)
              }
              style.setText(textStyle);
              style.setImage(image);
              return style;
              // return minZoom <= viewZoom && viewZoom <= maxZoom ? style : null
            },
          },
          properties: {
            name: "feature1",
            level: 1,
          },
          flash: {
            radius: 40,
            rate: 3,
            color: "green",
            timeout: 2000,
          },
          noCluster: true,
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
          id: "point11",
          coordinates: [118.11176, 24.511762],
          convert: "bd-84", // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_6.png')
              src: new URL("../../assets/img/point_3.png", import.meta.url).href,
            },
            text: {
              text: "百度转84",
              font: "13px sans-serif",
              fill: {
                color: "#3d73e8",
              },
              backgroundFill: {
                color: "#ffffff",
              },
              stroke: {
                color: "#ffffff",
                width: 1,
              },
              backgroundStroke: {
                color: "#000000",
                width: 1,
              },
              offsetX: 0,
              offsetY: 30,
            },
            styleFunction: function (feature, resolution, map, style) {
              const viewZoom = map.getView().getZoom();
              const minZoom = 12;
              const maxZoom = 16;
              const textStyle = style.getText();
              if (viewZoom >= 14) {
                textStyle.setText("百度转84");
              }
              if (viewZoom >= 15) {
                textStyle.setText("根据层级显示不同内容");
              }
              style.setText(textStyle);
              return minZoom <= viewZoom && viewZoom <= maxZoom ? style : null;
            },
          },
          properties: {
            name: "feature11",
            level: 1,
          },
          flash: {
            radius: 50,
            rate: 1,
            // color: 'green',
            timeout: 3000,
          },
          noCluster: true,
        },
        {
          id: "point2",
          coordinates: [118.168742, 24.487505],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL("../../assets/img/point_4.png", import.meta.url).href,
            },
          },
          flash: {
            // radius: 40,
            rate: 1,
            color: "blue",
            timeout: 0,
          },
          properties: {
            name: "feature2",
            level: 2,
          },
          noCluster: true,
        },
        {
          id: "point3",
          coordinates: [118.1401534526062, 24.461376055501933],
          style: {
            icon: {
              scale: 0.6,
              // src: require('@/assets/img/point_5.png')
              src: new URL("../../assets/img/point_2.png", import.meta.url).href,
            },
          },
          properties: {
            level: 3,
            name: "point3",
          },
          noCluster: true,
        },
        {
          id: "point4",
          coordinates: [118.102941, 24.454704],
          style: {},
          noCluster: true,
        },
        {
          id: "circleCenter",
          coordinates: [0, 0],
          style: {
            circle: {
              radius: 4,
              stroke: {
                color: "rgba(0,0,0,0.4)",
                width: 2,
              },
              fill: {
                color: "rgba(255,255,255,0.4)",
              },
            },
          },
        },
        {
          id: "circleEdge",
          coordinates: [0, 0],
          style: {
            circle: {
              radius: 4,
              stroke: {
                color: "rgba(0,0,0,0.4)",
                width: 2,
              },
              fill: {
                color: "rgba(255,255,255,0.4)",
              },
            },
          },
        },
      ],
      radius: 0,
      positionRadius: undefined,
      position: undefined,
      positionLevel: undefined,
      positionMenu: undefined,
      level: undefined,
      overlayCluster: {
        trigger: "pointermove",
        // autoHide: true,
        position: undefined,
      },
      cluster: {
        style: {
          // min: 0,
          // max: 200,
          icon: {
            scale: 0.8,
            // src: require('@/assets/img/point_6.png')
            src: new URL("../../assets/img/point_3.png", import.meta.url).href,
          },
          text: {
            fill: {
              color: "white",
            },
          },
        },
        radius: 120, // supercluster radius
        distance: 120, // 要素将聚集在一起的像素距离。
        minDistance: 1, // 聚合之间的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不设置最小距离。此配置可用于避免重叠图标。作为权衡，聚合要素的位置将不再是其所有要素的中心。
      },
      showTrack: false,
      track: {
        id: "track1",
        mode: "animation",
        path: [],
        options: {
          timeStep: 1, // skip动画的播放间隔,单位秒
          speed: 60, // animation动画播放的速度设置,单位 km/h
        },
      },
      echarts: {
        options: null,
        visible: true,
      },
      drawType: "",
      measureType: "",
      measureStyle: {
        fill: {
          color: "rgba(74,226,199,0.15)",
        },
        stroke: {
          color: "#4AE2C7",
          lineDash: [10, 10],
          width: 2,
        },
        circle: {
          radius: 5,
          fill: {
            color: "#4AE2C7",
          },
        },
      },
      measureLabelStyle: {
        text: {
          fill: {
            color: "#4AE2C7",
          },
          backgroundFill: {
            color: "rgba(74,226,199,0.15)",
          },
          backgroundStroke: {
            color: "rgba(74,226,199,1)",
          },
          padding: [3, 3, 3, 3],
          textBaseline: "bottom",
          offsetY: -15,
        },
        shape: {
          radius: 8,
          points: 3,
          angle: Math.PI,
          displacement: [0, 8],
          fill: {
            color: "rgba(74,226,199,1)",
          },
        },
      },
      measureTipStyle: {
        text: {
          fill: {
            color: "#4AE2C7",
          },
          backgroundFill: {
            color: "rgba(74,226,199,0.15)",
          },
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        },
      },
      measureModifyStyle: {
        circle: {
          radius: 5,
          stroke: {
            color: "#4AE2C7",
          },
          fill: {
            color: "rgba(74,226,199,0.15)",
          },
        },
        text: {
          text: "编辑测量",
          font: "12px Calibri,sans-serif",
          fill: {
            color: "rgba(74,226,199,1)",
          },
          backgroundFill: {
            color: "rgba(74,226,199,0.15)",
          },
          padding: [2, 2, 2, 2],
          textAlign: "left",
          offsetX: 15,
        },
      },
      currentCoordinateText: "",
      heatmap: {
        features: [],
        visible: true,
      },
      imageSource: {
        url: "",
        imageExtent: [118.0531, 24.423728, 118.197989, 24.502344],
      },
      imageSource2: {
        geoImage: false,
        url: "",
        imageCenter: [118.213269, 24.569244],
        imageScale: [0.00004, 0.00004],
        imageExtent: [118.0531, 24.423728, 118.197989, 24.502344],
      },
      imageOpacity: 0.5,
      imageVisible: false,
      textFeatures: [
        {
          coordinates: [118.057099, 24.500103],
          style: {
            text: {
              text: "滨北",
              font: "24px sans-serif",
              fill: {
                color: "#FFFFFF",
              },
            },
          },
        },
        {
          coordinates: [118.07076307714804, 24.49984086168768],
          style: {
            text: {
              text: "50",
              font: "28px sans-serif",
              fill: {
                color: "#FF9D2F",
              },
            },
          },
        },
        {
          coordinates: [118.108984, 24.464809],
          style: {
            circle: {
              radius: 5,
              fill: {
                color: "red",
              },
              stroke: {
                width: 0,
                color: "red",
              },
            },
          },
        },
        {
          type: "polyline",
          style: {
            stroke: {
              color: "#34D1FE",
              width: 2,
            },
          },
          coordinates: [
            [118.085664, 24.482754],
            [118.07431, 24.495718],
            [118.05317343756677, 24.49607713463211],
          ],
        },
        {
          type: "polyline",
          style: {
            stroke: {
              color: "#34D1FE",
              width: 2,
            },
          },
          coordinates: [
            [118.071986, 24.4628],
            [118.058538, 24.472773],
            [118.0380779141473, 24.472963941494164],
          ],
        },
      ],
      trafficLayer: {
        visible: true,
        xyz: {
          url:
            "http://its.map.baidu.com:8002/traffic/TrafficTileService?x={x}&y={y}&level={z}&time=" +
            new Date().getTime() +
            "&label=web2D&v=017",
          // url: 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + (new Date()).getTime(),
          // projection: 'GCJ02'
          projection: "BD09",
          // url: 'http://rtt2b.map.qq.com/rtt/?z={z}&x={x}&y={reverseY}&time=' + (new Date()).getTime() + '&times=1'
        },
      },
      // https://its.map.baidu.com/traffic/?qt=vtraffic&z=12&x=791&y=296&udt=20230510&fn=BMapGL.cbkBMAP_CUSTOM_LAYER_0_default_791_296_12_12&v=gl
      // https://its.map.baidu.com/traffic/v1/traffic?&ApiAuthorization=eYSfK7oo7MVRcD6bbhAOZQRglX3c3H5K
      trafficUrl: "http://its.map.baidu.com:8002/traffic/?qt=vtraffic",
      // trafficUrl: '',
      showTraffic: true,
      GeoTIFF: {
        projection: "EPSG:4548",
        sources: [
          {
            url: "http://172.16.34.132:5000/ljd/result.tif",
            overviews: ["http://172.16.34.132:5000/ljd/result.tif.ovr"],
          },
        ],
      },
      wfsLayerVisible: false,
      wfsOptions: {
        featureNS: "http://218.5.80.6:6600/geoserver/xiaqu/ows",
        featureTypes: ["xiaqu:PaiChuSouXQ_polygon"],
        srsName: "EPSG:4326",
      },
      wfsLayerStyle: {
        fill: {
          color: "rgb(198, 226, 255,0.6)",
        },
        stroke: {
          color: "rgb(51, 126, 204)",
          width: 2,
        },
        text: {
          text: "",
          font: "16px sans-serif",
          fill: {
            color: "#fff",
          },
          stroke: {
            color: "#000",
            width: 3,
          },
        },
        styleFunction: function (feature, resolution, map, style) {
          const textStyle = style.getText(); // 获取文本样式
          const text_ = feature.get("NAME"); // 设置文本内容
          textStyle.setText(text_); // 更新文本样式
          style.setText(textStyle);
          return style; // 返回样式
        },
      },
      positionWFS: undefined,
      wfsInfo: "",
      geoJSONSource: {
        url:
          "http://218.5.80.6:6600/geoserver/xiaqu/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=xiaqu:PaiChuSouXQ_polygon&maxFeatures=50&outputFormat=application/json",
        format: true,
      },
      geoJsonStyle: {
        fill: {
          color: "rgb(198, 226, 255,0.6)",
        },
        stroke: {
          color: "rgb(51, 126, 204)",
          width: 2,
        },
        text: {
          text: "",
          font: "16px sans-serif",
          fill: {
            color: "#fff",
          },
          stroke: {
            color: "#000",
            width: 3,
          },
        },
        styleFunction: function (feature, resolution, map, style) {
          const textStyle = style.getText(); // 获取文本样式
          const text_ = feature.get("NAME"); // 设置文本内容
          textStyle.setText(text_); // 更新文本样式
          style.setText(textStyle);
          return style; // 返回样式
        },
      },
    };
  },
  methods: {
    onLoad() {
      this.mapLoaded = true;
      // setTimeout(() => {
      //   this.trafficUrl = 'https://its.map.baidu.com/traffic/'
      //   this.showTraffic = true
      // }, 1000)
    },
    getRandomIntegerInRange(min, max) {
      return Math.floor((max + 1 - min) * Math.random() + min);
    },
    removeFeatures() {
      this.clusterFeatures = [];
    },
    addClusterFeatures(count = 50000) {
      for (let i = 0; i < count; i++) {
        this.clusterFeatures.push({
          coordinates: [117.6 + Math.random(), 24.1 + Math.random()],
          style: {
            icon: {
              src: new URL(`../../assets/img/point_${this.getRandomIntegerInRange(1, 6)}.png`, import.meta.url).href,
              scale: 0.6,
            },
          },
          id: `random-${i + 1}`,
          name: `聚合要素-${i + 1}`,
          flash: {
            color: "purple",
            radius: 40,
            rate: 3,
            timeout: 2000,
          },
          properties: {
            id: `random-${i + 1}`,
            name: `聚合要素-${i + 1}`,
          },
        });
      }
    },
    setModify() {
      this.addModify = !this.addModify;
      if (this.addModify) {
        this.features2.push({
          id: "add",
          type: "circle",
          center: [0, 0],
          radius: 400,
        });
      }
    },
    onClick(evt, map) {
      console.log(evt);
      // console.log(this.$refs.layer1.getFeatures())
      this.currentCoordinateText = [evt.coordinate[0].toFixed(6), evt.coordinate[1].toFixed(6)].join(",");
      this.positionMenu = undefined;
      if (this.addModify && !this.drawType && !this.measureType) {
        console.log(evt);
        this.features2[3].center = evt.coordinate;
        this.features.forEach((feature) => {
          if (feature.id === "circleCenter") {
            feature.coordinates = evt.coordinate;
          }
        });
        this.addModify = false;
        // this.$refs.map.panTo({
        //   center: evt.coordinate,
        //   zoom: 15
        // })
      }
      const wmsSource = this.$refs.wms?.layer.getSource();
      if (!wmsSource) return;
      const viewResolution = map.getView().getResolution();
      const projection = map.getView().getProjection();
      const url = wmsSource.getFeatureInfoUrl(evt.coordinate, viewResolution, projection, {
        INFO_FORMAT: "application/json",
        FEATURE_COUNT: 50,
      });
      if (url) {
        axios.get(url).then((res) => {
          console.log(res.data.features);
        });
      }
    },
    changeZoom(evt, map) {
      this.mapZoom = map.getView().getZoom();
    },
    setTileFilter(visible) {
      if (visible) {
        const coordinates = [
          [118.06753147006152, 24.457176596284448],
          [118.06711975097774, 24.457662369482755],
          [118.067109860332, 24.45767720545137],
          [118.06706715453534, 24.45770985296422],
          [118.06704737324385, 24.45772716159427],
          [118.06704737324385, 24.45772716159427],
          [118.06701941959678, 24.457755115241348],
          [118.06701941959678, 24.457755115241348],
          [118.0670070562896, 24.45776500588709],
          [118.0670070562896, 24.45776500588709],
          [118.06699469298242, 24.45778231451714],
          [118.06699469298242, 24.45778231451714],
          [118.06699469298242, 24.45778231451714],
          [118.06697738435237, 24.45780456847006],
          [118.06697738435237, 24.45780456847006],
          [118.06696254838376, 24.45782187710011],
          [118.06696254838376, 24.45782187710011],
          [118.06694771241514, 24.457836713068723],
          [118.06694771241514, 24.457836713068723],
          [118.0669304037851, 24.457856494360207],
          [118.0669304037851, 24.457856494360207],
          [118.06692051313935, 24.45786638500595],
          [118.06692051313935, 24.45786638500595],
          [118.06691062249361, 24.457883693636],
          [118.06691062249361, 24.457883693636],
          [118.06690073184787, 24.457896056943177],
          [118.06690073184787, 24.457896056943177],
          [118.06690073184787, 24.457896056943177],
          [118.06689084120212, 24.457908420250355],
          [118.06689084120212, 24.457908420250355],
          [118.06687847789495, 24.45792325621897],
          [118.06687847789495, 24.45792325621897],
          [118.0668685872492, 24.457935619526147],
          [118.0668685872492, 24.457935619526147],
          [118.06685622394203, 24.45795045549476],
          [118.06685622394203, 24.45795045549476],
          [118.06684633329628, 24.457960346140503],
          [118.06684633329628, 24.457960346140503],
          [118.06684138797341, 24.457970236786245],
          [118.06684138797341, 24.457970236786245],
          [118.06683149732767, 24.45798507275486],
          [118.06683149732767, 24.45798507275486],
          [118.06682407934336, 24.457999908723473],
          [118.06682407934336, 24.457999908723473],
          [118.06681171603618, 24.45801721735352],
          [118.06681171603618, 24.45801721735352],
          [118.06680182539044, 24.458032053322135],
          [118.06680182539044, 24.458032053322135],
          [118.06679126419245, 24.4580562770223],
          [118.06678384620814, 24.45806864032948],
          [118.06677890088527, 24.458083476298093],
          [118.06677890088527, 24.458083476298093],
          [118.06676833968727, 24.458102754675387],
          [118.06676833968727, 24.458102754675387],
          [118.0667633943644, 24.458115117982565],
          [118.06675844904153, 24.458125008628308],
          [118.0667559763801, 24.45813984459692],
          [118.0667559763801, 24.45813984459692],
          [118.06674855839579, 24.458162098549842],
          [118.06674855839579, 24.458162098549842],
          [118.06674855839579, 24.458189297825633],
          [118.06674855839579, 24.458189297825633],
          [118.06674855839579, 24.458216497101425],
          [118.06674855839579, 24.458216497101425],
          [118.06674855839579, 24.458216497101425],
          [118.06674855839579, 24.458216497101425],
          [118.06674855839579, 24.458246336676716],
          [118.06674855839579, 24.458246336676716],
          [118.06674855839579, 24.458258699983894],
          [118.06674361307292, 24.458273535952507],
          [118.06674361307292, 24.458273535952507],
          [118.06674114041148, 24.458285899259685],
          [118.06674114041148, 24.458285899259685],
          [118.06674114041148, 24.458285899259685],
          [118.06673619508861, 24.458295789905428],
          [118.06673619508861, 24.458295789905428],
          [118.06673124976574, 24.45830568055117],
          [118.06673124976574, 24.45830568055117],
          [118.06672630444287, 24.458315571196913],
          [118.06672630444287, 24.458315571196913],
          [118.06672630444287, 24.458315571196913],
          [118.06671888645856, 24.45832793450409],
          [118.06671888645856, 24.45832793450409],
          [118.06671146847425, 24.45834029781127],
          [118.06671146847425, 24.45834029781127],
          [118.06670157782851, 24.458355133779882],
          [118.06670157782851, 24.458355133779882],
          [118.06668921452133, 24.458369969748496],
          [118.06668921452133, 24.458369969748496],
          [118.06667932387559, 24.45838480571711],
          [118.06667932387559, 24.45838480571711],
          [118.06666448790698, 24.458397169024288],
          [118.06666448790698, 24.458397169024288],
          [118.0666521245998, 24.458409532331466],
          [118.0666521245998, 24.458409532331466],
          [118.06664470661549, 24.458419422977208],
          [118.06664470661549, 24.458419422977208],
          [118.06663234330831, 24.45843425894582],
          [118.06663234330831, 24.45843425894582],
          [118.0666175073397, 24.45845156757587],
          [118.0666175073397, 24.45845156757587],
          [118.06660514403252, 24.45846887620592],
          [118.06660514403252, 24.45846887620592],
          [118.06659030806391, 24.45849113015884],
          [118.06659030806391, 24.45849113015884],
          [118.0665828900796, 24.458501020804583],
          [118.06656918566792, 24.458520299181878],
          [118.06656918566792, 24.458520299181878],
          [118.0665543496993, 24.458542553134798],
          [118.0665543496993, 24.458542553134798],
          [118.06654445905356, 24.458554916441976],
          [118.06654445905356, 24.458554916441976],
          [118.06653209574638, 24.458572225072025],
          [118.06653209574638, 24.458572225072025],
          [118.06652220510064, 24.458584588379203],
          [118.06652220510064, 24.458584588379203],
          [118.0665123144549, 24.45859695168638],
          [118.0665123144549, 24.45859695168638],
          [118.06650242380915, 24.45860931499356],
          [118.06650242380915, 24.45860931499356],
          [118.06649006050198, 24.458624150962173],
          [118.06649006050198, 24.458624150962173],
          [118.0664776971948, 24.458641459592222],
          [118.0664776971948, 24.458641459592222],
          [118.06646286122619, 24.458656295560836],
          [118.06646286122619, 24.458656295560836],
          [118.06644802525757, 24.458673604190885],
          [118.06644802525757, 24.458673604190885],
          [118.06643071662752, 24.458690912820934],
          [118.06643071662752, 24.458690912820934],
          [118.06643071662752, 24.458690912820934],
          [118.06641093533604, 24.45871069411242],
          [118.06641093533604, 24.45871069411242],
          [118.06639857202886, 24.458725530081033],
          [118.06638868138312, 24.458735420726775],
          [118.06638868138312, 24.458735420726775],
          [118.06638126339881, 24.458745311372518],
          [118.06638126339881, 24.458745311372518],
          [118.0663664274302, 24.45876014734113],
          [118.0663664274302, 24.45876014734113],
          [118.0663664274302, 24.45876014734113],
          [118.06635653678445, 24.458774983309745],
          [118.06635653678445, 24.458774983309745],
          [118.06635653678445, 24.458774983309745],
          [118.06634664613871, 24.45878240129405],
          [118.06634664613871, 24.45878240129405],
          [118.0663392281544, 24.458792291939794],
          [118.0663392281544, 24.458792291939794],
          [118.0663318101701, 24.458802182585536],
          [118.0663318101701, 24.458802182585536],
          [118.0663318101701, 24.458802182585536],
          [118.06632191952436, 24.45881207323128],
          [118.06632191952436, 24.45881207323128],
          [118.06632191952436, 24.45881207323128],
          [118.06632191952436, 24.45881207323128],
          [118.06632426645724, 24.458824436538457],
          [118.06632426645724, 24.458824436538457],
          [118.06632426645724, 24.458824436538457],
          [118.06633398946492, 24.458829381861328],
          [118.06633398946492, 24.458829381861328],
          [118.06634614322452, 24.458836799845635],
          [118.06634614322452, 24.458836799845635],
          [118.0663558662322, 24.458841745168506],
          [118.0663558662322, 24.458841745168506],
          [118.0663680199918, 24.458846690491377],
          [118.0663680199918, 24.458846690491377],
          [118.0663801737514, 24.458854108475684],
          [118.0663801737514, 24.458854108475684],
          [118.06638989675908, 24.45886152645999],
          [118.06638989675908, 24.45886152645999],
          [118.06640452318011, 24.458868944444298],
          [118.06640452318011, 24.458868944444298],
          [118.06641424618779, 24.458876362428605],
          [118.06641424618779, 24.458876362428605],
          [118.06642396919547, 24.45888378041291],
          [118.06642396919547, 24.45888378041291],
          [118.06644098445891, 24.458893671058654],
          [118.06644098445891, 24.458893671058654],
          [118.06645804163186, 24.458903561704396],
          [118.06645804163186, 24.458903561704396],
          [118.06647019539146, 24.45891345235014],
          [118.06647019539146, 24.45891345235014],
          [118.06647019539146, 24.45891345235014],
          [118.06647991839914, 24.458920870334445],
          [118.06648964140682, 24.458925815657317],
          [118.06648964140682, 24.458925815657317],
          [118.06650422591834, 24.45893570630306],
          [118.06651399083553, 24.458943124287366],
          [118.06651399083553, 24.458943124287366],
          [118.06652371384321, 24.458948069610237],
          [118.06653343685089, 24.458955487594544],
          [118.06653343685089, 24.458955487594544],
          [118.06654559061049, 24.458965378240286],
          [118.06654559061049, 24.458965378240286],
          [118.06655531361817, 24.45897526888603],
          [118.06655531361817, 24.45897526888603],
          [118.06657484345256, 24.458987632193207],
          [118.06657484345256, 24.458987632193207],
          [118.06659194253503, 24.45899752283895],
          [118.06659194253503, 24.45899752283895],
          [118.06661147236942, 24.459009886146127],
          [118.06661147236942, 24.459009886146127],
          [118.06662857145189, 24.45901977679187],
          [118.06662857145189, 24.45901977679187],
          [118.06662857145189, 24.45901977679187],
          [118.06664319787292, 24.459029667437612],
          [118.06664319787292, 24.459029667437612],
          [118.0666529208806, 24.45903708542192],
          [118.0666529208806, 24.45903708542192],
          [118.0666650746402, 24.45904697606766],
          [118.0666650746402, 24.45904697606766],
          [118.06667727030931, 24.459051921390532],
          [118.06668950788794, 24.45905933937484],
          [118.06668950788794, 24.45905933937484],
          [118.06672043711065, 24.459073043786525],
          [118.06672043711065, 24.459073043786525],
          [118.06673016011833, 24.45908046177083],
          [118.06673016011833, 24.45908046177083],
          [118.06674721729128, 24.45908787975514],
          [118.06674721729128, 24.45908787975514],
          [118.06675937105088, 24.459095297739445],
          [118.06675937105088, 24.459095297739445],
          [118.06677399747191, 24.459100243062316],
          [118.06677399747191, 24.459100243062316],
          [118.06678862389295, 24.459107661046623],
          [118.06678862389295, 24.459107661046623],
          [118.0668056810659, 24.459117551692366],
          [118.0668056810659, 24.459117551692366],
          [118.06682521090029, 24.459127442338108],
          [118.06682521090029, 24.459127442338108],
          [118.06683979541181, 24.459134860322415],
          [118.06683979541181, 24.459134860322415],
          [118.06684951841949, 24.45914227830672],
          [118.06684951841949, 24.45914227830672],
          [118.06688375849394, 24.45915958693677],
          [118.06688375849394, 24.45915958693677],
          [118.0668984268245, 24.459167004921078],
          [118.06691305324553, 24.45917689556682],
          [118.06691305324553, 24.45917689556682],
          [118.06692524891464, 24.459184313551127],
          [118.06692524891464, 24.459184313551127],
          [118.06693740267424, 24.45919420419687],
          [118.06693740267424, 24.45919420419687],
          [118.06695202909528, 24.459201622181176],
          [118.06695202909528, 24.459201622181176],
          [118.0669716427487, 24.459213985488354],
          [118.06698140766589, 24.45922140347266],
          [118.06698140766589, 24.45922140347266],
          [118.06699356142549, 24.459231294118403],
          [118.0670057570946, 24.45923871210271],
          [118.0670057570946, 24.45923871210271],
          [118.06702780149995, 24.459253548071324],
          [118.06703760832666, 24.459258493394195],
          [118.06704984590529, 24.459265911378502],
          [118.06705961082248, 24.45927332936281],
          [118.06707427915303, 24.45928322000855],
          [118.06707427915303, 24.45928322000855],
          [118.06709380898742, 24.459293110654293],
          [118.06710604656605, 24.4593005286386],
          [118.06711824223517, 24.459310419284343],
          [118.06712804906188, 24.459315364607214],
          [118.06714271739243, 24.459325255252956],
          [118.06715449396638, 24.45933401434177],
          [118.06716425888358, 24.459341432326077],
          [118.06717896912365, 24.45935132297182],
          [118.06718869213132, 24.459358740956127],
          [118.06718869213132, 24.459358740956127],
          [118.06720084589092, 24.459366158940433],
          [118.06720084589092, 24.459366158940433],
          [118.06721790306388, 24.45937852224761],
          [118.06721790306388, 24.45937852224761],
          [118.06723252948491, 24.45939088555479],
          [118.06723252948491, 24.45939088555479],
          [118.06724715590595, 24.459400776200532],
          [118.06724715590595, 24.459400776200532],
          [118.06726668574034, 24.459415612169146],
          [118.06726668574034, 24.459415612169146],
          [118.06727883949993, 24.459423030153452],
          [118.06727883949993, 24.459423030153452],
          [118.06729342401145, 24.45943539346063],
          [118.06729342401145, 24.45943539346063],
          [118.06730314701913, 24.4594403387835],
          [118.06730314701913, 24.4594403387835],
          [118.06731773153065, 24.459450229429244],
          [118.06731773153065, 24.459450229429244],
          [118.06732988529025, 24.45945764741355],
          [118.06732988529025, 24.45945764741355],
          [118.0673469424632, 24.45947001072073],
          [118.0673469424632, 24.45947001072073],
          [118.0673469424632, 24.45947001072073],
          [118.06735666547088, 24.4594749560436],
          [118.06735666547088, 24.4594749560436],
          [118.06735666547088, 24.4594749560436],
          [118.06737862605719, 24.459487319350778],
          [118.06737862605719, 24.459487319350778],
          [118.06739077981679, 24.459494737335085],
          [118.06739077981679, 24.459494737335085],
          [118.06741030965118, 24.459504627980827],
          [118.06741030965118, 24.459504627980827],
          [118.0674225053203, 24.4595095733037],
          [118.0674225053203, 24.4595095733037],
          [118.06743960440276, 24.459516991288005],
          [118.06743960440276, 24.459516991288005],
          [118.06744941122948, 24.459521936610876],
          [118.0674758980435, 24.459532497808873],
          [118.0674758980435, 24.459532497808873],
          [118.0674999541056, 24.45954305900687],
          [118.0674999541056, 24.45954305900687],
          [118.06752845257638, 24.45955429075712],
          [118.06752845257638, 24.45955429075712],
          [118.06756139345585, 24.459566193059622],
          [118.06756139345585, 24.459566193059622],
          [118.06757115837304, 24.459571138382493],
          [118.06757115837304, 24.459571138382493],
          [118.06759073011695, 24.459581029028236],
          [118.06759073011695, 24.459581029028236],
          [118.06761721693097, 24.459594062887668],
          [118.06761721693097, 24.459594062887668],
          [118.06763683058439, 24.459601480871974],
          [118.06763683058439, 24.459601480871974],
          [118.06766532905517, 24.459615855835914],
          [118.06766532905517, 24.459615855835914],
          [118.06766532905517, 24.459615855835914],
          [118.06767752472429, 24.459620801158785],
          [118.06768976230292, 24.45962821914309],
          [118.06768976230292, 24.45962821914309],
          [118.06770937595634, 24.459638109788834],
          [118.06770937595634, 24.459638109788834],
          [118.06771909896402, 24.459643055111705],
          [118.06771909896402, 24.459643055111705],
          [118.06773577895133, 24.459654286861955],
          [118.06774797462045, 24.459661704846262],
          [118.06774797462045, 24.459661704846262],
          [118.06775769762812, 24.45966912283057],
          [118.06775769762812, 24.45966912283057],
          [118.06775769762812, 24.45966912283057],
          [118.06775769762812, 24.45966912283057],
          [118.0677674206358, 24.459676540814876],
          [118.0677674206358, 24.459676540814876],
          [118.06777714364348, 24.459683958799182],
          [118.06777714364348, 24.459683958799182],
          [118.06778686665116, 24.459688904122054],
          [118.06778686665116, 24.459688904122054],
          [118.06779658965884, 24.45969632210636],
          [118.06779658965884, 24.45969632210636],
          [118.06780874341844, 24.459703740090667],
          [118.06780874341844, 24.459703740090667],
          [118.06782089717804, 24.459711158074974],
          [118.06782089717804, 24.459711158074974],
          [118.06783062018572, 24.459716103397845],
          [118.06783062018572, 24.459716103397845],
          [118.06783062018572, 24.459716103397845],
          [118.06783062018572, 24.459716103397845],
          [118.06784277394532, 24.459723521382152],
          [118.06784277394532, 24.459723521382152],
          [118.06785501152395, 24.459723521382152],
          [118.06785501152395, 24.459723521382152],
          [118.0678765530151, 24.459721090630232],
          [118.0678765530151, 24.459721090630232],
          [118.06788879059373, 24.459716229126393],
          [118.06788879059373, 24.459716229126393],
          [118.06788879059373, 24.459716229126393],
          [118.06788879059373, 24.459716229126393],
          [118.06790094435333, 24.459711367622553],
          [118.06790094435333, 24.459711367622553],
          [118.06790094435333, 24.459711367622553],
          [118.06790823660909, 24.459701644614874],
          [118.06791552886484, 24.459691921607195],
          [118.06791552886484, 24.459691921607195],
          [118.06791552886484, 24.459691921607195],
          [118.0679228211206, 24.459677337095677],
          [118.0679228211206, 24.459677337095677],
          [118.06793011337636, 24.459662710674642],
          [118.06793011337636, 24.459662710674642],
          [118.06793983638404, 24.45964565350169],
          [118.06793983638404, 24.45964565350169],
          [118.06795199014364, 24.459626081757783],
          [118.06795199014364, 24.459626081757783],
          [118.0679592823994, 24.459613927998184],
          [118.06796657465516, 24.45960416308099],
          [118.06796657465516, 24.45960416308099],
          [118.06797629766284, 24.45959200932139],
          [118.0679835899186, 24.45958228631371],
          [118.0679835899186, 24.45958228631371],
          [118.06799331292628, 24.459570132554113],
          [118.06799331292628, 24.459570132554113],
          [118.06800546668588, 24.459557936885],
          [118.06800546668588, 24.459557936885],
          [118.06801518969355, 24.45954821387732],
          [118.06801518969355, 24.45954821387732],
          [118.06802981611459, 24.45953849086964],
          [118.06802981611459, 24.45953849086964],
          [118.06804196987419, 24.45952876786196],
          [118.06804196987419, 24.45952876786196],
          [118.06805906895666, 24.459516614102363],
          [118.06805906895666, 24.459516614102363],
          [118.06806879196434, 24.459509321846603],
          [118.06806879196434, 24.459509321846603],
          [118.06806879196434, 24.459509321846603],
          [118.06808341838537, 24.459502029590844],
          [118.06808341838537, 24.459502029590844],
          [118.06809314139305, 24.459494737335085],
          [118.06810290631024, 24.459487445079326],
          [118.06810290631024, 24.459487445079326],
          [118.06812239423512, 24.459475291319727],
          [118.06812239423512, 24.459475291319727],
          [118.06815575420974, 24.459459323794185],
          [118.06815575420974, 24.459459323794185],
          [118.06818266011892, 24.45944226662123],
          [118.06818266011892, 24.45944226662123],
          [118.06818266011892, 24.45944226662123],
          [118.0682021480438, 24.459427682109713],
          [118.0682021480438, 24.459427682109713],
          [118.06821434371291, 24.459417959102034],
          [118.06821434371291, 24.459417959102034],
          [118.06823391545682, 24.459408236094355],
          [118.06823391545682, 24.459408236094355],
          [118.06824606921641, 24.459396082334756],
          [118.06824606921641, 24.459396082334756],
          [118.06824606921641, 24.459396082334756],
          [118.0682557922241, 24.459388790078997],
          [118.0682557922241, 24.459388790078997],
          [118.0682557922241, 24.459388790078997],
          [118.06826551523177, 24.459379067071318],
          [118.06827766899137, 24.4593644825598],
          [118.06827766899137, 24.4593644825598],
          [118.06827766899137, 24.4593644825598],
          [118.06829225350289, 24.45934503654444],
          [118.06829225350289, 24.45934503654444],
          [118.06829954575865, 24.459335313536762],
          [118.06830683801441, 24.459325590529083],
          [118.06830683801441, 24.459325590529083],
          [118.06831656102209, 24.459311006017565],
          [118.06831656102209, 24.459311006017565],
          [118.06832628402977, 24.459298852257966],
          [118.06832628402977, 24.459298852257966],
          [118.06833600703744, 24.45928422583693],
          [118.06833600703744, 24.45928422583693],
          [118.06835059154896, 24.459264737912058],
          [118.06835059154896, 24.459264737912058],
          [118.06836031455664, 24.459247680739104],
          [118.06836031455664, 24.459247680739104],
          [118.06837498288719, 24.459225720152794],
          [118.06837498288719, 24.459225720152794],
          [118.06838960930823, 24.459206190318405],
          [118.06839690156399, 24.459193952739774],
          [118.06840905532358, 24.45917438099587],
          [118.06841777250288, 24.459156946637272],
          [118.06843239892392, 24.45913490223193],
          [118.06843969117968, 24.459125137314736],
          [118.06845008473961, 24.45910355391407],
          [118.06845741890488, 24.45909374708736],
          [118.068469614574, 24.459074133433937],
          [118.0684793794912, 24.45905942319387],
          [118.06848667174695, 24.459047227524756],
          [118.06848667174695, 24.459047227524756],
          [118.06850125625847, 24.459027697690367],
          [118.06850125625847, 24.459027697690367],
          [118.06851584076999, 24.459008167855977],
          [118.06851584076999, 24.459008167855977],
          [118.06853046719102, 24.45898859611207],
          [118.06853046719102, 24.45898859611207],
          [118.06854509361206, 24.458969024368166],
          [118.06854509361206, 24.458969024368166],
          [118.06856705419837, 24.45894459112042],
          [118.06856705419837, 24.45894459112042],
          [118.0685816806194, 24.45892749203795],
          [118.06859148744611, 24.45891768521124],
          [118.06860125236331, 24.458907920294045],
          [118.06860125236331, 24.458907920294045],
          [118.0686134061229, 24.45889572462493],
          [118.0686134061229, 24.45889572462493],
          [118.06863046329586, 24.458878667451977],
          [118.06864270087449, 24.458871375196217],
          [118.06865246579169, 24.45886165218854],
          [118.06865246579169, 24.45886165218854],
          [118.06867891069619, 24.45884078124964],
          [118.06868867561339, 24.458833488993882],
          [118.06870581660537, 24.458818820663332],
          [118.06870581660537, 24.458818820663332],
          [118.0687278191012, 24.458801763490378],
          [118.06873762592791, 24.45879690198654],
          [118.06874982159702, 24.45878474822694],
          [118.06874982159702, 24.45878474822694],
          [118.06876687876998, 24.458770121805905],
          [118.06876687876998, 24.458770121805905],
          [118.06878397785245, 24.458755453475355],
          [118.06878397785245, 24.458755453475355],
          [118.06880593843876, 24.458738354392885],
          [118.06880593843876, 24.458738354392885],
          [118.06882257651655, 24.458724817619263],
          [118.06882257651655, 24.458724817619263],
          [118.06884210635094, 24.45870776044631],
          [118.0688538829249, 24.458699085176526],
          [118.06887098200737, 24.458684458755492],
          [118.06889629535495, 24.458666731030284],
          [118.06891590900837, 24.458652062699734],
          [118.06891590900837, 24.458652062699734],
          [118.06894285682706, 24.45863006020391],
          [118.06895710606246, 24.458621384934126],
          [118.06898489207147, 24.45859607158655],
          [118.06898489207147, 24.45859607158655],
          [118.06900199115394, 24.458581445165514],
          [118.06900199115394, 24.458581445165514],
          [118.06902642440168, 24.45856195724064],
          [118.06902642440168, 24.45856195724064],
          [118.06904348157464, 24.45854737272912],
          [118.06904348157464, 24.45854737272912],
          [118.06906791482238, 24.458527884804248],
          [118.06906791482238, 24.458527884804248],
          [118.06908015240101, 24.458515647225617],
          [118.06909486264108, 24.45850093698555],
          [118.06910466946779, 24.458493602820276],
          [118.06912428312121, 24.45847646182829],
          [118.06912428312121, 24.45847646182829],
          [118.06914389677463, 24.458459320836305],
          [118.06914389677463, 24.458459320836305],
          [118.06916103776662, 24.45844217984432],
          [118.06917084459333, 24.458434845679044],
          [118.06919045824675, 24.458415232025622],
          [118.06919045824675, 24.458415232025622],
          [118.06921007190017, 24.4583956183722],
          [118.06921007190017, 24.4583956183722],
          [118.06923546906678, 24.45837022120559],
          [118.06924481488882, 24.45836397668773],
          [118.06927586984007, 24.458332921736478],
          [118.06928211435793, 24.45832357591444],
          [118.06930826589583, 24.458297424376546],
          [118.06931941382705, 24.458283175141155],
          [118.06934719983606, 24.45825538913214],
          [118.06935344435392, 24.458246043310105],
          [118.06937439911185, 24.458221987248002],
          [118.06938374493389, 24.45821574273014],
          [118.06938998945175, 24.458206396908103],
          [118.069410483205, 24.45818590315485],
          [118.06941672772287, 24.458176557332813],
          [118.06945163834958, 24.45813854540193],
          [118.06945163834958, 24.45813854540193],
          [118.0694881834474, 24.45809889899993],
          [118.0694881834474, 24.45809889899993],
          [118.06949799027412, 24.458089092173218],
          [118.06952577628313, 24.458061306164204],
          [118.06952577628313, 24.458061306164204],
          [118.06953558310984, 24.458051499337493],
          [118.06955117344974, 24.458035908997594],
          [118.0695574179676, 24.458026563175558],
          [118.06958235412954, 24.458004728317796],
          [118.0695885986474, 24.45799538249576],
          [118.06960821230082, 24.45797576884234],
          [118.06960821230082, 24.45797576884234],
          [118.06961801912753, 24.457965962015628],
          [118.06963025670616, 24.45795125177556],
          [118.06963025670616, 24.45795125177556],
          [118.06965184010683, 24.45793276967907],
          [118.06965184010683, 24.45793276967907],
          [118.06966650843738, 24.45791810134852],
          [118.06966650843738, 24.45791810134852],
          [118.06968113485841, 24.45790837834084],
          [118.06968113485841, 24.45790837834084],
          [118.06969781484572, 24.45789794287139],
          [118.06971239935724, 24.457885789111792],
          [118.06971239935724, 24.457885789111792],
          [118.06973930526642, 24.457866259277402],
          [118.06973930526642, 24.457866259277402],
          [118.06975388977794, 24.457854105517804],
          [118.06975388977794, 24.457854105517804],
          [118.06976608544706, 24.457844382510125],
          [118.06976608544706, 24.457844382510125],
          [118.06978318452953, 24.457829797998606],
          [118.06978318452953, 24.457829797998606],
          [118.06979781095056, 24.457820074990927],
          [118.06979781095056, 24.457820074990927],
          [118.0698124373716, 24.45780792123133],
          [118.0698124373716, 24.45780792123133],
          [118.0698245911312, 24.45779576747173],
          [118.0698245911312, 24.45779576747173],
          [118.06984169021366, 24.457783571802615],
          [118.06984169021366, 24.457783571802615],
          [118.06985384397326, 24.457771418043016],
          [118.06985384397326, 24.457771418043016],
          [118.0698684703943, 24.457759264283418],
          [118.0698684703943, 24.457759264283418],
          [118.06988066606341, 24.45774954127574],
          [118.06988066606341, 24.45774954127574],
          [118.06989281982301, 24.45773981826806],
          [118.06989281982301, 24.45773981826806],
          [118.06991230774788, 24.457722761095106],
          [118.06991230774788, 24.457722761095106],
          [118.0699268922594, 24.457710607335507],
          [118.0699268922594, 24.457710607335507],
          [118.069939046019, 24.457698453575908],
          [118.069939046019, 24.457698453575908],
          [118.06995606128244, 24.45768143831247],
          [118.06995606128244, 24.45768143831247],
          [118.06997072961299, 24.457669242643355],
          [118.06997072961299, 24.457669242643355],
          [118.0699829252821, 24.457654658131837],
          [118.0699829252821, 24.457654658131837],
          [118.0699950790417, 24.45764007362032],
          [118.0699950790417, 24.45764007362032],
          [118.07000970546274, 24.45762297453785],
          [118.07000970546274, 24.45762297453785],
          [118.07001942847042, 24.45761082077825],
          [118.07001942847042, 24.45761082077825],
          [118.07003401298194, 24.457591332853376],
          [118.07003401298194, 24.457591332853376],
          [118.07004616674153, 24.457576748341857],
          [118.07004616674153, 24.457576748341857],
          [118.07006318200497, 24.457554829665064],
          [118.07006318200497, 24.457554829665064],
          [118.07007537767409, 24.457540245153545],
          [118.07008266992985, 24.45753048023635],
          [118.0700973382604, 24.457515853815316],
          [118.0700973382604, 24.457515853815316],
          [118.07010953392951, 24.457498754732846],
          [118.07010953392951, 24.457498754732846],
          [118.07012411844103, 24.457481697559892],
          [118.07012411844103, 24.457481697559892],
          [118.07013870295255, 24.457464640386938],
          [118.07013870295255, 24.457464640386938],
          [118.07015085671215, 24.45745248662734],
          [118.07015085671215, 24.45745248662734],
          [118.07016795579462, 24.457435429454385],
          [118.07016795579462, 24.457435429454385],
          [118.07018501296757, 24.45741837228143],
          [118.07018501296757, 24.45741837228143],
          [118.07019968129812, 24.457403745860397],
          [118.07019968129812, 24.457403745860397],
          [118.07021187696724, 24.457391550191282],
          [118.07021187696724, 24.457391550191282],
          [118.0702289760497, 24.457376881860732],
          [118.0702289760497, 24.457376881860732],
          [118.0702485058841, 24.457357393935858],
          [118.0702485058841, 24.457357393935858],
          [118.07026309039561, 24.45734524017626],
          [118.07026309039561, 24.45734524017626],
          [118.07027528606473, 24.45733551716858],
          [118.07027528606473, 24.45733551716858],
          [118.07028743982433, 24.457325752251386],
          [118.07028743982433, 24.457325752251386],
          [118.07030445508776, 24.457311083920835],
          [118.07030445508776, 24.457311083920835],
          [118.07032151226072, 24.457293984838365],
          [118.07032151226072, 24.457293984838365],
          [118.07034343093751, 24.457274538823008],
          [118.07034343093751, 24.457274538823008],
          [118.07035801544903, 24.457259912401973],
          [118.07035801544903, 24.457259912401973],
          [118.0703775033739, 24.4572404244771],
          [118.0703775033739, 24.4572404244771],
          [118.07039208788542, 24.45722583996558],
          [118.07040189471213, 24.45721603313887],
          [118.07041404847173, 24.45720387937927],
          [118.07041404847173, 24.45720387937927],
          [118.07042863298325, 24.457189294867753],
          [118.07043839790045, 24.457179529950558],
          [118.07045055166004, 24.45716737619096],
          [118.07045055166004, 24.45716737619096],
          [118.07046765074251, 24.45715027710849],
          [118.07046765074251, 24.45715027710849],
          [118.07048231907307, 24.45713560877794],
          [118.07049208399026, 24.457125843860744],
          [118.07050675232081, 24.45710870286876],
          [118.07050675232081, 24.45710870286876],
          [118.07052879672615, 24.457089131124853],
          [118.07052879672615, 24.457089131124853],
          [118.07053856164335, 24.457076893546223],
          [118.07053856164335, 24.457076893546223],
          [118.07055813338725, 24.457057321802317],
          [118.07055813338725, 24.457057321802317],
          [118.07057527437924, 24.457037708148896],
          [118.07058260854451, 24.457027901322185],
          [118.07059618722765, 24.457011221334874],
          [118.07059618722765, 24.457011221334874],
          [118.07061332821964, 24.456991607681452],
          [118.07062066238491, 24.45698180085474],
          [118.07063424106805, 24.456962648205995],
          [118.07064404789476, 24.456952841379284],
          [118.07066009923933, 24.456933688730537],
          [118.07066009923933, 24.456933688730537],
          [118.07067724023132, 24.456914075077115],
          [118.0706845743966, 24.456904268250405],
          [118.07070062574117, 24.456885115601658],
          [118.07071177367239, 24.456870866366266],
          [118.07073599737255, 24.456843541361927],
          [118.07073599737255, 24.456843541361927],
          [118.07077820025502, 24.456798237175285],
          [118.07077820025502, 24.456798237175285],
          [118.07079291049509, 24.45678352693522],
          [118.07080514807372, 24.456768816695153],
          [118.07080514807372, 24.456768816695153],
          [118.0708222890657, 24.456751675703167],
          [118.0708222890657, 24.456751675703167],
          [118.07084186080961, 24.45672715863639],
          [118.07084186080961, 24.45672715863639],
          [118.07085166763632, 24.45671735180968],
          [118.0708688086283, 24.456700210817694],
          [118.07087505314617, 24.456690864995657],
          [118.07087505314617, 24.456690864995657],
          [118.07088976338623, 24.45667615475559],
          [118.07088976338623, 24.45667615475559],
          [118.07090690437822, 24.45665654110217],
          [118.07090690437822, 24.45665654110217],
          [118.07092647612212, 24.456636969358264],
          [118.07092647612212, 24.456636969358264],
          [118.07093871370076, 24.456624731779634],
          [118.07095095127939, 24.456610021539568],
          [118.07095719579725, 24.45660067571753],
          [118.0709800783929, 24.456577793121873],
          [118.0709800783929, 24.456577793121873],
          [118.07101029515384, 24.456545103699504],
          [118.07101029515384, 24.456545103699504],
          [118.07102010198055, 24.456535296872794],
          [118.07103233955918, 24.456520586632728],
          [118.07103233955918, 24.456520586632728],
          [118.07105329431711, 24.456496530570625],
          [118.07107261460392, 24.45647410897964],
          [118.07109549719958, 24.456451226383983],
          [118.07110174171744, 24.456441880561947],
          [118.07112269647537, 24.456417824499844],
          [118.07112269647537, 24.456417824499844],
          [118.07113740671544, 24.45640311425978],
          [118.07115048248438, 24.45639003849083],
          [118.07117470618455, 24.45636271348649],
          [118.07118895541994, 24.456351565555273],
          [118.07120500676452, 24.456332412906526],
          [118.07120500676452, 24.456332412906526],
          [118.07122462041794, 24.45631527191454],
          [118.07122462041794, 24.45631527191454],
          [118.07126191988705, 24.456274871141254],
          [118.07127126570909, 24.45626862662339],
          [118.07130722407369, 24.456232668258785],
          [118.07130722407369, 24.456232668258785],
          [118.07133010666935, 24.456209785663127],
          [118.07134808585165, 24.456191806480824],
          [118.07136233508704, 24.456180658549606],
          [118.07137658432244, 24.456169510618388],
          [118.0713912945625, 24.45615480037832],
          [118.0713912945625, 24.45615480037832],
          [118.07140349023162, 24.456145077370643],
          [118.07140349023162, 24.456145077370643],
          [118.07141811665265, 24.456132923611044],
          [118.07141811665265, 24.456132923611044],
          [118.0714327849832, 24.45612072794193],
          [118.0714327849832, 24.45612072794193],
          [118.07144250799088, 24.45611586643809],
          [118.07144250799088, 24.45611586643809],
          [118.07145470366, 24.456106101520895],
          [118.07145470366, 24.456106101520895],
          [118.07145470366, 24.456106101520895],
          [118.07146689932911, 24.456098809265136],
          [118.07146689932911, 24.456098809265136],
          [118.07146689932911, 24.456098809265136],
          [118.07148148384063, 24.456084224753617],
          [118.07148148384063, 24.456084224753617],
          [118.07149862483261, 24.456074501745938],
          [118.07149862483261, 24.456074501745938],
          [118.07149862483261, 24.456074501745938],
          [118.07151082050173, 24.45606477873826],
          [118.07152548883228, 24.456052583069145],
          [118.07152548883228, 24.456052583069145],
          [118.0715376845014, 24.45604281815195],
          [118.0715376845014, 24.45604281815195],
          [118.07155482549338, 24.456030622482835],
          [118.07155482549338, 24.456030622482835],
          [118.07156706307201, 24.45602085756564],
          [118.07156706307201, 24.45602085756564],
          [118.071584204064, 24.456003716573655],
          [118.071584204064, 24.456003716573655],
          [118.07160624846934, 24.45598414482975],
          [118.0716124929872, 24.455974799007713],
          [118.07162959206967, 24.455957699925243],
          [118.07162959206967, 24.455957699925243],
          [118.07164669115214, 24.45594307350421],
          [118.07164669115214, 24.45594307350421],
          [118.07164669115214, 24.45594307350421],
          [118.07165888682125, 24.455925932512223],
          [118.07166869364796, 24.455916125685512],
          [118.07167850047468, 24.4559063188588],
          [118.07167850047468, 24.4559063188588],
          [118.07169069614379, 24.45589165052825],
          [118.07169069614379, 24.45589165052825],
          [118.0717028918129, 24.4558769821977],
          [118.0717028918129, 24.4558769821977],
          [118.07171512939154, 24.455867217280506],
          [118.07171512939154, 24.455867217280506],
          [118.07172979772209, 24.455847603627085],
          [118.07172979772209, 24.455847603627085],
          [118.07174932755647, 24.455828073792695],
          [118.07174932755647, 24.455828073792695],
          [118.07176642663894, 24.455806029387354],
          [118.07176642663894, 24.455806029387354],
          [118.07179157234846, 24.45577216649854],
          [118.07179157234846, 24.45577216649854],
          [118.07180272027968, 24.45575791726315],
          [118.07181738861023, 24.455740776271163],
          [118.07181738861023, 24.455740776271163],
          [118.07181738861023, 24.455740776271163],
          [118.07183696035413, 24.455718731865822],
          [118.07184429451941, 24.45570892503911],
          [118.07184429451941, 24.45570892503911],
          [118.07185896284996, 24.455691784047126],
          [118.07187011078118, 24.455677534811734],
          [118.07187011078118, 24.455677534811734],
          [118.07188477911173, 24.45566039381975],
          [118.07188477911173, 24.45566039381975],
          [118.07189701669036, 24.455645683579682],
          [118.07190435085563, 24.45563587675297],
          [118.0719204022002, 24.455616724104225],
          [118.0719204022002, 24.455616724104225],
          [118.0719301671174, 24.455604486525594],
          [118.0719301671174, 24.455604486525594],
          [118.07194483544795, 24.45558734553361],
          [118.07194483544795, 24.45558734553361],
          [118.0719595037785, 24.455570204541623],
          [118.07196574829636, 24.455560858719586],
          [118.07197551321356, 24.45555109380239],
          [118.07197551321356, 24.45555109380239],
          [118.07198770888267, 24.45553642547184],
          [118.07198770888267, 24.45553642547184],
          [118.07199990455179, 24.45552175714129],
          [118.07199990455179, 24.45552175714129],
          [118.07201453097282, 24.455502185397386],
          [118.07201453097282, 24.455502185397386],
          [118.07202676855145, 24.45548747515732],
          [118.07204034723459, 24.455468322508572],
          [118.07204034723459, 24.455468322508572],
          [118.07205748822658, 24.455451181516587],
          [118.07205748822658, 24.455451181516587],
          [118.07207458730905, 24.455429137111246],
          [118.07207458730905, 24.455429137111246],
          [118.07207458730905, 24.455429137111246],
          [118.07208431031673, 24.45541694144213],
          [118.07209407523392, 24.4554047038635],
          [118.07210384015112, 24.455394938946306],
          [118.07210384015112, 24.455394938946306],
          [118.07211599391071, 24.455382785186707],
          [118.07211599391071, 24.455382785186707],
          [118.07213548183559, 24.455363255352317],
          [118.07213548183559, 24.455363255352317],
          [118.07215258091806, 24.4553486708408],
          [118.07215258091806, 24.4553486708408],
          [118.07216477658717, 24.4553365170812],
          [118.07216477658717, 24.4553365170812],
          [118.07218187566964, 24.455321890660166],
          [118.07218187566964, 24.455321890660166],
          [118.07220140550403, 24.455304791577696],
          [118.07220140550403, 24.455304791577696],
          [118.07221846267699, 24.45529016515666],
          [118.07221846267699, 24.45529016515666],
          [118.07223799251138, 24.45527063532227],
          [118.07223799251138, 24.45527063532227],
          [118.07225014627097, 24.455258481562673],
          [118.07225014627097, 24.455258481562673],
          [118.07226724535344, 24.45524385514164],
          [118.07226724535344, 24.45524385514164],
          [118.07227939911304, 24.45523413213396],
          [118.07227939911304, 24.45523413213396],
          [118.07229402553408, 24.45521711687052],
          [118.07229402553408, 24.45521711687052],
          [118.07230865195511, 24.455202490449487],
          [118.07230865195511, 24.455202490449487],
          [118.07231837496279, 24.455195198193728],
          [118.07231837496279, 24.455195198193728],
          [118.07233786288766, 24.455175710268854],
          [118.07233786288766, 24.455175710268854],
          [118.07235244739918, 24.455163556509255],
          [118.07235244739918, 24.455163556509255],
          [118.07236460115878, 24.455151402749657],
          [118.07236460115878, 24.455151402749657],
          [118.07238165833174, 24.455134303667187],
          [118.07238165833174, 24.455134303667187],
          [118.07240118816613, 24.455114773832797],
          [118.07240118816613, 24.455114773832797],
          [118.0724182872486, 24.45509532781744],
          [118.0724182872486, 24.45509532781744],
          [118.07243287176011, 24.45507822873497],
          [118.07243287176011, 24.45507822873497],
          [118.07244749818115, 24.455061171562015],
          [118.07244749818115, 24.455061171562015],
          [118.07246212460218, 24.455046587050496],
          [118.07246212460218, 24.455046587050496],
          [118.0724743202713, 24.455034433290898],
          [118.0724743202713, 24.455034433290898],
          [118.07248161252706, 24.45502471028322],
          [118.07248161252706, 24.45502471028322],
          [118.07248161252706, 24.45502471028322],
          [118.07249133553474, 24.45501741802746],
          [118.07249133553474, 24.45501741802746],
          [118.07250596195577, 24.45500283351594],
          [118.07250596195577, 24.45500283351594],
          [118.07251815762488, 24.454990637846826],
          [118.07252792254208, 24.45498087292963],
          [118.07252792254208, 24.45498087292963],
          [118.07252792254208, 24.45498087292963],
          [118.07252792254208, 24.45498087292963],
          [118.07254007630168, 24.454968719170033],
          [118.07254007630168, 24.454968719170033],
          [118.07254007630168, 24.454968719170033],
          [118.07254007630168, 24.454968719170033],
          [118.07254979930936, 24.454954134658514],
          [118.07254979930936, 24.454954134658514],
          [118.07254979930936, 24.454954134658514],
          [118.07255709156512, 24.454944411650835],
          [118.07256438382088, 24.454934688643156],
          [118.07256438382088, 24.454934688643156],
          [118.07256438382088, 24.454934688643156],
          [118.07256438382088, 24.454934688643156],
          [118.07256438382088, 24.454934688643156],
          [118.07257410682855, 24.454922534883558],
          [118.07257410682855, 24.454922534883558],
          [118.07257410682855, 24.454922534883558],
          [118.07257410682855, 24.454922534883558],
          [118.07257410682855, 24.454922534883558],
          [118.0725641742733, 24.45491038112396],
          [118.0725641742733, 24.45491038112396],
          [118.0725641742733, 24.45491038112396],
          [118.07254439298181, 24.45489579661244],
          [118.07254439298181, 24.45489579661244],
          [118.07252213902889, 24.454881170191406],
          [118.07252213902889, 24.454881170191406],
          [118.07250730306028, 24.454871447183727],
          [118.07250730306028, 24.454871447183727],
          [118.07248999443023, 24.454859251514613],
          [118.07248999443023, 24.454859251514613],
          [118.07248010378449, 24.454851959258853],
          [118.07248010378449, 24.454851959258853],
          [118.07245784983157, 24.454837374747335],
          [118.07245784983157, 24.454837374747335],
          [118.07244301386295, 24.454827651739656],
          [118.07244301386295, 24.454827651739656],
          [118.07242075991003, 24.45481302531862],
          [118.07241086926429, 24.454808163814782],
          [118.0723910879728, 24.454795968145667],
          [118.0723910879728, 24.454795968145667],
          [118.07237872466563, 24.45478624513799],
          [118.07237872466563, 24.45478624513799],
          [118.07236636135845, 24.45477409137839],
          [118.07236636135845, 24.45477409137839],
          [118.0723490527284, 24.45475699229592],
          [118.0723490527284, 24.45475699229592],
          [118.07233916208266, 24.454744796626805],
          [118.07233916208266, 24.454744796626805],
          [118.07232927143691, 24.45473260095769],
          [118.07232927143691, 24.45473260095769],
          [118.07231690812974, 24.454710598461865],
          [118.07231690812974, 24.454710598461865],
          [118.07230454482256, 24.45469345746988],
          [118.07230454482256, 24.45469345746988],
          [118.07229465417682, 24.45467392763549],
          [118.07229465417682, 24.45467392763549],
          [118.07228476353107, 24.454656870462536],
          [118.07228476353107, 24.454656870462536],
          [118.07227734554677, 24.4546422440415],
          [118.07227734554677, 24.4546422440415],
          [118.0722724002239, 24.454630090281903],
          [118.0722724002239, 24.454630090281903],
          [118.07226498223959, 24.454620367274224],
          [118.07226498223959, 24.454620367274224],
          [118.07225509159385, 24.45460331010127],
          [118.07225509159385, 24.45460331010127],
          [118.0722452009481, 24.45458872558975],
          [118.0722452009481, 24.45458872558975],
          [118.07223531030236, 24.454576571830152],
          [118.07223531030236, 24.454576571830152],
          [118.07222160589068, 24.454557503000437],
          [118.07222160589068, 24.454557503000437],
          [118.07221171524493, 24.45454534924084],
          [118.07221171524493, 24.45454534924084],
          [118.07219687927632, 24.4545283339774],
          [118.07219687927632, 24.4545283339774],
          [118.07217957064627, 24.454508846052526],
          [118.07217957064627, 24.454508846052526],
          [118.07216720733909, 24.454494219631492],
          [118.07216720733909, 24.454494219631492],
          [118.07214742604761, 24.45447473170662],
          [118.07214742604761, 24.45447473170662],
          [118.072132590079, 24.454460105285584],
          [118.072132590079, 24.454460105285584],
          [118.07210786346464, 24.45443810278976],
          [118.07210786346464, 24.45443810278976],
          [118.07208560951172, 24.45441857295537],
          [118.07208560951172, 24.45441857295537],
          [118.07208560951172, 24.45441857295537],
          [118.07205841023593, 24.454394139707624],
          [118.07205841023593, 24.454394139707624],
          [118.07204110160588, 24.454379471377074],
          [118.07204110160588, 24.454379471377074],
          [118.07202379297583, 24.45436727570796],
          [118.07201440524427, 24.454361031190096],
          [118.07199956927566, 24.4543512662729],
          [118.07199956927566, 24.4543512662729],
          [118.07197236999987, 24.45433173643851],
          [118.07197236999987, 24.45433173643851],
          [118.0719481462997, 24.45431819966489],
          [118.07193825565396, 24.45431333816105],
          [118.07192589234678, 24.45430604590529],
          [118.07192589234678, 24.45430604590529],
          [118.0719135290396, 24.454296322897612],
          [118.0719135290396, 24.454296322897612],
          [118.07189374774812, 24.454286599889933],
          [118.07189374774812, 24.454286599889933],
          [118.07186902113376, 24.4542719734689],
          [118.07186902113376, 24.4542719734689],
          [118.07184974275647, 24.454258436695277],
          [118.07184974275647, 24.454258436695277],
          [118.07181613132475, 24.454239325956046],
          [118.07181613132475, 24.454239325956046],
          [118.07180129535614, 24.45422713028693],
          [118.07180129535614, 24.45422713028693],
          [118.07177904140322, 24.454212503865897],
          [118.07177904140322, 24.454212503865897],
          [118.07176173277317, 24.454200350106298],
          [118.07176173277317, 24.454200350106298],
          [118.07173180937885, 24.454173695654212],
          [118.07173180937885, 24.454173695654212],
          [118.07170314327, 24.454151399791776],
          [118.07170314327, 24.454151399791776],
          [118.0716838648927, 24.454135348447203],
          [118.07166953183828, 24.454124200515984],
          [118.0716201624286, 24.454089918532013],
          [118.0716201624286, 24.454089918532013],
          [118.07159099340556, 24.454066533022164],
          [118.07158160567401, 24.4540602885043],
          [118.07158160567401, 24.4540602885043],
          [118.07155243665098, 24.45403937565589],
          [118.07155243665098, 24.45403937565589],
          [118.07152821295081, 24.454020893559395],
          [118.07152821295081, 24.454020893559395],
          [118.0715133769822, 24.4540111286422],
          [118.0715133769822, 24.4540111286422],
          [118.07149359569071, 24.45399646031165],
          [118.07149359569071, 24.45399646031165],
          [118.07147381439923, 24.453981833890616],
          [118.07147381439923, 24.453981833890616],
          [118.07145650576918, 24.4539696382215],
          [118.07145650576918, 24.4539696382215],
          [118.07143425181626, 24.453952581048547],
          [118.07143425181626, 24.453952581048547],
          [118.07142436117051, 24.453947719544708],
          [118.07142436117051, 24.453947719544708],
          [118.07141447052477, 24.45394042728895],
          [118.07141447052477, 24.45394042728895],
          [118.07140457987903, 24.45393556578511],
          [118.07140457987903, 24.45393556578511],
          [118.07138974391042, 24.45392584277743],
          [118.07138974391042, 24.45392584277743],
          [118.07138974391042, 24.45392584277743],
          [118.07138974391042, 24.45392584277743],
          [118.07137985326467, 24.45392098127359],
          [118.07137985326467, 24.45392098127359],
          [118.07137985326467, 24.45392098127359],
          [118.07136501729606, 24.45391368901783],
          [118.07136501729606, 24.45391368901783],
          [118.07135512665032, 24.45390882751399],
          [118.07135512665032, 24.45390882751399],
          [118.07135512665032, 24.45390882751399],
          [118.07134276334314, 24.453903966010152],
          [118.07134276334314, 24.453903966010152],
          [118.07134276334314, 24.453903966010152],
          [118.07133040003596, 24.45391138399446],
          [118.07133040003596, 24.45391138399446],
          [118.07133040003596, 24.45391138399446],
          [118.07131803672878, 24.453923747301637],
          [118.07131803672878, 24.453923747301637],
          [118.0713056734216, 24.453936110608815],
          [118.0713056734216, 24.453936110608815],
          [118.0713056734216, 24.453936110608815],
          [118.07129331011443, 24.453946001254558],
          [118.07129331011443, 24.453946001254558],
          [118.07128341946868, 24.45395094657743],
          [118.07128341946868, 24.45395094657743],
          [118.07127352882294, 24.4539558919003],
          [118.07125869285433, 24.45396083722317],
          [118.07125869285433, 24.45396083722317],
          [118.07124632954715, 24.453965782546042],
          [118.07124632954715, 24.453965782546042],
          [118.07123396623997, 24.453970727868914],
          [118.07123396623997, 24.453970727868914],
          [118.07121418494849, 24.453975673191785],
          [118.07121418494849, 24.453975673191785],
          [118.071194403657, 24.453980618514656],
          [118.071194403657, 24.453980618514656],
          [118.07117265261827, 24.453988707051217],
          [118.07117265261827, 24.453988707051217],
          [118.07115287132679, 24.453993652374088],
          [118.07115287132679, 24.453993652374088],
          [118.07114050801961, 24.453996125035523],
          [118.07114050801961, 24.453996125035523],
          [118.071125672051, 24.454001070358395],
          [118.071125672051, 24.454001070358395],
          [118.07110341809808, 24.45400354301983],
          [118.07110341809808, 24.45400354301983],
          [118.07108363680659, 24.4540084883427],
          [118.07108363680659, 24.4540084883427],
          [118.07108363680659, 24.4540084883427],
          [118.07106632817654, 24.454010961004137],
          [118.07105149220793, 24.454013433665573],
          [118.07105149220793, 24.454013433665573],
          [118.07103418357788, 24.454018378988444],
          [118.07103418357788, 24.454018378988444],
          [118.07101934760927, 24.45402085164988],
          [118.07101934760927, 24.45402085164988],
          [118.07100698430209, 24.454023324311315],
          [118.07100698430209, 24.454023324311315],
          [118.07100698430209, 24.454023324311315],
          [118.07099214833347, 24.45402579697275],
          [118.07097731236486, 24.454028269634186],
          [118.07095803398757, 24.454030742295622],
          [118.0709412282717, 24.454033214957057],
          [118.07092689521728, 24.454035687618493],
          [118.07091205924867, 24.45403816027993],
          [118.07089772619425, 24.45403816027993],
          [118.07088289022563, 24.454040632941364],
          [118.07088289022563, 24.454040632941364],
          [118.07085619386403, 24.4540431056028],
          [118.07085619386403, 24.4540431056028],
          [118.07082752775518, 24.45404624881649],
          [118.07082752775518, 24.45404624881649],
          [118.07079588607071, 24.45404939203018],
          [118.07079588607071, 24.45404939203018],
          [118.07079588607071, 24.45404939203018],
          [118.07076424438624, 24.454051864691614],
          [118.07076424438624, 24.454051864691614],
          [118.07072304733215, 24.45405626519078],
          [118.07072304733215, 24.45405626519078],
          [118.0706983207178, 24.454058737852215],
          [118.0706983207178, 24.454058737852215],
          [118.07067359410344, 24.45406121051365],
          [118.07067359410344, 24.45406121051365],
          [118.07065134015052, 24.454063683175086],
          [118.07065134015052, 24.454063683175086],
          [118.0706365041819, 24.454063683175086],
          [118.0706365041819, 24.454063683175086],
          [118.07062166821329, 24.454063683175086],
          [118.07062166821329, 24.454063683175086],
          [118.07059300210445, 24.454063683175086],
          [118.07057422664134, 24.454063683175086],
          [118.07055494826405, 24.454063683175086],
          [118.07055494826405, 24.454063683175086],
          [118.07053269431113, 24.454063683175086],
          [118.07053269431113, 24.454063683175086],
          [118.07051291301964, 24.454063683175086],
          [118.07051291301964, 24.454063683175086],
          [118.07051291301964, 24.454063683175086],
          [118.07049807705103, 24.454063683175086],
          [118.07048571374385, 24.454063683175086],
          [118.07048571374385, 24.454063683175086],
          [118.07048571374385, 24.454063683175086],
          [118.07047335043667, 24.454063683175086],
          [118.07047335043667, 24.454063683175086],
          [118.0704609871295, 24.45406615583652],
          [118.0704609871295, 24.45406615583652],
          [118.0704609871295, 24.45406615583652],
          [118.0704337878537, 24.45406615583652],
          [118.0704337878537, 24.45406615583652],
          [118.0704337878537, 24.45406615583652],
          [118.0704337878537, 24.45406615583652],
          [118.0704337878537, 24.45406615583652],
          [118.07041647922365, 24.45406615583652],
          [118.07041647922365, 24.45406615583652],
          [118.07039225552349, 24.45406615583652],
          [118.07039225552349, 24.45406615583652],
          [118.07037792246906, 24.45406615583652],
          [118.07036555916189, 24.454063725084602],
          [118.07036555916189, 24.454063725084602],
          [118.07035072319327, 24.454063725084602],
          [118.07035072319327, 24.454063725084602],
          [118.0703383598861, 24.454063725084602],
          [118.0703383598861, 24.454063725084602],
          [118.0703383598861, 24.454063725084602],
          [118.0703383598861, 24.454063725084602],
          [118.0703383598861, 24.454063725084602],
          [118.07032846924035, 24.454068670407473],
          [118.07032352391748, 24.454078561053215],
          [118.07031610593317, 24.454088451698958],
          [118.07031610593317, 24.454088451698958],
          [118.070303742626, 24.45411070565188],
          [118.07029632464169, 24.454123068959056],
          [118.07028509289144, 24.45414234733635],
          [118.07028509289144, 24.45414234733635],
          [118.07026778426139, 24.454169546612142],
          [118.07026778426139, 24.454169546612142],
          [118.07025227774052, 24.45419871563518],
          [118.07025227774052, 24.45419871563518],
          [118.07023991443334, 24.45421602426523],
          [118.07023991443334, 24.45421602426523],
          [118.07022755112617, 24.454230860233842],
          [118.07021766048042, 24.45423827821815],
          [118.07020776983468, 24.45424816886389],
          [118.07020776983468, 24.45424816886389],
          [118.07019293386607, 24.454263004832505],
          [118.07019293386607, 24.454263004832505],
          [118.07017562523602, 24.454280313462554],
          [118.07017562523602, 24.454280313462554],
          [118.07015584394453, 24.454297622092604],
          [118.07015584394453, 24.454297622092604],
          [118.07014100797592, 24.45430998539978],
          [118.07014100797592, 24.45430998539978],
          [118.07012122668444, 24.454324821368395],
          [118.07012122668444, 24.454324821368395],
          [118.07009897273151, 24.45434460265988],
          [118.07009897273151, 24.45434460265988],
          [118.07007919144003, 24.454364383951365],
          [118.07006930079429, 24.45437180193567],
          [118.07006930079429, 24.45437180193567],
          [118.07005446482567, 24.454386637904285],
          [118.07003715619562, 24.454403946534335],
          [118.07003715619562, 24.454403946534335],
          [118.07002232022701, 24.454421255164384],
          [118.07001242958127, 24.454431145810126],
          [118.07000253893553, 24.45444103645587],
          [118.07000253893553, 24.45444103645587],
          [118.06996829886107, 24.454478377834498],
          [118.06993711818127, 24.454509558514296],
          [118.06990866162, 24.454543128036498],
          [118.06988925751416, 24.454565633446514],
          [118.06985673572986, 24.454601256534993],
          [118.06984106157093, 24.454616930693923],
          [118.0698248844978, 24.454636209071218],
          [118.06981499385206, 24.45464609971696],
          [118.06979747567443, 24.454669820502936],
          [118.06976901911317, 24.454703390025138],
          [118.06972966607778, 24.454742743060528],
          [118.06971654839931, 24.45475586073899],
          [118.06968402661501, 24.45479148382747],
          [118.06967090893654, 24.454804601505934],
          [118.06963155590115, 24.454843954541325],
          [118.06961843822269, 24.454857072219788],
          [118.06958122257261, 24.454908118010103],
          [118.06954543184607, 24.45494902169758],
          [118.06951475408046, 24.454989925385057],
          [118.06946165472387, 24.455063979499577],
          [118.06944631584106, 24.455084431343316],
          [118.06940029919265, 24.455150899835466],
          [118.06934552345542, 24.45523484459573],
          [118.0693214254838, 24.45527277270758],
          [118.06928856842337, 24.455328177087544],
          [118.06924531780301, 24.455387856238126],
          [118.06918542910485, 24.45547180099839],
          [118.06917231142639, 24.455484918676852],
          [118.06912851598231, 24.455538940042793],
          [118.0690978382167, 24.45557984373027],
          [118.06905219875394, 24.455628584497212],
          [118.06903908107547, 24.455641702175676],
          [118.06900655929117, 24.455677325264155],
          [118.06898032393424, 24.45570356062108],
          [118.06894247964142, 24.455743416570662],
          [118.06892936196296, 24.455756534249126],
          [118.06889684017865, 24.455792157337605],
          [118.06887433476864, 24.455811561443447],
          [118.06884587820737, 24.45584513096565],
          [118.06881008748083, 24.45588092169219],
          [118.0687957544264, 24.45589215344244],
          [118.0687727461022, 24.455915161766647],
          [118.0687415654224, 24.455946342446445],
          [118.06871533006547, 24.455972577803372],
          [118.06868909470855, 24.4559988131603],
          [118.06867342054962, 24.45601448731923],
          [118.06863779746114, 24.456047009103536],
          [118.0686173456174, 24.45606234798634],
          [118.06858172252892, 24.456094869770645],
          [118.06854815300672, 24.456123326331912],
          [118.06847367979704, 24.456192686580657],
          [118.06847367979704, 24.456192686580657],
          [118.06845142584412, 24.45620752254927],
          [118.06845142584412, 24.45620752254927],
          [118.06843164455263, 24.45622483117932],
          [118.06841731149821, 24.45623606292957],
          [118.06837925765781, 24.456262340196012],
          [118.06837925765781, 24.456262340196012],
          [118.06835700370489, 24.45627964882606],
          [118.06834267065047, 24.456288407914876],
          [118.06832041669755, 24.456305716544925],
          [118.0683105260518, 24.456313134529232],
          [118.06828630235164, 24.45633178426379],
          [118.06828630235164, 24.45633178426379],
          [118.06826652106015, 24.456349092893838],
          [118.06824845805882, 24.456367155895173],
          [118.0682336220902, 24.456381991863786],
          [118.06822373144446, 24.45639188250953],
          [118.06820395015298, 24.45641413646245],
          [118.06820395015298, 24.45641413646245],
          [118.0681691233453, 24.456455165878474],
          [118.06815973561375, 24.456461452305852],
          [118.068149844968, 24.456471342951595],
          [118.06812055021642, 24.456503739007353],
          [118.06808572340874, 24.45653856581503],
          [118.06805043559639, 24.456571380965947],
          [118.06800303593396, 24.45662498323673],
          [118.0679716876161, 24.45665633155459],
          [118.06793870482711, 24.456683698468446],
          [118.06791314002244, 24.45670926327312],
          [118.06789880696802, 24.45672049502337],
          [118.06785907674698, 24.456765841119527],
          [118.06784918610124, 24.45677573176527],
          [118.06781389828889, 24.45681101957762],
          [118.06780400764315, 24.456820910223364],
          [118.0677711086732, 24.456853809193312],
          [118.06776369068889, 24.456863699839055],
          [118.06774390939741, 24.45688348113054],
          [118.06772710368155, 24.45689965820366],
          [118.06770732239006, 24.45692191215658],
          [118.06770732239006, 24.45692191215658],
          [118.06769248642145, 24.45693922078663],
          [118.06769248642145, 24.45693922078663],
          [118.06767270512997, 24.45696147473955],
          [118.06767270512997, 24.45696147473955],
          [118.06765786916135, 24.4569787833696],
          [118.06765786916135, 24.4569787833696],
          [118.06764303319274, 24.456993619338213],
          [118.06764303319274, 24.456993619338213],
          [118.06762819722412, 24.457008455306827],
          [118.06762819722412, 24.457008455306827],
          [118.06762819722412, 24.457008455306827],
          [118.06761830657838, 24.457020818614005],
          [118.06761830657838, 24.457020818614005],
          [118.06760841593264, 24.457030709259747],
          [118.06759605262546, 24.45704554522836],
          [118.06759605262546, 24.45704554522836],
          [118.06757874399541, 24.457065326519846],
          [118.06757379867254, 24.45707521716559],
          [118.06757379867254, 24.45707521716559],
          [118.0675639080268, 24.45708510781133],
          [118.0675639080268, 24.45708510781133],
          [118.0675639080268, 24.45708510781133],
          [118.06755154471962, 24.45710241644138],
          [118.06755154471962, 24.45710241644138],
          [118.06755154471962, 24.45710241644138],
          [118.06755154471962, 24.45710241644138],
          [118.067536708751, 24.45711972507143],
          [118.067536708751, 24.45711972507143],
          [118.06753176342814, 24.45712961571717],
          [118.06753176342814, 24.45712961571717],
          [118.0675218727824, 24.45714197902435],
          [118.0675218727824, 24.45714197902435],
          [118.0675218727824, 24.45714197902435],
          [118.0675218727824, 24.45714197902435],
          [118.06751692745952, 24.457151869670092],
          [118.06751692745952, 24.457151869670092],
          [118.06751692745952, 24.457151869670092],
          [118.06751198213665, 24.457161760315834],
          [118.06751198213665, 24.457161760315834],
          [118.06753147006152, 24.457176596284448],
        ];
        this.tileFilter = {
          feature: {
            type: "polygon",
            coordinates: [coordinates],
          },
          shadowWidth: 50,
          fill: "rgba(0,0,0,0.8)",
        };
        const extent = this.$refs.map.boundingExtent(coordinates);
        this.$refs.map.fit(extent, {
          duration: 1500,
          easing: "linear",
        });
      } else {
        this.tileFilter = undefined;
      }
    },
    setWFSVisible(visible) {
      this.wfsLayerVisible = visible;
    },
    onContextmenu(evt, map) {
      this.positionMenu = evt.coordinate;
    },
    onClickFeatures(evt, feature) {
      console.log(evt, feature);
      // const feature = features.length ? features[0] : undefined
      if (feature) {
        console.log(feature);
        if (this.toggleCluster) {
          if (feature.get("features") && feature.get("features").length <= 1) {
            const data = feature.get("features")[0];
            this.overlay.name = data.get("properties")?.name || "";
            this.position = data.get("coordinates") || evt.coordinate;
          } else {
            console.log(feature.get("features"));
          }
        } else {
          this.overlay.name = feature.get("properties")?.name || "";
          this.position = feature.get("coordinates") || evt.coordinate;
        }
      }
    },
    onDblClick(evt, map) {
      this.$refs.map.closeOverlays();
    },
    pointermove(evt, feature) {
      if (feature) {
        if (this.toggleCluster) {
          // console.log(feature)
          if (feature.get("features") && feature.get("features").length <= 1) {
            const data = feature.get("features")[0];
            this.level = data.get("properties")?.level || "";
            this.positionLevel = data.get("coordinates") || evt.coordinate;
          }
        } else {
          console.log(feature);
          this.level = feature.get("properties")?.level || "";
          this.positionLevel = feature.get("coordinates") || evt.coordinate;
        }
        // console.log(this.level)
        // console.log(this.positionLevel)
      }
    },
    changeTile() {
      // if (this.tile === "XYZ") {
      //   this.xyz = { ...this.XYZMix };
      // }
      // this.tileType2 = val;
      if (this.tile.indexOf("XYZ") > -1) {
        this.tileType = "XYZ";
        const tile = this.baseTile.find((item) => item.value === this.tile);
        if (tile) {
          console.log(tile);
          this.xyz = {
            ...this.XYZMix[this.tile],
          };
        }
      } else {
        this.tileType = this.tile;
      }
    },
    loadTrack() {
      fetch("data-6k.json")
        .then((res) => res.json())
        .then((path) => {
          console.log(path);
          this.track.path = path;
          this.showTrack = true;
        });
    },
    startTrack() {
      if (this.$refs.track) {
        this.$refs.track.start();
      } else {
        alert("track unload");
      }
    },
    pauseTrack() {
      if (this.$refs.track) {
        this.$refs.track.pause();
      } else {
        alert("track unload");
      }
    },
    resumeTrack() {
      if (this.$refs.track) {
        this.$refs.track.resume();
      } else {
        alert("track unload");
      }
    },
    stopTrack() {
      if (this.$refs.track) {
        this.$refs.track.stop();
      } else {
        alert("track unload");
      }
    },
    disposeTrack() {
      this.showTrack = false;
    },
    drawend(evt, map) {
      console.log("on drawend: ", evt, map);
      console.log("sketchCoords_--", JSON.stringify(evt.feature.getGeometry().getCoordinates()));
      if (this.drawType !== "Polygon") return;
      const feature = evt.feature;
      const geometry = feature.getGeometry();
      const extent = geometry.getExtent();
      const inExtent = [];
      this.$refs.layer1.layer.getSource().forEachFeatureInExtent(extent, (feature) => {
        // console.log(feature);
        const point = feature.get("features");
        if (point && point.length > 0) {
          point.forEach((feature) => {
            if (feature.get("flash")) {
              inExtent.push(feature);
            }
          });
        }
      });
      this.$refs.map.updateFeature(feature, "style", {
        stroke: {
          color: "red",
          width: 8,
        },
        text: {
          text: `范围内包含${inExtent.length}个预警点`,
          fill: {
            color: "white",
          },
          offsetY: 20,
        },
      });
    },
    onselect(evt, map) {
      console.log("on select: ", evt, map);
      const feature = evt.selected[0];
      console.log(feature);
      // const geometry = feature.getGeometry()
      // console.log(geometry.getCoordinates())
    },
    modifystart(evt, map) {
      console.log("modify start: ", evt, map);
    },
    modifyend(evt, map) {
      console.log("modify end: ", evt, map);
      const feature = evt.features.getArray()[0];
      const geometry = feature.getGeometry();
      console.log(geometry.getCoordinates());
    },
    modifychange(evt, map, feature) {
      // console.log('modify change: ', evt, map, feature)
      if (feature.getId() === "add") {
        const Geometry = feature.getGeometry();
        const center = this.$refs.map.calculateCenter(Geometry);
        console.log(center);
        const radius = Geometry.getRadius(); // 半径
        const metersPerUnit = map.getView().getProjection().getMetersPerUnit(); // 半径以米为单位
        const extent = Geometry.getExtent();
        this.positionRadius = [extent[2], (extent[3] + extent[1]) / 2];
        this.radius = (radius * metersPerUnit).toFixed(2);
        this.features.forEach((feature) => {
          if (feature.id === "circleCenter") {
            feature.coordinates = center.center;
          }
          if (feature.id === "circleEdge") {
            feature.coordinates = this.positionRadius;
          }
        });
      }
    },
    closeOverlays() {
      this.$refs.map.closeOverlays();
    },
    removeDraw() {
      this.drawType = "";
      // this.$refs.drawLayer.remove()
    },
    drawHandler(type) {
      this.positionMenu = undefined;
      if (this.drawType && this.drawType === type) {
        this.$refs.drawLayer.setActive(true);
      }
      this.drawType = type;
    },
    measureHandler(type) {
      this.positionMenu = undefined;
      if (this.measureType && this.measureType === type) {
        this.$refs.measureLayer.setActive(true);
      }
      this.measureType = type;
    },
    setEchartsOptions() {
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
        韶关: [113.7964, 24.7028],
      };
      const BJData = [
        [{ name: "北京" }, { name: "上海", value: 95 }],
        [{ name: "北京" }, { name: "广州", value: 90 }],
        [{ name: "北京" }, { name: "大连", value: 80 }],
        [{ name: "北京" }, { name: "南宁", value: 70 }],
        [{ name: "北京" }, { name: "南昌", value: 60 }],
        [{ name: "北京" }, { name: "拉萨", value: 50 }],
        [{ name: "北京" }, { name: "长春", value: 40 }],
        [{ name: "北京" }, { name: "包头", value: 30 }],
        [{ name: "北京" }, { name: "重庆", value: 20 }],
        [{ name: "北京" }, { name: "常州", value: 10 }],
      ];
      const SHData = [
        [{ name: "上海" }, { name: "包头", value: 95 }],
        [{ name: "上海" }, { name: "昆明", value: 90 }],
        [{ name: "上海" }, { name: "广州", value: 80 }],
        [{ name: "上海" }, { name: "郑州", value: 70 }],
        [{ name: "上海" }, { name: "长春", value: 60 }],
        [{ name: "上海" }, { name: "重庆", value: 50 }],
        [{ name: "上海" }, { name: "长沙", value: 40 }],
        [{ name: "上海" }, { name: "北京", value: 30 }],
        [{ name: "上海" }, { name: "丹东", value: 20 }],
        [{ name: "上海" }, { name: "大连", value: 10 }],
      ];
      const GZData = [
        [{ name: "广州" }, { name: "福州", value: 95 }],
        [{ name: "广州" }, { name: "太原", value: 90 }],
        [{ name: "广州" }, { name: "长春", value: 80 }],
        [{ name: "广州" }, { name: "重庆", value: 70 }],
        [{ name: "广州" }, { name: "西安", value: 60 }],
        [{ name: "广州" }, { name: "成都", value: 50 }],
        [{ name: "广州" }, { name: "常州", value: 40 }],
        [{ name: "广州" }, { name: "北京", value: 30 }],
        [{ name: "广州" }, { name: "北海", value: 20 }],
        [{ name: "广州" }, { name: "海口", value: 10 }],
        [{ name: "广州" }, { name: "厦门", value: 10 }],
      ];
      const planePath =
        "path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z";
      const convertData = function (data) {
        const res = [];
        for (let i = 0; i < data.length; i++) {
          const dataItem = data[i];
          const fromCoord = geoCoordMap[dataItem[0].name];
          const toCoord = geoCoordMap[dataItem[1].name];
          if (fromCoord && toCoord) {
            res.push({
              fromName: dataItem[0].name,
              toName: dataItem[1].name,
              coords: [fromCoord, toCoord],
            });
          }
        }
        return res;
      };
      const color = ["#a6c84c", "#ffa022", "#46bee9"];
      const series = [];
      [
        ["北京", BJData],
        ["上海", SHData],
        ["广州", GZData],
      ].forEach(function (item, i) {
        series.push(
          {
            name: item[0] + " Top10",
            type: "lines",
            zlevel: 1,
            effect: {
              show: true,
              period: 6,
              trailLength: 0.7,
              color: "#fff",
              symbolSize: 3,
            },
            lineStyle: {
              normal: {
                color: color[i],
                width: 0,
                curveness: 0.2,
              },
            },
            data: convertData(item[1]),
          },
          {
            name: item[0] + " Top10",
            type: "lines",
            zlevel: 2,
            effect: {
              show: true,
              period: 6,
              trailLength: 0,
              symbol: planePath,
              symbolSize: 15,
            },
            lineStyle: {
              normal: {
                color: color[i],
                width: 1,
                opacity: 0.4,
                curveness: 0.2,
              },
            },
            data: convertData(item[1]),
          },
          {
            name: item[0] + " Top10",
            type: "effectScatter",
            coordinateSystem: "geo",
            zlevel: 2,
            rippleEffect: {
              brushType: "stroke",
            },
            label: {
              normal: {
                show: true,
                position: "right",
                formatter: "{b}",
              },
            },
            symbolSize: function (val) {
              return val[2] / 8;
            },
            itemStyle: {
              normal: {
                color: color[i],
              },
            },
            data: item[1].map(function (dataItem) {
              return {
                name: dataItem[1].name,
                value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
              };
            }),
          }
        );
      });
      return {
        tooltip: {
          trigger: "item",
        },
        series,
      };
    },
    panTo() {
      this.$refs.map.panTo({
        zoom: 13,
        center: [118.137676, 24.494068],
      });
    },
    flyTo() {
      this.$refs.map.flyTo({
        zoom: 13,
        flyZoom: 8,
        center: [120.12636, 30.230779],
      });
    },
    getExtent() {
      const extent = this.$refs.map.map.getView().calculateExtent(this.$refs.map.map.getSize());
      console.log(extent);
    },
    changeImage(url, geoImage) {
      this.imageSource2.geoImage = geoImage;
      this.imageSource2.url = new URL(`../../assets/img/${url}.jpg`, import.meta.url).href;
      this.imageOpacity = 0.9;
      this.imageVisible = true;
    },
    getHeatmapData() {
      axios.get("/heatmap.json").then((res) => {
        console.log(res);
        const points = [].concat.apply(
          [],
          res.data.map(function (track) {
            return track.map(function (seg) {
              return {
                coordinates: seg.coord,
                convert: "bd-84",
              };
            });
          })
        );
        console.log(points);
        this.heatmap.features = points;
      });
    },
    textLayerModifyEnd(params) {
      const coordinates = params.features.getArray()[0].getGeometry().getCoordinates();
      console.log(JSON.stringify(coordinates));
    },
    featuresChange(features) {
      console.log("features change", features);
    },
    showItem(index) {
      this.clusterOverlay = false;
      this.overlayIndex = index;
    },
    overlayClose() {
      if (this.toggleCluster) {
        this.clusterOverlay = true;
      }
    },
    showClusterItem(id) {
      console.log(id);
      const { properties } = this.clusterFeatures.find((x) => x.id === id);
      this.clusterOverlay.info = properties;
      this.clusterOverlay.cluster = false;
    },
    onmovestart() {
      console.log("on move start");
      this.mapLoading = true;
    },
    onMoveend() {
      console.log("on move end");
      this.mapLoading = false;
    },
    onChangeResolution() {
      console.log("on change Resolution");
    },
    onClickCluster(evt, feature) {
      console.log(feature);
      // const feature = features.length ? features[0] : undefined
      if (feature) {
        this.clusterOverlay.cluster = feature.get("cluster");
        if (this.clusterOverlay.cluster) {
          const id = feature.get("cluster_id");
          const count = feature.get("point_count");
          if (count <= 10) {
            const children = this.$refs.clusterLayer.getLeaves(id, Infinity);
            this.clusterOverlay.list = children.map((child) => {
              return child.properties;
            });
            this.clusterOverlay.position = feature.get("coordinates") || evt.coordinate;
          }
        } else {
          console.log(feature.get("properties"));
          this.clusterOverlay.info = feature.get("properties");
          this.clusterOverlay.position = feature.get("coordinates") || evt.coordinate;
        }
      }
    },
    onClickWFS(evt, feature) {
      console.log(evt);
      this.positionWFS = undefined;
      if (feature) {
        console.log("on click wfs", feature);
        const geometry = feature.getGeometry();
        if (geometry) {
          console.log(geometry);
          const { center } = calculateCenter(geometry);
          if (center) {
            const DISCRIB = feature.get("DISCRIB");
            const NAME = feature.get("NAME");
            this.wfsInfo = DISCRIB ? `分局：${DISCRIB} 派出所：${NAME}` : `派出所：${NAME}`;
            this.positionWFS = center;
          }
        }
      }
    },
    getCentroid() {
      const coordinates = [
        [118.23048075355373, 24.587052571002776],
        [118.25051461705989, 24.592192894082423],
        [118.257872, 24.573517],
        [118.24383041710121, 24.561810933485354],
        [118.23048075355373, 24.587052571002776],
      ];
      const feature = getCentroid([coordinates]);
      console.log(feature);
      this.features2.push(feature.geometry);
    },
  },
  mounted() {
    this.echarts.options = this.setEchartsOptions();
    this.getHeatmapData();
    this.getCentroid();
  },
};
</script>

<style>
p {
  margin: 0;
  padding: 0;
}
.ol-rotate-custom {
  right: 5em;
  top: 0.5em;
}
.mask {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}
.overlay {
  padding: 5px 10px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}
.overlay-menu {
  padding: 5px 10px;
  border-radius: 5px;
  background: white;
  color: #1a1a1a;
}
.overlay-cluster {
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
.tool {
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
  /*background: #ffffff;*/
}
.item {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.2);
}
.label {
  width: 100%;
}
.group {
  background: #888888;
  color: #ffffff;
  cursor: default;
}
.tag {
  color: #fff;
  background: #f91;
  padding: 0.1em 0.3em;
  display: inline-block;
  -webkit-transform: rotate(-5deg);
  transform: rotate(-5deg);
  margin: -1em 0;
  cursor: pointer;
}
.overview-map-customer {
  right: 5rem;
  left: auto;
  z-index: 999;
}
</style>
