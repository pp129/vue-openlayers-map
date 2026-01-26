/**
 * Vue OpenLayers 优化包 - 统一导出
 *
 * 使用方式:
 * import { VMap, VVector, EventManager, LayerManager } from '@/packages';
 */

// ========== 组件导出 ==========
import VMap from "./components/map/index.vue";
import BaseLayer from "./components/layers/BaseLayer.vue";
import VVector from "./components/layers/vector/index.vue";
import VSuperCluster from "./components/layers/cluster/index.vue";
import VDraw from "./components/layers/draw/index.vue";
import VHeatmap from "./components/layers/heatmap/index.vue";
import VTile from "./components/layers/tile/index.vue";
import VOverlay from "./components/overlay/index.vue";
import VGroupLayer from "./components/layers/group/index.vue";
import VMeasure from "./components/layers/measure/index.vue";
import VVectorTile from "./components/layers/vectorTile/index.vue";
import VWebGLVector from "./components/layers/webGlVector/index.vue";
import VImage from "./components/layers/image/index.vue";
import VGraphic from "./components/layers/graphic/index.vue";
import VWfs from "./components/layers/wfs/index.vue";
import VEcharts from "./components/layers/echarts/index.vue";
import VRoute from "./components/layers/route/index.vue";
import VPath from "./components/path/index.vue";
// 导入工具函数
import * as utils from "@/utils";

// ========== 工具类导出 ==========
import LayerManager from "./utils/layerManager";
import EventManager from "./utils/eventManager";
import StyleCache from "./utils/styleCache";
import {
  throttle,
  debounce,
  rafThrottle,
  createBatchProcessor,
  runWhenIdle,
  cancelIdleCallback,
  shallowArrayEqual,
  shallowObjectEqual,
  createPerformanceMonitor,
} from "./utils/performance";

// ========== 辅助工具导出 ==========
import {
  FeatureExt,
  validObjKey,
  isFunction,
  convertCoordinate,
  setStyle,
  setText,
  setFeature,
  setFeatures,
  setPointFeature,
  setPolyline,
  setPolygon,
  setCircle,
  flyTo,
  panTo,
} from "./utils/helpers";

// ========== 组件 ==========
export {
  VMap,
  BaseLayer,
  VVector,
  VSuperCluster,
  VDraw,
  VHeatmap,
  VTile,
  VOverlay,
  VGroupLayer,
  VMeasure,
  VVectorTile,
  VWebGLVector,
  VImage,
  VGraphic,
  VWfs,
  VEcharts,
  VRoute,
  VPath,
  utils,
};

// ========== 工具类 ==========
export { LayerManager, EventManager, StyleCache };

// ========== 辅助工具 ==========
export {
  FeatureExt,
  validObjKey,
  isFunction,
  convertCoordinate,
  setStyle,
  setText,
  setFeature,
  setFeatures,
  setPointFeature,
  setPolyline,
  setPolygon,
  setCircle,
  flyTo,
  panTo,
};

// ========== 性能工具 ==========
export {
  throttle,
  debounce,
  rafThrottle,
  createBatchProcessor,
  runWhenIdle,
  cancelIdleCallback,
  shallowArrayEqual,
  shallowObjectEqual,
  createPerformanceMonitor,
};

// ========== 安装函数 (Vue 插件) ==========
export function install(Vue, options = {}) {
  // 注册全局组件
  Vue.component("VMap", VMap);
  Vue.component("BaseLayer", BaseLayer);
  Vue.component("VVector", VVector);
  Vue.component("VSuperCluster", VSuperCluster);
  Vue.component("VDraw", VDraw);
  Vue.component("VHeatmap", VHeatmap);
  Vue.component("VTile", VTile);
  Vue.component("VOverlay", VOverlay);
  Vue.component("VGroupLayer", VGroupLayer);
  Vue.component("VMeasure", VMeasure);
  Vue.component("VVectorTile", VVectorTile);
  Vue.component("VWebGLVector", VWebGLVector);
  Vue.component("VImage", VImage);
  Vue.component("VGraphic", VGraphic);
  Vue.component("VWfs", VWfs);
  Vue.component("VEcharts", VEcharts);
  Vue.component("VRoute", VRoute);
  Vue.component("VPath", VPath);

  // 挂载到 Vue 原型 (可选)
  if (options.attachToPrototype) {
    Vue.prototype.$olUtils = {
      LayerManager,
      EventManager,
      StyleCache,
      throttle,
      debounce,
    };
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Vue OpenLayers] Plugin installed successfully");
  }
}

// ========== 默认导出 ==========
export default {
  install,

  // 组件
  VMap,
  BaseLayer,
  VVector,
  VSuperCluster,
  VDraw,
  VHeatmap,
  VTile,
  VOverlay,
  VGroupLayer,
  VMeasure,
  VVectorTile,
  VWebGLVector,
  VImage,
  VGraphic,
  VWfs,
  VEcharts,
  VRoute,
  VPath,
  utils,

  // 工具类
  LayerManager,
  EventManager,
  StyleCache,

  // 辅助工具
  FeatureExt,
  validObjKey,
  setFeature,
  setFeatures,
  setStyle,
  flyTo,
  panTo,

  // 性能工具
  throttle,
  debounce,
  rafThrottle,
  createBatchProcessor,
  runWhenIdle,
  cancelIdleCallback,
  shallowArrayEqual,
  shallowObjectEqual,
  createPerformanceMonitor,
};

// 自动安装 (CDN 引入时)
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}
