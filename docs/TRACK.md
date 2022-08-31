# v-track

轨迹动画组件

```javascript
import { VTrack } from 'vue-openlayers-map'
```



## 参数 props

| 参数                  | 类型                 | 默认值            | 描述                                                |
| --------------------- | -------------------- | ----------------- | --------------------------------------------------- |
| `id`                  | String               | `track-${uuid()}` | id                                                  |
| `paths`               | Array                | `[]`              | 轨迹路径数据集合。                                  |
| `tracePointsModePlay` | String               | `animation`       | 轨迹点播放模式。`skip`跳动模式、`animation`动画模式 |
| `smokeMode`           | String               | `distance`        | 轨迹抽稀模式。可选：`distance`或`track`             |
| `vacuate`             | Boolean              | `false`           | 是否抽稀                                            |
| `vacuateDistance`     | Number / `undefined` | `undefined`       | 抽稀距离，单位像素                                  |
| `labelShow`           | Boolean              | `false`           | 是否显示轨迹点信息标签                              |
| `showTracePoint`      | Boolean              | `true`            | 是否显示轨迹点                                      |
| `centerAtCar`         | Boolean              | `false`           | 视图是否跟随小车                                    |
| `options`             | Object               | `{}`              | 小车参数                                            |

### 轨迹点数据样例 paths

```javascript
const paths = [
  {
    longitude: 118.15450000867712,//必要属性，经度
    latitude: 24.50164504684645,// 必要属性，维度
    id: 1,
    info: '起点',
    time: '2018-08-20 08:21:00'// 必要属性，经过时间
  }
]
```

### 小车参数样例及说明 option

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
  tracePlay: false, // 是否进行轨迹回放，默认为 false
  lineWidth: 5, // 轨迹线宽度，单位为像素
  lineColor: 'red', // 轨迹线颜色
  passlineColor: 'lightgreen' // 通过动画轨迹线颜色
}
```

## 轨迹图层生成 use

```vue
<template>
  <v-map>
    <v-track ref="track" :id="track.id" :paths="track.paths" :options="track.options"></v-track>
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
          // showInfoWin: false,
          overlay: {
            id: 'carOverlay',
            element: 'carOverlay'
          },
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
          tracePlay: false, // 是否进行轨迹回放，默认为 false
          lineWidth: 5, // 轨迹线宽度，单位为像素
          lineColor: 'red', // 轨迹线颜色
          passlineColor: 'lightgreen' // 通过动画轨迹线颜色
        }
      }
    }
  }
}
</script>
```



## methods

> 可调用方法

### start

开始轨迹动画。

```javascript
this.$refs.track.start()
```

### pause

暂停轨迹动画，执行`start`方法将继续动画。

```javascript
this.$refs.track.pause()
```

### stop

结束轨迹动画。小车将回到起始点。

```javascript
this.$refs.track.stop()
```

### dispose

清除轨迹动画。

```javascript
this.$refs.track.dispose()
```

## 事件 events

| Event Name | Description            | Parameters |
| ---------- | ---------------------- | ---------- |
| onLoad     | 轨迹对象加载完成时触发 | 组件实例   |

