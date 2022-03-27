# Layer Props

包含：瓦片图层VTileLayer、矢量图层VVectorLayer、聚合图层VClusterLayer、热力图VHeatmapLayer、图形图层VGraphicLayer共同继承的图层参数。

## props

> 参数

| 参数            | 类型                                                         | 默认值       | 描述                                               |
| --------------- | ------------------------------------------------------------ | ------------ | -------------------------------------------------- |
| `className`     | String                                                       | `'ol-layer'` | 要设置为图层元素的 CSS 类名称。                    |
| `opacity`       | Number                                                       | `1`          | 不透明度 (0, 1)。                                  |
| `visible`       | Boolean                                                      | `true`       | 是否显示图层。                                     |
| `extent`        | [ module:ol/extent~Extent](https://openlayers.org/en/latest/apidoc/module-ol_extent.html#~Extent)  / `undefined` | `undefined`  | 图层渲染的边界范围。该层将不会在此范围之外渲染。   |
| `zIndex`        | Number / `undefined`                                         | `undefined`  | 图层渲染的 z-index。                               |
| `minResolution` | Number / `undefined`                                         | -            | 此图层可见的最小分辨率（含）。                     |
| `maxResolution` | Number / `undefined`                                         | -            | 低于该层可见的最大分辨率（不包括）。               |
| `minZoom`       | Number / `undefined`                                         | -            | 此图层可见的最小视图缩放级别（不包括）。           |
| `maxZoom`       | Number / `undefined`                                         | -            | 此图层可见的最大视图缩放级别（包括）。             |
| `properties`    | Object /  `undefined`                                        | -            | 任意可观察的属性。可以使用`#get()`和访问`#set()`。 |

