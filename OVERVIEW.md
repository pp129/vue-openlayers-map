# props

>  参数

| 参数        | 类型                                                                                         | 默认值    | 描述                                                         |
| ----------- |--------------------------------------------------------------------------------------------| --------- | ------------------------------------------------------------ |
| view        | 继承 [ol/View](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) / undefined | undefined | 概览图的自定义视图（应使用与主图相同的投影）。如果未提供，将使用与主地图具有相同投影的默认视图。 |
| collapsible | Boolean                                                                                    | true      | 控件是否可以折叠。                                           |
| collapsed   | Boolean                                                                                    | true      | 控件是否应该开始折叠（展开）。                               |
| layers      | Array / undefined                                                                          | undefined | 总览图的图层。                                               |

# use

```vue
<template>
	<v-map>
  	<v-overview :view="overview.view" :layers="overview.layers"></v-overview>
  </v-map>
</template>
<script>
import { VMap, VOverview } from 'vue-openlayers-map'
export default {
  data(){
    return {
      overview: {
        view: {
          center: [118.045456, 24.567489],
          zoom: 10
        },
        layers: [
          'td'
        ]
      }
    }
  }
}
</script>	
```

