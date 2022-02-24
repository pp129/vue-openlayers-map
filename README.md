# vue-openlayers-map

> 一个基于[OpenLayers](https://openlayers.org/) 的vue组件

## 已实现

- [x] 生成地图 Map
  - [x] 视图 View
  - [x] 地图控件 control
  - [x] 鹰眼 overview
- [x] 基础图层 baseTile
  - [x] 加载天地图
  - [x] 加载百度地图
  - [x] 自定义路径加载XYZ规则切片
- [x] 图层 Layer
  - [x] 矢量图层 VectorLayer
    - [x] 要素 Feature
    - [x] 点 Point
    - [x] 多边形 Polygon
    - [x] 线 LineString
    - [x] 圆 Circle
      - [x] 自定义样式 Style
  - [x] 瓦片图层 TileLayer
  - [x] 热力图 Heatmap
  - [x] 聚合 Cluster
  - [x] WebGL WebGLPointsLayer
- [x] 弹框 Overlay
- [x] 交互 Interaction
  - [x] 编辑 modify
  - [x] 选中 select
  - [x] 绘制 draw
    - [x] 自定义参数clear-清除上一次绘制
    - [x] 自定义参数endRight-鼠标右键结束绘制
    - [x] 自定义参数editable-结束绘制后可选中编辑
- [x] 测量 Measure
- [x] 经纬度转换 Coordinates convert
- [x] 事件回调 eventListener
  - [x] 点击事件 click
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
- [x] 可调用方法
  - [x] 移动动画 panTo
  - [x] 主动生成元素 setFeature
  - [x] 获取经纬度集合中心点 getCenterByExtent
  - [x] 获取两点距离方法 getDistancePoint
  - [x] 获取折线长度方法 getDistanceString

## 安装
```bash
npm install vue-openlayers-map
```

## 使用
```js
import VMap from 'vue-openlayers-map'
Vue.use(VMap)

// or 
import { VMap } from 'vue-openlayers-map'
```

## 简单示例
```vue
<template>
  <div class="home">
    <v-map ref="map" :height="height" :width="width" :option="option"></v-map>
  </div>
</template>
<script>
import { VMap } from 'vue-openlayers-map'
export default {
  name: 'Home',
  components: {
    VMap
  },
  data () {
    return {
      height: '100%',
      width: '100%',
      option: {
        view: {
          center: [118.045456, 24.567489],
          zoom: 12
        }
      }
    }
  }
}
</script>
```

## docs

### [参考配置](OPTION.md)
### [说明文档](DEV.md)

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

![image](examples/assets/screenshot/screenshot.png)
