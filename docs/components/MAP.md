# 地图组件 v-map

```vue
<template>
  <v-map :height="height" :width="width" :view="view"></v-map>
</template>
<script>
export default {
  data () {
    return {
      width: '1920px',
      height: '1080px',
      view: {
        center: [118.045456, 24.567489],//中心点，厦门
        // city: 'xiamen', // 优先级高于center
        city: '厦门', // 支持城市中文/拼音全拼
        zoom: 10, //地图加载完成时显示层级
        maxZoom: 18 //最大可缩放层级
      }
    }
  }
}
</script>
```

## 宽 width

未设置宽度时默认宽度为100%，需要父节点有宽度，否则地图容器无法撑开。

| 说明     | 是否必填 | 类型                | 可选值 | 默认值    |
|--------|------|-------------------|-----|--------|
| 地图容器宽度 | 否    | `String`/`Number` | -   | `100%` |
## 高 height

未设置宽度时默认高度为100%，需要父节点有高度，否则地图容器无法撑开。

| 说明     | 是否必填 | 类型                | 可选值 | 默认值    |
|--------|------|-------------------|-----|--------|
| 地图容器高度 | 否    | `String`/`Number` | -   | `100%` |

```vue
<template>
  <div style="width:100%;height:100%;">
    <v-map></v-map>
  </div>	
</template>
```
## 地图容器标识 target

| 说明         | 是否必填       | 类型       | 可选值 | 默认值           |
|:-----------|:-----------|----------|:---:|---------------|
| 地图容器的唯一标识。 | 否，多地图时避免重复 | `String` |  -  | `map-${uuid}` |

<span id="view"></span>
## 视图 view

| 说明  | 是否必填 | 类型     | 可选值                                                                           | 默认值                                                                                                  |
|-----|------|--------|-------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 视图  | 否    | Object | 继承[ol/view](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) | `{view={center: [108.552500, 34.322700],zoom: 5,constrainResolution: true,projection: 'EPSG:4326'}}` |


### 扩展属性

`view.city` 城市名称/拼音，优先级高于`center`,无法识别的城市定向到`view.center`,若`view.center`未设置则定位到`[108.552500, 34.322700]`（中国范围中心点）

### 监听view属性

已实现的监听属性： 

- [x] center 中心点变化监听
- [x] zoom 层级变化监听
- [x] constrainRotation 旋转约束
- [x] maxZoom 限制最大层级
- [x] minZoom 限制最小层级

<span id="controls"></span>
## 控制 controls

默认值说明：不显示层级操作按钮、不显示视图旋转按钮。

| 说明  | 是否必填 | 类型     | 可选值                                                                             | 默认值                                       |
|-----|------|--------|---------------------------------------------------------------------------------|-------------------------------------------|
| 控件  | 否    | Object | 继承 [ol/control](https://openlayers.org/en/latest/apidoc/module-ol_control.html) | `{controls={zoom: false, rotate: false}}` |

### 监听controls属性

已实现的监听属性：

- [x] zoom 是否显示层级变化操作图标
- [x] rotate 是否显示旋转图标
- [x] attribution 是否显示归属说明
- [x] FullScreen 是否显示全屏图标
- [x] ScaleLine 是否显示刻度线
- [x] ZoomSlider 是否显示层级变化滑块

<span id="interactions"></span>
## 交互 interactions

| 说明     | 是否必填 | 类型     | 可选值                                                                                      | 默认值 |
|--------|------|--------|------------------------------------------------------------------------------------------|-----|
| 地图交互功能 | 否    | Object | 继承 [ol/interactions](https://openlayers.org/en/latest/apidoc/module-ol_interaction.html) | -   |

<span id="cesiumMap"></span>
<span id="events"></span>
## 事件 events

| 事件名         | 说明         | 参数                                                                                                                                   |
|-------------|------------|--------------------------------------------------------------------------------------------------------------------------------------|
| load        | 地图对象生成完成事件 | -                                                                                                                                    |
| click       | 点击事件       | (evt, map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。 |
| singleclick | 点击事件       | (evt, map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。 |
| dblclick    | 双击事件       | (evt, map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。 |
| changeZoom  | 层级变化事件     | (evt,map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。  |
| pointermove | 鼠标悬停事件     | (evt,map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。  |
| contextmenu | 鼠标右键点击事件   | (evt,map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。  |
| postrender  | 渲染完成事件     | (evt,map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。  |
| movestart   | 地图开始移动事件   | (evt,map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。  |
| moveend     | 地图移动完成事件   | (evt,map)接受2个参数。1、事件实例 [模块：ol/MapEvent~MapEvent](https://openlayers.org/en/latest/apidoc/module-ol_MapEvent-MapEvent.html) 。2、地图实例。  |


<span id="methods"></span>
## 方法 methods

| 方法名                                     | 说明                             | 参数                                                                                                    |
|-----------------------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------|
| [panTo](#panTo)                         | 移动视图动画                         | {center:中心点数组,zoom:缩放层级数字}接受一个对象参数。                                                                   |
| [getDistancePoint](#getDistancePoint)   | 获取两点之间距离                       | (from, to, units)接受三个参数，1、起点经纬度，2、终点经纬度，3、距离单位                                                        |
| [getDistanceString](#getDistanceString) | 计算折线长度                         | (lines, units)接受两个参数，1、折线经纬度集合，2、长度单位                                                                 |
| [getCenterByExtent](#getCenterByExtent) | 获取区域中心点                        | (extent)接受一个数组参数。区域范围经纬度集合。                                                                           |
| [calculateCenter](#calculateCenter)     | 获取几何图形中心点                      | ([geometry](https://openlayers.org/en/latest/apidoc/module-ol_geom_Geometry-Geometry.html))接受几何形成类参数。 |
| [exportPNG](#exportPNG)                 | 将当前视图内的地图（包括图层、要素）转成png格式图片导出。 | （pngName）接受一个参数，要导出的图片文件名。                                                                            |
| [closeOverlays](#closeOverlays)         | 关闭所有弹框。                        |                                                                                                       |

### 地图中心移动动画 panTo

`param.center`中心点数组。

`param.zoom`缩放层级数字。

```js
const param = {
  center: [118,24],//中心点
  zoom: 12//层级
}
this.$refs.map.panTo(param)
```

### 得到两点间距离 getDistancePoint

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

### 获取区域中心点 getCenterByExtent

```js
// 多边形经纬度集合
const polygonFeature = feature.getGeometry().getExtent()
// 多边形中心点
const center = this.$refs.map.getCenterByExtent(polygonFeature)
```

### 获取要素中心点 calculateCenter
```javascript
// 要素的几何图形
const geometry = feature.getGeometry()
// 多边形中心点
const center = this.$refs.map.calculateCenter(geometry)
```
### 图片导出 exportPNG

```javascript
/**
 * @param name 图片名称，可缺省
 */
this.$refs.map.exportPNG('xm')
```

### 关闭所有弹框 closeOverlays

```javascript
this.$refs.map.closeOverlays()
```
