<template>
  <div class="page">
    <div class="tool">
      <div class="item">
        <label>点标记</label>
        <button @click="addFeatures2">添加若干个点</button>
        <button @click="removeFeatures">清除点</button>
      </div>
    </div>
    <v-map ref="map" class="map" :view="view">
      <v-tile type="BD" :z-index="0"></v-tile>
      <!-- :feature-style="style" -->
      <v-vector :features="features" :z-index="2"></v-vector>
    </v-map>
  </div>
</template>

<script>
import Gyeonghwon from 'Gyeonghwon'
import iconWebp from '@/assets/img/purple-animated.png'
export default {
  name: 'points-page',
  data () {
    return {
      view: {
        city: '厦门',
        zoom: 12
      },
      features: []
      // style: {
      //   zIndex: 1,
      //   icon: {
      //     scale: 0.6,
      //     // src: require('@/assets/img/point_5.png')
      //     src: new URL('../../assets/img/point_4.png', import.meta.url).href
      //   }
      // }
    }
  },
  methods: {
    addFeatures () {
      // this.removeFeatures()
      for (let i = 0; i < 5; i++) {
        this.features.push({
          coordinates: [117.6 + Math.random(), 24.1 + Math.random()]
        })
      }
    },
    addFeatures2 () {
      // this.removeFeatures()
      for (let i = 0; i < 5; i++) {
        this.features.push({
          animate: true,
          coordinates: [117.6 + Math.random(), 24.1 + Math.random()],
          style: {
            icon: {
              animate: true,
              scale: 1.5,
              src: new URL('../../assets/img/purple-animated.png', import.meta.url).href
            }
          }
        })
      }
    },
    async addFeatures3 () {
      // 直接进行引用创建
      const gh = new Gyeonghwon({
        ignoreSingle: false,
        forceLoop: false,
        waitingMilliSec: 10000
      })
      const anim = await gh.animateNewContext(iconWebp)
      this.style.icon = {
        anchor: [0.5, 1],
        anchorXUnits: 'fraction', // IconAnchorUnits.FRACTION,
        anchorYUnits: 'fraction', // IconAnchorUnits.FRACTION,
        img: anim.latestContext().canvas,
        imgSize: [anim.width, anim.height]
      }
      for (let i = 0; i < 5; i++) {
        this.features.push({
          coordinates: [117.6 + Math.random(), 24.1 + Math.random()]
        })
      }
      gh.addEventListener('need_render', (e) => {
        // console.log('render opera', e)
        this.$refs.map.map.render()
        return false
      })
    },
    removeFeatures () {
      this.features = []
    }
  }
}
</script>

<style scoped>
.map {
  position: absolute;
  left: 0;
  top: 0;
}
.tool{
  width: 10%;
  z-index: 2;
  position: absolute;
  right: 10px;
  top: 5%;
  display: flex;
  justify-content: flex-start;
  align-items: start;
  padding-left: 10px;
  flex-direction: column;
//background: #ffffff;
}
.item{
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  border: 1px solid #666;
  border-radius: 6px;
  padding: 10px;
  background: rgba(0,0,0,0.2);
}
.label {
  width: 100%;
}
</style>
