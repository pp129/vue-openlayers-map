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

# Components

> 组件

## v-map

[地图组件。](./MAP.md)

## v-overview

鹰眼组件。

## v-tile-layer

瓦片图层组件

## v-vector-layer

矢量图层组件

## v-heatmap-layer

热力图组件

## v-cluster-layer

聚合图层组件

## v-graphic-layer

图形图层组件。海量点实现推荐使用次图层。

## v-overlay

地图弹框组件

## v-track

轨迹动画组件

