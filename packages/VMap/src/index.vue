<template>
  <div :id="target" :style="{'width':mapWidth,'height':mapHeight}">
    <a :id="downLoadId" :download="downloadName"></a>
    <v-tile-layer v-if="noBase" :tile-type="defaultTile" :properties="properties"></v-tile-layer>
    <slot v-if="load"></slot>
  </div>
</template>

<script>
import { VMap, uuid, olSelect, olModify, validObjKey } from '~/utils'
import { VTileLayer } from '~/VLayers'
import { DragRotateAndZoom, Translate } from 'ol/interaction'
import { FullScreen } from 'ol/control'

export default {
  name: 'v-map',
  provide () {
    return {
      VMap: this
    }
  },
  components: {
    VTileLayer
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
      default: `map-${uuid()}`
    },
    // 视窗属性
    view: {
      type: Object
    },
    // 未引入tile组件时默认加载图层
    defaultTile: {
      type: String,
      default: 'TD'
    },
    // 控制属性
    controls: {
      type: Object
    },
    // 控制类扩展
    controlsExtend: {
      type: Object
    },
    // 交互属性
    interactions: {
      type: Object
    },
    // 交互类扩展
    interactionsExtend: {
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
      return VMap.map.map
    },
    mapWidth () {
      return typeof this.width === 'string' ? this.width : this.width.toString() + 'px'
    },
    mapHeight () {
      return typeof this.height === 'string' ? this.height : this.height.toString() + 'px'
    }
  },
  watch: {
    interactionsExtend: {
      handler (val) {
        for (const key in val) {
          if (key === 'translate') {
            this.setTranslates(val[key])
          } else if (key === 'DragRotateAndZoom') {
            this.setDragRotateAndZoom(val[key])
          }
        }
      },
      immediate: false,
      deep: true
    },
    controlsExtend: {
      handler (value) {
        for (const key in value) {
          if (key === 'FullScreen') {
            this.setFullScreen(value[key])
          }
        }
      },
      immediate: false,
      deep: true
    }
  },
  data () {
    return {
      load: false,
      downLoadId: `download-${uuid()}`,
      downloadName: 'map.png',
      noBase: false,
      properties: {
        isDefault: true
      },
      modify: null,
      select: null,
      translates: null,
      dragRotateAndZoom: null,
      fullScreen: null
    }
  },
  mounted () {
    this.init().then(res => {
      if (res === 'success') {
        // 业务代码中未引入tile组件则添加默认图层)
        this.noBase = this.map.getLayers().getArray().findIndex(x => x.get('base')) < 0
        // 交互属性扩展
        for (const key in this.interactionsExtend) {
          if (key === 'translate') {
            this.setTranslates(this.interactionsExtend[key])
          } else if (key === 'DragRotateAndZoom') {
            this.setDragRotateAndZoom(this.interactionsExtend[key])
          }
        }
        // 控制扩展
        for (const key in this.controlsExtend) {
          if (key === 'FullScreen') {
            this.setFullScreen(this.controlsExtend[key])
          }
        }
        // 点击事件
        this.map.on('singleclick', (r) => {
          this.$emit('click', r, this.map)
          this.map.forEachSmFeatureAtPixel(r.pixel, (i, e) => {
            this.$emit('onClickFeature', i, e, r)
          }, {}, r)
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
  beforeDestroy () {
    this.dispose()
  },
  methods: {
    init () {
      return new Promise((resolve, reject) => {
        console.log(this.mapOption)
        VMap.map = new VMap(this.mapOption)
        if (VMap.map.map) {
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
            console.log('destroying layer', layerTitle)
            layer.getSource().clear()
            layer.getRenderer().dispose()
            layer.setSource(undefined)
            this.map.removeLayer(layer)
          }
        }
      })
      this.map.disposeInternal()
      // this.map.setTarget(null)
      // this.map = null
    },
    zoomEnd (evt) {
      this.$emit('changeZoom', evt, this.map)
      evt.map.once('moveend', (evt) => {
        this.zoomEnd(evt)
      })
    },
    getMap () {
      return VMap.map
    },
    updateFeatureById (layerId, featureId, update) {
      this.map.getLayers().getArray().forEach(val => {
        console.log(val)
        if (val.get('id') === layerId) {
          const features = val.getSource().getFeatures()
          console.log(features)
          features.forEach(feature => {
            if (feature.get('id') === featureId) {
              if (typeof update === 'object') {
                for (const i in update) {
                  if (Object.prototype.hasOwnProperty.call(update, i)) {
                    feature.update(i, update[i])
                  }
                }
              }
            }
          })
        }
      })
    },
    removeLayerById (id) {
      VMap.removeLayerById(id)
    },
    removeLayer (layer) {
      VMap.removeLayer(layer)
    },
    clearLayerById (id) {
      const layer = this.map.getLayerById(id)
      // console.log(layer)
      if (layer.get('type') === 'graphicLayer') {
        layer.setSource(null)
      } else {
        layer.getSource().clear()
      }
    },
    setFeature (option) {
      return VMap.setFeature(option)
    },
    getCenterByExtent (extent) {
      return VMap.getCenterByExtent(extent)
    },
    panTo (option) {
      VMap.panTo(option.center, option.zoom)
    },
    getDistancePoint (from, to, units) {
      return VMap.getDistancePoint(from, to, units)
    },
    getDistanceString (lines, units) {
      return VMap.getDistanceString(lines, units)
    },
    getFeatureById (layerId, featureId) {
      return this.map.getFeatureById(layerId, featureId)
    },
    setLayerVisible (layer, visible) {
      layer.setVisible(visible)
    },
    setLayerVisibleById (id, visible) {
      const layers = this.map.getLayers().getArray()
      const layer = layers.find(x => x.get('id') === id)
      if (layer) layer.setVisible(visible)
    },
    exportPNG (downloadName) {
      if (downloadName) {
        if (downloadName.indexOf('.png') > -1) {
          this.downloadName = downloadName
        } else {
          this.downloadName = downloadName + '.png'
        }
      } else {
        this.downloadName = `map-export-${uuid()}.png`
      }
      VMap.exportPNG(this.downLoadId)
    },
    modifyFeature (option) {
      this.startModify = true
      this.select = olSelect()
      const features = this.select.getFeatures()
      this.map.addInteraction(this.select)
      this.modify = olModify({
        features: features
      })
      this.map.addInteraction(this.modify)
      if (validObjKey(option, 'start') && typeof option.start === 'function') {
        this.select.on('select', evt => {
          // const params = { ...evt, ...{ select: this.select } }
          option.start(evt, this.map)
        })
      }
      if (validObjKey(option, 'end') && typeof option.end === 'function') {
        this.modify.on('modifyend', evt => {
          const params = { ...evt, ...{ select: this.select } }
          option.end(params, this.map)
        })
      }
    },
    clearModify (callback) {
      this.startModify = false
      if (this.select) this.map.removeInteraction(this.select)
      if (this.modify) this.map.removeInteraction(this.modify)
      if (callback && typeof callback === 'function') {
        callback()
      }
    },
    translateEvent () {
      if (this.translates) {
        this.translates.on('translateend', e => {
          this.$emit('translateend', e, this.map)
        })
        this.translates.on('translatestart', e => {
          this.$emit('translatestart', e, this.map)
        })
        this.translates.on('translating', e => {
          this.$emit('translating', e, this.map)
        })
      }
    },
    setTranslates (value) {
      if (value) {
        if (!this.select) {
          this.select = olSelect()
          this.map.addInteraction(this.select)
        }
        if (!this.translates) {
          this.translates = new Translate({
            features: this.select.getFeatures()
          })
          this.map.addInteraction(this.translates)
          this.translateEvent()
        }
      } else {
        if (this.translates) {
          this.map.removeInteraction(this.translates)
          this.translates = null
          if (!this.startModify && this.select) {
            this.map.removeInteraction(this.select)
            this.select = null
          }
        }
      }
    },
    setDragRotateAndZoom (value) {
      if (value) {
        if (!this.dragRotateAndZoom) {
          this.dragRotateAndZoom = new DragRotateAndZoom()
          this.map.addInteraction(this.dragRotateAndZoom)
        }
      } else {
        this.map.removeInteraction(this.dragRotateAndZoom)
        this.dragRotateAndZoom = null
      }
    },
    setFullScreen (value) {
      if (value) {
        if (!this.fullScreen) {
          this.fullScreen = new FullScreen()
          this.map.addControl(this.fullScreen)
        }
      } else {
        this.map.removeControl(this.fullScreen)
        this.fullScreen = null
      }
    }
  }
}
</script>

<style scoped>

</style>
