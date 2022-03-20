# props

> 参数

## target

| 说明                 | 是否必填             | 类型   | 可选值 | 默认值   |
| :------------------- | :------------------- | ------ | :----: | -------- |
| 地图容器的唯一标识。 | 否，多地图时避免重复 | String |   -    | map-uuid |

```vue
<template>
  <v-map :height="height" :width="width" :option="option1.target"></v-map>  
  <v-map :height="height" :width="width" :option="option2.target"></v-map>  
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

## view

| 说明 | 是否必填 | 类型   | 可选值                                                       | 默认值                                                       |
| ---- | -------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 视图 | 否       | Object | 继承[ol/view](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) | {view={center: [0, 0],zoom: 12,constrainResolution: true,projection: 'EPSG:4326'}} |

# events

> 事件

## load

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

## click

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
        console.log(evt.coordinate)
        console.log(map.getEventPixel(evt.originalEvent))
      }
    }
  }
</script>
```



## changeZoom

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
        console.log(evt.map.getView().getZoom())
      }
    }
  }
</script>
```



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

# methods

> 方法

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

