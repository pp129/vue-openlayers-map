<template>
<div class="home">
  <div class="tools">
    <select id="changeLayer" class="btn" v-model="selectedTile" @change="changeTile">
      <option v-for="(item,index) in tileOptions" :key="index" :value="item.value">{{item.name}}</option>
    </select>
  </div>
  <v-map ref="map" :view="view">
<!--    <v-tile-layer v-if="selectedTile === '1'" :tile-type="tileType" :xyz="vec_w"></v-tile-layer>-->
<!--    <v-tile-layer v-if="selectedTile === '1'" :tile-type="tileType" :xyz="cva_w"></v-tile-layer>-->
    <v-tile-layer v-if="selectedTile === '1'" tile-type="TD" :td-cva="cva_w.url" :td-vec="vec_w.url"></v-tile-layer>
    <v-tile-layer v-if="selectedTile === '2'" tile-type="TD_IMG"></v-tile-layer>
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
      tileType: process.env.NODE_ENV === 'production' ? 'PGIS_TILE' : 'XYZ',
      xyz: {
        urls: [
          'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
          'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
        ]
      },
      vec_w: {
        url: 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      },
      cva_w: {
        url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      },
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
      const layers = this.$refs.map.map.getLayers().getArray().filter(x => x.get('base'))
      console.log(layers)
    }
  }
}
</script>

<style lang="scss">
@import "examples/style/common";
</style>
