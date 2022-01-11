export default {
  /**
   * 基础图层
   */
  baseTile: [
    'td', // 天地矢量
    'td_img', // 天地影像
    // 自定义路径
    {
      base: true,
      type: 'xyz',
      url: [
        'http://t4.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
        'http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a'
      ],
      visible: false
    }
  ],
  visibleTile: 'td', // 多个基础图层情况下默认显示的图层
  /**
   * 鹰眼显示图层
   */
  overview: 'td_img',
  /**
   * 视图
   */
  view: {
    center: [118.045456, 24.567489],
    zoom: 12,
    constrainResolution: true, // 设置视图是否应允许中间缩放级别。true:鼠标缩放地图,每次缩放为1级别
    // 地图加载初始动画
    animate: {
      center: [118.18239576954171, 24.487288698062056], // 中心点
      zoom: 14 // 级别
    }
  },
  /**
   * 图层
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
            icon: require('@/assets/img/point_red.png')
          },
          properties: {
            name: 'feature1'
          }
        },
        {
          coordinates: [118.159440, 24.499776],
          style: {
            icon: require('@/assets/img/point_red.png')
          },
          properties: {
            name: 'feature2'
          }
        },
        {
          coordinates: [118.0501900989113, 24.58279368463898],
          style: {
            icon: require('@/assets/img/point_blue.png')
          },
          properties: {
            name: 'feature3'
          }
        }
      ]
    },
    /**
     * 示例图层
     * features为多边形、折线、圆形
     */
    {
      id: 'polygon',
      visible: true,
      features: [
        {
          type: 'polygon',
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
     * 示例图层
     * 聚合
     */
    {
      id: 'cluster',
      type: 'cluster',
      visible: true,
      features: [
        {
          coordinates: [117.96768937292673, 24.51616895381355]
        },
        {
          coordinates: [117.97481324839465, 24.502306340499445]
        }
      ],
      distance: 120,
      minDistance: 0,
      minZoom: 1,
      maxZoom: 16
    },
    /**
     * 示例图层
     * 热力图
     */
    {
      id: 'heatmap',
      type: 'heatmap',
      visible: true,
      features: [
        {
          coordinates: [117.97453973475076, 24.61692211214447],
          weight: 0.7
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
      radius: 100
    }
  ],
  /**
   * 叠加（弹框）
   */
  overlays: [
    {
      id: 'overlay',
      target: 'overlay'// dom元素id
    }
  ],
  eventListeners: ['changeZoom']
}
