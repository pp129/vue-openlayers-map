<template>
  <div :id="target" :style="{'width':mapWidth,'height':mapHeight}">
    <a :id="downLoadId" :download="downloadName"></a>
    <slot v-if="load"></slot>
  </div>
</template>

<script>
import { nanoid } from 'nanoid'
import { OlMap, setStyle } from '@/utils/index.js'
import { getCenter } from 'ol/extent'

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
    },
    cesium: {
      type: Boolean,
      default: false
    },
    cesiumOptions: {
      type: Object
    }
  },
  computed: {
    mapOption () {
      return {
        target: this.target,
        view: this.view,
        controls: this.controls,
        interactions: this.interactions,
        cesium: this.cesium,
        cesiumOptions: this.cesiumOptions
      }
    },
    map () {
      return OlMap.map.map
    },
    map3d () {
      return OlMap.map.map3d
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
    },
    cesium: {
      handler (value) {
        if (OlMap.map.map3d) {
          OlMap.map.map3d.setEnabled(value)
        } else {
          OlMap.setMap3d()
          const eventHandler = new window.Cesium.ScreenSpaceEventHandler(OlMap.map.map3d.getCesiumScene().canvas)
          eventHandler.setInputAction(this.onClickHandlerCS.bind(this), window.Cesium.ScreenSpaceEventType.LEFT_CLICK)
          OlMap.map.map3d.getCesiumScene().camera.moveEnd.addEventListener(() => {
            console.log(OlMap.map.map3d.getCesiumScene().camera)
            // console.log(window.Cesium.Math.toDegrees(OlMap.map.map3d.getCesiumScene().camera.pitch))
            // 获取当前相机高度
            // height = Math.ceil(earth.camera.positionCartographic.height);
            this.$emit('moveEnd', OlMap.map.map3d.getCesiumScene().camera, this.map3d)
          })
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
          if (this.map3d) {
            const eventHandler = new window.Cesium.ScreenSpaceEventHandler(OlMap.map.map3d.getCesiumScene().canvas)
            eventHandler.setInputAction(this.onClickHandlerCS.bind(this), window.Cesium.ScreenSpaceEventType.LEFT_CLICK)
            OlMap.map.map3d.getCesiumScene().camera.moveEnd.addEventListener(() => {
              console.log(OlMap.map.map3d.getCesiumScene().camera)
              // console.log(window.Cesium.Math.toDegrees(OlMap.map.map3d.getCesiumScene().camera.pitch))
              // 获取当前相机高度
              // height = Math.ceil(earth.camera.positionCartographic.height);
              this.$emit('moveEnd', OlMap.map.map3d.getCesiumScene().camera, this.map3d)
            })
          }
          // 点击事件
          this.map.on('singleclick', (r) => {
            this.$emit('click', r, this.map)
            this.map.forEachSmFeatureAtPixel(r.pixel, (i, e) => {
              this.$emit('clickfeature', i, e, r)
            }, {}, r)
          })
          // 双击时间
          this.map.on('dblclick', (evt) => {
            this.$emit('dblclick', evt, this.map)
          })
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
              if (layer.get('type') === 'graphic') {
                const data = layer.getData(evt.pixel)
                const hitImage = data && data[3] > 0 // transparent pixels have zero for data[3]
                this.map.getTargetElement().style.cursor = hitImage || hit ? 'pointer' : ''
              }
            })
            this.$emit('pointermove', evt, this.map)
          })
          // 鼠标右键
          this.map.on('contextmenu', evt => {
            this.$emit('contextmenu', evt, this.map)
          })
          this.$emit('load')
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
    onClickHandlerCS (event) {
      if (event.position.x === 0 && event.position.y === 0) {
        return
      }
      console.log(OlMap.map.map3d.getCesiumScene().pick(event.position))
      const pick = OlMap.map.map3d.getCesiumScene().pick(event.position)
      this.$emit('map3dClick', event, OlMap.map.map3d, pick)
    },
    getDistancePoint (from, to, units) {
      return OlMap.getDistancePoint(from, to, units)
    },
    closeOverlays () {
      this.map.getOverlays().forEach(overlay => {
        overlay.setPosition(undefined)
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
