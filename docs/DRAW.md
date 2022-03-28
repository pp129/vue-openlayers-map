# Draw

```javascript
import { VDraw } from 'vue-openlayers-map'
```

在一个矢量图层上添加一个绘制事件。绘制图层的图层参数继承[LayerProps](LAYER_PROPS.md)。

## props

| 参数             | 类型      | 默认值          | 描述                                                         |
| ---------------- | --------- | --------------- | ------------------------------------------------------------ |
| type             | String    | -               | 使用此实例绘制的几何图形的几何类型。[可选值参考](#props.type) |
| clickTolerance   | Number    | `6`             | “向上”事件的“向下”和“向上”之间的最大像素距离被视为“点击”事件，并实际上将一个点/顶点添加到正在绘制的几何图形。为绘图交互选择了默认值，`6` 以便在鼠标和触摸设备上正确运行。 |
| features         | Array     | `[]`            | 绘制特征的目标集合。                                         |
| source           | Object    | `{features:[]}` | 绘制要素的目标源。                                           |
| dragVertexDelay  | Number    | `500`           | 在可以将当前顶点拖动到其确切位置之前，在指针向下之后的毫秒延迟。 |
| snapTolerance    | Number    | `12`            | 捕捉到绘图完成的像素距离。必须大于`0`。                      |
| stopClick        | Boolean   | `false`         | 停止在绘图期间触发单击、单击和双击事件。                     |
| maxPoints        | Number    | `undefined`     | 在完成多边形环或线串之前可以绘制的点数。默认情况下没有限制。 |
| minPoints        | Number    | `undefined`     | 在完成多边形环或线串之前必须绘制的点数。默认`3`用于多边形环和`2`线串。 |
| featureStyle     | Object    | -               | 草图特征的样式。                                             |
| geometryFunction | Funnction | -               | 几何坐标更新时调用的函数。                                   |
| geometryName     | String    | `undefined`     | 用于绘制交互创建的特征的几何名称。                           |
| freehand         | Boolean   | `false`         | 以手绘模式操作线条、多边形和圆形。这使得交互始终以手绘模式运行 |
| wrapX            | Boolean   | `false`         | 在草图叠加层上水平包裹世界。                                 |
| endRight         | Boolean   | `false`         | 是否右键结束                                                 |
| editable         | Boolean   | `false`         | 是否可编辑                                                   |
| clear            | Boolean   | `false`         | 是绘制前清除上一次记录                                       |
|                  |           |                 |                                                              |

### props.type

- `Point`点
- `LineString`线
- `LinearRing`
- `Polygon`面
- `MultiPoint`多个点
- `MultiLineString`多条线
- `MultiPolygon`多个面
- `GeometryCollection`
- `Circle`圆

## events

> 事件

### drawstart

绘制开始事件

### drawend

绘制结束事件

### modifystart

编辑开始事件

### modifyend

编辑结束事件