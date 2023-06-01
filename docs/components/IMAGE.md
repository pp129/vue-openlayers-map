# 图像图层 v-image


可用于任意范围和分辨率的图像渲染图层。

```javascript
import { VImage } from 'v-ol-map'
```

## 参数 props

[继承参数查看](LAYER_PROPS.md)

| 参数         | 类型      | 默认值                                                                                                                                                                                                                                                                          | 描述                                                                                          |
|------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| `layerId`  | String  | `tile-layer-${uuid()}`                                                                                                                                                                                                                                                       | 图层id                                                                                        |
| `geoImage` | Boolean | `false`                                                                                                                                                                                                                                                                      | 是否采用[ol-ext的GeoImage](https://viglino.github.io/ol-ext/examples/layer/map.geoimage.html)图层。 |
| `source`   | Object  | 若`geoImage`不设置或为`false`。`source`参数参考 [ol/source/ImageStatic](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageStatic-Static.html)。若`geoImage`为 `true`时，`source`参数参考[ol.source. GeoImage](http://viglino.github.io/ol-ext/doc/doc-pages/ol.source.GeoImage.html) |                                                                                             |
