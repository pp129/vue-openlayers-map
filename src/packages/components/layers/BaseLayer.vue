<script>
import EventManager from "@/packages/utils/eventManager";

/**
 * 基础图层组件 (优化版)
 *
 * 优化内容:
 * 1. 添加统一的事件管理器
 * 2. 增强 dispose 清理逻辑
 * 3. 提供通用的生命周期钩子
 * 4. 避免内存泄漏
 */
export default {
  name: "base-layer",
  render(createElement, context) {
    return null;
  },
  props: {
    className: {
      type: String,
      default: "ol-layer",
    },
    opacity: {
      type: Number,
      default: 1,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    extent: {
      type: Array,
      default: undefined,
    },
    zIndex: {
      type: Number,
      default: undefined,
    },
    maxResolution: {
      type: Number,
      default: undefined,
    },
    minResolution: {
      type: Number,
      default: undefined,
    },
    minZoom: {
      type: Number,
      default: undefined,
    },
    maxZoom: {
      type: Number,
      default: undefined,
    },
    title: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    preview: {
      type: String,
      default: undefined,
    },
    baseLayer: {
      type: Boolean,
      default: false,
    },
    properties: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      layer: null,
      // 事件管理器实例
      eventManager: null,
      // 定时器引用
      timers: [],
      // 动画帧引用
      rafIds: [],
    };
  },
  watch: {
    visible: {
      handler(value) {
        if (this.layer) {
          this.layer.setVisible(value);
        }
      },
      immediate: false,
    },
    opacity: {
      handler(value) {
        if (this.layer) {
          this.layer.setOpacity(value);
        }
      },
      immediate: false,
    },
    zIndex: {
      handler(value) {
        if (this.layer) {
          this.layer.setZIndex(value);
        }
      },
      immediate: false,
    },
    maxZoom: {
      handler(value) {
        if (this.layer) {
          this.layer.setMaxZoom(value);
        }
      },
      immediate: false,
    },
    minZoom: {
      handler(value) {
        if (this.layer) {
          this.layer.setMinZoom(value);
        }
      },
      immediate: false,
    },
    extent: {
      handler(value) {
        if (this.layer) {
          this.layer.setExtent(value);
        }
      },
      immediate: false,
      deep: true,
    },
    maxResolution: {
      handler(value) {
        if (this.layer) {
          this.layer.setMaxResolution(value);
        }
      },
      immediate: false,
    },
    minResolution: {
      handler(value) {
        if (this.layer) {
          this.layer.setMinResolution(value);
        }
      },
      immediate: false,
    },
    properties: {
      handler(value) {
        if (this.layer) {
          this.layer.setProperties(value);
        }
      },
      immediate: false,
      deep: true,
    },
  },
  created() {
    // 初始化事件管理器
    this.eventManager = new EventManager();
  },
  beforeDestroy() {
    // 调用基础清理方法
    this.baseDispose();
  },
  methods: {
    /**
     * 添加事件监听器
     * @param {import('ol/events').EventsKey} listener - 事件监听器
     * @param {string} [name] - 监听器名称
     */
    addListener(listener, name) {
      if (this.eventManager) {
        return this.eventManager.add(listener, name);
      }
      return listener;
    },

    /**
     * 移除事件监听器
     * @param {import('ol/events').EventsKey|string} listenerOrName - 监听器或名称
     */
    removeListener(listenerOrName) {
      if (this.eventManager) {
        this.eventManager.remove(listenerOrName);
      }
    },

    /**
     * 清理所有事件监听器
     */
    cleanupListeners() {
      if (this.eventManager) {
        this.eventManager.removeAll();
      }
    },

    /**
     * 添加定时器引用
     * @param {number} timerId - 定时器ID
     */
    addTimer(timerId) {
      this.timers.push(timerId);
      return timerId;
    },

    /**
     * 清理所有定时器
     */
    clearAllTimers() {
      this.timers.forEach((timerId) => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      this.timers = [];
    },

    /**
     * 添加动画帧引用
     * @param {number} rafId - 动画帧ID
     */
    addRaf(rafId) {
      this.rafIds.push(rafId);
      return rafId;
    },

    /**
     * 清理所有动画帧
     */
    clearAllRafs() {
      this.rafIds.forEach((rafId) => {
        cancelAnimationFrame(rafId);
      });
      this.rafIds = [];
    },

    /**
     * 基础清理方法
     * 子类可以覆盖此方法以添加额外的清理逻辑
     * 但应该调用 super.baseDispose() 或手动调用清理方法
     */
    baseDispose() {
      // 清理事件监听器
      this.cleanupListeners();

      // 清理定时器
      this.clearAllTimers();

      // 清理动画帧
      this.clearAllRafs();

      // 清理图层
      if (this.layer) {
        const source = this.layer.getSource();
        if (source) {
          // 清空数据源
          if (typeof source.clear === "function") {
            source.clear();
          }
          // 释放数据源资源
          if (typeof source.dispose === "function") {
            source.dispose();
          }
        }

        // 清理渲染器
        const renderer = this.layer.getRenderer();
        if (renderer && typeof renderer.dispose === "function") {
          renderer.dispose();
        }

        // 注意: 图层从地图移除应该由子类处理
        // 因为子类可能使用了 LayerManager 或 GroupLayer
      }

      // 清理事件管理器
      if (this.eventManager) {
        this.eventManager.dispose();
        this.eventManager = null;
      }
    },

    /**
     * 获取图层
     * @returns {import('ol/layer/Base').default|null}
     */
    getLayer() {
      return this.layer;
    },

    /**
     * 获取图层数据源
     * @returns {import('ol/source/Source').default|null}
     */
    getSource() {
      return this.layer ? this.layer.getSource() : null;
    },

    /**
     * 刷新图层
     */
    refresh() {
      if (this.layer) {
        const source = this.layer.getSource();
        if (source && typeof source.refresh === "function") {
          source.refresh();
        } else if (source && typeof source.changed === "function") {
          source.changed();
        }
      }
    },

    /**
     * 获取图层要素数量
     * @returns {number}
     */
    getFeatureCount() {
      const source = this.getSource();
      if (source && typeof source.getFeatures === "function") {
        return source.getFeatures().length;
      }
      return 0;
    },

    /**
     * 获取图层的范围
     * @returns {import('ol/extent').Extent|null}
     */
    getExtent() {
      const source = this.getSource();
      if (source && typeof source.getExtent === "function") {
        return source.getExtent();
      }
      return null;
    },
  },
};
</script>

<style scoped></style>
