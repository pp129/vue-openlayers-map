<template>
<div class="layers">
  <div class="tools">
    <button class="btn" @click="addLayer">更新features</button>
    <button @click="changeTile">更新</button>
    <input type="checkbox" v-model="showTile">
  </div>
  <v-map ref="map"
         class="map"
         :default-tile="'BD'"
         :view="option.view"
         :height="height"
         :width="width">
    <v-vector-layer :features="features" :feature-style="style"/>
    <v-tile-layer v-if="showTile" :tile-type="tileType"></v-tile-layer>
    <v-tile-layer v-if="showWMS" :tile-type="tile.type" :wms="tile.wms" :base="false"></v-tile-layer>
  </v-map>
</div>
</template>

<script>
import { VMap, VVectorLayer, VTileLayer } from '~/index'
import layersOption from '@/utils/layersOption'
import Mock from 'mockjs'
export default {
  name: 'layers',
  components: {
    VMap,
    VVectorLayer,
    VTileLayer
  },
  data () {
    return {
      tileType: 'GD',
      showTile: true,
      showWMS: false,
      height: '100%',
      width: '100%',
      option: layersOption,
      features: [
        {
          coordinates: [118.045456, 24.567489]
        }
      ],
      style: {
        icon: {
          src: require('@/assets/img/point_1.png'),
          scale: 0.6
        }
      },
      tile: {
        type: 'WMS',
        wms: {
          url: 'http://218.5.80.6:6600/geoserver/softThree/wms',
          params: {
            LAYERS: 'softThree:softThreeGaode',
            TILED: true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }
      }
    }
  },
  methods: {
    setMockData (count = 10) {
      const Random = Mock.Random
      const option = {}
      option[`array|${count}`] = [
        () => [Random.float(117, 118, 6, 6), Random.float(24, 24, 6, 6)]
      ]
      return Mock.mock(option)
    },
    getFeatures () {
      const features = []
      const mockData = this.setMockData()
      const randomNum = Mock.mock({
        'number|1-6': 3
      })
      mockData.array.forEach(val => {
        features.push({
          coordinates: val,
          style: {
            icon: {
              src: require(`@/assets/img/point_${randomNum.number}.png`),
              scale: 0.6
            }
          }
        })
      })
      return features
    },
    addLayer () {
      this.features = this.getFeatures()
    },
    changeTile () {
      this.tileType = 'BD'
    }
  },
  mounted () {
  }
}
</script>

<style lang="scss">
.layers{
  width: 100%;
  height: 100%;
  .tools{
    z-index: 2;
    position: absolute;
    top: 10px;
    right: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: center;
    button,select{
      cursor: pointer;
    }
    .btn{
      display: flex;
      align-items: center;
      margin-left: 20px;
      margin-bottom: 10px;
      background: white;
      padding: 10px;
      font-size: 12px;
      &-input{
        width: 85px;
        margin-right: 10px;
      }
    }
    .checkbox-group{
      padding: 5px;
      .checkbox-item{
        margin-right: 10px;
        input{
          cursor: pointer;
        }
      }
    }
  }
  .map{
    z-index: 1;
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
