# v-path

轨迹动画组件

```javascript
import { VPath } from 'v-ol-map'
```



## 参数 props

| 参数                    | 类型      | 默认值                  | 描述                                 |
|-----------------------|---------|----------------------|------------------------------------|
| `id`                  | String  | `track-${uuid()}`    | id                                 |
| `path`                | Array   | `[...[path](#path)]` | 轨迹路径数据集合。                          |
| `bubble`              | Boolean | `true`               | 事件触发是否穿透                           |
| `tracePointsModePlay` | String  | `animation`          | 轨迹点播放模式。`skip`跳动模式、`animation`动画模式 |
| `showTracePoint`      | Boolean | `true`               | 是否显示路径轨迹点                          |
| `options`             | Object  | [options](#options)  | 小车参数                               |
| `autoPlay`            | Boolean | `false`              | 是否自动开始                             |

### path

```javascript
const paths = [
  {
    longitude: 118.15450000867712,//必要属性，经度
    latitude: 24.50164504684645,// 必要属性，维度
  }
]
```

### options

```javascript
const options = {
  // 起始点图标
  startIcon: {
    src: require('@/assets/img/point_start.png'),
    scale: 0.05
  },
  // 终点图标
  endIcon: {
    src: require('@/assets/img/point_end.png'),
    scale: 0.05
  },
  // 小车图标
  carIcon: {
    src: require('@/assets/img/car2.png'),
    scale: 0.1
  },
  speed: 120, // 车速，设置时为匀速模式，否则为实际速度模式
  arrowPixel: 20, // 方向箭头之间的像素距离，单位是 px
  timeStep: 1, // 点播放动画运动间隔
}
```

## methods

> 可调用方法

### start

参数：moveIdx Number 动画开始点位于轨迹集合的下标，可缺省

开始轨迹动画。

```javascript
this.$refs.track.start(moveIdx)
```

### pause

暂停轨迹动画，执行`resume`方法将继续动画。

```javascript
this.$refs.track.pause()
```
### resume

继续轨迹动画。

```javascript
this.$refs.track.resume()
```

### stop

结束轨迹动画。小车将回到起始点。

```javascript
this.$refs.track.stop()
```

### destroy

清除轨迹和动画。

```javascript
this.$refs.track.destroy()
```

## 事件 events

| Event Name    | Description | Parameters                                  |
|---------------|-------------|---------------------------------------------|
| load          | 轨迹对象加载完成时触发 | 组件实例                                        |
| move          | 轨迹动画执行中的回调  | ({type:'move',target:[moveInfo](#moveInfo}) |
| nodeClick     | 轨迹节点点击      |                                             |
| nodeMouseover | 轨迹节点鼠标移入    |                                             |
| nodeMouseout  | 轨迹节点鼠标移出    |                                             |
| pathClick     | 轨迹线点击       |                                             |
| pathMouseover | 轨迹线鼠标移入     |                                             |
| pathMouseout  | 轨迹线鼠标移出     |                                             |


### moveInfo


## demo

> 生成图层并自动开始轨迹动画

```vue
<template>
  <v-map>
    <v-path ref="track" :id="track.id" :path="track.path" :options="track.options" auto-play></v-path>
  </v-map>
</template>
<script>
export default{
  data(){
    return {
      track:{
        id: 'track1',
        paths: [
          {
            longitude: 118.15450000867712,
            latitude: 24.50164504684645,
            id: 1,
            info: '起点',
            time: '2018-08-20 08:21:00'
          },
          {
            longitude: 118.16383838653563,
            latitude: 24.505768746466842,
            id: 2,
            info: '35 号工业园',
            time: '2018-08-20 08:21:10'
          },
          {
            longitude: 118.16205310926304,
            latitude: 24.535005617443176,
            id: 5,
            info: '不清楚',
            time: '2018-08-20 08:21:30'
          },
          {
            longitude: 118.15062904357909,
            latitude: 24.543125760364646,
            id: 6,
            info: '厦门敦上加油站',
            time: '2018-08-20 08:21:40'
          },
          {
            longitude: 118.1449985525105,
            latitude: 24.539877767388717,
            id: 7,
            info: '宝立达汽车',
            time: '2018-08-20 08:21:50'
          },
          {
            longitude: 118.1348361968994,
            latitude: 24.53662968915482,
            id: 8,
            info: '航空商务广场 9 号楼',
            time: '2018-08-20 08:22:00'
          },
          {
            longitude: 118.12357520952354,
            latitude: 24.52800937789857,
            id: 10,
            info: '终点',
            time: '2018-08-20 08:22:20'
          }
        ],
        options: {
          startIcon: {
            src: require('@/assets/img/point_start.png'),
            scale: 0.05
          },
          endIcon: {
            src: require('@/assets/img/point_end.png'),
            scale: 0.05
          },
          carIcon: {
            src: require('@/assets/img/car2.png'),
            scale: 0.1
          }, // 小车图标
          speed: 120, // 车速，设置时为匀速模式，否则为实际速度模式
          arrowPixel: 20, // 方向箭头之间的像素距离，单位是 px
        }
      }
    }
  }
}
</script>
```
