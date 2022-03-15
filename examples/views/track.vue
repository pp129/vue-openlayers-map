<template>
<div class="home">
  <!-- map -->
  <v-map
    ref="map"
    class="map"
    :height="height"
    :width="width"
    :view="option.view" :track="option.track" @click="onClick" @onLoadTrack="onLoadTrack">
  </v-map>
  <div class="tools">
    <button class="btn" @click="setTrack">新增轨迹</button>
    <button class="btn" @click="startTrack('track1')">出发</button>
    <button class="btn" @click="pauseTrack('track1')">暂停</button>
    <button class="btn" @click="stopTrack('track1')">结束</button>
  </div>
  <div id="carOverlay" class="overlay">
    <div>carOverlay</div>
  </div>
</div>
</template>

<script>
import { VMap } from '~/index'
export default {
  name: 'trackMap',
  components: {
    VMap
  },
  data () {
    return {
      height: '100%',
      width: '100%',
      option: {
        view: {
          center: [118.045456, 24.567489],
          zoom: 10,
          constrainResolution: true // 设置视图是否应允许中间缩放级别。true:鼠标缩放地图,每次缩放级别为整数1
        },
        track: []
      },
      tracks: []
    }
  },
  methods: {
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
        tracePointsModePlay: 'animation', // skip 跳动模式，默认 animation 动画模式
        smokeMode: 'distance', // 轨迹抽稀模式，”distance”和”track”
        vacuateDistance: 20, // 抽稀距离，单位像素
        labelShow: true, // 是否显示轨迹点信息标签
        vacuate: false, // 是否抽稀
        showTracePoint: true, // 是否显示轨迹点，默认显示
        changeCarRotate: false,
        centerAtCar: false,
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
    startTrack (id) {
      this.option.track[0].target.start()
      // const index = this.tracks.findIndex(x => x.id === id)
      // if (index > -1) {
      //   this.tracks[index].start()
      // } else {
      //   alert('track unload')
      // }
    },
    pauseTrack (id) {
      const index = this.tracks.findIndex(x => x.id === id)
      if (index > -1) {
        this.tracks[index].pause()
      } else {
        alert('track unload')
      }
    },
    stopTrack (id) {
      const index = this.tracks.findIndex(x => x.id === id)
      if (index > -1) {
        this.tracks[index].stop()
      } else {
        alert('track unload')
      }
    },
    onClick (evt, map) {
      console.log('on map click === get coordinate', evt.coordinate)
      const pixel = map.getEventPixel(evt.originalEvent)
      const hit = map.hasFeatureAtPixel(pixel)
      if (hit) {
        const features = map.getFeaturesAtPixel(evt.pixel)
        console.log(features)
        if (features && features.length > 0) {
          console.log(features)
        }
      }
    },
    onLoadTrack (tracks) {
      console.log(tracks)
      this.tracks = tracks
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
