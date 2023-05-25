<script>
import { nanoid } from 'nanoid'
import VzPath from '@/utils/path'

export default {
  name: 'v-path',
  render () {
    return null
  },
  inject: ['VMap'],
  props: {
    id: {
      type: String,
      default () {
        return `track-${nanoid()}`
      }
    },
    // 事件触发是否穿透
    bubble: {
      type: Boolean,
      default: true
    },
    // 是否显示路径轨迹点
    showTracePoint: {
      type: Boolean,
      default: true
    },
    tracePointsModePlay: {
      type: String
    },
    path: {
      type: Array
    },
    options: {
      type: Object
    },
    autoPlay: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pathObj: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  methods: {
    init (paths) {
      if ((paths && paths.length > 0) || (this.path && this.path.length > 0)) {
        const option = { ...this.$props, ...{ mapObj: this.map, path: paths || this.path, options: this.options } }
        // console.log(this.$props)
        this.pathObj = new VzPath(option)
        console.log(this.pathObj)
        this.$emit('load', this.pathObj)
        if (this.autoPlay) {
          this.start()
        }
      }
    },
    start (moveIdx) {
      this.pathObj.start(moveIdx)
    },
    pause () {
      this.pathObj.pause()
    },
    resume () {
      this.pathObj.resume()
    },
    stop (ended) {
      this.pathObj.stop(ended)
    },
    destroy () {
      this.pathObj.destroy()
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.pathObj.destroy()
    this.pathObj = null
  }
}
</script>

<style scoped>

</style>
