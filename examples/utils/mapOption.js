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
  controls: {
    zoom: true
  },
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
  // visibleTile: 'td',
  /**
   * 视图 view
   * 继承view ： https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
   * 可选
   * @param {Object} [view={center: [0, 0],zoom: 12,constrainResolution: true,projection: 'EPSG:4326'}]
   */
  view: {
    center: [118.045456, 24.567489],
    zoom: 10,
    maxZoom: 18
  },
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
  measure: false
}
