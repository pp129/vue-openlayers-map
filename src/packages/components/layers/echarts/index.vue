<script>
import { nanoid } from "nanoid";
import EChartsLayer from "ol-echarts";

/**
 * 优化的 ECharts 图层组件
 *
 * 修复问题:
 * 1. stopEvent: false - 解决地图无法拖动、缩放问题
 * 2. pointer-events: none - 解决鼠标悬浮要素无法变pointer问题
 *
 * 优化内容:
 * 1. 添加 interactive prop 控制是否响应鼠标事件
 * 2. 完善的 dispose 清理逻辑
 * 3. 支持动态切换交互状态
 */
export default {
  name: "v-echarts",
  inject: ["VMap"],
  render() {
    return null;
  },
  props: {
    /**
     * ECharts 图表配置
     */
    chartOptions: {
      type: Object,
    },
    /**
     * EChartsLayer 配置选项
     */
    options: {
      type: Object,
    },
    /**
     * 图层是否可见
     */
    visible: {
      type: Boolean,
      default: true,
    },
    /**
     * 图层 z-index
     */
    zIndex: {
      type: Number,
    },
    /**
     * 是否允许 ECharts 图层响应鼠标事件
     * false: 鼠标事件穿透到地图(默认，不影响地图要素交互)
     * true: ECharts 图层响应鼠标事件
     */
    interactive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      layer: null,
      layerSelector: ".ol-echarts-layer-container",
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    visible: {
      handler(val) {
        if (this.layer) {
          this.layer.setVisible(val);
        }
      },
      immediate: false,
    },
    zIndex: {
      handler(val) {
        if (this.layer) {
          this.layer.setZIndex(val);
        }
      },
      immediate: false,
    },
    chartOptions: {
      handler(val) {
        if (this.layer) {
          this.layer.setChartOptions(val);
        }
      },
      deep: true,
      immediate: false,
    },
    interactive: {
      handler() {
        this.setPointerStyle();
      },
      immediate: false,
    },
  },
  methods: {
    /**
     * 初始化 ECharts 图层
     */
    init() {
      // 创建 ECharts 图层，设置 stopEvent: false 解决地图拖动问题
      this.layer = new EChartsLayer(this.chartOptions, {
        ...this.options,
        stopEvent: false, // 关键：不阻止事件传播，允许地图正常拖动缩放
      });

      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      this.layer.setVisible(this.visible);
      this.layer.appendTo(this.map);

      // 设置 pointer-events 样式，解决光标问题
      this.setPointerStyle();

      this.$emit("load", this.layer, this.map);
    },

    /**
     * 设置 ECharts 图层容器的 pointer-events 样式
     * 解决鼠标悬浮在地图要素上无法显示 pointer 光标的问题
     */
    setPointerStyle() {
      this.$nextTick(() => {
        const target = this.map.getTargetElement();
        if (!target) return;

        const containers = target.querySelectorAll(this.layerSelector);
        const pointerValue = this.interactive ? "auto" : "none";

        containers.forEach((el) => {
          el.style.pointerEvents = pointerValue;
        });
      });
    },

    /**
     * 获取 EChartsLayer 实例
     */
    getLayer() {
      return this.layer;
    },

    /**
     * 更新图表配置
     */
    setChartOptions(options) {
      if (this.layer) {
        this.layer.setChartOptions(options);
      }
    },

    /**
     * 设置可见性
     */
    setVisible(visible) {
      if (this.layer) {
        this.layer.setVisible(visible);
      }
    },

    /**
     * 显示图层
     */
    show() {
      this.setVisible(true);
    },

    /**
     * 隐藏图层
     */
    hide() {
      this.setVisible(false);
    },

    /**
     * 刷新图层
     */
    refresh() {
      if (this.layer) {
        this.layer.setChartOptions(this.chartOptions);
      }
    },

    /**
     * 清理资源
     */
    dispose() {
      if (this.layer) {
        this.layer.remove();
        this.layer = null;
      }
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    if (this.map && this.layer) {
      this.map.removeLayer(this.layer);
    }
    this.dispose();
  },
};
</script>

<style scoped></style>
