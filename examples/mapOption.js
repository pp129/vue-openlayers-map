export default {
  /**
   * 基础图层
   * @param {Array} [baseTile=['td']] 数组内元素可以是字符串或对象，默认天地图矢量图层
   */
  baseTile: [
    'td', // 天地图-矢量
    {
      type: 'td_img'// 天地图-影像
    },
    /**
     * 自定义图层 以天地图地形图为例
     * @param {String} [type]
     * @param {Array} [url]
     */
    {
      type: 'xyz',
      // 图层加载路径需符合XYZ规则
      url: [
        'http://t4.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      ]
    },
    'bd'
  ],
  visibleTile: 'td', // 多个基础图层情况下默认显示的图层,对应baseTile中元素，当元素类型为对象时指定对象中type的值
  /**
   * 鹰眼显示图层 值参考baseTile中元素，可以是字符串也可以是对象，不设置次属性或值为false则不显示鹰眼
   */
  overview: false,
  /**
   * 视图 view
   * 属性参考： https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
   */
  view: {
    center: [118.045456, 24.567489],
    zoom: 12,
    // 设置视图是否应允许中间缩放级别。true:鼠标缩放地图,每次缩放级别为整数1
    constrainResolution: true,
    // 地图加载初始动画
    animate: {
      center: [118.182395, 24.487288], // 中心点
      zoom: 14 // 级别
    }
  },
  /**
   * 图层 layer：https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html
   * 单个layer属性参考：https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html
   */
  layers: [
    /**
     * 示例图层
     * features为点
     */
    {
      id: 'layer1',
      visible: true,
      features: [
        {
          coordinates: [118.124728, 24.487902],
          style: {
            // 点位图标：https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html
            icon: {
              scale: 0.6,
              src: require('@/assets/img/point_red.png')
            },
            // 点位文字：https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
            text: {
              text: 'text',
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
            }
          },
          // 需要附加在元素上的属性，一般用于点击获取点位信息，使用feature.get('properties')读取
          properties: {
            name: 'feature1'
          }
        },
        {
          coordinates: [118.159440, 24.499776],
          style: {
            icon: {
              src: require('@/assets/img/point_red.png')
            }
          },
          properties: {
            name: 'feature2'
          }
        },
        {
          coordinates: [118.0501900989113, 24.58279368463898],
          style: {
            icon: {
              src: require('@/assets/img/point_blue.png')
            }
          },
          properties: {
            name: 'feature3'
          }
        },
        {
          coordinates: [118.17377442687904, 24.47150100874583],
          style: {
            // 点位图标：https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html
            icon: {
              scale: 0.6,
              src: require('@/assets/img/point_red.png')
            },
            // 点位文字：https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
            text: {
              text: '84点位',
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
            }
          }
        },
        {
          coordinates: [118.208004, 24.469997],
          style: {
            // 点位图标：https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html
            icon: {
              scale: 0.6,
              src: require('@/assets/img/point_red.png')
            },
            // 点位文字：https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html
            text: {
              text: '百度点位',
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
            }
          }
        }
      ]
    },
    /**
     * 示例图层 继承layer
     * features为多边形、折线、圆形
     */
    {
      id: 'polygon',
      visible: true,
      features: [
        {
          type: 'polygon', // 除了普通icon点位，其他元素需注明元素类型
          style: {
            fill: {
              color: 'rgba(167,26,12,0.15)'
            },
            stroke: {
              color: 'rgba(67,126,255,1)',
              width: 1,
              lineDash: [20, 10, 20, 10]
            }
          },
          updateStyle: {
            fill: {
              color: 'rgba(4,3,43,0.5)'
            }
          },
          coordinates: [[118.23048075355373, 24.587052571002776], [118.25051461705989, 24.592192894082423], [118.24383041710121, 24.561810933485354], [118.23048075355373, 24.587052571002776]]
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
          radius: 500
        }
      ]
    },
    /**
     * 示例图层 继承layer
     * 聚合
     */
    {
      id: 'cluster',
      type: 'cluster',
      visible: true,
      minZoom: 10,
      maxZoom: 16,
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
      // 聚合：https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html
      cluster: {
        distance: 120, // 要素将聚集在一起的像素距离。
        minDistance: 1// 聚合之间的最小距离（以像素为单位）。将被限制在配置的距离。默认情况下，不设置最小距离。此配置可用于避免重叠图标。作为权衡，聚合要素的位置将不再是其所有要素的中心。
      }
    },
    /**
     * 示例图层 继承layer
     * 热力图：https://openlayers.org/en/latest/apidoc/module-ol_layer_Heatmap-Heatmap.html
     */
    {
      id: 'heatmap',
      type: 'heatmap',
      visible: true,
      features: [
        {
          coordinates: [117.97453973475076, 24.61692211214447],
          weight: 0.7// 一般来说在元素上配置权重,默认为"weight"，Number类型。
        },
        {
          coordinates: [118.00639182661692, 24.57216235632966],
          weight: 0.8
        },
        {
          coordinates: [117.98525113645174, 24.57184088412666],
          weight: 0.6
        }
      ],
      blur: 100,
      radius: 100,
      /**
       * 用于权重的特征属性或从特征返回权重的函数。权重值的范围应为 0 到 1（超出范围的值将被限制在该范围内）。
       * type: string | function
       * (defaults to 'weight')
       */
      weight: 'weight'
    }
  ],
  /**
   * 叠加（弹框）https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html
   */
  overlays: [
    {
      id: 'overlay1',
      element: 'overlay1', // dom元素id
      position: undefined
    }
  ],
  /**
   * 除去默认的 https://openlayers.org/en/latest/apidoc/module-ol_interaction.html#~DefaultsOptions
   * 要新加的交互类型集合
   * 目前支持:
   * select选择要素功能
   * modify更改要素
   * draw绘制地理要素功能
   */
  interaction: [],
  measure: false,
  updateLayers: []// 想要局部更新的layers id最好不要重复
}
