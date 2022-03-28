<template>
<div class="home">
  <div class="tools">
    <select id="changeLayer" class="btn" v-model="selectedTile" @change="changeTile">
      <option v-for="(item,index) in tileOptions" :key="index" :value="item.value">{{item.name}}</option>
    </select>
  </div>
  <v-map :view="view">
    <v-tile-layer :tile-type="tileType"></v-tile-layer>
  </v-map>
</div>
</template>

<script>
import { VMap, VTileLayer } from '~/index'

export default {
  name: 'tile',
  components: {
    VMap,
    VTileLayer
  },
  data () {
    return {
      view: {
        center: [118.045456, 24.567489],
        zoom: 10,
        maxZoom: 18
      },
      tileType: process.env.NODE_ENV === 'production' ? 'PGIS_TILE' : 'TD',
      selectedTile: '1',
      tileOptions: [
        {
          name: '矢量',
          value: '1'
        },
        {
          name: '影像',
          value: '2'
        }
      ]
    }
  },
  methods: {
    changeTile () {
      console.log(process.env.NODE_ENV)
      if (this.selectedTile === '1') {
        this.tileType = process.env.NODE_ENV === 'production' ? 'PGIS_TILE' : 'TD'
      } else {
        this.tileType = process.env.NODE_ENV === 'production' ? 'PGIS_HPYX' : 'TD_IMG'
      }
    }
  }
}
</script>

<style lang="scss">
@import "examples/style/common";
</style>
