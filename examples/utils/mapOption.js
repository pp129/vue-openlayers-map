export default {
  /**
   * 地图容器id
   * 可选
   * 单页面生成多地图时必填且不重复
   * @param {String} [target='map']
   */
  target: 'map',
  /**
   * 操作栏
   * 可选
   * 继承control：https://openlayers.org/en/latest/apidoc/module-ol_control.html
   * @param {Object} [controls={zoom: false, rotate: false}]
   */
  controls: {},
  /**
   * 基础图层
   * 可选
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
    'bd'// 百度
  ],
  /**
   * 默认可视切片
   * 多个基础图层情况下默认显示的图层,与baseTile中的元素对应
   * 可选
   * @param {String|Object} [visibleTile=baseTile[0]]
   */
  visibleTile: 'td',
  /**
   * 鹰眼显示图层
   * 参考baseTile中元素，可以是字符串也可以是对象，不设置此属性或值为false则不显示鹰眼
   */
  overview: 'td',
  /**
   * 视图 view
   * 继承view ： https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
   * 可选
   * @param {Object} [view={center: [0, 0],zoom: 12,constrainResolution: true,projection: 'EPSG:4326'}]
   */
  view: {
    center: [118.045456, 24.567489],
    zoom: 10,
    constrainResolution: true, // 设置视图是否应允许中间缩放级别。true:鼠标缩放地图,每次缩放级别为整数1
    /**
     * 地图加载初始动画
     * 继承AnimationOptions： https://openlayers.org/en/latest/apidoc/module-ol_View.html#~AnimationOptions
     * 可选
     * @param {Object} [animate={center: [0, 0], zoom: 12, duration: 1000}]
     */
    animate: {
      center: [118.085428, 24.519409], // 中心点
      zoom: 12 // 级别
    }
  },
  /**
   * 图层集合
   * 可选
   * @param {Array} [layers=[]]
   */
  layers: [
    /**
     * 示例图层 layer
     * 继承layer：https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html
     * 可选
     * @param {Object}
     */
    {
      id: 'layer1',
      visible: true,
      /**
       * 图层来源 source
       * 继承VectorSource：https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
       * 可选
       * @param {Object}
       */
      source: {
        features: [
          {
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
            coordinates: [118.0501900989113, 24.58279368463898],
            style: {
              icon: {
                src: require('@/assets/img/point_blue.png')
              }
            },
            properties: {
              name: 'feature2'
            }
          }
        ]
      }
    },
    /**
     * 示例图层 继承layer
     * features为多边形、折线、圆形
     */
    {
      id: 'polygon',
      visible: true,
      source: {
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
      }
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
    },
    /**
     * 示例图层 继承layer
     * 热力图：https://openlayers.org/en/latest/apidoc/module-ol_layer_Heatmap-Heatmap.html
     */
    {
      id: 'heatmap',
      type: 'heatmap',
      visible: true,
      // 继承source
      source: {
        features: []
      },
      // blur: 60, // 模糊大小 控制热力图热度深浅
      // radius: 40, // 半径大小 点扩散的范围
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
      element: 'overlay1', // 仅支持dom元素id，不支持直接设置HTMLElement
      position: undefined
    }
  ],
  // todo 轨迹动画
  track: [
    {
      id: 'track1',
      speed: 45,
      routes: [
        [118.171545, 24.460156],
        [118.169381, 24.459420],
        [118.167310, 24.457971],
        [118.166292, 24.456996],
        [118.165197, 24.456315],
        [118.163195, 24.455480],
        [118.161864, 24.454370],
        [118.161154, 24.454048],
        [118.159665, 24.454158],
        [118.157046, 24.453941]
      ],
      start: {
        icon: {
          scale: 0.05,
          src: require('@/assets/img/point_start.png')
        }
      },
      end: {
        icon: {
          scale: 0.05,
          src: require('@/assets/img/point_end.png')
        }
      },
      geoMarker: {
        icon: {
          scale: 0.1,
          src: require('@/assets/img/car.png'),
          rotation: 180
        }
      },
      state: ''// start、pause、continue、stop
    }
  ],
  /**
   * 除去默认的交互选项： https://openlayers.org/en/latest/apidoc/module-ol_interaction.html#~DefaultsOptions
   * 要新加的交互类型集合
   * 目前支持:
   * select -- 选择要素
   * modify -- 更改要素
   * draw ---- 绘制地理要素
   */
  interaction: [],
  /**
   * 测量工具
   * 可选
   * @param {String} [type] LineString：测线 Polygon：测面
   * @param {Boolean} [segments] 是否显示分段测量值
   * @param {Boolean} [clear] 是否清空上次测量
   * {
          type: '',
          segments: true,
          clear: true
   * }
   * 当值为false/null/undefined时为不设置或清空测量
   */
  measure: false,
  updateLayers: []// 想要局部更新的layers id最好不要重复
}
