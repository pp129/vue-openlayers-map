import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home.vue'
import Simple from '../views/simple.vue'
import Layers from '../views/layers.vue'
import CanvasMap from '../views/canvasMap.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/simple',
    name: 'simple',
    component: Simple
  },
  {
    path: '/layers',
    name: 'layers',
    component: Layers
  },
  {
    path: '/canvasMap',
    name: 'canvasMap',
    component: CanvasMap
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
