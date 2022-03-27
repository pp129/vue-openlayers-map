# props

> 要素参数

| 参数          | 说明                                                | 是否必填 | 类型   | 可选值                                                       | 默认值 |
| ------------- | --------------------------------------------------- | -------- | ------ | ------------------------------------------------------------ | ------ |
| `id`          | 要素id                                              | 否       | String | -                                                            | -      |
| `type`        | 要素类型                                            | 否       | String | `point`/`polygon`/`polyline`/`circle`                        | -      |
| `coordinates` | 经纬度/经纬度集合                                   | 是       | Array  | -                                                            | -      |
| `style`       | 要素样式                                            | 否       | Object | 继承 [ol/style](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html) | -      |
| `convert`     | 经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转 | 否       | String | `bd-84`/`bd-gd`/`gd-84`/`gd-bd`/`84-gd`/`84-bd`              | -      |
| `radius`      | 当`type`为`circle`时，圆形半径                      | 是       | Number | -                                                            | -      |

**组件会利用 [ol/feature/set](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#set) 方法将所有设置进要素携带属性。可以通过 [ol/feature/get](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#get) 主动获取所有属性值。任意可观察的属性。可以使用`#get()`和访问`#set()`。**

