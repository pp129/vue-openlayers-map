<template>
<div class="simple">
  <v-map class="map" :height="height" :width="width" :target="option.target" :view="option.view" :base-tile="option.baseTile" :layers="option.layers" @click="onClick"></v-map>
</div>
</template>

<script>
import { VMap } from '~/index'
export default {
  name: 'simple',
  components: {
    VMap
  },
  data () {
    return {
      height: '100%',
      width: '100%',
      option: {
        target: 'map2',
        baseTile: [
          {
            type: 'xyz',
            name: 'gd',
            option: [
              {
                url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7'
              }
            ]
          }
        ],
        // visibleTile: 'gd',
        view: {
          center: [118.045456, 24.567489],
          zoom: 10
        },
        layers: [
          {
            id: 'layer1',
            source: {
              features: [
                {
                  id: 'point1',
                  coordinates: [118.140448, 24.512917],
                  style: {
                    icon: {
                      scale: 0.5,
                      src: require('@/assets/img/point_red.png')
                    }
                  },
                  // 需要附加在元素上的属性，一般用于点击获取点位信息，使用feature.get('properties')读取
                  properties: {
                    name: 'feature1'
                  }
                }
              ]
            }
          }
        ]
      }
    }
  },
  methods: {
    onClick (evt, map) {
      console.log('on map click === get coordinate', evt.coordinate)
    }
  }
}
</script>

<style scoped lang="scss">
.simple{
  width: 100%;
  height: 100%;
  position: relative;
}
.map{
  z-index: 1;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
