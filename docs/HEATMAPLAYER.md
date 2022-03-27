# HeatmapLayer

```javascript
import { VHeatmapLayer } from 'vue-openlayers-map'
```

用于将矢量数据渲染为热力图的图层。

## props

> 参数

[继承参数查看](LAYER_PROPS.md)

| 参数       | 类型                                                         | 默认值                                     | 描述                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| `layerId`  | String                                                       | `heatmap-layer-${uuid()}`                  | 图层id                                                       |
| `source`   | [module:ol/source/Vector~VectorSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html) / `undefined` | `undefined`                                | 资源。                                                       |
| `features` | Array                                                        | `[]`                                       | 图层中的要素集合，单个要素参数参考：[feature](FEATURE_OPTS.md) |
| `blur`     | Number                                                       | `15`                                       | 以像素为单位的模糊大小。                                     |
| `radius`   | Number                                                       | `8`                                        | 以像素为单位的半径大小。                                     |
| `weight`   | String /  Function                                           | `'weight'`                                 | 用于权重的特征属性或从特征返回权重的函数。权重值的范围应为 0 到 1（超出范围的值将被限制在该范围内）。 |
| `gradient` | Array                                                        | `['#00f', '#0ff', '#0f0', '#ff0', '#f00']` | 热力图的颜色渐变，指定为 CSS 颜色字符串数组。                |

