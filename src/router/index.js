import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export const constantRouterMap = [
  {
    path: "/",
    name: "Index",
    component: () => import(/* webpackChunkName: "Index" */ "../examples/Home/index.vue"),
  },
  {
    path: "/Home",
    name: "Home",
    component: () => import(/* webpackChunkName: "Home" */ "../examples/Home/index.vue"),
  },
  {
    path: "/AMap",
    name: "AMap",
    component: () => import(/* webpackChunkName: "AMap" */ "../examples/AMap/index.vue"),
  },
  {
    path: "/Heatmap",
    name: "Heatmap",
    component: () => import(/* webpackChunkName: "Heatmap" */ "../examples/Heatmap/index.vue"),
  },
  {
    path: "/FeatureClick",
    name: "FeatureClick",
    component: () => import(/* webpackChunkName: "FeatureClick" */ "../examples/FeatureClick/index-optimized.vue"),
  },
  {
    path: "/Points",
    name: "Points",
    component: () => import(/* webpackChunkName: "Points" */ "../examples/Points/index.vue"),
  },
  {
    path: "/ModifyLine",
    name: "ModifyLine",
    component: () => import(/* webpackChunkName: "ModifyLine" */ "../examples/ModifyLine/index.vue"),
  },
  {
    path: "/Mobile",
    name: "Mobile",
    component: () => import(/* webpackChunkName: "Polyline" */ "../examples/Mobile/index.vue"),
  },
  {
    path: "/MultiMap",
    name: "MultiMap",
    component: () => import(/* webpackChunkName: "MultiMap" */ "../examples/MultiMap/index.vue"),
  },
  {
    path: "/GroupLayer",
    name: "GroupLayer",
    component: () => import(/* webpackChunkName: "MultiMap" */ "../examples/Group/index.vue"),
  },
  {
    path: "/WMS",
    name: "WMS",
    component: () => import(/* webpackChunkName: "WMS" */ "../examples/WMS/index.vue"),
  },
  {
    path: "/TrafficImageWMS",
    name: "TrafficImageWMS",
    component: () => import(/* webpackChunkName: "TrafficImageWMS" */ "../examples/TrafficImageWMS/index.vue"),
  },
  {
    path: "/OptimizedMap",
    name: "OptimizedMap",
    component: () => import(/* webpackChunkName: "OptimizedMap" */ "../examples/OptimizedMap/index.vue"),
  },
  {
    path: "/BasicMapExample",
    name: "BasicMapExample",
    component: () => import(/* webpackChunkName: "BasicMapExample" */ "../examples/BasicMapExample/index.vue"),
  },
  {
    path: "/ClusterExample",
    name: "ClusterExample",
    component: () => import(/* webpackChunkName: "ClusterExample" */ "../examples/ClusterExample/index.vue"),
  },
  {
    path: "/DrawExample",
    name: "DrawExample",
    component: () => import(/* webpackChunkName: "DrawExample" */ "../examples/DrawExample/index.vue"),
  },
  {
    path: "/GroupExample",
    name: "GroupExample",
    component: () => import(/* webpackChunkName: "GroupExample" */ "../examples/GroupExample/index.vue"),
  },
  {
    path: "/MeasureExample",
    name: "MeasureExample",
    component: () => import(/* webpackChunkName: "MeasureExample" */ "../examples/MeasureExample/index.vue"),
  },
  {
    path: "/OverviewMapExample",
    name: "OverviewMapExample",
    component: () => import(/* webpackChunkName: "OverviewMapExample" */ "../examples/OverviewMapExample/index.vue"),
  },
  {
    path: "/ImageLayerExample",
    name: "ImageLayerExample",
    component: () => import(/* webpackChunkName: "ImageLayerExample" */ "../examples/ImageLayerExample/index.vue"),
  },
  {
    path: "/GraphicExample",
    name: "GraphicExample",
    component: () => import(/* webpackChunkName: "GraphicExample" */ "../examples/GraphicExample/index.vue"),
  },
  {
    path: "/EchartsExample",
    name: "EchartsExample",
    component: () => import(/* webpackChunkName: "EchartsExample" */ "../examples/EchartsExample/index.vue"),
  },
  {
    path: "/PathExample",
    name: "PathExample",
    component: () => import(/* webpackChunkName: "PathExample" */ "../examples/PathExample/index.vue"),
  },
  {
    path: "/GeoJsonExample",
    name: "GeoJsonExample",
    component: () => import(/* webpackChunkName: "GeoJsonExample" */ "../examples/GeoJsonExample/index.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: "",
  routes: constantRouterMap,
});

export default router;
