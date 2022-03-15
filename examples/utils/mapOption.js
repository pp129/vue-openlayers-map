/**
 * 配置项
 * @module Page-option
 */
const resolutions = []
for (let i = 0; i < 19; i++) {
  resolutions[i] = Math.pow(2, 18 - i)
}
export default {
  /**
   * @key target
   * @description 地图容器id
   * 可选
   * 单页面生成多地图时必填且不重复
   * @param {String} [target='map']
   */
  target: 'map',
  /**
   * @description 控件
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
    'td_img', // 天地图-影像
    'bd', // 百度
    /**
     * 自定义图层 以高德地图为例
     * @param {String} [type]
     * @param {String} [name]
     * @param {Array} [option]
     */
    {
      type: 'xyz',
      name: 'gd',
      option: [
        {
          url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7'
        }
      ]
    },
    /**
     * 自定义图层 接受完整XYZ参数
     * 继承 https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html
     */
    {
      type: 'xyz',
      name: 'xyz_bd',
      option: [
        {
          projection: 'baidu',
          tileGrid: {
            origin: [0, 0], // 设置原点坐标
            resolutions: resolutions // 设置分辨率
          },
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            if (!tileCoord) {
              return ''
            }
            const z = tileCoord[0]
            const x = tileCoord[1]
            const y = -tileCoord[2] - 1
            return 'https://maponline1.bdimg.com/tile/?qt=vtile&x=' +
              x + '&y=' + y + '&z=' + z +
              '&styles=pl&scaler=1&udt=20220113&from=jsapi2_0'
          }
        }
      ]
    }
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
    zoom: 10
  },
  /**
   * 图层集合
   */
  layers: [
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
            id: 'point2',
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
    {
      id: 'layer2',
      visible: true,
      source: {
        features: []
      }
    },
    {
      id: 'polygon',
      visible: true,
      source: {
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
    }
  ],
  graphicLayers: [
    {
      source: {
        features: [{
          id: 'point2',
          coordinates: [118.106671, 24.449304],
          properties: {
            name: 'feature2'
          }
        }]
      },
      style: {
        icon: {
          src: require('@/assets/img/point_red.png')
        }
      }
    }
  ],
  clusters: [
    {
      visible: true,
      minZoom: 10,
      maxZoom: 16,
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
  ],
  heatmaps: [
    {
      id: 'heatmap',
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
  ],
  /**
   * 叠加（弹框）https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html
   */
  overlays: [
    {
      id: 'overlay1',
      element: 'overlay1', // 仅支持dom元素id，不支持直接设置HTMLElement
      position: undefined
    },
    {
      id: 'drawEnd',
      element: 'drawEnd',
      position: undefined,
      offset: [0, 0]
    }
  ],
  track: [],
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
