<script>
import { uuid } from '~/utils'
import PathSimplifier from '~/VTrack/track'

export default {
  name: 'v-track',
  render (createElement, context) {
    return null
  },
  inject: ['VMap'],
  props: {
    id: {
      type: String,
      default () {
        return `track-${uuid()}`
      }
    },
    paths: {
      type: Array,
      default () {
        return [
          /* {
            longitude: 118.15450000867712,
            latitude: 24.50164504684645,
            id: 1,
            info: '起点',
            time: '2018-08-20 08:21:00'
          } */
        ]
      }
    },
    // skip 跳动模式，默认 animation 动画模式
    tracePointsModePlay: {
      type: String,
      default: 'animation'
    },
    // 轨迹抽稀模式，”distance”和”track”
    smokeMode: {
      type: String,
      default: 'distance'
    },
    // 是否抽稀
    vacuate: {
      type: Boolean,
      default: false
    },
    // 抽稀距离，单位像素
    vacuateDistance: {
      type: [Number, undefined],
      default: undefined
    },
    // 是否显示轨迹点信息标签
    labelShow: {
      type: Boolean,
      default: false
    },
    // 是否显示轨迹点，默认显
    showTracePoint: {
      type: Boolean,
      default: true
    },
    // 小车自动旋转角度
    changeCarRotate: {
      type: Boolean,
      default: false
    },
    // 视图是否跟随小车
    centerAtCar: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default () {
        return {
          // startIcon: {
          //   src: '',
          //   scale: 1
          // },
          // endIcon: {
          //   src: '',
          //   scale: 1
          // },
          // carIcon: {
          //   src: '',
          //   scale: 1
          // }, // 小车图标
          // speed: 120, // 车速，设置时为匀速模式，否则为实际速度模式
          // arrowPixel: 20, // 方向箭头之间的像素距离，单位是 px
          // tracePlay: false, // 是否进行轨迹回放，默认为 false
          // lineWidth: 5, // 轨迹线宽度，单位为像素
          // lineColor: 'red', // 轨迹线颜色
          // passlineColor: 'lightgreen' // 通过动画轨迹线颜色
        }
      }
    }
  },
  data () {
    return {
      track: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    paths: {
      handler (value) {
        console.log(value)
        this.init(value)
      },
      immediate: false,
      deep: true
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.track.dispose()
    this.track = null
  },
  methods: {
    init (paths) {
      if ((paths && paths.length > 0) || (this.paths && this.paths.length > 0)) {
        const option = { ...this.$props, ...{ map: this.map, paths: paths || this.paths } }
        // console.log(this.$props)
        this.track = PathSimplifier(option)
        this.$emit('onLoad', this.track)
      }
    },
    start () {
      this.track.start()
    },
    pause () {
      this.track.pause()
    },
    stop () {
      this.track.stop()
    },
    dispose () {
      this.track.dispose()
    }
  }
}
</script>

<style scoped>

</style>
