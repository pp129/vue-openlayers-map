# ClusterLayer

```javascript
import { VClusterLayer } from 'vue-openlayers-map'
```

用于聚合类矢量数据的图层。

## props

> 参数

[继承参数查看](LAYER_PROPS.md)

| 参数           | 类型                                                         | 默认值                    | 描述                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| `layerId`      | String                                                       | `cluster-layer-${uuid()}` | 图层id                                                       |
| `source`       | [module:ol/source/Vector~VectorSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html) / `undefined` | `undefined`               | 资源。                                                       |
| `features`     | Array                                                        | `[]`                      | 图层中的要素集合，单个要素参数参考：[feature](FEATURE_OPTS.md) |
| `FeatureStyle` | [ module:ol/style/Style~StyleLike](https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleLike) / `null` / `undefined` | `undefined`               | 图层样式。当设置为 时`null`，只有具有自己风格的特征才会被渲染。[`module:ol/style/Style~Style`](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html)如果未设置，请参阅将使用的默认样式。 |
| `distance`     | Number                                                       | `20`                      | 要素将聚集在一起的像素距离。                                 |
| `minDistance`  | Number                                                       | `0`                       | 设置聚合的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不保证最小距离。此配置可用于避免重叠图标。作为权衡，集群要素的位置将不再是其所有要素的中心。 |

