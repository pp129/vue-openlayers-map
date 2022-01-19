<template>
<div class="simple">
  <v-map class="map" :height="height" :width="width" :option="option"></v-map>
</div>
</template>

<script>
import { VMap } from '~/index'
import mapOption from '@/utils/tempOption.js'
export default {
  name: 'simple',
  components: {
    VMap
  },
  data () {
    return {
      height: '100%',
      width: '100%',
      option: mapOption
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
