<template>
<div class="overlay">
  222
  <span @click="close">close</span>
</div>
</template>

<script>
export default {
  name: 'MapOverlay',
  methods: {
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.overlay{
  width: 100px;
  height: 100px;
  background: white;
}
</style>
