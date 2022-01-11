import Vue from 'vue'
import VMap from '~/VMap/src/index.vue'

Vue.component(VMap.name, VMap)
// import VMap from '~/VMap/index.js'
const components = [VMap]
const install = function (Vue) {
  if (install.installed) return
  components.map(component => {
    Vue.use(component)
  })
}
//  全局引用可自动安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}
export default {
  install,
  VMap
}
export {
  VMap
}
