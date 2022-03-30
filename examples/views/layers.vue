<template>
<div class="layers">
  <div class="tools">
    <button class="btn" @click="addLayer">更新features</button>
  </div>
  <v-map ref="map"
         class="map"
         :view="option.view"
         :height="height"
         :width="width">
    <v-vector-layer :features="features" :feature-style="style"/>
  </v-map>
</div>
</template>

<script>
import { VMap, VVectorLayer } from '~/index'
import layersOption from '@/utils/layersOption'
import Mock from 'mockjs'
export default {
  name: 'layers',
  components: {
    VMap,
    VVectorLayer
  },
  data () {
    return {
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
