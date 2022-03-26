```javascript
import {VGraphicLayer} from 'vue-openlayers-map'
```

实际上是一个资源为[ImageCanvasSource](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageCanvas-ImageCanvasSource.html)生成的[ImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html)。建议用于非常大量的矢量数据渲染。

# props

> 参数

[继承参数查看](LAYER_PROPS.md)

| 参数           | 类型                                                         | 默认值                    | 描述                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| `layerId`      | String                                                       | `graphic-layer-${uuid()}` | 图层id                                                       |
| `features`     | Array                                                        | `[]`                      | 图层中的要素集合，单个要素参数参考：[feature](FEATURE_OPTS.md) |
| `FeatureStyle` | [ module:ol/style/Style~StyleLike](https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleLike) / `null` / `undefined` | `undefined`               | 图层样式。当设置为 时`null`，只有具有自己风格的特征才会被渲染。[`module:ol/style/Style~Style`](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html)如果未设置，请参阅将使用的默认样式。 |

如果单个feature中没有设置`style`，图层中点样式将被`FeatureStyle`的样式统一设置。如果`FeatureStyle`和单个feature中都没有设置`style`，点样式将被设置成默认的纯颜色圆点。