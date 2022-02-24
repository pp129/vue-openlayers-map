# 起步

## 安装
```bash
npm install vue-openlayers-map
```

## 全局引用
```js
import VMap from 'vue-openlayers-map'
Vue.use(VMap)
```

## 按需加载
```js
import { VMap } from 'vue-openlayers-map'
```

## 加载地图

```vue
<template>
  <div class="home">
    <v-map ref="map" :height="height" :width="width" :option="option"></v-map>
  </div>
</template>
<script>
import { VMap } from 'vue-openlayers-map'
export default {
  name: 'Home',
  components: {
    VMap
  },
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


# 配置与说明

## target

地图容器对象，唯一标识

| 属性     | 必填                       | 类型     | 默认值     |
|--------|--------------------------|--------|---------|
| target | 单页面生成单个地图时不必填，多地图时必填且不重复 | String | `'map'` |

## controls

控件。继承[control](https://openlayers.org/en/latest/apidoc/module-ol_control.html)

| 属性       | 必填  | 类型  | 默认值                                       |
|----------|-----|-----|-------------------------------------------|
| controls | 不必填 | 对象  | `{controls={zoom: false, rotate: false}}` |

## baseTile

基础瓦片图层

| 属性       | 必填  | 类型  | 默认值      |
|----------|-----|-----|----------|
| baseTile | 不必填 | 数组  | `['td']` |

### 瓦片图层参数：

#### 已封装的图层

1、天地图-矢量：`'td'`

2、天地图-影像：`'td_img'`

3、百度-矢量：`'bd'`

### 自定义图层参数

支持自定义加载瓦片图层，加载图层仅支持xyz类型

| 属性     | 说明                                                                             | 必填  | 类型     | 可选值   |
|--------|--------------------------------------------------------------------------------|-----|--------|-------|
| type   | 类型                                                                             | 必填  | String | `xyz` |
| name   | 名称                                                                             | 必填  | String |       |
| option | 继承[xyz](https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html) | 必填  | Arary  |       |



## visibleTile 

默认可视瓦片图层。多个基础图层情况下默认显示的图层,与baseTile中的元素对应

| 属性          | 必填  | 类型              | 默认值                           |
|-------------|-----|-----------------|-------------------------------|
| visibleTile | 不必填 | String / Object | [baseTile](##baseTile)中的第一个元素 |

## overview

鹰眼/缩略图。
参数内容可为字符串或对象，参考[baseTile](##baseTile)，不设置此属性或值为false则不显示鹰眼。

| 属性       | 必填  | 类型              |
|----------|-----|-----------------|
| overview | 不必填 | Array / Boolean |

**注意：在代码中只能新加一个配置项，不能直接=baseTile中的某个元素。**

```js
//错误示范
this.option.overview = this.option.baseTile[0]
//正确写法
this.option.overview = 'td'
```

## view

视图。继承[view](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) 

| 属性   | 必填  | 类型     | 默认值                                                                                  |
|------|-----|--------|--------------------------------------------------------------------------------------|
| view | 不必填 | Object | `{view={center: [0, 0],zoom: 12,constrainResolution: true,projection: 'EPSG:4326'}}` |

## layers

图层集合。

### layer

单个图层。继承 [Layer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html)

#### source 

继承 [VectorSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html)

##### features

要素。继承 [Feature](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html)

###### 扩展方法：

**update**：要素更新

使用:`feature.update(key,value);`

**注意：feature应为ol生成的feature类。不是配置中的单个feature对象。**

| key      | 说明  | 类型     | value     |
|----------|-----|--------|-----------|
| style    | 样式  | Object | 参考Style   |
| position | 位置  | Array  | [lon,lat] |


###### point

点类型要素。继承 [Point](https://openlayers.org/en/latest/apidoc/module-ol_geom_Point-Point.html)

扩展属性：

**convert**：经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转

例子：
```js
{
    coordinates: [118.140448, 24.512917],
    convert: 'bd-84' //百度转84
}
```
