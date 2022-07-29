<template>
<div class="home">
  <!-- map -->
  <v-map
    ref="map"
    class="map"
    :height="height"
    :width="width"
    default-tile="BD"
    :view="option.view">
    <VTrack ref="track" :id="track.id" :paths="track.paths" :options="track.options"></VTrack>
  </v-map>
  <div class="tools">
    <button class="btn" @click="setTrack">新增10w点轨迹【卡爆了】</button>
    <button class="btn" @click="startTrack">出发</button>
    <button class="btn" @click="pauseTrack()">暂停</button>
    <button class="btn" @click="stopTrack()">结束</button>
  </div>
</div>
</template>

<script>
import { VMap, VTrack } from '~/index'
import axios from 'axios'
export default {
  name: 'trackMap',
  components: {
    VMap, VTrack
  },
  data () {
    return {
      height: '100%',
      width: '100%',
      option: {
        view: {
          center: [113.2512, 23.23879],
          zoom: 12
        }
      },
      track: {
        id: 'track1',
        paths: [],
        options: {
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
          speed: 280, // 车速，设置时为匀速模式，否则为实际速度模式
          arrowPixel: 20, // 方向箭头之间的像素距离，单位是 px
          tracePlay: false, // 是否进行轨迹回放，默认为 false
          lineWidth: 5, // 轨迹线宽度，单位为像素
          lineColor: 'red', // 轨迹线颜色
          passlineColor: 'lightgreen' // 通过动画轨迹线颜色
        }
      },
      tracks: []
    }
  },
  methods: {
    setTrack () {
      axios.get('/paths.json').then(res => {
        const result = res.data
        console.log(result)
        result.forEach((path, index) => {
          const item = {
            id: index + 1,
            longitude: path.lon,
            latitude: path.lat,
            info: '',
            time: ''
          }
          this.track.paths.push(item)
        })
      })
    },
    startTrack () {
      this.$refs.track.start()
    },
    pauseTrack () {
      this.$refs.track.pause()
    },
    stopTrack () {
      this.$refs.track.stop()
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
