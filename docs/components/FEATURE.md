# 要素 Feature

考虑到减少组件嵌套的层级，从设计上并没有针对feature及source做组件封装，而是将二者合并在Layer中作为传入参数来生成。

## 参数 props

| 参数          | 说明                                 | 类型            | 可选值                                             | 默认值     |
|-------------|------------------------------------|---------------|-------------------------------------------------|---------|
| type        | 要素类型                               | String        | `point`/`polygon`/`polyline`/`circle`           | `point` |
| convert     | 坐标系转化。支持：百度(bd)、高德(gd)、wgs84(84)互转 | String        | `bd-84`/`bd-gd`/`gd-84`/`gd-bd`/`84-gd`/`84-bd` |         |
| coordinates | 坐标/坐标集合                            | Array<number> | -                                               | -       |
| style       | 要素样式                               | Object        | [feature.style](#featureStyle)                  | -       |
| center      | 当要素`type`为`circle`时，需要设置圆形中心点      | Array<number> | -                                               | -       |
| radius      | 当要素`type`为`circle`时，需要设置圆形半径（米）    | Number        | -                                               | -       |
| flash       | 对点类型要素加上光晕动画。                      | Object        | [feature.flash](#featureFlash)                  | -       |

### feature.style

<span id="featureStyle"></span>

| 参数            | 说明                                                                                                                                                                                                                                                                                                                                                   | 类型       | 可选值                                                                                                         | 默认值                                                    |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| fill          | 填充样式。                                                                                                                                                                                                                                                                                                                                                | Object   | [module:ol/style/Fill~Fill](https://openlayers.org/en/latest/apidoc/module-ol_style_Fill-Fill.html)         | `{color: 'rgba(67,126,255,0.15)'}`                     |
| icon          | 矢量图标样式。                                                                                                                                                                                                                                                                                                                                              | Object   | [ol/style/Icon](https://openlayers.org/en/latest/apidoc/module-ol_style_Icon.html)                          | -                                                      |
| stroke        | 笔画风格。                                                                                                                                                                                                                                                                                                                                                | Object   | [module:ol/style/Stroke~Stroke](https://openlayers.org/en/latest/apidoc/module-ol_style_Stroke-Stroke.html) | `{color: 'rgba(67,126,255,1)',   width: 1}`            |
| text          | 文字样式。                                                                                                                                                                                                                                                                                                                                                | Object   | [module:ol/style/Text~Text](https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html)         | `{font: '14px sans-serif',   padding: [2, 5, 2, 5]  }` |
| circle        | 矢量圆形样式。                                                                                                                                                                                                                                                                                                                                              | Object   | [ol/style/Circle](https://openlayers.org/en/latest/apidoc/module-ol_style_Circle.html)                      | `{radius:2,fill:{color:'blue'}}`                       |
| styleFunction | 一个函数，参数包含一个[`module:ol/Feature~Feature`](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html)、一个`{number}` 表示视图分辨率的函数、一个地图对象、一个[样式对象](#feature.style)。该函数应返回 [`module:ol/style/Style~Style`](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html)它们的一个或一个数组。通过这种方式，例如可以设置矢量图层的样式。如果函数返回`undefined`，则不会呈现该特征。 | Function | [StyleFunction](https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleFunction)          | `undefined`                                            |
| arrow         | 对线类型要素加上线内箭头。                                                                                                                                                                                                                                                                                                                                        | Object   | [style.arrow](#styleArrow)                                                                                  | -                                                      |

#### style.arrow

<span id="styleArrow"></span>

| 参数    | 说明                          | 类型     | 可选值                                                                                | 默认值  |
|-------|-----------------------------|--------|------------------------------------------------------------------------------------|------|
| icon  | 箭头图标                        | Object | [ol/style/Icon](https://openlayers.org/en/latest/apidoc/module-ol_style_Icon.html) |      |
| pixel | 方向箭头之间的像素距离，单位像素。数值越小，箭头越密集 | Number |                                                                                    | `50` |


### feature.flash

<span id="featureFlash"></span>

| 参数    | 说明           | 类型     | 可选值                                                                                | 默认值                  |
|-------|--------------|--------|------------------------------------------------------------------------------------|----------------------|
| rate  | 频率，光晕每秒的发散频率 | Number | [ol/style/Icon](https://openlayers.org/en/latest/apidoc/module-ol_style_Icon.html) | `3`                  |
| color | 光晕颜色         | String |                                                                                    | `rgba(255, 0, 0, 1)` |
