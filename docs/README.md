# v-ol-map

> 一个基于[OpenLayers](https://openlayers.org/) 的vue组件

## 已实现

- 地图 [v-map](MAP.md)
   - 视图 [view](MAP.md#view)
   - 地图控件 [controls](MAP.md#controls)
   - 地图交互 [interactions](MAP.md#interactions)
   - 透视图 [perspectiveMap](MAP.md#perspectiveMap) （实验性）
   - 事件 [events](MAP.md#events)
   - 可调用方法 [methods](MAP.md#methods)
- 鹰眼 [v-overview](OVERVIEW.md)
- 图层
  - 矢量图层 [v-vector](VECTORLAYER.md)
    - 编辑 [modify](VECTORLAYER.md#modify)
    - 聚合 [cluster](VECTORLAYER.md#cluster)
  - 瓦片图层 [v-tile](TILELAYER.md)
  - 热力图 [v-heatmap](HEATMAPLAYER.md)
  - 聚合图层 [v-cluster](CLUSTERLAYER.md) （建议使用v-vector的cluster属性实现）
  - 图形图层 [v-graphic](GRAPHICLAYER.md)
  - 路径规划图层 [v-route](ROUTELAYER.md)
-  弹框 [v-overlay](OVERLAY.md)
-  轨迹动画 [v-track](TRACK.md)
-  绘制 [v-draw](DRAW.md)
-  测量 [v-measure](MEASURE.md)


## [文档](https://pp129.github.io/vue-openlayers-map/DEV.html)

## [在线示例](https://vue-openlayers-map.netlify.app/)

## [源码](https://github.com/pp129/vue-openlayers-map)

### git clone

```bash
//github
git clone https://github.com/pp129/vue-openlayers-map.git
//gitee
git clone https://gitee.com/ayos-team/vue-openlayers-map.git
```

### 运行
```bash
npm run serve
```

