<template>
  <div :id="element" :class="className">
    <slot :data="data"></slot>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { Overlay } from 'ol'

export default {
  name: 'v-overlay',
  inject: ['VMap'],
  props: {
    overlayId: {
      type: String,
      default () {
        return `overlay-id-${nanoid()}`
      }
    },
    element: {
      type: String,
      default () {
        return `overlay-el-${nanoid()}`
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
    },
    data: {
      type: Array
    },
    close: {
      type: Function
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
    for (const i in overlayOption) {
      if (Object.prototype.hasOwnProperty.call(overlayOption, i)) {
        this.overlay.set(i, overlayOption[i])
      }
    }
    this.map.addOverlay(this.overlay)
    this.$emit('load', this.overlay, this.map)
  },
  beforeDestroy () {
    this.map.removeOverlay(this.overlay)
  }
}
</script>

<style scoped>

</style>
