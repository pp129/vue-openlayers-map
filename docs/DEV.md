# 开始使用 start

## 安装 install

```bash
npm install v-ol-map
```

## 引入组件 import

完整引入

```javascript
import vueOlMap from 'v-ol-map'
Vue.use(vueOlMap)
```

按需引入，以VMap为例

```javascript
import { VMap } from 'v-ol-map'
```

## 开始使用 use

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
      height: '1080px',
      width: '960px',
      view: {
        center: [118.045456, 24.567489],
        zoom: 12
      }
    }
  }
}
</script>
```

## 组件 components

* v-map [地图组件](MAP.md)

* v-tile [瓦片图层组件](TILELAYER.md)

* v-vector [矢量图层组件](VECTORLAYER.md)

* v-heatmap [热力图组件](HEATMAPLAYER.md)

* v-cluster [聚合图层组件](CLUSTERLAYER.md)

* v-graphic [图形图层组件](GRAPHICLAYER.md) 海量点实现推荐使用次图层

* v-route [路径规划](ROUTELAYER.md) 调用arcgis或graphhopper最短路径规划服务生成的图层

* v-overview [概览地图/鹰眼组件](OVERVIEW.md)

* v-overlay [地图弹框组件](OVERLAY.md)

* v-track [轨迹动画组件](TRACK.md)

* v-draw [绘制组件](DRAW.md)

* v-measure [测量组件](MEASURE.md)
