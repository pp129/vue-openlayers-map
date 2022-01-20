import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home.vue'
import Simple from '../views/simple.vue'

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
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Simple
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router