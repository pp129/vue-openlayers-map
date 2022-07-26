import VDraw from './src/VDraw.vue'

VDraw.install = function (Vue) {
  Vue.component(VDraw.name, VDraw)
}

export default VDraw
