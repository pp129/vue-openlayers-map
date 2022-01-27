<template>
<div class="layers">
  <div class="tools">
    <button class="btn" @click="addLayer">新增layer</button>
  </div>
  <v-map ref="map"
         class="map"
         :option='option'
         :height="height"
         :width="width"></v-map>
</div>
</template>

<script>
import { VMap } from '~/index'
import layersOption from '@/utils/layersOption'
import Mock from 'mockjs'
export default {
  name: 'layers',
  components: {
    VMap
  },
  data () {
    return {
      height: '100%',
      width: '100%',
      option: layersOption
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
    getFeatures (index) {
      const features = []
      const mockData = this.setMockData()
      mockData.array.forEach(val => {
        features.push({
          coordinates: val,
          style: {
            icon: {
              src: require('@/assets/img/point_red.png')
            },
            text: {
              text: `layer-${index + 1}`,
              font: '13px sans-serif',
              fill: {
                color: '#3d73e8'
              },
              backgroundFill: {
                color: '#ffffff'
              },
              stroke: {
                color: '#ffffff',
                width: 1
              },
              backgroundStroke: {
                color: '#000000',
                width: 1
              },
              offsetX: 0,
              offsetY: 30
            }
          }
        })
      })
      return features
    },
    initLayers () {
      for (let i = 0; i < 20; i++) {
        this.option.layers.push({
          id: `layer${i + 1}`,
          source: {
            features: this.getFeatures(i)
          }
        })
      }
    },
    addLayer () {
      const index = this.option.layers.length
      this.option.layers.push({
        id: `layer${index}`,
        source: {
          features: this.getFeatures(index)
        }
      })
    }
  },
  mounted () {
    this.initLayers()
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
