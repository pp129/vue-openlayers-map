# Measure

```javascript
import { VMeasure } from 'vue-openlayers-map'
```

在一个矢量图层上添加一个测量事件。绘制图层的图层参数继承[LayerProps](LAYER_PROPS.md)。

## props

| 参数     | 类型    | 默认值  | 描述                                |
| -------- | ------- | ------- | ----------------------------------- |
| type     | String  | -       | 测量类型。[可选值参考](#props.type) |
| clear    | Boolean | `false` | 是绘制前清除上一次记录              |
| segments | Boolean | `false` | 是否显示分段测量值                  |
| endRight | Boolean | `false` | 是否右键结束                        |
|          |         |         |                                     |

### props.type

- `Polygon`面积
- `LineString`线长