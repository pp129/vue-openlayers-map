import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home.vue'
import Simple from '../views/simple.vue'
import Layers from '../views/layers.vue'
import Track from '../views/track.vue'
import Tile from '@/views/tile'

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
    path: '/tile',
    name: 'tile',
    component: Tile
  },
  {
    path: '/trackMap',
    name: 'trackMap',
    component: Track
  },
  {
    path: '/routeMap',
    name: 'routeMap',
    component: () => import('@/views/route.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
