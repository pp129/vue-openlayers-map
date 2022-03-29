# GraphicLayer

```javascript
import {VGraphicLayer} from 'vue-openlayers-map'
```

实际上是一个资源为[ImageCanvasSource](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageCanvas-ImageCanvasSource.html)生成的[ImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html)。建议用于非常大量的矢量数据渲染。


## props

> 参数

[继承参数查看](LAYER_PROPS.md)

| 参数       | 类型   | 默认值                    | 描述                                                         |
| ---------- | ------ | ------------------------- | ------------------------------------------------------------ |
| `layerId`  | String | `graphic-layer-${uuid()}` | 图层id                                                       |
| `features` | Array  | `[]`                      | 图层中的要素集合，单个要素参数参考：[feature](FEATURE_OPTS.md) |
