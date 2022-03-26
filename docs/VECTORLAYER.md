```javascript
import { VVectorLayer } from 'vue-openlayers-map'
```

矢量数据在客户端呈现为矢量。即使在动画期间，这种图层类型也能提供最准确的渲染。点和标签在旋转视图上保持直立。对于非常大量的矢量数据，在平移和缩放动画期间性能可能会受到影响。在这种情况下，请尝试[`module:ol/layer/VectorImage~VectorImageLayer`](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorImage-VectorImageLayer.html).

# props

> 参数

[继承参数查看](LAYER_PROPS.md)

| 参数           | 类型                                                         | 默认值                   | 描述                                                         |
| -------------- | ------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------ |
| `layerId`      | String                                                       | `vector-layer-${uuid()}` | 图层id                                                       |
| `source`       | [module:ol/source/Vector~VectorSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html) / `undefined` | `undefined`              | 资源。                                                       |
| `features`     | Array                                                        | `[]`                     | 图层中的要素集合，单个要素参数参考：[feature](FEATURE_OPTS.md) |
| `FeatureStyle` | [ module:ol/style/Style~StyleLike](https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleLike) / `null` / `undefined` | `undefined`              | 图层样式。当设置为 时`null`，只有具有自己风格的特征才会被渲染。[`module:ol/style/Style~Style`](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html)如果未设置，请参阅将使用的默认样式。 |

# use

```vue
<template>
  <v-map>
    <v-vector-layer v-for="layer in layers" :key="layer.id" :ref="layer.id" :layer-id="layer.id"  :visible="layer.visible" :features="layer.features"></v-vector-layer>
  </v-map>
</template>
<script>
import { VMap, VVectorLayer } from 'vue-openlayers-map'
export default {
  data(){
    return {
       layers: [
        {
          id: 'layer1',
          visible: true,
          features: [
            {
              id: 'point1',
              coordinates: [118.140448, 24.512917],
              convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
              style: {
                icon: {
                  scale: 0.6,
                  src: require('@/assets/img/point_6.png')
                },
                text: {
                  text: '百度转84',
                  font: '13px sans-serif',
                  fill: {
                    color: '#3d73e8'
                  },
                  backgroundFill: {
                    color: '#ffffff'
                  },
                  stroke: {
                    color: '#ffffff',
                    width: 1
                  },
                  backgroundStroke: {
                    color: '#000000',
                    width: 1
                  },
                  offsetX: 0,
                  offsetY: 30
                },
                styleFunction: function (feature, resolution, map, style) {
                  const viewZoom = map.getView().getZoom()
                  const minZoom = 12
                  const maxZoom = 16
                  const textStyle = style.getText()
                  if (viewZoom >= 14) {
                    textStyle.setText('百度转84')
                  }
                  if (viewZoom >= 15) {
                    textStyle.setText('根据层级显示不同内容')
                  }
                  style.setText(textStyle)
                  return minZoom <= viewZoom && viewZoom <= maxZoom ? style : null
                }
              },
              properties: {
                name: 'feature1'
              }
            }
          ]
        },
        {
          id: 'layer2',
          visible: true,
          features: []
        },
        {
          id: 'polygon',
          visible: true,
          features: [
            {
              type: 'polygon', // 除了普通icon点位，其他元素需注明元素类型
              style: {
                fill: {
                  color: 'rgba(67,126,152,0.15)'
                },
                stroke: {
                  color: 'rgba(67,126,255,1)',
                  width: 1,
                  lineDash: [20, 10, 20, 10]
                },
                text: {
                  text: '多边形',
                  font: '13px sans-serif',
                  fill: {
                    color: '#3d73e8'
                  }
                }
              },
              updateStyle: {
                fill: {
                  color: 'rgba(4,3,43,0.5)'
                }
              },
              coordinates: [
                [118.23048075355373, 24.587052571002776], [118.25051461705989, 24.592192894082423],
                [118.24383041710121, 24.561810933485354], [118.23048075355373, 24.587052571002776]
              ]
            },
            {
              type: 'polyline',
              style: {
                stroke: {
                  color: 'rgba(220,171,119,1)',
                  width: 2
                  // lineDash: [20, 10, 20, 10]
                },
                text: {
                  text: 'line'
                }
              },
              coordinates: [[118.20513460817911, 24.6005204040184], [118.22511304202654, 24.607323827184675], [118.22998527470209, 24.627570481933592]]
            },
            {
              type: 'circle',
              center: [118.25945470514871, 24.608883531726836],
              radius: 500,
              style: {
                text: {
                  text: '圆形'
                }
              }
            }
          ]
        }
      ]
    }
  }
}
</script>	
```

