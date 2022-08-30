import VEcharts from '@/components/layers/echarts/index.vue'

VEcharts.install = Vue => { Vue.component(VEcharts.name, VEcharts) }

export default VEcharts
