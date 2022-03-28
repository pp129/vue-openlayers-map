# vue-openlayers-map

> 一个基于[OpenLayers](https://openlayers.org/) 的vue组件

## 已实现

- [x] 地图 [Map](./MAP.md)
  - [x] 视图 [View](MAP.md#view)
  - [x] 地图控件 [Controls](MAP.md#controls)
  - [x] 事件 [events](MAP.md#events)
    - [x] 加载完成 load
    - [x] 点击事件 click
    - [x] 点击要素事件 onClickFeature
    - [x] 层级变化事件 changeZoom
  - [x] 可调用方法 [methods](MAP.md#methods)
- [x] 鹰眼 [Overview](DEV.md#overview)
- [x] 图层
  - [x] [矢量图层](VECTORLAYER.md)
  - [x] [瓦片图层](TILELAYER.md)
  - [x] [热力图](HEATMAPLAYER.md)
  - [x] [聚合](CLUSTERLAYER.md)
  - [x] [图形图层](GRAPHICLAYER.md)
  - [x] [路径规划图层](ROUTELAYER.md)
- [x] 弹框 [Overlay](OVERLAY.md)
- [x] 轨迹动画 [Track](TRACK.md)
- [x] 交互 Interaction
  - [x] 绘制 [Draw](DRAW.md)
  - [x] 测量 [Measure](MEASURE.md)

## docs

### [开发文档](DEV.md)

## demo

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
[live demo](https://vue-openlayers-map.netlify.app)

![](../examples/assets/screenshot/screenshot.png)
