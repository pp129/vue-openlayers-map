# 绘制 v-draw

在一个矢量图层上添加一个绘制事件。绘制图层的图层参数继承[LayerProps](LAYER_PROPS.md)。

```javascript
import { VDraw } from 'v-ol-map'
```

## 参数 props

| 参数               | 类型        | 默认值             | 描述                                                                                          |
|------------------|-----------|-----------------|---------------------------------------------------------------------------------------------|
| type             | String    | -               | 使用此实例绘制的几何图形的几何类型。[可选值参考](#type)                                                            |
| clickTolerance   | Number    | `6`             | “向上”事件的“向下”和“向上”之间的最大像素距离被视为“点击”事件，并实际上将一个点/顶点添加到正在绘制的几何图形。为绘图交互选择了默认值，`6` 以便在鼠标和触摸设备上正确运行。 |
| features         | Array     | `[]`            | 绘制特征的目标集合。                                                                                  |
| source           | Object    | `{features:[]}` | 绘制要素的目标源。                                                                                   |
| dragVertexDelay  | Number    | `500`           | 在可以将当前顶点拖动到其确切位置之前，在指针向下之后的毫秒延迟。                                                            |
| snapTolerance    | Number    | `12`            | 捕捉到绘图完成的像素距离。必须大于`0`。                                                                       |
| stopClick        | Boolean   | `false`         | 停止在绘图期间触发单击、单击和双击事件。                                                                        |
| maxPoints        | Number    | `undefined`     | 在完成多边形环或线串之前可以绘制的点数。默认情况下没有限制。                                                              |
| minPoints        | Number    | `undefined`     | 在完成多边形环或线串之前必须绘制的点数。默认`3`用于多边形环和`2`线串。                                                      |
| featureStyle     | Object    | -               | 草图特征的样式。                                                                                    |
| geometryFunction | Funnction | -               | 几何坐标更新时调用的函数。                                                                               |
| geometryName     | String    | `undefined`     | 用于绘制交互创建的特征的几何名称。                                                                           |
| freehand         | Boolean   | `false`         | 以手绘模式操作线条、多边形和圆形。这使得交互始终以手绘模式运行                                                             |
| wrapX            | Boolean   | `false`         | 在草图叠加层上水平包裹世界。                                                                              |
| endRight         | Boolean   | `false`         | 是否右键结束                                                                                      |
| endDblclick      | Boolean   | `false`         | 是否双击结束                                                                                      |
| editable         | Boolean   | `false`         | 是否可编辑                                                                                       |
| clear            | Boolean   | `false`         | 是绘制前清除上一次记录                                                                                 |
| drawOnce         | Boolean   | `false`         | 结束绘制后不会自动开始下一次绘制                                                                            |
| arrow            | Object    | -               | 绘制线段是否带线内箭头。[可选值](#styleArrow)                                                              |

### type

[ol/geom/Geometry~Type](https://openlayers.org/en/latest/apidoc/module-ol_geom_Geometry.html#~Type)

- `Point`点
- `LineString`线
- `LinearRing`
- `Polygon`面
- `MultiPoint`多个点
- `MultiLineString`多条线
- `MultiPolygon`多个面
- `GeometryCollection`
- `Circle`圆
- `Star`星，默认五角星
  - `Star-${points}`，如`Star-6`为六角星

### arrow

<span id="styleArrow"></span>

| 参数    | 说明                          | 类型     | 可选值                                                                                | 默认值  |
|-------|-----------------------------|--------|------------------------------------------------------------------------------------|------|
| icon  | 箭头图标                        | Object | [ol/style/Icon](https://openlayers.org/en/latest/apidoc/module-ol_style_Icon.html) |      |
| pixel | 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集 | Number |                                                                                    | `50` |


## 事件 events

### drawstart

绘制开始事件

### drawend

绘制结束事件

### modifystart

编辑开始事件

### modifyend

编辑结束事件

## 绘制图层 use

``` vue
<template>
  <div id="app">
    <select id="draw" class="btn-draw" v-model="drawType" @change="changeInteractions">
      <option value="none">绘制图形</option>
      <option value="Point">Point</option>
      <option value="LineString">LineString</option>
      <option value="Polygon">Polygon</option>
      <option value="Circle">Circle</option>
      <option value="Rectangle">Rectangle</option>
      <option value="Square">Square</option>
    </select>
    <!-- @contextmenu.prevent 阻止鼠标右键默认事件，避免与点击右键结束绘制冲突 -->
    <v-map class="map" @contextmenu.prevent>
      <v-draw v-if="showInteraction" :type="interaction.type" :clear="interaction.clear" :freehand="interaction.freehand" :end-right="interaction.endRight" :editable="interaction.editable" @drawend="drawend"></v-draw>
    </v-map>
  </div>
</template>

<script>
import { VMap, VDraw } from 'vue-openlayers-map'

export default {
  name: 'App',
  components: {
    VMap,
    VDraw
  },
  data () {
    return {
      showInteraction: false,
      drawType: 'none',
      interaction: {
        type: '',
        clear: true,
        freehand: false,
        endRight: true,
        editable: true
      }
    }
  },
  methods: {
    changeInteractions () {
      if (this.drawType !== 'none') {
        this.interaction.type = this.drawType
        this.showInteraction = true
      } else {
        this.interaction.type = ''
        this.showInteraction = false
      }
    },
    drawend (evt) {
      // 获取绘制图形的经纬度集合
      console.log(evt.feature.getGeometry().getCoordinates())
    }
  }
}
</script>

<style lang="scss">
html,body{
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  position: relative;
}
.btn-draw{
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}
.map{
  z-index: 1;
}
</style>

```
