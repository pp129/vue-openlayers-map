<template>
  <div v-if="rendered"><slot></slot></div>
</template>

<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import Group from "ol/layer/Group";

/**
 * 优化的图层分组组件
 *
 * 优化内容:
 * 1. 继承 BaseLayer，使用统一的事件和资源管理
 * 2. 使用 EventManager 管理事件监听器
 * 3. 完善的 dispose 清理逻辑
 * 4. 移除不必要的 console.log
 */
export default {
  name: "v-group-layer",
  provide() {
    return {
      VGroupLayer: this,
    };
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    layerId: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      rendered: false,
      eventList: [
        "change",
        "change:extent",
        "change:layers",
        "change:maxResolution",
        "change:maxZoom",
        "change:minResolution",
        "change:minZoom",
        "change:opacity",
        "change:visible",
        "change:zIndex",
      ],
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  methods: {
    /**
     * 初始化图层分组
     */
    init() {
      try {
        this.layer = new Group({
          ...this.$props,
          layers: [], // 初始为空，子图层会自动添加
        });

        const layerId = this.layerId || `group-layer-${nanoid()}`;
        this.layer.set("id", layerId);
        this.layer.set("type", "group");

        if (this.title) {
          this.layer.set("title", this.title);
        }

        if (this.zIndex !== undefined) {
          this.layer.setZIndex(this.zIndex);
        }

        // 优化: 使用 BaseLayer 的事件管理
        this.bindEvents();

        // 添加到地图
        this.map?.addLayer(this.layer);

        // 渲染子组件
        this.rendered = true;

        /**
         * Triggers when group layer is loaded
         * @property {Group} layer - Group layer instance
         * @property {Map} map - Map instance
         */
        this.$emit("load", this.layer, this.map);
      } catch (error) {
        console.error("[v-group-layer] Failed to initialize:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 绑定事件监听器
     * 优化: 使用 EventManager 统一管理
     */
    bindEvents() {
      this.eventList.forEach((eventName) => {
        const listener = this.layer.on(eventName, (evt) => {
          this.$emit(eventName, evt, this.layer);
        });
        // 使用 BaseLayer 的 addListener 方法自动管理
        this.addListener(listener, `group-${eventName}`);
      });
    },

    /**
     * 添加子图层
     * @param {import('ol/layer/Base').default} layer - 子图层
     */
    addChildLayer(layer) {
      if (this.layer) {
        this.layer.getLayers().push(layer);
      }
    },

    /**
     * 移除子图层
     * @param {import('ol/layer/Base').default} layer - 子图层
     */
    removeChildLayer(layer) {
      if (this.layer) {
        this.layer.getLayers().remove(layer);
      }
    },

    /**
     * 获取所有子图层
     * @returns {Array} 子图层数组
     */
    getChildLayers() {
      return this.layer ? this.layer.getLayers().getArray() : [];
    },

    /**
     * 清空所有子图层
     */
    clearChildLayers() {
      if (this.layer) {
        this.layer.getLayers().clear();
      }
    },

    /**
     * 优化的 dispose 方法
     * 优化: 继承 BaseLayer 的清理机制
     */
    dispose() {
      if (!this.layer || !this.map) return;

      // 清空子图层
      this.clearChildLayers();

      // 从地图移除
      this.map.removeLayer(this.layer);

      // 调用基类清理 (会自动清理事件监听器)
      this.baseDispose();

      this.rendered = false;
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
