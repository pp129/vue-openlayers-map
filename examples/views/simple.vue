<template>
  <v-map :view="view" @onClickFeature="onClickFeature" @click="onClick">
    <v-vector-layer :features="layer.features"></v-vector-layer>
    <v-overlay style="background: white;" :position="overlay.position">
      {{content}}<span @click="close">&times;</span>
    </v-overlay>
  </v-map>
</template>

<script>
import { VMap, VVectorLayer, VOverlay } from '~/index'
export default {
  name: 'simple',
  components: { VMap, VVectorLayer, VOverlay },
  data () {
    return {
      view: {
        center: [118.045456, 24.567489],
        zoom: 12
      },
      layer: {
        features: [{ coordinates: [118.045456, 24.567489], name: 'point' }]
      },
      overlay: {
        position: undefined
      },
      content: ''
    }
  },
  methods: {
    onClickFeature (feature, layer) {
      console.log(feature, layer)
      this.overlay.position = feature.get('coordinates')
      this.content = feature.get('name')
    },
    onClick (evt, map) {
      console.log(evt, map)
    },
    close () {
      this.overlay.position = undefined
    }
  }
}
</script>
