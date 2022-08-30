import './polyfills'
import Vue from 'vue'
import App from './App.vue'
import olMap from '@/components/index'

// window.CESIUM_BASE_URL 必须在导入 CesiumJS 之前设置全局变量。
window.CESIUM_BASE_URL = 'node_modules/cesium/Build/Cesium'

import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
// import {defaultServer} from "cesium";

export const OLCS_ION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZWVhYmU0Mi1jNTZkLTQ3OGItYmUxYS00YTMyMDQyZTMwNDkiLCJpZCI6NjQ1LCJpYXQiOjE2MDYxMjE2OTF9.zQibbf5P0-moQ8KiV_K7KMtyLHbR-VlPghj8lyqWduU'

Cesium.Ion.defaultAccessToken = OLCS_ION_TOKEN
Cesium.Ion.defaultServer = ''

window.Cesium = Cesium

Vue.config.productionTip = false

Vue.use(olMap)

new Vue({
  render: h => h(App)
}).$mount('#app')
