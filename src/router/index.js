import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export const constantRouterMap = [
  {
    path: '/',
    name: 'Home',
    // redirect: '/home',
    component: () =>
      import(/* webpackChunkName: "Home" */ '../examples/Home/index.vue')
  },
  {
    path: '/AMap',
    name: 'AMap',
    component: () =>
      import(/* webpackChunkName: "AMap" */ '../examples/AMap/index.vue')
  },
  {
    path: '/Heatmap',
    name: 'Heatmap',
    component: () =>
      import(/* webpackChunkName: "Heatmap" */ '../examples/Heatmap/index.vue')
  },
  {
    path: '/FeatureClick',
    name: 'FeatureClick',
    component: () =>
      import(/* webpackChunkName: "FeatureClick" */ '../examples/FeatureClick/index.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: '',
  routes: constantRouterMap
})

export default router
