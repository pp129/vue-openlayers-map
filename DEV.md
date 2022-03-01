# 起步

## 安装

~~~bash
```
npm install vue-openlayers-map
```
~~~

## 使用

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
    <v-map ref="map" :height="height" :width="width" :option="option"></v-map>
  </div>
</template>
<script>
export default {
  data () {
    return {
      height: '100%',
      width: '100%',
      option:{
        view: {
          center: [118.045456, 24.567489],
          zoom: 12
        }
      }
    }
  }
}
</script>
```
# 配置 option

## target

| 说明                 | 是否必填                                         | 类型   | 可选值 | 默认值 |
| :------------------- | :----------------------------------------------- | ------ | :----: | ------ |
| 地图容器的唯一标识。 | 单页面生成单个地图时不必填，多地图时必填且不重复 | String |   -    | map    |

```vue
<template>
  <v-map :height="height" :width="width" :option="option1"></v-map>  
  <v-map :height="height" :width="width" :option="option1"></v-map>  
</template>
<script>
export default{
  data(){
    return {
      width:'50%',
      height:'100%',
      option1:{
        target:'map1'
      },
      option2:{
        target:'map2'
      }
    }
  }
}
</script>
```

## controls

| 说明 | 是否必填 | 类型   | 可选值                                                       | 默认值                                  |
| ---- | -------- | ------ | ------------------------------------------------------------ | --------------------------------------- |
| 控件 | 否       | Object | 继承 [ol/control](https://openlayers.org/en/latest/apidoc/module-ol_control.html) | {controls={zoom: false, rotate: false}} |

默认值说明：不显示层级操作按钮、不显示视图旋转按钮。

## baseTile

| 说明     | 是否必填 | 类型  | 可选值            | 默认值 |
| -------- | -------- | ----- | ----------------- | ------ |
| 瓦片图层 | 否       | Array | [可选值](#可选值) | ['td'] |

### 可选值

- 天地图-矢量：`'td'`
- 天地图-影像：`'td_img'`
- 百度-矢量：`'bd'`
- 自定义图层：`'xyz'`

#### 自定义图层

支持自定义加载瓦片图层，加载图层仅支持xyz类型。

| 属性   | 说明                                                         | 必填 | 类型   | 可选值 | 默认值 |
| ------ | ------------------------------------------------------------ | ---- | ------ | :----: | :----: |
| type   | 类型                                                         | 必填 | String |  xyz   |  xyz   |
| name   | 名称                                                         | 必填 | String |   -    |   -    |
| option | xyz图层参数集合，单个图层参数继承 [ol/source/xyz](https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html) | 必填 | Arary  |   -    |   -    |

```vue
<template>
  <v-map :height="height" :width="width" :option="option"></v-map>
</template>
<script>
export default{
  data(){
    return {
      width:'100%',
      height:'100%',
      option:{
        baseTile: [{
          type: 'xyz',
          name: 'gd',
          option: [
            {
              url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7'
            }
          ]
        },{
          type: 'xyz',
          name: 'xyz_bd',
          option: [{
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
          }]
    		}]
      }
    }
  }
}
</script>
```

## visibleTile

| 说明                                                    | 是否必填 | 类型          | 可选值                 | 默认值                                    |
| ------------------------------------------------------- | -------- | ------------- | ---------------------- | ----------------------------------------- |
| 默认可视瓦片图层。<br/>多个基础图层情况下默认显示的图层 | 否       | String/Object | 与baseTile中的元素对应 | [baseTile](##baseTile)中的第一个元素/'td' |

## overview

| 说明                                             | 是否必填 | 类型            | 可选值                     | 默认值 |
| ------------------------------------------------ | -------- | --------------- | -------------------------- | ------ |
| 鹰眼/缩略图。不设置此属性或值为false则不显示鹰眼 | 不必填   | Array / Boolean | 参考[baseTile](##baseTile) | -      |

**注意：在代码中只能新加一个配置项，不能直接=baseTile中的某个元素。**

```js
//错误示范
this.option.overview = this.option.baseTile[0]
//正确写法
this.option.overview = 'td'
```

## view

| 说明 | 是否必填 | 类型   | 可选值                                                       | 默认值                                                       |
| ---- | -------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 视图 | 否       | Object | 继承[ol/view](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) | {view={center: [0, 0],zoom: 12,constrainResolution: true,projection: 'EPSG:4326'}} |

## layers

| 说明     | 是否必填 | 类型  | 可选值 | 默认值 |
| -------- | -------- | ----- | :----: | :----: |
| 图层集合 | 否       | Array |   -    |   -    |

### layer

继承  ol/layer

官方文档：https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html

二次封装参数说明

| 参数 | 说明     | 是否必填 | 类型   | 可选值                                  | 默认值 |
| ---- | -------- | -------- | ------ | --------------------------------------- | ------ |
| id   | 图层id   | 是       | String | -                                       | -      |
| type | 图层类型 | 否       | String | VectorLayer/cluster/heatmap/webGLPoints | -      |

layer参数详见 [LAYER.md](LAYER.md)

# 事件 events

## load

地图对象生成完成事件

## change

图层、弹框改变事件

## click

点击事件

## changeZoom

层级变化事件

## drawstart

绘制开始事件

## drawend

绘制完成事件

## modifystart

编辑开始事件

## modifyend

编辑结束事件

## measurestart

测量开始事件

## measureend

测量完成事件

# 方法 methods

## panTo

移动地图中心点

```js
const param = {
  center:[Lon,Lat],//中心点
  zoom:zoom//层级
}
this.$refs.map.panTo(param)
```

## getDistancePoint

获取两点之间距离

```js
/**
 * @param from {Array} [经度,纬度]
 * @param to {Array} [经度,纬度]
 * @param units {String} 单位默认千米kilometers，单位还可以设置为degrees, radians, miles
 * @returns {number}
 */
const distance = this.$refs.map.getDistancePoint(from, to, units)
```

## getDistanceString

获取两线之间距离

## setFeature

主动生成要素

## getCenterByExtent

获取区域中心点

```js
// 多边形经纬度集合
const polygonFeature = feature.getGeometry().getExtent()
// 多边形中心点
const center = this.$refs.map.getCenterByExtent(polygonFeature)
```

## getFeatureById

根据指定图层id获取该图层下指定id的要素

```js
/**
 * @param layerId {String} 图层id
 * @param featureId {String} 要素id
 * @returns {Object} feature对象
 */
const feature = this.$refs.map.getFeatureById(layerId,featureId)
```


