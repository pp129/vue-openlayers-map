# 开始使用 start

## 安装 install

```bash
npm install v-ol-map
```

## 引入组件 import

完整引入

```javascript
import vueOlMap from 'v-ol-map'
Vue.use(vueOlMap)
```

按需引入，以VMap为例

```javascript
import { VMap } from 'v-ol-map'
```

## 开始使用 use

加载地图

```vue
<template>
  <div class="home">
    <v-map ref="map" :height="height" :width="width" :view="view"></v-map>
  </div>
</template>
<script>
export default {
  data () {
    return {
      height: '1080px',
      width: '960px',
      view: {
        center: [118.045456, 24.567489],
        zoom: 12
      }
    }
  }
}
</script>
```
