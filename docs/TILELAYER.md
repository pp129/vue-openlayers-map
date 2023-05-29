# 瓦片图层 v-tile

对于在按特定分辨率的缩放级别组织的网格中提供预渲染的平铺图像的图层源。

```javascript
import VTileLayer from 'v-ol-map'
```

## 参数 props

[继承参数查看](LAYER_PROPS.md)

| 参数       | 类型              | 默认值                 | 描述                                                                                                                                                                                                             |
| ---------- | ----------------- | ---------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `layerId`  | String            | `tile-layer-${uuid()}` | 图层id                                                                                                                                                                                                           |
| `preload`  | Number / Infinity | `0`                    | 预加载。将低分辨率图块加载到`preload`层级。`0` 意味着没有预加载。也可以采用`Infinity`，这样所有较低的分辨率级别都会被考虑在内。                                                                                                                                    |
| `tileType` | String            | `'TD'`                 | [已封装图层类型](#tileType)                                                                                                                                                                                           |
| `xyz`      | Object            | `{}`                   | 当`tileType`值为`XYZ`时的可选参数。具有在 URL 模板中定义的一组 XYZ 格式的 URL 的切片数据的图层源。默认情况下，这遵循广泛使用的 Google 网格，其中`x`0 和`y`0 位于左上角。只要源没有自定义平铺网格，就可以使用 URL 模板中的占位符来使用像 TMS 这样的网格，其中`x`0 和`y`0 位于左下角。`{-y}`在这种情况下`tileUrlFunction`可以使用。 |
| `wms`      | Object            | `{}`                   | 来自 WMS 服务器的切片数据的图层源。                                                                                                                                                                                           |

<span id="tileType"></span>
### tileType 已封装图层类型

`TD` 天地图

`TD_IMG` 天地图影像图

`BD` 百度地图

`BD_BLUE` 百度暗夜地图

`BD_DARK` 百度深色地图

`ARCGIS_NORMAL` arcgis公开服务-正常

`ARCGIS_BLUE` arcgis公开服务-暗夜

`ARCGIS_WARM` arcgis公开服务-暖色

`ARCGIS_GRAY` arcgis公开服务-灰色

`GD` 高德地图

`OSM` OpenStreetMap地图

`WMS` 来自 WMS 服务器的切片数据的图层源。

`XYZ` 自定义路径的XYZ规则地图

### xyz属性参数 props.xyz

当`tileType`为`XYZ`时

参数参考：[ol/source/XYZ](https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ.html)

### wms属性参数 props.wms

当`tileType`为`WMS`时

参考参数：[ol/source/TileWMS](https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS.html)

## 自定义xyz参数 use

通过自定义xyz参数实现百度地图加载

```vue
<template>
  <v-map :view="view">
    <v-tile :tile-type="tileType" :xyz="xyz" :preload="preload"></v-tile>
  </v-map>
</template>
<script>
export default {
  data(){
    const resolutions = []
    for (let i = 0; i < 19; i++) {
      resolutions[i] = Math.pow(2, 18 - i)
    }
    return {
      view: {
        center: [118.045456, 24.567489],
        zoom: 10,
        maxZoom: 18
      },
      preload: Infinity,
      tileType: 'XYZ',
      xyz:{
        projection: 'baidu',
          tileGrid: {
            origin: [0, 0], // 设置原点坐标
            resolutions: resolutions // 设置分辨率
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

### 加载自定义瓦片服务路径的xyz图层

自定义瓦片服务路径。路径规则参考data.xyz.url

```vue
<template>
  <div class="home">
    <v-map :view="view">
      <v-tile :tile-type="tileType" :xyz="xyz"></v-tile>
    </v-map>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      view: {
        center: [120.499307, 24.009825],
        zoom: 10,
        maxZoom: 18
      },
      tileType: 'XYZ',
      xyz: {
        url: '/tiles/{z}/{y}/{x}.png'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.home{
  width: 100%;
  height: 100%;
}
</style>
```

#### 图层切换

在测试环境中切换天地图/天地图影像图层。在正式环境中切换PGIS/PGIS航拍影像图层。

```vue
<template>
<div class="home">
  <div class="tools">
    <select id="changeLayer" class="btn" v-model="selectedTile" @change="changeTile">
      <option v-for="(item,index) in tileOptions" :key="index" :value="item.value">{{item.name}}</option>
    </select>
  </div>
  <v-map :view="view">
    <v-tile :tile-type="tileType"></v-tile>
  </v-map>
</div>
</template>

<script>

export default {
  name: 'tile',
  data () {
    return {
      view: {
        center: [118.045456, 24.567489],
        zoom: 10,
        maxZoom: 18
      },
      tileType: process.env.NODE_ENV === 'production' ? 'PGIS_TILE' : 'TD',
      selectedTile: '1',
      tileOptions: [
        {
          name: '矢量',
          value: '1'
        },
        {
          name: '影像',
          value: '2'
        }
      ]
    }
  },
  methods: {
    changeTile () {
      console.log(process.env.NODE_ENV)
      if (this.selectedTile === '1') {
        this.tileType = process.env.NODE_ENV === 'production' ? 'PGIS_TILE' : 'TD'
      } else {
        this.tileType = process.env.NODE_ENV === 'production' ? 'PGIS_HPYX' : 'TD_IMG'
      }
    }
  }
}
</script>
```

### 加载wms图层

加载发布于geoserver的手工绘制图层。

```vue
<template>
<div class="layers">
  <v-map ref="map" class="map" :view="view">
    <v-tile :tile-type="tile.type" :wms="tile.wms"></v-tile>
  </v-map>
</div>
</template>

<script>
export default {
  name: 'layers',
  data () {
    return {
      view:{
        center: [118.045456, 24.567489],
        zoom: 12
      },
      tile: {
        type: 'WMS',
        wms: {
          url: 'http://218.5.80.6:6600/geoserver/softThree/wms',
          params: {
            LAYERS: 'softThree:softThreeGaode',
            TILED: true
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        }
      }
    }
  }
}
</script>
```
