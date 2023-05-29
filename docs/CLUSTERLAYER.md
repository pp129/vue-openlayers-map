# 聚合图层 v-super-cluster

用于海量数据聚合类矢量数据的图层。基于supercluster聚合原理实现。简单少量的聚合可以使用v-vector的cluster属性实现。

```javascript
import { VSuperCluster } from 'v-ol-map'
```

## 参数 props

| 参数        | 类型     | 默认值                                                       | 描述                     |
|-----------|--------|-----------------------------------------------------------|------------------------|
| `cluster` | Object | [Options](https://github.com/mapbox/supercluster#options) | supercluster的options属性 |

## 事件 event

| Event Name  | Description | Parameters           |
|-------------|-------------|----------------------|
| singleclick | 点击事件        | ({MapEvent,feature}) |
| pointermove | 鼠标悬浮事件      | ({MapEvent,feature}) |

## 方法 methods

### getLeaves

参数参考：https://github.com/mapbox/supercluster#getleavesclusterid-limit--10-offset--0


