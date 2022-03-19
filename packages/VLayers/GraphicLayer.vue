<template>
<div><slot></slot></div>
</template>

<script>
import BaseLayer from '~/VLayers/BaseLayer'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import ImageLayer from 'ol/layer/Image'
import { toContext } from 'ol/render'
import { Point } from 'ol/geom'
import { FeatureExt } from '~/VMap/src/VMap'
import { setStyle, uuid, validObjKey } from '~/utils'

export default {
  name: 'v-graphic-layer',
  extends: BaseLayer,
  provide () {
    return {
      VGraphicLayer: this
    }
  },
  inject: ['VMap'],
  data () {
    return {
      source: null,
      layer: null
    }
  },
  props: {
    layerId: {
      type: String,
      default () {
        return `graphic-layer-${uuid()}`
      }
    },
    features: {
      type: Array,
      default () {
        return []
      }
    },
    FeatureStyle: {
      type: [Object, Boolean],
      default () {
        return false
      }
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    features: {
      handler (value) {
        console.log('layers change', value)
        this.source.refresh()
      },
      immediate: false
    },
    visible: {
      handler (value) {
        console.log('layer visible change', value)
        this.layer.setVisible(value)
      },
      immediate: false
    },
    zIndex: {
      handler (value) {
        this.layer.setZIndex(value)
      },
      immediate: false
    },
    maxZoom: {
      handler (value) {
        this.layer.setMaxZoom(value)
      },
      immediate: false
    },
    minZoom: {
      handler (value) {
        this.layer.setMinZoom(value)
      },
      immediate: false
    },
    extent: {
      handler (value) {
        this.layer.setExtent(value)
      },
      immediate: false
    }
  },
  mounted () {
    this.source = new ImageCanvasSource({
      canvasFunction: (extent, resolution, pixelRatio, size, projection) => {
        const geoms = []
        const canvas = document.createElement('canvas')
        const width = size[0] / pixelRatio
        const height = size[1] / pixelRatio
        const vectorContext = toContext(canvas.getContext('2d'), { size: [width, height] })
        let style
        if (this.FeatureStyle) {
          style = this.FeatureStyle
          vectorContext.setStyle(style)
        }
        // console.log(this.VMap)
        const mapsize = this.VMap.map.getSize()
        const t = width
        const r = height
        const s = [(t - mapsize[0]) / 2, (r - mapsize[1]) / 2]
        const h = -this.VMap.map.getView().getRotation()
        const u = this.VMap.map.getPixelFromCoordinate(this.VMap.map.getView().getCenter())
        if (this.features.length > 0) {
          this.features.map(feature => {
            const r = feature.coordinates
            const l = this.VMap.map.getPixelFromCoordinate(r)
            const c = (function (e, t, r) {
              return [Math.cos(t) * (e[0] - r[0]) - Math.sin(t) * (e[1] - r[1]) + r[0], Math.sin(t) * (e[0] - r[0]) + Math.cos(t) * (e[1] - r[1]) + r[1]]
            }((function (e, t, r) {
              return [(e[0] - t[0]) * r + t[0], (e[1] - t[1]) * r + t[1]]
            }(l, u, 1)), h, u))
            const d = [c[0] + s[0], c[1] + s[1]]
            const p = new Point(d, 'XY')
            const geom = new FeatureExt(p)
            geom._coordinates = r
            for (const i in feature) {
              if (Object.prototype.hasOwnProperty.call(feature, i)) {
                geom.set(i, feature[i])
              }
            }
            if (validObjKey(feature, 'style')) {
              style = setStyle(feature.style)
              vectorContext.drawFeature(geom, style)
            } else {
              vectorContext.drawGeometry(p)
            }
            geom._style = style
            geoms.push(geom)
          })
        }
        this.source.set('graphics', geoms)
        return canvas
      }
    })
    const layerOpt = { ...this.$props, ...{ source: this.source } }
    this.layer = new ImageLayer(layerOpt)
    this.layer.set('id', this.layerId)
    this.layer.set('type', 'graphic')
    this.layer.set('users', true)
    this.layer.setZIndex(1)
    this.map.addLayer(this.layer)
  },
  beforeDestroy () {
    this.layer.setSource(null)
    this.VMap.removeLayer(this.layer)
  }
}
</script>

<style scoped>

</style>
