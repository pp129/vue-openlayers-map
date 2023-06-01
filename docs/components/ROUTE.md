# 路径规划 v-route

路径规划图层。支持由arcgis、graphhopper发布的最短路径规划服务所获取的数据生成图层。

```javascript
import { VRoute } from 'v-ol-map'
```

## 参数 props

[继承参数查看](LAYER_PROPS.md)

| 参数           | 类型      | 可选值                       | 默认值                      | 描述                    |
|--------------|---------|:--------------------------|--------------------------|-----------------------|
| `layerId`    | String  |                           | `vector-layer-${uuid()}` | 图层id                  |
| `serviceUrl` | String  |                           |                          | 请求路径。                 |
| `method`     | String  | `GET` / `POST`            | `GET`                    | 请求类型，支持`GET`或  `POST` |
| `routeType`  | String  | `arcgis` / `graphhopper`  |                          | **必填**，路径规划数据类型。      |
| `stops`      | Array   |                           | `[]`                     | 路线计算坐标。               |
| `showStart`  | Boolean |                           | `false`                  | 是否显示起点                |
| `showEnd`    | Boolean |                           | `false`                  | 是否显示终点                |
| `showPass`   | Boolean |                           | `false`                  | 是否显示途经点               |
| `routeStyle` | Object  | [routeStyle](#routeStyle) | `undefined`              | 路径样式。                 |

### routeStyle

包含属性：`line` `start` `end`  `pass`。可重写样式属性覆盖默认值。

<span id="routeStyle"></span>

- `routeStyle.line`道路样式。

默认值：

```json
stroke: {
  color: 'rgba(67,126,255,1)',
  width: 4
}
```

- `routeStyle.start`起点样式.

默认值：

```json
circle: {
  radius: 15,
  fill: {
    color: 'rgba(255,255,255,1)'
  },
  stroke: {
    color: 'rgba(67,126,255,1)',
    width: 2
  }
},
text: {
  text: '起',
  fill: {
    color: '#3d73e8'
  }
}
```

- `routeStyle.end`终点样式。

默认值：

```json
circle: {
  radius: 15,
  fill: {
    color: 'rgba(255,255,255,1)'
  },
  stroke: {
    color: 'rgba(67,126,255,1)',
    width: 2
  }
},
text: {
  text: '终',
  fill: {
    color: '#3d73e8'
  }
}
```

- `routeStyle.pass`途经点样式。

默认值：

```json
circle: {
  radius: 8,
  fill: {
    color: 'rgba(255,255,255,1)'
  },
  stroke: {
    color: 'tomato',
    width: 4
  }
}
```

### Arcgis server 服务接口参数 arcgis props

当`routeType`为`arcgis`时组件的可选参数。

[实在太多了，还是去官网看吧~](https://developers.arcgis.com/rest/network/api-reference/route-synchronous-service.htm)

### graphhopper 服务接口参数 graphhopper props

当`routeType`为`graphhopper`时组件的可选参数。只封装了如下部分。

| 参数名称           | 参数类型                    | 是否必选（默认值）  | 参数说明                                                                                |
|----------------|-------------------------|------------|-------------------------------------------------------------------------------------|
| point          | string of array (纬度，经度) | 是          | 路线计算坐标，至少包括一个起点和一个终点                                                                |
| point_hint     | string of array         | 否          | 路线必须经过的点，通常是路的名称                                                                    |
| vehicle        | string                  | 否（car）     | 交通工具（"car" "bike" "foot" "hike" "mtb" "racingbike" "scooter" "truck" "small_truck"） |
| locale         | string                  | 否（en）      | 文本语言类型（中文zh-CN）                                                                     |
| elevation      | Boolean                 | 否（false）   | 是否计算高程                                                                              |
| points_encoded | boolean                 | 否（true）    | 是否格式化坐标，true会对坐标进行格式化，减少占用带宽，false返回坐标形式                                            |
| type           | string                  | 否（json）    | 返回值类型                                                                               |
| weighting      | string                  | 否（fastest） | 最佳路径计算标准（shortest，fastest）                                                          |

## 事件 events

| Event Name | Description | Parameters                                 |
|------------|-------------|--------------------------------------------|
| render     | 路径渲染完成回调    | (routeData:接口返回值, map:地图对象, features:要素集合) |

`render`回调中的features参数包含扩展属性：

**featureType** :`start`-起点，`end`-终点，`stops`途经点,`line`-路线。

**stopIndex**：若`featureType`=`stops`, 既途经点下标。


##  示例

### 以Graphhopper为服务的最短路径规划功能

```vue
<template>
  <div class="home" :style="cursorStyle">
    <ul class="list">
      <li v-for="(item,index) in routeOpt.stops" :key="index">
        <span v-if="index === 0">起点：</span>
        <span v-else-if="index === routeOpt.stops.length - 1">终点：</span>
        <span v-else>途经点：</span>
        {{item}}
        <button @click="addPoint(index)">新增</button>
        <button @click="removePoint(index)">移除</button>
        <button @click="resetPoint(index)">重选</button>
      </li>
    </ul>
    <v-map :view="view" @click="insertPoint">
      <v-route :route-type="routeOpt.type" :service-url="routeOpt.serviceUrl" :stops="routeOpt.stops" :route-style="routeStyle" />
    </v-map>
  </div>
</template>

<script>

export default {
  name: 'route',
  components: {
    VMap,
    VRouteLayer
  },
  data () {
    return {
      view: {
        center: [118.118033, 24.478697],
        zoom: 12
      },
      routeOpt: {
        type: 'graphhopper',
        serviceUrl: 'http://172.16.28.74:9999/route',
        stops: [
          [118.106298, 24.506290],
          [118.132400, 24.509894],
          [118.182088, 24.487228]
        ]
      },
      insertIndex: null,
      resetIndex: null,
      cursorPointer: false,
      routeStyle: {
        start: {
          icon: {
            src: require('@/assets/img/point_start.png'),
            scale: 0.05
          }
        },
        pass: {
          circle: {
            radius: 10,
            fill: {
              color: 'rgba(255,255,255,1)'
            }
          }
        },
        end: {
          icon: {
            src: require('@/assets/img/point_end.png'),
            scale: 0.05
          }
        },
        line: {
          stroke: {
            color: 'blue',
            width: 2
          }
        }
      }
    }
  },
  computed: {
    // 选点状态光标样式变为手型
    cursorStyle () {
      return {
        cursor: this.cursorPointer ? 'pointer' : ''
      }
    }
  },
  methods: {
    removePoint (index) {
      if (this.routeOpt.stops.length > 2) {
        this.routeOpt.stops.splice(index, 1)
      }
    },
    addPoint (index) {
      this.cursorPointer = true
      this.insertIndex = index + 1
    },
    resetPoint (index) {
      this.cursorPointer = true
      this.resetIndex = index
    },
    insertPoint (evt) {
      console.log('on map click === get coordinate', evt.coordinate)
      if (this.insertIndex || this.insertIndex === 0) {
        this.routeOpt.stops.splice(this.insertIndex, 0, evt.coordinate)
      }
      if (this.resetIndex || this.resetIndex === 0) {
        this.routeOpt.stops.splice(this.resetIndex, 1, evt.coordinate)
      }
      this.insertIndex = null
      this.resetIndex = null
      this.cursorPointer = false
    }
  }
}
</script>

<style scoped>
.list{
  position: absolute;
  left: 10px;
  top: 10px;
  background: #ffffff;
  z-index: 2;
}
</style>

```

### 以Arcgis为服务例的最短路径规划功能

```vue
<template>
  <div class="home" :style="cursorStyle">
    <ul class="list">
      <!-- 起点 -->
      <li>
        <span :style="{color:activeIndex === 0?'orange':'black'}" @click="setActive(0)">起点：</span>
        {{routeOpt.stops[0]}}
        <!-- 已有起点时才允许新增途经点 -->
        <button v-if="routeOpt.stops.length>1" @click="addPoint(0)">新增</button>
        <!-- stops不止有起点、终点时可以移除起点 -->
        <button v-if="routeOpt.stops.length>2" @click="removePoint(0)">移除</button>
        <button @click="resetPoint(0)">重选</button>
      </li>
      <!-- 途经点，stops长度大于2时显示（不止有起点、终点） -->
      <li v-if="routeOpt.stops.length > 2">
        <div v-for="(item,index) in routeOpt.stops" :key="index">
          <div v-if="index!==0&&index!==routeOpt.stops.length-1">
            <span :style="{color:activeIndex === index?'orange':'black'}" @click="setActive(index)">途经点{{index}}：</span>
            {{item}}
            <button @click="addPoint(index)">新增</button>
            <button @click="removePoint(index)">移除</button>
            <button @click="resetPoint(index)">重选</button>
          </div>
        </div>
      </li>
      <!-- 终点 -->
      <li>
        <span :style="{color:(activeIndex === routeOpt.stops.length-1&&routeOpt.stops.length>1)?'orange':'black'}" @click="setActive(routeOpt.stops.length-1)">终点：</span>
        {{routeOpt.stops.length>1?routeOpt.stops[routeOpt.stops.length-1]:''}}
        <!-- stops不止有起点、终点时可以移除终点 -->
        <button v-if="routeOpt.stops.length>2" @click="removePoint(routeOpt.stops.length-1)">移除</button>
        <!-- stops不止有起点（已有终点）时可以重选终点，仅有起点时（stops.length === 1）相当于新增终点 -->
        <button v-if="routeOpt.stops.length === 1" @click="resetPoint(1)">重选</button>
        <button v-if="routeOpt.stops.length > 1" @click="resetPoint(routeOpt.stops.length-1)">重选</button>
      </li>
    </ul>
    <v-map :view="view" default-tile="OSM" @click="insertPoint">
      <v-route :route-type="routeOpt.type" :service-url="routeOpt.serviceUrl" :stops="routeOpt.stops" :route-style="routeStyle" @render="render" />
    </v-map>
  </div>
</template>

<script>

export default {
  name: 'route',
  components: {
    VMap,
    VRouteLayer
  },
  data () {
    return {
      view: {
        // center: [118.118033, 24.478697],
        center: [-117.16669620165261, 32.73134186412363],
        zoom: 12
      },
      routeOpt: {
        // type: 'graphhopper',
        // serviceUrl: 'http://172.16.28.74:9999/route',
        type: 'arcgis',
        serviceUrl: 'http://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/NAServer/Route/solve',
        stops: []
      },
      insertIndex: null,
      resetIndex: null,
      cursorPointer: false,
      routeStyle: {
        // 默认起点样式
        start: {
          circle: {
            radius: 10,
            fill: {
              color: 'rgba(255,255,255,1)'
            },
            stroke: {
              color: 'red'
            }
          },
          text: {
            text: '始',
            fill: {
              color: 'red'
            }
          }
        },
        // 默认途径点样式
        pass: {
          circle: {
            radius: 10,
            fill: {
              color: 'rgba(255,255,255,1)'
            }
          }
        },
        // 默认终点样式
        end: {
          circle: {
            radius: 10,
            fill: {
              color: 'rgba(255,255,255,1)'
            },
            stroke: {
              color: 'red'
            }
          },
          text: {
            text: '终',
            fill: {
              color: 'red'
            }
          }
        },
        // 路径样式
        line: {
          stroke: {
            color: 'blue',
            width: 2
          }
        }
      },
      // 选中状态途径点样式
      passActiveStyle: {
        circle: {
          radius: 16,
          fill: {
            color: 'rgba(255,255,255,1)'
          },
          stroke: {
            width: 2,
            color: 'orange'
          }
        }
      },
      // 包括起点、重点、途经点的要素集合
      stops: [],
      // 选中的要素下标
      activeIndex: null
    }
  },
  computed: {
    // 选点状态光标样式：+
    cursorStyle () {
      return {
        cursor: this.cursorPointer ? 'crosshair' : ''
      }
    }
  },
  methods: {
    /**
     * 点击列表，切换选中的下标，点击相同下标取消选中，并触发根据下标改变要素样式方法
     * @param index
     */
    setActive (index) {
      if (this.stops.length > 1 && (index || index >= 0)) {
        if (this.activeIndex !== index) {
          this.activeIndex = index
        } else {
          this.activeIndex = null
        }
        this.updateFeature(index)
      }
    },
    /**
     * 根据下标改变要素样式
     * @param index
     */
    updateFeature (index) {
      this.stops.forEach((feature, i) => {
        let style = {}
        if (i === index && (this.activeIndex || this.activeIndex === 0)) {
          // 选中
          if (index === 0) {
            // 起点
            style = {
              circle: {
                radius: 16,
                fill: {
                  color: 'rgba(255,255,255,1)'
                },
                stroke: {
                  width: 2,
                  color: 'orange'
                }
              },
              text: {
                text: '起',
                fill: {
                  color: 'orange'
                }
              }
            }
          } else if (index === this.stops.length - 1) {
            // 终点
            style = {
              circle: {
                radius: 16,
                fill: {
                  color: 'rgba(255,255,255,1)'
                },
                stroke: {
                  width: 2,
                  color: 'orange'
                }
              },
              text: {
                text: '终',
                fill: {
                  color: 'orange'
                }
              }
            }
          } else {
            // 途经点
            style = {
              ...this.passActiveStyle,
              ...{
                text: {
                  // text: `途经点${index + 1}`
                  text: `途经点${feature.get('stopIndex') + 1}`,
                  fill: {
                    color: 'orange'
                  }
                }
              }
            }
          }
        } else {
          // 非选中
          if (i === 0) {
            // 起点
            style = this.routeStyle.start
          } else if (i === this.stops.length - 1) {
            // 终点
            style = this.routeStyle.end
          } else {
            // 途经点
            style = {
              ...this.routeStyle.pass,
              ...{
                text: {
                  // text: `途经点${index + 1}`
                  text: `途经点${feature.get('stopIndex') + 1}`,
                  fill: {
                    color: 'green'
                  }
                }
              }
            }
          }
        }
        feature.update('style', style)
      })
    },
    removePoint (index) {
      if (this.routeOpt.stops.length > 2) {
        this.routeOpt.stops.splice(index, 1)
      }
    },
    addPoint (index) {
      this.cursorPointer = true
      this.insertIndex = index + 1
    },
    resetPoint (index) {
      this.cursorPointer = true
      this.resetIndex = index
    },
    setStops (coordinate) {
      const isInsert = this.insertIndex || this.insertIndex === 0
      const isReset = this.resetIndex || this.resetIndex === 0
      // 新增
      this.activeIndex = null
      if (isInsert) {
        this.activeIndex = this.insertIndex
        this.routeOpt.stops.splice(this.insertIndex, 0, coordinate)
      }
      // 重选
      if (isReset) {
        this.activeIndex = this.resetIndex
        if (this.routeOpt.stops.length <= 1) {
          this.routeOpt.stops.splice(this.resetIndex, 0, coordinate)
        } else {
          this.routeOpt.stops.splice(this.resetIndex, 1, coordinate)
        }
      }
      this.insertIndex = null
      this.resetIndex = null
      this.cursorPointer = false
    },
    insertPoint (evt, map) {
      const pixel = map.getEventPixel(evt.originalEvent)
      const features = map.getFeaturesAtPixel(pixel)
      const hit = map.hasFeatureAtPixel(pixel)
      if (hit) {
        if (features && features.length > 0) {
          features.forEach(feature => {
            if (feature.get('featureType')) {
              console.log(feature.get('featureType'))
              // 点击要素触发改变选中要素样式
              if (feature.get('featureType') === 'line') {
                this.setStops(evt.coordinate)
              } else {
                const isInsert = this.insertIndex || this.insertIndex === 0
                const isReset = this.resetIndex || this.resetIndex === 0
                if (!isInsert && !isReset) {
                  if (feature.get('featureType') === 'start') {
                    this.activeIndex = 0
                  } else if (feature.get('featureType') === 'end') {
                    this.activeIndex = this.stops.length - 1
                  } else if (feature.get('featureType') === 'stops') {
                    this.activeIndex = feature.get('stopIndex') + 1
                  }
                  this.updateFeature(this.activeIndex)
                }
              }
            }
          })
        }
      } else {
        this.setStops(evt.coordinate)
        // 点击位置无要素且非新增or重选则清空要素选中状态样式
        if (!this.activeIndex && this.activeIndex !== 0) {
          this.updateFeature()
        }
      }
    },
    /**
     * 路径规划图层渲染完成事件
     * @param routeData 接口返回值
     * @param map 地图对象
     * @param features 要素集合
     */
    render (routeData, map, features) {
      console.log('route data ===', routeData)
      console.log('route features ===', features)
      this.stops = features.filter(feature => feature.get('featureType') && feature.get('featureType') !== 'line')// featureType:start-起点，end-终点，stops途经点,line-路线
      const stops = features.filter(feature => feature.get('featureType') && feature.get('featureType') === 'stops')
      // 动态更新途经点文字
      stops.forEach((feature, index) => {
        const style = {
          ...this.routeStyle.pass,
          ...{
            text: {
              // text: `途经点${index + 1}`
              text: `途经点${feature.get('stopIndex') + 1}`,
              fill: {
                color: 'green'
              }
            }
          }
        }
        feature.update('style', style)
      })
      // 根据地图点击事件得到的下标更新选中要素样式
      this.updateFeature(this.activeIndex)
    }
  }
}
</script>

<style scoped>
.list{
  position: absolute;
  left: 10px;
  top: 10px;
  background: #ffffff;
  z-index: 2;
}
</style>

```
