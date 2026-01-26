<template>
  <div :id="elementId" :class="className">
    <slot :data="data"></slot>
  </div>
</template>

<script>
import { nanoid } from "nanoid";
import { Overlay } from "ol";

/**
 * 优化的 Overlay 组件
 *
 * 优化内容:
 * 1. 添加完善的清理逻辑
 * 2. 添加错误处理
 * 3. 优化 watch 性能
 */
export default {
  name: "v-overlay",
  inject: ["VMap"],
  props: {
    overlayId: {
      type: String,
      default: "",
    },
    element: {
      type: String,
      default: "",
    },
    position: {
      type: [Array, undefined],
      default: undefined,
    },
    positioning: {
      type: String,
    },
    offset: {
      type: Array,
      default: () => [0, 0],
    },
    autoPan: {
      type: Boolean,
      default: false,
    },
    className: {
      type: [String, Array],
    },
    data: {
      type: Array,
    },
    close: {
      type: Function,
    },
  },
  data() {
    return {
      elementId: "",
      overlay: null,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    position: {
      handler(value) {
        if (this.overlay) {
          this.overlay.setPosition(value);
        }
      },
      immediate: false,
    },
    positioning: {
      handler(value) {
        if (this.overlay) {
          this.overlay.setPositioning(value);
        }
      },
      immediate: false,
    },
    offset: {
      handler(value) {
        if (this.overlay) {
          this.overlay.setOffset(value);
        }
      },
      immediate: false,
    },
  },
  methods: {
    /**
     * 设置 Overlay 位置
     * @param {Array} coordinates - 坐标数组 [lon, lat]
     */
    setPosition(coordinates) {
      if (this.overlay) {
        this.overlay.setPosition(coordinates);
      }
    },

    /**
     * 获取 Overlay 实例
     * @returns {Overlay} overlay 实例
     */
    getOverlay() {
      return this.overlay;
    },

    /**
     * 清理资源
     */
    dispose() {
      if (this.overlay && this.map) {
        this.map.removeOverlay(this.overlay);
        this.overlay = null;
      }
    },
  },
  created() {
    this.elementId = this.element || `overlay-el-${nanoid()}`;
  },
  mounted() {
    try {
      const overlayEl = document.getElementById(this.elementId);

      if (!overlayEl) {
        console.error("[v-overlay] Element not found:", this.elementId);
        return;
      }

      const id = this.overlayId || `overlay-id-${nanoid()}`;
      const overlayOption = {
        ...this.$props,
        id,
        element: overlayEl,
      };

      this.overlay = new Overlay(overlayOption);

      // 设置自定义属性
      for (const key in overlayOption) {
        if (Object.prototype.hasOwnProperty.call(overlayOption, key)) {
          this.overlay.set(key, overlayOption[key]);
        }
      }

      this.map.addOverlay(this.overlay);

      /**
       * Triggers when overlay is loaded
       * @property {Overlay} overlay - Overlay instance
       * @property {Map} map - Map instance
       */
      this.$emit("load", this.overlay, this.map);
    } catch (error) {
      console.error("[v-overlay] Failed to create overlay:", error);
      this.$emit("error", error);
    }
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>

<style scoped></style>
