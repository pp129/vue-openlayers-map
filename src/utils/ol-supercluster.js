/**
 * @module SuperCluster
 */

import Supercluster from './supercluster'
import { Feature } from 'ol'
import { listen } from 'ol/events'
import EventType from 'ol/events/EventType'
import { Point } from 'ol/geom'
import { Vector as VectorSource } from 'ol/source'
import { transformExtent, equivalent } from 'ol/proj'
import { equals } from 'ol/extent'

class OlSuperCluster extends VectorSource {
  constructor (options) {
    super({
      attributions: options.attributions,
      wrapX: options.wrapX
    })

    this.resolution_ = undefined

    this.extent_ = undefined

    this.projection_ = options.projection ?? 'EPSG:4326'

    this.view_ = options.view

    this.radius_ = options.radius ?? 60

    this.onDemandMode_ = options.onDemandMode ?? false

    this.features_ = []

    this.cluster_ = undefined

    this.clusterFeatures_ = []

    this.geojsonFunction_ = options.geojsonFunction ?? function (feature) {
      const geometry = /** @type {Point} */ (feature.getGeometry())
      return {
        type: 'Feature',
        properties: null,
        geometry: {
          type: 'Point',
          coordinates: geometry.getCoordinates()
        }
      }
    }

    this.source_ = options.source

    listen(this.source_, EventType.CHANGE, this.refresh, this)
  }

  getRadius () {
    return this.radius_
  }

  getSource () {
    return this.source_
  }

  loadFeatures (extent, resolution, projection) {
    this.source_.loadFeatures(extent, resolution, projection)
    if (resolution !== this.resolution_ || !equals(extent, this.extent_) || !equivalent(projection, this.projection_)) {
      this.clear()
      this.extent_ = extent
      this.projection_ = projection
      this.resolution_ = resolution
      this.processCluster_(false)
      this.addFeatures(this.features_)
    }
  }

  setRadius (radius) {
    this.radius_ = radius
    this.refresh()
  }

  refresh () {
    this.clear()
    this.processCluster_(true)
    this.addFeatures(this.features_)
    return true
  }

  processCluster_ (force) {
    if (this.resolution_ === undefined || this.features_ === undefined) {
      return
    }
    this.features_.length = 0
    const features = this.source_.getFeatures()
    if (force || !this.cluster_) {
      const geoJsonFeatures = features.map(this.geojsonFunction_)
      const clusterFeatures = geoJsonFeatures.map(addIndexToFeature).filter(filterFeature)
      this.cluster_ = new Supercluster({
        radius: this.radius_,
        maxZoom: Math.round(this.view_.getMaxZoom()),
        minZoom: Math.round(this.view_.getMinZoom())
      })
      this.clusterFeatures_ = features
      this.cluster_.load(clusterFeatures)
    }
    const bbox = transformExtent(this.extent_, this.projection_, 'EPSG:4326')
    const zoom = Math.round(this.view_.getZoomForResolution(this.resolution_))
    const result = this.cluster_.getClusters(bbox, zoom)

    for (const feature of result) {
      let cluster = new Feature(new Point(feature.geometry.coordinates))
      const isCluster = feature.properties && feature.properties.cluster === true
      cluster.set('cluster', isCluster)
      if (cluster.get('cluster')) {
        cluster.set('cluster_id', feature.properties.cluster_id)
      }
      if (!this.onDemandMode_) {
        let children = [features[feature.properties.index]]
        if (isCluster) {
          children = this.getFeaturesForCluster(cluster)
        }
        cluster.set('features', children)
      } else if (!isCluster) {
        cluster = features[feature.properties.index]
      }
      this.features_.push(cluster)
    }
  }

  getFeaturesForCluster (feature) {
    if (!feature.get('cluster') || !this.cluster_) {
      return [feature]
    }
    const clusterFeatures = this.cluster_.getLeaves(feature.get('cluster_id'), Infinity)
    const resultFeatures = []
    const indexes = new Set()
    for (const clusterFeature of clusterFeatures) {
      const index = clusterFeature.properties.index
      if (!indexes.has(index)) {
        indexes.add(index)
        resultFeatures.push(this.clusterFeatures_[index])
      }
    }
    return resultFeatures
  }

  getClusterExpansionZoom (feature) {
    if (!feature.get('cluster') || !this.cluster_) {
      return this.view_.getZoom()
    }
    return this.cluster_.getClusterExpansionZoom(feature.get('cluster_id'))
  }
}

function addIndexToFeature (feature, index) {
  const result = Object.assign({}, feature)
  result.properties = Object.assign({}, result.properties, {
    index
  })
  return result
}

function filterFeature (feature) {
  return !!feature
}

export default OlSuperCluster
