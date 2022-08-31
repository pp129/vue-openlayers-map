# 鹰眼/概览图 v-overview

创建一个新控件，其中的地图充当另一个已定义地图的概览图。

```javascript
import { VOverview } from 'v-ol-map'
```

## 参数 props

基础属性参考：[ol​/control​/OverviewMap](https://openlayers.org/en/latest/apidoc/module-ol_control_OverviewMap-OverviewMap.html)

基础属性中的图层属性继承：[v-tile组件props](TILELAYER.md) 

### 自定义xyz的概览图

可以在`v-overview`组件中直接使用`v-tile`的参数作生成`layers`。以概览图生成自定义xyz参数百度地图为例：

```vue
<template>
  <v-map>
    <v-tile></v-tile>
    <v-overview tile-type="XYZ" :xyz="xyz"></v-overview>
  </v-map>
</template>
<script>
export default {
  data () {
    const resolutions = []
    for (let i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    return {
      xyz: {
        projection: 'baidu',
        tileGrid: {
          origin: [0, 0], // 设置原点坐标
          resolutions // 设置分辨率
        },
        tileUrlFunction: function (tileCoord, pixelRatio, proj) {
          if (!tileCoord) {
            return ''
          }
          const z = tileCoord[0]
          const x = tileCoord[1]
          const y = -tileCoord[2] - 1
          return 'https://maponline1.bdimg.com/tile/?qt=vtile&x=' +
              x + '&y=' + y + '&z=' + z +
              '&styles=pl&scaler=1&udt=20220113&from=jsapi2_0'
        }
      }
    }
  }
}
</script>
```
