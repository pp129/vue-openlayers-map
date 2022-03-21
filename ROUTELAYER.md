```javascript
import { VRouteLayer } from 'vue-openlayers-map'
```

路径规划图层。支持由arcgis、graphhopper发布的最短路径规划服务所获取的数据生成图层。

# props

> 参数

[继承参数查看](LAYER_PROPS.md)

| 参数         | 类型   | 默认值                   | 描述                                                         |
| ------------ | ------ | ------------------------ | ------------------------------------------------------------ |
| `layerId`    | String | `vector-layer-${uuid()}` | 图层id                                                       |
| `serviceUrl` | String |                          | 请求路径。                                                   |
| `method`     | String | `GET`                    | 请求类型，支持`GET`或  `POST`                                |
| `routeType`  | String |                          | **必填**，路径规划数据类型。可选值：`arcgis`   `graphhopper` |
| `stops`      | Array  | `[]`                     | 路线计算坐标。                                               |

## arcgis props

当`routeType`为`arcgis`时组件的可选参数。

[实在太多了，还是去官网看吧~](https://developers.arcgis.com/rest/network/api-reference/route-synchronous-service.htm)

## graphhopper props

当`routeType`为`graphhopper`时组件的可选参数。只封装了如下部分。

| 参数名称        | 参数类型                     | 是否必选（默认值） | 参数说明                                                     |
| --------------- | ---------------------------- | ------------------ | ------------------------------------------------------------ |
| point           | string of array (纬度，经度) | 是                 | 路线计算坐标，至少包括一个起点和一个终点                     |
| point_hint      | string of array              | 否                 | 路线必须经过的点，通常是路的名称                             |
| vehicle         | string                       | 否（car）          | 交通工具（"car" "bike" "foot" "hike" "mtb" "racingbike" "scooter" "truck" "small_truck"） |
| locale          | string                       | 否（en）           | 文本语言类型（中文zh-CN）                                    |
| elevation       | Boolean                      | 否（false）        | 是否计算高程                                                 |
| points_encoded  | boolean                      | 否（true）         | 是否格式化坐标，true会对坐标进行格式化，减少占用带宽，false返回坐标形式 |
| type            | string                       | 否（json）         | 返回值类型                                                   |
| weighting       | string                       | 否（fastest）      | 最佳路径计算标准（shortest，fastest）                        |

# use

```vue
<template>
  <v-map>
    <!-- arcgis 路径规划服务图层 -->
    <v-route-layer :route-type="'arcgis'" :service-url="routeLayer.serviceUrl" :method="routeLayer.method" :stops="routeLayer.stops" :impedance-attribute-name="routeLayer.impedanceAttributeName" :route-style="routeLayer.routeStyle"></v-route-layer>
    <!-- graphhopper 路径规划服务图层 -->
    <v-route-layer :route-type="'graphhopper'" :service-url="graphhopper.serviceUrl" :stops="graphhopper.stops"></v-route-layer>
  </v-map>
</template>
<script>
export default{
  data(){
    return {
      graphhopper: {
        serviceUrl: '/graphhoppe/route',
        stops: [
          [118.106298, 24.506290],
          [118.181858, 24.491986]
        ]
      },
      routeLayer: {
        serviceUrl: '/arcgis/rest/services/tx/NAServer/Route/solve',
        method: 'POST',
        stops: [
          [120.557909, 30.644344],
          [120.555485, 30.635603],
          [120.547913, 30.621760]
        ],
        impedanceAttributeName: '长度',
        routeStyle: {
          stroke: {
            color: 'red',
            width: 5,
            lineDash: [20, 10, 20, 10]
          }
        }
      }
    }
  }
}
</script>
```

