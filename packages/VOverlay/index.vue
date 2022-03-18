<template>
  <div :id="element">
    <slot :position="position"></slot>
  </div>
</template>

<script>
import { uuid } from '~/utils'
import Overlay from 'ol/Overlay'

export default {
  name: 'v-overlay',
  inject: ['VMap'],
  props: {
    id: {
      type: String,
      default () {
        return `overlay-id-${uuid()}`
      }
    },
    element: {
      type: String,
      default () {
        return `overlay-el-${uuid()}`
      }
    },
    position: {
      type: [Array, undefined],
      default () {
        return undefined
      }
    },
    offset: {
      type: Array,
      default () {
        return [0, 0]
      }
    },
    autoPan: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      overlay: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    position: {
      handler (value) {
        console.log('overlay change', value)
        this.overlay.setPosition(value)
      },
      immediate: false
    }
  },
  mounted () {
    // const ele =
    let overlayEl
    if (typeof this.element === 'string') {
      overlayEl = document.getElementById(this.element.toString())
    }
    const overlayOption = {
      id: this.id,
      element: overlayEl,
      position: this.position,
      offset: this.offset
    }
    this.overlay = new Overlay(overlayOption)
    this.map.addOverlay(this.overlay)
  },
  beforeDestroy () {
    this.map.removeOverlay(this.overlay)
  }
}
</script>

<style scoped>

</style>
