# 矢量图层 v-vector

矢量数据在客户端呈现为矢量。即使在动画期间，这种图层类型也能提供最准确的渲染。点和标签在旋转视图上保持直立。对于非常大量的矢量数据，在平移和缩放动画期间性能可能会受到影响。在这种情况下，请尝试
[`module:ol/layer/VectorImage~VectorImageLayer`](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorImage-VectorImageLayer.html)
--- 对应[`v-graphic`](GRAPHIC.md)组件

```javascript
import { VVector } from 'v-ol-map'
```

## 参数 props

[继承参数查看](LAYER_PROPS.md)

| 参数                                   | 类型                            | 默认值                      | 描述                                                                                                                                                             |
|--------------------------------------|-------------------------------|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `layerId`                            | String                        | `vector-layer-${uuid()}` | 图层id                                                                                                                                                           |
| `source`                             | Object / `undefined`          | `undefined`              | 资源。数据结构参考：[ol/source/Vector](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector.html)                                                             |
| `features`                           | Array                         | `[]`                     | 图层中的要素集合，单个要素参数参考：[feature](FEATURE.md)                                                                                                                        |
| `FeatureStyle`                       | Object / `null` / `undefined` | `undefined`              | 图层样式。当设置为 时`null`，只有具有自己风格的特征才会被渲染。[`module:ol/style/Style~Style`](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html)如果未设置，请参阅将使用的默认样式。 |
| `modify`                             | Object / Boolean              | `false`                  | 是否开启编辑，参数：[modify](#modify)                                                                                                                                    |
| <span id="cluster"></span> `cluster` | Object / Boolean              | `false`                  | 是否开启聚合，参数：[ol/source/Cluster](https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html)                                                   |

### 编辑 modify

modify.style 参考：[style](FEATURE.md#feature.style)


## 可调用方法 methods

| 方法名                                     | 说明                                                      | 参数                                                                            |
|-----------------------------------------|---------------------------------------------------------|-------------------------------------------------------------------------------|
| [updateFeatureById](#updateFeatureByid) | 有些时候不想改动原始数据来改变图层中要素属性，可以使用此方法。在使用此方法前需保证生成的要素带有`id`属性。 | (`id`, `update`) 接收两个参数，1. 要素id。2. 要素更新内容(key,value)。可选key：`position`、`style` |
| [getFeatureById](#getFeatureById)       | 根据要素ID获取当前图层上的要素                                        | (`id`) 要素id                                                                   |

### updateFeatureById

`update.poition`更新要素位置。值为经纬度数组。

`update.style`更新要素样式。值为样式对象。

```javascript
this.$refs.layer.updateFeatureById(feature.id, { position: position })
```

### getFeatureById

```javascript
const feature = this.$refs.layer.getFeatureById(id)
```

## 事件 events

| 事件名称         | 说明       | 会调参数              |
|--------------|----------|-------------------|
| load         | 图层加载完成回调 | -                 |
| modifyStart  | 开始编辑的回调  | (evt,map)         |
| modifyEnd    | 编辑结束时的回调 | (evt,map)         |
| modifyChange | 编辑进行时的回调 | (evt,map,feature) |
| singleclick  | 点击事件     | (evt,feature)     |
| pointermove  | 鼠标悬浮事件   | (evt,feature)     |


## 示例

### 加载矢量图层、在该图层上生成点、线、面 use

```vue
<template>
  <v-map ：view="view">
    <v-vector v-for="layer in layers" :key="layer.id" :ref="layer.id" :layer-id="layer.id"  :visible="layer.visible" :features="layer.features"></v-vector>
  </v-map>
</template>
<script>
export default {
  data(){
    return {
      view: {
        center: [118.045456, 24.567489],
        zoom: 10
      },
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

### 编辑要素

```vue
<template>
<div class="home">
  <button class="btn-modify" @click="modify = !modify">{{ modify?'取消编辑':'激活编辑' }}</button>
  <v-map ref="map" :view="view" default-tile="BD">
    <!-- 弹框初始化位置在圆形边界，需要layer图层加载完成后获取要素信息 -->
    <v-vector v-if="overlayLoad" ref="layer" :modify="modify?modifyOptions:false" :features="features" @load="load" @modifyChange="change"></v-vector>
    <!-- 先生成弹框再加载图层 -->
    <v-overlay class="overlay" :position="position" @load="onOverlayLoad">
      半径：{{radius}}米
    </v-overlay>
  </v-map>
</div>
</template>

<script>
export default {
  name: 'modify',
  data () {
    return {
      view: {
        city: 'xiamen',
        zoom: 12
      },
      modify: true,
      modifyOptions: {
        style: {
          stroke: {
            color: 'yellow'
          },
          fill: {
            color: 'black'
          }
        }
      },
      features: [
        {
          id: 'circle',
          type: 'circle',
          center: [118.11921478793144, 24.49890150072479],
          radius: 500,
          style: {
            stroke: {
              color: 'red'
            },
            fill: {
              color: 'green'
            }
          }
        }
      ],
      position: undefined,
      radius: 0,
      overlayLoad: false
    }
  },
  methods: {
    load (layer, map) {
      const circle = this.$refs.layer.getFeatureById('circle')
      const geometry = circle.getGeometry()
      const radius = geometry.getRadius() // 半径
      const metersPerUnit = map.getView().getProjection().getMetersPerUnit() // 半径以米为单位
      const extent = geometry.getExtent()
      this.position = [extent[2], (extent[3] + extent[1]) / 2]
      this.radius = (radius * metersPerUnit).toFixed(2)
    },
    onOverlayLoad () {
      this.overlayLoad = true
    },
    change (evt, map) {
      const geometry = evt.target
      this.setPosition(geometry, map)
    },
    setPosition (geometry, map) {
      const radius = geometry.getRadius() // 半径
      const metersPerUnit = map.getView().getProjection().getMetersPerUnit() // 半径以米为单位
      const extent = geometry.getExtent()
      this.position = [extent[2], (extent[3] + extent[1]) / 2]
      this.radius = (radius * metersPerUnit).toFixed(2)
    }
  }
}
</script>

<style lang="scss">
.btn-modify{
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 9;
}
.overlay{
  background: white;
  color: black;
  border: 1px solid blue;
  display: inline;
  padding: 2px;
}
</style>

```
