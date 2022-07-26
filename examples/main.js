import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VMap from '~/index.js'

Vue.config.productionTip = false

Vue.use(VMap)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
