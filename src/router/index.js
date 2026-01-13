import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export const constantRouterMap = [
  {
    path: "/",
    name: "Home",
    // redirect: '/home',
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
    component: () => import(/* webpackChunkName: "FeatureClick" */ "../examples/FeatureClick/index.vue"),
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
    path: "/TrafficRoute",
    name: "TrafficRoute",
    component: () => import(/* webpackChunkName: "TrafficRoute" */ "../examples/TrafficRoute/index.vue"),
  },
  {
    path: "/RouteInArea",
    name: "RouteInArea",
    component: () => import(/* webpackChunkName: "RouteInArea" */ "../examples/RouteInArea/index.vue"),
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
    path: "/TrafficWMS",
    name: "TrafficWMS",
    component: () => import(/* webpackChunkName: "WMS" */ "../examples/TrafficWMS/index.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: "",
  routes: constantRouterMap,
});

export default router;
