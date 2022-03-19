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
    overlayId: {
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
    positioning: {
      type: String
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
    },
    className: {
      type: String
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
    },
    positioning: {
      handler (value) {
        this.overlay.setPositioning(value)
      },
      immediate: false
    },
    offset: {
      handler (value) {
        this.overlay.setOffset(value)
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
    const overlayOption = { ...this.$props, ...{ id: this.overlayId, element: overlayEl } }
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
