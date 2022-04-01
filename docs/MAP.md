# props

> 参数

## target

| 说明                 | 是否必填             | 类型   | 可选值 | 默认值        |
| :------------------- | :------------------- | ------ | :----: | ------------- |
| 地图容器的唯一标识。 | 否，多地图时避免重复 | String |   -    | `map-${uuid}` |

```vue
<template>
  <div style="width:100%;height:100%;">
    <v-map :height="height" :width="width" :target="option1.target"></v-map>
    <v-map :height="height" :width="width" :target="option2.target"></v-map>  
  </div>	
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

| 说明 | 是否必填 | 类型   | 可选值                                                       | 默认值                                    |
| ---- | -------- | ------ | ------------------------------------------------------------ | ----------------------------------------- |
| 控件 | 否       | Object | 继承 [ol/control](https://openlayers.org/en/latest/apidoc/module-ol_control.html) | `{controls={zoom: false, rotate: false}}` |

> 默认值说明：不显示层级操作按钮、不显示视图旋转按钮。

## view

| 说明 | 是否必填 | 类型   | 可选值                                                       | 默认值                                                       |
| ---- | -------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 视图 | 否       | Object | 继承[ol/view](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) | `{view={center: [0, 0],zoom: 12,constrainResolution: true,projection: 'EPSG:4326'}}` |

```vue
<template>
  <v-map :height="height" :width="width" :view="view"></v-map>
</template>
<script>
export default{
  data(){
    return {
      width:'100%',
      height:'100%',
      view:{
        center: [118.045456, 24.567489],//中心点，厦门
        zoom: 10,//地图加载完成时显示层级
        maxZoom: 18//最大可缩放层级
      }
    }
  }
}
</script>
```

## defaultTile

业务代码中未引入v-tile-layer组件则添加默认图层（天地图）。

| 说明     | 是否必填 | 类型   | 可选值                                                      | 默认值 |
| -------- | -------- | ------ | ----------------------------------------------------------- | ------ |
| 基础图层 | 否       | String | 'TD', 'TD_IMG', 'BD', 'GD', 'OSM', 'PGIS_TILE', 'PGIS_HPYX' | TD     |

## events

> 事件

### load

地图对象生成完成事件

```vue
<template>
  <div>
    <v-map @load="onLoad"></v-map>
  </div>
</template>
<script>
  export default{
    methods:{
      onLoad(){
        console.log('map loaded')
      }
    }
  }
</script>
```

### click

点击事件

```vue
<template>
  <div>
    <v-map @click="onClick"></v-map>
  </div>
</template>
<script>
  export default{
    methods:{
      onClick(evt, map){
        console.log(evt.coordinate)//点击位置经纬度
        console.log(map.getEventPixel(evt.originalEvent))//点击位置像素
      }
    }
  }
</script>
```

### onClickFeature

点击要素

```vue
<template>
  <div>
    <v-map @onClickFeature="onClickFeature"></v-map>
  </div>
</template>
<script>
  export default{
    methods:{
      onClickFeature(feature, layer){
        console.log(feature)//要素对象
        console.log(layer)//要素所在图层
      }
    }
  }
</script>
```



### changeZoom

层级变化事件

```vue
<template>
  <div>
    <v-map @changeZoom="onChangeZoom"></v-map>
  </div>
</template>
<script>
  export default{
    methods:{
      onChangeZoom(evt,map){
        console.log(evt.map.getView().getZoom())//当前层级
      }
    }
  }
</script>
```

## methods

> 方法

| 方法名                                  | 说明                                                      | 参数                                                         |
| --------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| [panTo](#panTo)                         | 移动视图动画                                              | {center:中心点数组,zoom:缩放层级数字}接受一个对象参数。      |
| [getDistancePoint](#getDistancePoint)   | 获取两点之间距离                                          | (from, to, units)接受三个参数，1、起点经纬度，2、终点经纬度，3、距离单位 |
| [getDistanceString](#getDistanceString) | 计算折线长度                                              | (lines, units)接受两个参数，1、折线经纬度集合，2、长度单位   |
| [setFeature](#setFeature)               | 主动生成要素                                              | 要素对象。                                                   |
| [getCenterByExtent](#getCenterByExtent) | 获取区域中心点                                            | (extent)接受一个数组参数。区域范围经纬度集合。               |
| [getFeatureById](#getFeatureById)       | 根据指定图层id获取该图层下指定id的要素                    | 使用此方法前保证生成的图层和要素带有`id`属性。(layerID, featureID)接受两个参数，1、图层id，2、要素id。 |
| [exportPNG](#exportPNG)                 | 将当前视图内的地图（包括图层、要素）转成png格式图片导出。 | （pngName）接受一个参数，要导出的图片文件名。                |

### panTo

`param.center`中心点数组。

`param.zoom`缩放层级数字。

```js
const param = {
  center: [118,24],//中心点
  zoom: 12//层级
}
this.$refs.map.panTo(param)
```

### getDistancePoint

`from`测量起点经纬度数组

`to`测量终点经纬度数组

`units`单位默认千米`kilometers`，单位还可以设置为`degrees`, `radians`, `miles`

```js
/**
 * @param from {Array} [经度,纬度]
 * @param to {Array} [经度,纬度]
 * @param units {String} 单位默认千米kilometers，单位还可以设置为degrees, radians, miles
 * @returns {number}
 */
const distance = this.$refs.map.getDistancePoint(from, to, units)
```

### getCenterByExtent

```js
// 多边形经纬度集合
const polygonFeature = feature.getGeometry().getExtent()
// 多边形中心点
const center = this.$refs.map.getCenterByExtent(polygonFeature)
```

### getFeatureById

```js
/**
 * @param layerId {String} 图层id
 * @param featureId {String} 要素id
 * @returns {Object} feature对象
 */
const feature = this.$refs.map.getFeatureById(layerId,featureId)
```

### exportPNG

```javascript
/**
 * @param name 图片名称 不必填
 */
this.$refs.map.exportPNG('xm')
```
