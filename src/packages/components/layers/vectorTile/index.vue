<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import { createDefaultStyle } from "ol/style/flat";
import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";

/**
 * 优化的矢量瓦片图层组件
 *
 * 优化内容:
 * 1. 继承 BaseLayer，使用统一的资源管理
 * 2. 使用 EventManager 管理事件监听器
 * 3. 完善的 dispose 清理逻辑
 * 4. 移除不必要的 console.log
 * 5. 优化样式配置
 */
export default {
  name: "v-vector-tile",
  render() {
    return null;
  },
  extends: BaseLayer,
  inject: {
    VMap: {
      value: "VMap",
      default: null,
    },
    VGroupLayer: {
      value: "VGroupLayer",
      default: null,
    },
  },
  props: {
    layerId: {
      type: String,
      default: "",
    },
    source: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      default: null,
    },
    layerStyle: {
      type: [Object, Function],
      default: () => createDefaultStyle(),
    },
    declutter: {
      type: Boolean,
      default: false,
    },
    renderMode: {
      type: String,
      default: "hybrid",
      validator: (value) => ["hybrid", "vector"].includes(value),
    },
    updateWhileAnimating: {
      type: Boolean,
      default: false,
    },
    updateWhileInteracting: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      vectorTileSource: null,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
    groupLayer() {
      return this.VGroupLayer?.layer;
    },
  },
  watch: {
    source: {
      handler(newValue) {
        if (this.layer && newValue) {
          this.updateSource(newValue);
        }
      },
      immediate: false,
      deep: true,
    },
    layerStyle: {
      handler(newValue) {
        if (this.layer && newValue) {
          this.layer.setStyle(newValue);
        }
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    /**
     * 初始化矢量瓦片图层
     */
    init() {
      try {
        this.vectorTileSource = new VectorTileSource(this.source);

        this.layer = new VectorTileLayer({
          source: this.vectorTileSource,
          style: this.layerStyle,
          declutter: this.declutter,
          renderMode: this.renderMode,
          updateWhileAnimating: this.updateWhileAnimating,
          updateWhileInteracting: this.updateWhileInteracting,
          opacity: this.opacity,
          visible: this.visible,
          extent: this.extent,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom,
          minResolution: this.minResolution,
          maxResolution: this.maxResolution,
        });

        const layerId = this.layerId || `vectorTile-layer-${nanoid()}`;
        this.layer.set("id", layerId);
        this.layer.set("type", "vectorTile");
        this.layer.set("users", true);

        if (this.zIndex !== undefined) {
          this.layer.setZIndex(this.zIndex);
        }

        // 添加到地图或图层组
        this.addToMap();

        // 绑定事件
        this.bindEvents();

        /**
         * Triggers when vector tile layer is loaded
         * @property {VectorTileLayer} layer - Vector tile layer instance
         * @property {Map} map - Map instance
         */
        this.$emit("load", this.layer, this.map);
      } catch (error) {
        console.error("[v-vector-tile] Failed to initialize:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 添加到地图或图层组
     */
    addToMap() {
      if (this.groupLayer) {
        this.groupLayer.getLayers().push(this.layer);
      } else {
        this.map.addLayer(this.layer);
      }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
      // 监听图层变化事件
      const changeListener = this.layer.on("change", (evt) => {
        this.$emit("change", evt, this.layer);
      });

      this.addListener(changeListener, "layer-change");

      // 监听数据源变化
      const sourceChangeListener = this.vectorTileSource.on("change", (evt) => {
        this.$emit("sourcechange", evt, this.vectorTileSource);
      });

      this.addListener(sourceChangeListener, "source-change");
    },

    /**
     * 更新数据源
     */
    updateSource(newSource) {
      if (this.vectorTileSource) {
        this.vectorTileSource.clear();
      }

      this.vectorTileSource = new VectorTileSource(newSource);
      this.layer.setSource(this.vectorTileSource);

      this.$emit("sourceupdated", this.vectorTileSource);
    },

    /**
     * 清空图层
     */
    clear() {
      if (this.vectorTileSource) {
        this.vectorTileSource.clear();
      }
    },

    /**
     * 刷新图层
     */
    refresh() {
      if (this.vectorTileSource) {
        this.vectorTileSource.refresh();
      }
    },

    /**
     * 获取数据源
     */
    getSource() {
      return this.vectorTileSource;
    },

    /**
     * 优化的 dispose 方法
     */
    dispose() {
      if (!this.layer || !this.map) return;

      // 清空数据源
      this.clear();

      // 从地图或图层组移除
      if (this.groupLayer) {
        this.groupLayer.getLayers().remove(this.layer);
      } else {
        this.map.removeLayer(this.layer);
      }

      // 调用基类清理
      this.baseDispose();

      this.vectorTileSource = null;
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
