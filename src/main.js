import Vue from 'vue'
import App from './App.vue'
import olMap from '@/components/index'

Vue.config.productionTip = false

Vue.use(olMap)

new Vue({
  render: h => h(App)
}).$mount('#app')
