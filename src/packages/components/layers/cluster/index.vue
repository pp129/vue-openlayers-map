<template>
  <div><slot></slot></div>
</template>

<script>
import BaseLayer from "@/packages/components/layers/BaseLayer.vue";
import { nanoid } from "nanoid";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Style, Text } from "ol/style";
import Supercluster from "supercluster";
import CircleStyle from "ol/style/Circle";
import { convertCoordinate, setStyle, validObjKey } from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";
import StyleCache from "@/packages/utils/styleCache";
import { debounce } from "@/packages/utils/performance";

/**
 * 超级聚合图层组件 (优化版)
 *
 * 优化内容:
 * 1. 使用防抖替代 precompose 事件
 * 2. 使用 StyleCache 管理样式
 * 3. 使用 BaseLayer 的事件管理
 * 4. 完善 dispose 清理逻辑
 */
export default {
  name: "v-super-cluster",
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
    features: {
      type: Array,
      default() {
        return [];
      },
    },
    FeatureStyle: {
      type: [Array, undefined],
      default: undefined,
    },
    /**
     * Supercluster options:
     * - minZoom: 0 - Minimum zoom level at which clusters are generated
     * - maxZoom: 16 - Maximum zoom level at which clusters are generated
     * - minPoints: 2 - Minimum number of points to form a cluster
     * - radius: 40 - Cluster radius, in pixels
     * - extent: 512 - (Tiles) Tile extent
     * - nodeSize: 64 - Size of the KD-tree leaf node
     */
    cluster: {
      type: Object,
      default: undefined,
    },
    overlay: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      clusters: null,
      total: 0,
      // 使用 StyleCache 替代普通对象
      styleCache: null,
      // 防抖函数
      debouncedUpdateCluster: null,
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
    cluster: {
      handler(value) {
        if (value) {
          this.clusters = new Supercluster(this.cluster);
          this.clusters.load(this.getGeoFeatures());
          this.total = this.clusters.points.length;
          this.updateClusterFeatures();
        }
      },
      immediate: false,
      deep: true,
    },
    features: {
      handler() {
        this.dispose();
        this.init();
      },
      immediate: false,
      deep: true,
    },
  },
  created() {
    // 初始化样式缓存
    this.styleCache = new StyleCache(500);

    // 创建防抖函数 (100ms)
    this.debouncedUpdateCluster = debounce(100, () => {
      this.updateClusterFeatures();
    });
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    getGeoFeatures() {
      return this.features.map((feature) => {
        const coordinates = convertCoordinate(feature.coordinates, feature.convert);
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates,
          },
          properties: feature,
        };
      });
    },

    /**
     * 样式函数 - 使用 StyleCache
     */
    styleFunction(styleCache, feature) {
      const cluster = feature.get("cluster") || 0;
      const size = feature.get("point_count_abbreviated") || 0;
      const total = this.cluster?.source?.value?.getSource()?.getFeatures().length || 0;
      let styles = styleCache[size];
      if (cluster) {
        if (!styles) {
          let styleOptions = {};
          styleOptions = {
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: "blue",
              }),
            }),
            text: new Text({
              font: "16px sans-serif",
              text: size.toString(),
            }),
          };
          // const { style } = this.cluster
          if (validObjKey(this.cluster, "style")) {
            if (this.cluster.style instanceof Array) {
              this.cluster.style.forEach((e) => {
                let min = 0;
                let max = total;
                if (validObjKey(e, "min") || validObjKey(e, "max")) {
                  min = e.min;
                  max = e.max;
                  if (min < size && size <= max) {
                    styleOptions = this.clusterFeatureStyle(e, size.toString());
                  }
                } else {
                  if (total > 0) {
                    const average = total / styleOptions.style.length;
                    for (let i = 0; i < styleOptions.style.length; i++) {
                      min = i * average;
                      max = average * (i + 1);
                      if (min < size && size <= max) {
                        styleOptions = this.clusterFeatureStyle(styleOptions.style[i], size.toString());
                      }
                    }
                  }
                }
              });
              styles = setStyle(styleOptions);
            } else {
              styleOptions = this.clusterFeatureStyle(styleOptions, size.toString());
              styles = setStyle(styleOptions);
            }
          } else {
            styles = new Style(styleOptions);
          }
          styleCache[size] = styles;
        }
      } else {
        const style = feature.get("style");
        styles = setStyle(style);
      }
      // console.log(styles)
      return styles;
    },
    clusterFeatureStyle(style, text) {
      const textStyle = { ...style.text, text };
      return { ...style, text: textStyle };
    },
    init() {
      this.clusters = new Supercluster(this.cluster);
      this.clusters.load(this.getGeoFeatures());
      this.total = this.clusters.points.length;

      const extent = this.map.getView().calculateExtent(this.map.getSize());
      const cluster = this.clusters.getClusters(extent, this.map.getView().getZoom());
      const features = {
        type: "FeatureCollection",
        features: cluster,
      };
      const styleCache = {};
      this.layer = new VectorLayer({
        ...this.$props,
        source: new VectorSource({
          features: new GeoJSON().readFeatures(features).map((feature) => {
            const properties = feature.get("properties");
            if (properties && typeof properties === "object") {
              for (const i in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, i)) {
                  feature.set(i, properties[i]);
                }
              }
            }
            return feature;
          }),
        }),
        style: (feature) => this.styleFunction(styleCache, feature),
      });

      this.layer.set("cluster", true);
      const layerId = this.layerId || `cluster-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "vector");
      this.layer.set("users", true);

      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }

      addLayerToParentComp({
        type: this.$parent.$options.name,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });

      // 优化: 使用 moveend 替代 precompose,并添加防抖
      const moveendListener = this.map.on("moveend", () => {
        this.debouncedUpdateCluster();
        this.$emit("moveend");
      });
      this.addListener(moveendListener, "moveend");

      // movestart 事件
      const movestartListener = this.map.on("movestart", () => {
        this.$emit("movestart");
      });
      this.addListener(movestartListener, "movestart");

      // 绑定其他事件
      const eventList = ["singleclick", "pointermove"];
      eventList.forEach((listenerKey) => {
        const listener = this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt));
        this.addListener(listener, `event-${listenerKey}`);
      });
    },

    /**
     * 更新聚合要素
     */
    updateClusterFeatures() {
      const extent = this.map.getView().calculateExtent(this.map.getSize());
      const cluster = this.clusters.getClusters(extent, this.map.getView().getZoom());
      const features = {
        type: "FeatureCollection",
        features: cluster,
      };

      const source = this.layer.getSource();
      if (source) {
        source.clear();
        source.addFeatures(
          new GeoJSON().readFeatures(features).map((feature) => {
            const properties = feature.get("properties");
            if (properties && typeof properties === "object") {
              for (const i in properties) {
                if (Object.prototype.hasOwnProperty.call(properties, i)) {
                  feature.set(i, properties[i]);
                }
              }
            }
            return feature;
          })
        );
      }

      this.$emit("precompose");
    },

    getFeatureAtPixel(pixel) {
      return this.map.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          if (layer?.get("id") === this.layer?.get("id")) return feature;
        },
        {}
      );
    },

    eventHandler(listenerKey, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);
      this.$emit(listenerKey, evt, feature);
    },

    getLeaves(id, limit) {
      return this.clusters.getLeaves(id, limit);
    },

    /**
     * 优化后的 dispose 方法
     */
    dispose() {
      // 清理样式缓存
      if (this.styleCache) {
        this.styleCache.clear();
      }

      // 清理聚合对象
      if (this.clusters) {
        this.clusters = null;
      }

      // 清理防抖函数
      this.debouncedUpdateCluster = null;

      // 清理图层
      if (this.layer) {
        const source = this.layer.getSource();
        if (source) {
          source.clear();
        }
        if (this.map) {
          this.map.removeLayer(this.layer);
        }
      }

      // 调用基类清理 (清理事件监听器)
      this.baseDispose();
    },
  },
};
</script>

<style scoped></style>
