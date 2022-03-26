```javascript
import { VOverlay } from 'vue-openlayers-map'
```

在地图上显示并附加到单个地图位置的元素。就像[`module:ol/control/Control~Control`](https://openlayers.org/en/latest/apidoc/module-ol_control_Control-Control.html)，叠加层是可见的小部件。与控件不同，它们不在屏幕上的固定位置，而是与地理坐标相关联，因此平移地图将移动覆盖而不是控件。

# props

> 参数

| 参数          | 类型                                                         | 默认值                                 | 描述                                                         |
| ------------- | ------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------ |
| `overlayId`   | String                                                       | `overlay-id-${uuid()}`                 | 设置 overlay id。 overlay id 可以与该[`module:ol/Map~Map#getOverlayById`](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#getOverlayById)方法一起使用。 |
| `element`     | String                                                       | `overlay-el-${uuid()}`                 | overlay元素。                                                |
| `offset`      | Array                                                        | `[0,0]`                                | 定位overlay时使用的像素偏移量。数组中的第一个元素是水平偏移量。正值将覆盖向右移动。数组中的第二个元素是垂直偏移量。正值会使叠加层向下移动。 |
| `position`    | [module:ol/coordinate~Coordinate](https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html#~Coordinate) / `undefined` | `undefined`                            | 地图投影中的overlay位置。                                    |
| `positioning` | [module:ol/OverlayPositioning](https://openlayers.org/en/latest/apidoc/module-ol_OverlayPositioning.html) | `'top-left'`                           | 定义overlay相对于其`position`属性的实际定位方式。可能的值为`'bottom-left'`, `'bottom-center'`, `'bottom-right'`, `'center-left'`, `'center-center'`, `'center-right'`, `'top-left'`, `'top-center'`, 和`'top-right'`。 |
| `autoPan`     | [module:ol/Overlay~PanIntoViewOptions](https://openlayers.org/en/latest/apidoc/module-ol_Overlay.html#~PanIntoViewOptions) / Boolean | `false`                                | 调用时平移地图 `setPosition`，使overlay在当前视口中完全可见  |
| `className`   | String                                                       | `'ol-overlay-container ol-selectable'` | CSS 类名。                                                   |

# slot

> 使用插槽时的返回值

| 返回       | 类型   | 描述               |
| ---------- | ------ | ------------------ |
| `position` | Arrary | overlay的postion值 |

# use

```vue
<template>
  <v-map @onClickFeature="onClickFeature">
    <v-vector-layer :features="features"></v-vector-layer>
    <v-overlay :overlay-id="overlay.id" :element="overlay.element" :position="overlay.position" :auto-pan="true" class="overlay">
      <template v-slot="slotProps">
        <p>{{ slotProps.position }}</p>
        <span @click="overlay.position = undefined">close</span>
      </template>
    </v-overlay>
  </v-map>
</template>
<script>
import { VMap, VVectorLayer, VOverlay } from 'vue-openlayers-map'
export default {
  data(){
    return {
      overlay:{
        id:'overlay1',
        element:'overlay1',
        position:undefined
      },
      features: [{
        id: 'point1',
        coordinates: [118.140448, 24.512917],
        properties: {
          name: 'feature1'
        }
      }]
    }
  },
  methods:{
    onClickFeature(feature,layer){
      this.overlay.position = feature.get('coordinates')
    }
  }
}
</script>	
```

