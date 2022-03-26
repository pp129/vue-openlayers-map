# vue-openlayers-map

> 一个基于[OpenLayers](https://openlayers.org/) 的vue组件

## 已实现

- [x] 地图 [Map](./MAP.md)
  - [x] 视图 [View](MAP.md#view)
  - [x] 地图控件 [controls](MAP.md#controls)
- [x] 鹰眼 [overview](DEV.md#overview)
- [x] 图层 [Layer](LAYER.md)
  - [x] 矢量图层
  - [x] 瓦片图层
  - [x] 热力图
  - [x] 聚合
  - [x] 图形图层
- [x] 弹框 Overlay
- [x] 交互 Interaction
  - [x] 编辑 modify
  - [x] 选中 select
  - [x] 绘制 draw
    - [x] 自定义参数clear-清除上一次绘制
    - [x] 自定义参数endRight-鼠标右键结束绘制
    - [x] 自定义参数editable-结束绘制后可选中编辑
- [x] 测量 Measure
- [x] 事件 [events](MAP.md#events)
  - [x] 加载完成 load
  - [x] 点击事件 click
  - [x] 点击要素事件 onClickFeature
  - [x] 层级变化事件 changeZoom
  - [x] 绘制事件
    - [x] 绘制开始 drawstart
    - [x] 绘制结束 drawend
  - [x] 编辑事件
    - [x] 编辑开始 modifystart
    - [x] 编辑结束 modifyend
  - [x] 测量事件
    - [x] 测量开始 measurestart
    - [x] 测量结束 measureend
- [x] 可调用方法 [methods](MAP.md#methods)
  - [x] 移动动画 panTo
  - [x] 主动生成元素 setFeature
  - [x] 获取经纬度集合中心点 getCenterByExtent
  - [x] 获取两点距离方法 getDistancePoint
  - [x] 获取折线长度方法 getDistanceString

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

![image](../examples/assets/screenshot/screenshot.png)
