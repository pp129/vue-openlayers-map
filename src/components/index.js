import "@/polyfills";
import VMap from "@/components/map/index";
import VOverview from "@/components/overviewMap/index";
import VOverlay from "@/components/overlay/index";
import VGroupLayer from "@/components/layers/group/index";
import VTile from "@/components/layers/tile/index";
import VVector from "@/components/layers/vector/index";
import VWebglVector from "@/components/layers/webGlVector/index";
import VVectorTile from "@/components/layers/vectorTile/index";
import VImage from "@/components/layers/image/index";
import VRoute from "@/components/layers/route/index";
import VHeatmap from "@/components/layers/heatmap/index";
import VGraphic from "@/components/layers/graphic/index";
import VDraw from "@/components/layers/draw/index";
import VMeasure from "@/components/layers/measure/index";
import VEcharts from "@/components/layers/echarts/index";
import VTrack from "@/components/track/index";
import VPath from "@/components/path/index";
import VSuperCluster from "@/components/layers/cluster/index";
import VTraffic from "@/components/layers/traffic/index";
import VGDRoute from "@/components/layers/gd-route/index";
import VWfs from "@/components/layers/wfs/index";
import * as utils from "@/utils";

const components = [
  VMap,
  VOverview,
  VOverlay,
  VGroupLayer,
  VTile,
  VVector,
  VWebglVector,
  VVectorTile,
  VImage,
  VRoute,
  VHeatmap,
  VGraphic,
  VDraw,
  VMeasure,
  VTrack,
  VPath,
  VEcharts,
  VSuperCluster,
  VTraffic,
  VGDRoute,
  VWfs,
];

const install = function (Vue) {
  if (install.installed) return;
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};

//  全局引用可自动安装
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...components,
};

export {
  VMap,
  VOverview,
  VOverlay,
  VGroupLayer,
  VTile,
  VVector,
  VWebglVector,
  VVectorTile,
  VImage,
  VRoute,
  VHeatmap,
  VGraphic,
  VDraw,
  VMeasure,
  VTrack,
  VEcharts,
  VSuperCluster,
  VTraffic,
  VGDRoute,
  VPath,
  VWfs,
  utils,
};
