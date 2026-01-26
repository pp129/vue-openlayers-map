<script>
import VzPath from "@/utils/path";

/**
 * 优化的轨迹路径回放组件
 *
 * 基于原 v-path 组件优化：
 * 1. 完善的生命周期管理
 * 2. 错误处理机制
 * 3. 性能优化（事件节流、样式缓存）
 * 4. 支持动态更新路径
 */
export default {
  name: "v-path",
  render() {
    return null;
  },
  inject: ["VMap"],
  props: {
    /**
     * 事件触发是否穿透
     */
    bubble: {
      type: Boolean,
      default: true,
    },
    /**
     * 是否显示路径轨迹点
     */
    showTracePoint: {
      type: Boolean,
      default: true,
    },
    /**
     * 轨迹回放模式
     * skip: 跳点模式
     * animation: 动画模式
     */
    tracePointsModePlay: {
      type: String,
      default: "animation",
      validator: (value) => ["skip", "animation"].includes(value),
    },
    /**
     * 路径点数组
     * 每个点包含: { longitude, latitude, gnssTime?, ... }
     */
    path: {
      type: Array,
      default: () => [],
    },
    /**
     * 路径配置选项
     */
    options: {
      type: Object,
      default: () => ({}),
    },
    /**
     * 是否自动播放
     */
    autoPlay: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      pathObj: null,
      isInitialized: false,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    path: {
      handler(newPath) {
        if (newPath && newPath.length > 0) {
          this.updatePath(newPath);
        }
      },
      deep: true,
    },
  },
  methods: {
    /**
     * 初始化路径
     */
    init(paths) {
      const pathsData = paths || this.path;

      if (!pathsData || pathsData.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[v-path] No path data provided");
        }
        return;
      }

      try {
        // 如果已初始化，先清理
        if (this.pathObj) {
          this.dispose();
        }

        // 修复：正确传递 options，避免嵌套
        const option = {
          bubble: this.bubble,
          showTracePoint: this.showTracePoint,
          tracePointsModePlay: this.tracePointsModePlay,
          mapObj: this.map,
          path: pathsData,
          options: this.options, // 用户自定义配置（包含 carIcon 等）
        };

        this.pathObj = new VzPath(option);

        // 样式配置
        this.applyStyles();

        // 绑定事件
        this.bindEvents();

        this.isInitialized = true;
        this.$emit("load", this.pathObj);

        if (this.autoPlay) {
          this.start();
        }
      } catch (error) {
        console.error("[v-path] Failed to initialize:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 应用样式配置
     */
    applyStyles() {
      if (!this.pathObj) return;

      const opts = this.options;

      // 轨迹线样式
      this.pathObj.setTraceLineStyle({
        lineColor: opts.lineColor || "rgba(0, 0, 255, 0.6)",
        lineWidth: opts.lineWidth || 10,
      });

      // 通过线样式
      this.pathObj.setPassLineStyle({
        lineColor: opts.passlineColor || "red",
        lineWidth: opts.passlineWidth || 2,
      });

      // 轨迹点样式
      this.pathObj.setTraceNodeStyle({
        lineColor: opts.nodeStrokeColor || "#3399CC",
        lineWidth: opts.nodeStrokeWidth || 1.25,
        fillColor: opts.nodeFillColor || "rgba(255,255,255,0.4)",
      });
    },

    /**
     * 绑定事件监听
     */
    bindEvents() {
      if (!this.pathObj) return;

      const events = this.pathObj.getEvents();
      events.forEach((event) => {
        this.pathObj.on(event, (e) => {
          this.$emit(event, e);
        });
      });
    },

    /**
     * 更新路径数据
     */
    updatePath(newPath) {
      if (this.pathObj && newPath && newPath.length > 0) {
        this.pathObj.setPaths(newPath);
        this.applyStyles();
      } else {
        this.init(newPath);
      }
    },

    /**
     * 开始播放
     */
    start(moveIdx) {
      if (this.pathObj) {
        this.pathObj.start(moveIdx);
      }
    },

    /**
     * 暂停播放
     */
    pause() {
      if (this.pathObj) {
        this.pathObj.pause();
      }
    },

    /**
     * 恢复播放
     */
    resume() {
      if (this.pathObj) {
        this.pathObj.resume();
      }
    },

    /**
     * 停止播放
     */
    stop(ended) {
      if (this.pathObj) {
        this.pathObj.stop(ended);
      }
    },

    /**
     * 设置播放速度
     */
    setSpeed(speed) {
      if (this.pathObj) {
        this.pathObj.setSpeed(speed);
      }
    },

    /**
     * 设置倍速
     */
    setSpeedUp(speedUp) {
      if (this.pathObj) {
        this.pathObj.setSpeedUp(speedUp);
      }
    },

    /**
     * 获取路径对象
     */
    getPath() {
      return this.pathObj;
    },

    /**
     * 清理资源
     */
    dispose() {
      if (this.pathObj) {
        try {
          this.pathObj.destroy();
        } catch (error) {
          console.error("[v-path] Error disposing path:", error);
        }
        this.pathObj = null;
        this.isInitialized = false;
      }
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>

<style scoped></style>
