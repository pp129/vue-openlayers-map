import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vueOlMap from '~/index.js'

Vue.config.productionTip = false

Vue.use(vueOlMap)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
