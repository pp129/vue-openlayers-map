<template>
  <div :id="target" :style="{'width':mapWidth,'height':mapHeight}">
    <a :id="downLoadId" :download="downloadName"></a>
    <slot v-if="load"></slot>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { OlMap, setStyle } from '@/utils/index.js'
import { getCenter, boundingExtent } from 'ol/extent'

export default {
  name: 'v-map',
  provide () {
    return {
      VMap: this
    }
  },
  props: {
    // 地图容器宽度
    width: {
      type: [String, Number],
      default () {
        return '100%'
      }
    },
    // 地图容器高度
    height: {
      type: [String, Number],
      default () {
        return '100%'
      }
    },
    // 地图容器Id
    target: {
      type: String,
      default: `map-${nanoid()}`
    },
    // 视窗属性
    view: {
      type: Object
    },
    // 控制属性
    controls: {
      type: Object
    },
    // 交互属性
    interactions: {
      type: Object
    }
  },
  computed: {
    mapOption () {
      return {
        target: this.target,
        view: this.view,
        controls: this.controls,
        interactions: this.interactions
      }
    },
    map () {
      return OlMap.map.map
    },
    mapWidth () {
      return typeof this.width === 'string' ? this.width : this.width.toString() + 'px'
    },
    mapHeight () {
      return typeof this.height === 'string' ? this.height : this.height.toString() + 'px'
    }
  },
  watch: {
    'view.center': {
      handler (value) {
        if (value) {
          this.setCenter(value)
        }
      },
      immediate: false,
      deep: true
    },
    'view.zoom': {
      handler (value) {
        if (value) {
          this.setZoom(value)
        }
      },
      immediate: false,
      deep: true
    },
    'view.constrainRotation': {
      handler (value) {
        if (value) {
          this.setConstrainResolution(value)
        }
      },
      immediate: false,
      deep: true
    },
    'view.maxZoom': {
      handler (value) {
        if (value) {
          this.setMaxZoom(value)
        }
      },
      immediate: false,
      deep: true
    },
    'view.minZoom': {
      handler (value) {
        if (value) {
          this.setMinZoom(value)
        }
      },
      immediate: false,
      deep: true
    },
    'controls.zoom': {
      handler (value) {
        const zoom = OlMap.map.mapControlsZoom
        if (zoom) {
          OlMap.setControl('zoom', value, this.controls.zoomOptions)
        }
      },
      immediate: false,
      deep: true
    },
    'controls.rotate': {
      handler (value) {
        const rotate = OlMap.map.mapControlsRotate
        if (rotate) {
          OlMap.setControl('rotate', value, this.controls.rotateOptions)
        }
      },
      immediate: false,
      deep: true
    },
    'controls.attribution': {
      handler (value) {
        const rotate = OlMap.map.mapControlsAttribution
        if (rotate) {
          OlMap.setControl('attribution', value, this.controls.attributionOptions)
        }
      },
      immediate: false,
      deep: true
    },
    'controls.FullScreen': {
      handler (value) {
        const FullScreen = OlMap.map.mapControlsFullScreen
        if (FullScreen) {
          OlMap.setControl('FullScreen', value)
        }
      },
      immediate: false,
      deep: true
    },
    'controls.ScaleLine': {
      handler (value) {
        const ScaleLine = OlMap.map.mapControlsScaleLine
        if (ScaleLine) {
          OlMap.setControl('ScaleLine', value)
        }
      },
      immediate: false,
      deep: true
    }
  },
  data () {
    return {
      vMap: null,
      load: false,
      downLoadId: `download-${nanoid()}`,
      downloadName: 'map.png',
      noBase: true,
      properties: {
        isDefault: true
      }
    }
  },
  methods: {
    initMap () {
      this.init().then(res => {
        if (res === 'success') {
          console.log('map load')
          // 绑定事件
          const events = ['singleclick', 'click', 'dblclick', 'pointerdrag', 'contextmenu', 'postrender', 'loadend', 'loadstart', 'moveend', 'movestart']
          // 层级变化
          this.map.getView().once('change:resolution', () => {
            this.map.once('moveend', (evt) => {
              this.zoomEnd(evt)
            })
          })
          // 鼠标悬浮
          this.map.on('pointermove', evt => {
            const pixel = this.map.getEventPixel(evt.originalEvent)
            const hit = this.map.hasFeatureAtPixel(pixel)
            this.map.getTargetElement().style.cursor = hit ? 'pointer' : ''
            this.map.getLayers().getArray().forEach(layer => {
              if (layer.get('type') === 'graphic' || layer.get('type') === 'wms') {
                // console.log(layer)
                const data = layer.getData(evt.pixel)
                // console.log(data)
                const hitImage = data && data[3] > 0 // transparent pixels have zero for data[3]
                this.map.getTargetElement().style.cursor = hitImage || hit ? 'pointer' : ''
              }
            })
            this.$emit('pointermove', evt, this.map)
          })
          events.forEach(event => {
            this.map.on(event, evt => {
              this.$emit(event, evt, this.map)
            })
          })
          this.$emit('load', this.map)
          this.load = true
        }
      })
    },
    init () {
      return new Promise((resolve, reject) => {
        OlMap.map = new OlMap(this.mapOption)
        if (OlMap.map.map) {
          resolve('success')
        } else {
          reject(new Error('fail'))
        }
      })
    },
    dispose () {
      if (!this.map) return
      const layers = [...this.map.getLayers().getArray()]
      layers.forEach(layer => {
        if (layer) {
          const layerTitle = layer.get('users')
          if (layerTitle) {
            layer.getSource().clear()
            layer.getRenderer().dispose()
            layer.setSource(undefined)
            this.map.removeLayer(layer)
          }
        }
      })
      this.map.disposeInternal()
    },
    zoomEnd (evt) {
      this.$emit('changeZoom', evt, this.map)
      evt.map.once('moveend', (evt) => {
        this.zoomEnd(evt)
      })
    },
    setCenter (center) {
      OlMap.setCenter(center)
    },
    setZoom (zoom) {
      OlMap.setZoom(zoom)
    },
    setConstrainResolution (enabled) {
      OlMap.setConstrainResolution(enabled)
    },
    setMaxZoom (zoom) {
      OlMap.setMaxZoom(zoom)
    },
    setMinZoom (zoom) {
      OlMap.setMinZoom(zoom)
    },
    setControl (controls, options) {
      OlMap.setControl(controls, options)
    },
    panTo (param) {
      OlMap.panTo(param)
    },
    flyTo (param) {
      OlMap.flyTo(param)
    },
    getCenterByExtent (extent) {
      return getCenter(extent)
    },
    boundingExtent (coordinates) {
      return boundingExtent(coordinates)
    },
    calculateCenter (geometry) {
      return OlMap.calculateCenter(geometry)
    },
    exportPNG (downloadName) {
      if (downloadName) {
        if (downloadName.indexOf('.png') > -1) {
          this.downloadName = downloadName
        } else {
          this.downloadName = downloadName + '.png'
        }
      } else {
        this.downloadName = `map-export-${nanoid()}.png`
      }
      OlMap.exportPNG(this.downLoadId)
    },
    getDistancePoint (from, to, units) {
      return OlMap.getDistancePoint(from, to, units)
    },
    closeOverlays () {
      this.map.getOverlays().forEach(overlay => {
        overlay.setPosition(undefined)
        const onClose = overlay.get('close')
        if (onClose) onClose()
      })
    },
    updateFeature (feature, type, param) {
      if (type === 'style') {
        feature.setStyle(setStyle(param))
      }
    }
  },
  mounted () {
    this.initMap()
  },
  beforeDestroy () {
    this.dispose()
  }
}
</script>

<style scoped>

</style>
