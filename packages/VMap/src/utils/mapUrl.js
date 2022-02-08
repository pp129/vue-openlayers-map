export default {
  /****
   * 高德地图
   * lang可以通过zh_cn设置中文，en设置英文，size基本无作用，scl设置标注还是底图，scl=1代表注记，
   * scl=2代表底图（矢量或者影像），style设置影像和路网，style=6为影像图，
   * vec——街道底图
   * img——影像底图
   * roadLabel---路网+标注
   */
  'aMap-img': 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  'aMap-vec': 'http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  'aMap-roadLabel': 'http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
  /***
   *高德新版地图*
   */
  'aMap-vec-a': 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7', // 为矢量图（含路网、含注记）
  'aMap-img-n': 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6', // 为影像底图（不含路网，不含注记）
  'aMap-img-a': 'http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8', // 为影像路图（含路网，含注记）
  /***
   * 天地图 要key的
   * vec——街道底图
   * img——影像底图
   * ter——地形底图
   * cva——中文注记
   * cta/cia——道路+中文注记
   */
  'td-img': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
  'td-cta': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
  'td-cia': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
  'td-cva': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
  'td-vec': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
  'td-ter': 'http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a',
  /***
   *geoq地图
   * http://cache1.arcgisonline.cn
   * http://map.geoq.cn
   * vec：标准彩色地图
   * gray、blue、warm
   * line 中国轮廓图
   * china 中国轮廓图+标注
   * Hydro 水系
   * green 植被
   */
  'geoq-vec': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
  'geoq-gray': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
  'geoq-blue': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
  'geoq-warm': 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}',
  'geoq-line': 'http://cache1.arcgisonline.cn/arcgis/rest/services/SimpleFeature/ChinaBoundaryLine/MapServer/tile/{z}/{y}/{x}', // 不稳定
  'geoq-china': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}', // 不稳定
  'geoq-Hydro': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}', // 不稳定
  'geoq-green': 'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/vegetation/MapServer/tile/{z}/{y}/{x}', // 不稳定
  /***
   * Google
   * m 街道
   * s 影像
   */
  'google-vec': 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
  'google-img': 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
  /**
   * Baidu 街道
   */
  'bd-vec': 'https://maponline1.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20220113&from=jsapi2_0'
}
