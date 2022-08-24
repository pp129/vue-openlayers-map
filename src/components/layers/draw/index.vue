<script>
import BaseLayer from '@/components/layers/BaseLayer.vue'
import { nanoid } from 'nanoid'
import { addVectorSource, setFeatures, setStyle } from '@/utils'
import VectorLayer from 'ol/layer/Vector'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import { Polygon } from 'ol/geom'
import { Modify, Select } from 'ol/interaction'

export default {
  name: 'v-draw',
  extends: BaseLayer,
  inject: ['VMap'],
  render (createElement, context) {
    return null
  },
  props: {
    layerId: {
      type: String,
      default () {
        return `draw-layer-${nanoid()}`
      }
    },
    features: {
      type: Array,
      default () {
        return []
      }
    },
    source: {
      type: Object,
      default () {
        return { features: [] }
      }
    },
    featureStyle: {
      type: [Object, Boolean],
      default () {
        return false
      }
    },
    type: {
      type: String,
      default: ''// 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Circle'
    },
    clickTolerance: {
      type: Number,
      default: 6
    },
    dragVertexDelay: {
      type: Number,
      default: 500
    },
    snapTolerance: {
      type: Number,
      default: 12
    },
    stopClick: {
      type: Boolean,
      default () {
        return false
      }
    },
    maxPoints: {
      type: Number,
      default: undefined
    },
    minPoints: {
      type: Number,
      default: undefined
    },
    endRight: {
      type: Boolean,
      default () {
        return false
      }
    },
    editable: {
      type: Boolean,
      default () {
        return false
      }
    },
    clear: {
      type: Boolean,
      default () {
        return false
      }
    },
    wrapX: {
      type: Boolean,
      default () {
        return false
      }
    },
    finishCondition: {
      type: Object
    },
    geometryFunction: {
      type: Function
    },
    geometryName: {
      type: String
    },
    condition: {
      type: Object
    },
    freehand: {
      type: Boolean,
      default () {
        return false
      }
    },
    freehandCondition: {
      type: Object
    }
  },
  data () {
    return {
      layer: null,
      draw: null,
      modify: null,
      select: null
    }
  },
  computed: {
    map () {
      return this.VMap.map
    }
  },
  watch: {
    type: {
      handler (value) {
        // this.dispose()
        if (value) {
          this.initDraw()
        } else {
          this.dispose()
        }
      },
      immediate: false
    }
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.map.removeLayer(this.layer)
    this.dispose()
  },
  methods: {
    init () {
      const source = addVectorSource(this.source, this.map)
      if (this.source.features.length <= 0 && this.features.length > 0) {
        const features = setFeatures(this.features, this.map)
        source.addFeatures(features)
      }
      const layerOpt = { ...this.$props, ...{ source } }
      this.layer = new VectorLayer(layerOpt)
      this.layer.setStyle((feature) => {
        if (feature.get('style')) {
          return setStyle(feature.get('style'))
        } else {
          if (this.featureStyle) {
            return setStyle(this.featureStyle)
          } else {
            return setStyle({
              fill: {
                color: 'rgba(67,126,255,0.15)'
              },
              stroke: {
                color: 'rgba(67,126,255,1)',
                width: 1
                // lineDash: [20, 10, 20, 10]
              }
            })
          }
        }
      })
      this.layer.set('id', this.layerId)
      this.layer.set('type', 'draw')
      this.layer.set('users', true)
      this.layer.setZIndex(1)
      this.map.addLayer(this.layer)
      if (this.type) {
        this.initDraw()
      }
    },
    initDraw () {
      this.resetDraw()
      this.draw.set('type', 'draw')
      this.map.addInteraction(this.draw)
      if (this.endRight) {
        this.map.on('contextmenu', evt => {
          console.log(this.draw)
          this.draw.setActive(false)
        })
      }
      if (this.clear) {
        this.draw.on('drawstart', evt => {
          this.layer.getSource().clear()
        })
      }
      this.draw.on('drawstart', evt => {
        this.$emit('drawstart', evt, this.map)
      })
      this.draw.on('drawend', evt => {
        this.$emit('drawend', evt, this.map)
      })
      if (this.editable) {
        this.select = new Select()
        this.select.set('type', 'select')
        this.map.addInteraction(this.select)
        this.modify = new Modify({
          features: this.select.getFeatures()
        })
        this.modify.set('type', 'modify')
        this.map.addInteraction(this.modify)
        this.modify.on('modifystart', evt => {
          this.$emit('modifystart', evt, this.map)
        })
        this.modify.on('modifyend', evt => {
          this.$emit('modifyend', evt, this.map)
        })
      }
    },
    resetDraw () {
      if (this.draw) {
        this.map.removeInteraction(this.draw)
        this.draw = null
      }
      const option = {
        source: this.layer.getSource(),
        type: this.type,
        freehand: this.freehand,
        clickTolerance: this.clickTolerance,
        features: setFeatures(this.features, this.map),
        dragVertexDelay: this.dragVertexDelay,
        snapTolerance: this.snapTolerance,
        stopClick: this.stopClick,
        maxPoints: this.maxPoints,
        minPoints: this.minPoints,
        wrapX: this.wrapX,
        geometryName: this.geometryName,
        geometryFunction: this.geometryFunction
      }
      if (this.type === 'Rectangle') {
        const drawOpt = {
          ...option, ...{ type: 'Circle', geometryFunction: createBox() }
        }
        this.draw = new Draw(drawOpt)
      } else if (this.type === 'Square') {
        const drawOpt = {
          ...option, ...{ type: 'Circle', geometryFunction: createRegularPolygon(4) }
        }
        this.draw = new Draw(drawOpt)
      } else if (this.type.indexOf('Star') > -1) {
        const points = this.type.split('-')[1] || 5
        const geometryFunction = function (coordinates, geometry) {
          const center = coordinates[0]
          const last = coordinates[coordinates.length - 1]
          const dx = center[0] - last[0]
          const dy = center[1] - last[1]
          const radius = Math.sqrt(dx * dx + dy * dy)
          const rotation = Math.atan2(dy, dx)
          const newCoordinates = []
          const numPoints = Number(points) * 2
          for (let i = 0; i < numPoints; ++i) {
            const angle = rotation + (i * 2 * Math.PI) / numPoints
            const fraction = i % 2 === 0 ? 1 : 0.5
            const offsetX = radius * fraction * Math.cos(angle)
            const offsetY = radius * fraction * Math.sin(angle)
            newCoordinates.push([center[0] + offsetX, center[1] + offsetY])
          }
          newCoordinates.push(newCoordinates[0].slice())
          if (!geometry) {
            geometry = new Polygon([newCoordinates])
          } else {
            geometry.setCoordinates([newCoordinates])
          }
          return geometry
        }
        const drawOpt = {
          ...option, ...{ type: 'Circle', geometryFunction }
        }
        this.draw = new Draw(drawOpt)
      } else {
        this.draw = new Draw(option)
      }
    },
    dispose () {
      // this.map.removeLayer(this.layer)
      this.layer.getSource().clear()
      this.map.removeInteraction(this.draw)
      this.map.removeInteraction(this.select)
      this.map.removeInteraction(this.modify)
    },
    finish () {
      this.draw.finishDrawing()
    },
    remove () {
      this.map.removeInteraction(this.draw)
    },
    setActive (value) {
      this.draw.setActive(value)
    }
  }
}
</script>

<style scoped>

</style>
