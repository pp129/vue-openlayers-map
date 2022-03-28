# start

## install

~~~bash
npm install vue-openlayers-map
~~~

## use

全局引用

```js
import VMap from 'vue-openlayers-map'
Vue.use(VMap)
```

单独引用

```js
import { VMap } from 'vue-openlayers-map'
```


加载地图

```vue
<template>
  <div class="home">
    <v-map ref="map" :height="height" :width="width" :view="view"></v-map>
  </div>
</template>
<script>
export default {
  data () {
    return {
      height: '100%',
      width: '100%',
      view: {
        center: [118.045456, 24.567489],
        zoom: 12
      }
    }
  }
}
</script>
```

## Components

> 组件

### v-map

[地图组件](./MAP.md)

### v-tile-layer

[瓦片图层组件](TILELAYER.md)

### v-vector-layer

[矢量图层组件](VECTORLAYER.md)

### v-heatmap-layer

[热力图组件](HEATMAPLAYER.md)

### v-cluster-layer

[聚合图层组件](CLUSTERLAYER.md)

### v-graphic-layer

[图形图层组件](GRAPHICLAYER.md)。海量点实现推荐使用次图层。

### v-route-layer

调用arcgis或graphhopper最短路径规划服务生成的图层。[参数文档。](ROUTELAYER.md)

### v-overview

[概览地图/鹰眼组件](OVERVIEW.md)

### v-overlay

[地图弹框组件](OVERLAY.md)

### v-track

[轨迹动画组件](TRACK.md)

### v-draw

[绘制组件](DRAW.md)

### v-measure

[测量组件](MEASURE.md)
