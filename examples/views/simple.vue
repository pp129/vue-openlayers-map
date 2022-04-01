<template>
<div class="simple">
  <v-map class="map" :height="height" :width="width" :target="option.target" :view="option.view"></v-map>
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
        target: 'map',
        view: {
          center: [118.045456, 24.567489],
          zoom: 12
        }
      }
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
