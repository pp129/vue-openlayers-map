import Vue from 'vue'
import App from './App.vue'
// import VMap from '~/index.js'

Vue.config.productionTip = false

// Vue.use(VMap)

new Vue({
  render: h => h(App)
}).$mount('#app')
