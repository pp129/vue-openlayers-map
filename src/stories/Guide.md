# 起步

## 完整引入

在 `main.js`中写入以下内容：

```js
import Vue from "vue";
import App from "./App.vue";
import olMap from "v-ol-map";

Vue.use(olMap);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
```

## 按需引用

```html
<template>
  <v-map>
    <v-tile></v-tile>
  </v-map>
</template>

<script>
  import { VMap, VTile } from "v-ol-map";
  export default {
    components: {
      VMap,
      VTile,
    },
  };
</script>
```
