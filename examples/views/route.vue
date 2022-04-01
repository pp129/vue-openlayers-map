<template>
<div class="home" :style="cursorStyle">
  <ul class="list">
    <li v-for="(item,index) in routeOpt.stops" :key="index">{{item}} <button @click="removePoint(index)">-</button><button @click="addPoint(index)">+</button><button @click="resetPoint(index)">r</button></li>
  </ul>
  <v-map :view="view" @click="insertPoint">
    <v-route-layer :route-type="routeOpt.type" :service-url="routeOpt.serviceUrl" :stops="routeOpt.stops" :show-end="true" :show-start="true" :show-pass="true"/>
  </v-map>
</div>
</template>

<script>
import { VMap, VRouteLayer } from '~/index'

export default {
  name: 'route',
  components: {
    VMap,
    VRouteLayer
  },
  data () {
    return {
      view: {
        center: [118.118033, 24.478697],
        zoom: 12
      },
      routeOpt: {
        type: 'graphhopper',
        serviceUrl: 'http://172.16.28.74:9999/route',
        stops: [
          [118.106298, 24.506290],
          [118.132400, 24.509894],
          [118.182088, 24.487228]
        ]
      },
      insertIndex: null,
      resetIndex: null,
      cursorPointer: false
    }
  },
  computed: {
    cursorStyle () {
      return {
        cursor: this.cursorPointer ? 'pointer' : ''
      }
    }
  },
  methods: {
    removePoint (index) {
      if (this.routeOpt.stops.length > 2) {
        this.routeOpt.stops.splice(index, 1)
      }
    },
    addPoint (index) {
      this.cursorPointer = true
      this.insertIndex = index + 1
    },
    resetPoint (index) {
      this.cursorPointer = true
      this.resetIndex = index
    },
    insertPoint (evt) {
      console.log('on map click === get coordinate', evt.coordinate)
      if (this.insertIndex || this.insertIndex === 0) {
        this.routeOpt.stops.splice(this.insertIndex, 0, evt.coordinate)
      }
      if (this.resetIndex || this.resetIndex === 0) {
        this.routeOpt.stops.splice(this.resetIndex, 1, evt.coordinate)
      }
      this.insertIndex = null
      this.resetIndex = null
      this.cursorPointer = false
    }
  }
}
</script>

<style scoped>

</style>
