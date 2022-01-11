import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'

function baseLayer (option) {
  switch (option.name) {
    case 'td':
      return getTDMap()
    case 'td_img':
      return getTDImg()
    case 'customerXYZ':
      return getCustomerTileXYZ(option.data)
    default:
      return getTDMap()
  }
}

function getTDMap () {
  return [
    new TileLayer({
      source: new XYZ({
        url: 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      })
    }),
    new TileLayer({
      source: new XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      })
    })
  ]
}

function getTDImg () {
  return [
    new TileLayer({
      source: new XYZ({
        url: 'http://t4.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      })
    }),
    new TileLayer({
      source: new XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      })
    })
  ]
}

function getCustomerTileXYZ (url) {
  const tiles = []
  url.forEach(val => {
    tiles.push(new TileLayer({
      source: new XYZ({
        url: val
      })
    }))
  })
  return tiles
}

export class VLayers {
  static layers = VLayers
  constructor (option = {}) {
    const baseLayers = Object.assign({
      name: 'td'
    }, option.baseLayer)
    const tileLayer = baseLayer(baseLayers)
    const vectorLayersOption = option.layers || []
    const vectorLayers = []
    if (vectorLayersOption.length > 0) {
      vectorLayersOption.forEach(val => {
        vectorLayers.push(this.setVectorLayer(val))
      })
    }
    this.layers = tileLayer.concat(vectorLayers)
  }

  setVectorLayer (option) {
    const layer = new VectorLayer({
      source: this.addSource(option.features || [])
    })
    layer.set('id', option.id || '')
    layer.set('type', 'VectorLayer')
    return layer
  }

  getLayers () {
    return this.layers
  }

  addSource () {
    return new VectorSource({
      features: []
    })
  }
}
