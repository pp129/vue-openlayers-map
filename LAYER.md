# VectorLayer

当[layer.type](DEV.md/#layer)未填或值为VectorLayer时，图层为矢量图层。

继承 ol/layer/Vector

官方文档：https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html

## source

继承 ol/source/Vector

官方文档：https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html

### features

| 说明     | 是否必填 | 类型  | 可选值 | 默认值 |
| -------- | -------- | ----- | ------ | ------ |
| 要素集合 | 否       | Array | -      | -      |

#### feature

二次封装参数说明

| 参数        | 说明                                                | 是否必填 | 类型   | 可选值                                                       | 默认值 |
| ----------- | --------------------------------------------------- | -------- | ------ | ------------------------------------------------------------ | ------ |
| id          | 要素id                                              | 否       | String | -                                                            | -      |
| type        | 要素类型                                            | 否       | String | point/polygon/polyline/circle                                | -      |
| coordinates | 经纬度/经纬度集合                                   | 是       | Array  | -                                                            | -      |
| style       | 要素样式                                            | 否       | Object | 继承 [ol/style](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html) | -      |
| convert     | 经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转 | 否       | String | bd-84/bd-gd/gd-84/gd-bd/84-gd/84-bd                          | -      |
| radius      | 当要素类型为圆时，圆形半径                          | 是       | Number | -                                                            | -      |

**组件会利用 [ol/feature/set](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#set) 方法将所有设置进要素携带属性。可以通过 [ol/feature/get](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#get) 主动获取所有属性值。**

```js
const option = {
  layers:[
    {
      id:'features',
      source: {
        features:[
          {
            id: 'point1',
            coordinates: [118.140448, 24.512917],
            convert: 'bd-84', // 特殊属性，经纬度转化。支持：百度(bd)、高德(gd)、wgs84(84)互转
            /**
             * 样式：https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html
             */
            style: {
              /**
               * 点位图标：https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html
               */
              icon: {
                scale: 0.6,
                src: require('@/assets/img/point_red.png')
              },
              /**
               * 文本样式：https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
               */
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
              /**
               * 要素样式自定义方法
               * @param feature
               * @param resolution
               * @param map
               * @param style
               * @returns {*|null}
               */
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
            // 需要附加在元素上的属性，一般用于点击获取点位信息，使用feature.get('properties')读取
            properties: {
              name: 'feature1'
            }
          },
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
    }
  ]
}
```



# cluster

当[layer.type](DEV.md/#layer)值为cluster时，图层为聚合图层。

继承 ol/source/Cluster

官方文档：https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html

```js
const option = {
  layers:[
    {
      id: 'cluster',
      type: 'cluster',
      visible: true,
      minZoom: 10,
      maxZoom: 16,
      /**
       * 聚合：https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html
       */
      cluster: {
        // 继承source
        source: {
          features: [
            {
              coordinates: [117.96768937292673, 24.51616895381355],
              style: {
                icon: {
                  src: require('@/assets/img/point_red.png')
                }
              }
            },
            {
              coordinates: [117.97481324839465, 24.502306340499445],
              style: {
                icon: {
                  src: require('@/assets/img/point_blue.png')
                }
              }
            }
          ],
          extent: [117.882223, 24.386902, 118.373857, 24.90727]
        },
        distance: 120, // 要素将聚集在一起的像素距离。
        minDistance: 1// 聚合之间的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不设置最小距离。此配置可用于避免重叠图标。作为权衡，聚合要素的位置将不再是其所有要素的中心。
      }
    }
  ]
}
```



# heatmap

当[layer.type](DEV.md/#layer)值为heatmap时，图层为热力图图层。

继承 ol/layer/Heatmap

官方文档：https://openlayers.org/en/latest/apidoc/module-ol_layer_Heatmap-Heatmap.html

```js
const option = {
  layers:[
    {
      id: 'heatmap',
      type: 'heatmap',
      visible: true,
      // 继承source
      source: {
        features: []
      },
      blur: 15, // 模糊大小 控制热力图热度深浅
      radius: 5, // 半径大小 点扩散的范围
      /**
       * 用于权重的特征属性或从特征返回权重的函数。权重值的范围应为 0 到 1（超出范围的值将被限制在该范围内）。
       * type: string | function
       * (defaults to 'weight')
       */
      weight: 'weight'
    }
  ]
}
```



# webGLPoints

当[layer.type](DEV.md/#layer)值为webGLPoints时，图层为webGL图层。

继承 ol/layer/WebGLPoints

```js
const option = {
  layers:[
    {
      id: 'webGLPoints',
        type: 'webGLPoints',
        visible: true,
        source: {
          features: features
        },
        symbol: {
          symbolType: 'image',
          src: require('@/assets/img/car.png'),
          size: [18, 28],
          color: 'lightyellow',
          rotateWithView: false,
          offset: [0, 9]
        }
    }
  ]
}
```


