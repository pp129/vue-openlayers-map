# 使用指南

## 快速开始

### 1. 引入优化后的组件

```javascript
// 方式1: 按需引入
import { VMapOptimized, EventManager } from "@/packages";

// 方式2: 全量引入
import * as OptimizedOL from "@/packages";
```

### 2. 在 Vue 中使用

```vue
<template>
  <div class="map-container">
    <v-map-optimized :width="'100%'" :height="'600px'" :view="viewConfig" @load="onMapLoad" @pointermove="onPointerMove">
      <!-- 子图层组件 -->
    </v-map-optimized>
  </div>
</template>

<script>
import { VMapOptimized } from "@/packages";

export default {
  components: {
    VMapOptimized,
  },
  data() {
    return {
      viewConfig: {
        center: [0, 0],
        zoom: 5,
      },
    };
  },
  methods: {
    onMapLoad(map) {
      console.log("Map loaded:", map);
    },
    onPointerMove(evt, map) {
      // 已自动节流到 50ms
      console.log("Pointer move:", evt.coordinate);
    },
  },
};
</script>
```

## 核心工具使用

### 事件管理器 (EventManager)

```javascript
import { EventManager } from "@/packages";

export default {
  data() {
    return {
      eventManager: null,
    };
  },
  mounted() {
    this.eventManager = new EventManager();

    // 添加事件监听
    const clickListener = this.map.on("click", this.handleClick);
    this.eventManager.add(clickListener, "map-click");

    // 添加另一个监听器
    const moveListener = this.map.on("pointermove", this.handleMove);
    this.eventManager.add(moveListener, "map-move");
  },
  beforeDestroy() {
    // 一键清理所有监听器
    this.eventManager.dispose();
  },
  methods: {
    handleClick(evt) {
      console.log("Map clicked");
    },
    handleMove(evt) {
      console.log("Mouse moved");
    },
  },
};
```

### 图层管理器 (LayerManager)

```javascript
import { LayerManager } from "@/packages";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export default {
  data() {
    return {
      layerManager: null,
    };
  },
  methods: {
    initLayers() {
      this.layerManager = new LayerManager(this.map);

      // 创建图层
      const vectorLayer = new VectorLayer({
        source: new VectorSource(),
      });

      // 添加图层 (会自动管理)
      this.layerManager.addLayer("my-vector", vectorLayer);

      // 移除图层 (自动清理资源)
      this.layerManager.removeLayer("my-vector");

      // 获取图层
      const layer = this.layerManager.getLayer("my-vector");

      // 检查图层是否存在
      if (this.layerManager.hasLayer("my-vector")) {
        console.log("Layer exists");
      }
    },
  },
  beforeDestroy() {
    // 清理所有图层
    if (this.layerManager) {
      this.layerManager.dispose();
    }
  },
};
```

### 样式缓存 (StyleCache)

```javascript
import { StyleCache } from "@/packages";
import { Style, Fill, Stroke } from "ol/style";

export default {
  data() {
    return {
      styleCache: null,
    };
  },
  created() {
    // 创建缓存 (最多1000条)
    this.styleCache = new StyleCache(1000);
  },
  methods: {
    getFeatureStyle(feature) {
      const cacheKey = `style-${feature.get("type")}`;

      // 尝试从缓存获取
      let style = this.styleCache.get(cacheKey);

      if (!style) {
        // 创建新样式
        style = new Style({
          fill: new Fill({ color: "blue" }),
          stroke: new Stroke({ color: "red", width: 2 }),
        });

        // 存入缓存
        this.styleCache.set(cacheKey, style);
      }

      return style;
    },

    getCacheStats() {
      // 获取缓存统计
      const stats = this.styleCache.getStats();
      console.log("Cache stats:", stats);
      // { size: 500, maxSize: 1000, utilizationRate: '50.00%' }
    },
  },
  beforeDestroy() {
    // 清空缓存
    if (this.styleCache) {
      this.styleCache.clear();
    }
  },
};
```

### 性能工具

```javascript
import { throttle, debounce, shallowArrayEqual, createPerformanceMonitor } from "@/packages";

export default {
  data() {
    return {
      throttledUpdate: null,
      debouncedSearch: null,
    };
  },
  created() {
    // 节流: 限制执行频率
    this.throttledUpdate = throttle(100, this.updateMap);

    // 防抖: 延迟执行
    this.debouncedSearch = debounce(300, this.searchFeatures);
  },
  watch: {
    features(newVal, oldVal) {
      // 浅比较避免不必要的更新
      if (!shallowArrayEqual(newVal, oldVal)) {
        this.updateFeatures(newVal);
      }
    },
  },
  methods: {
    updateMap() {
      // 会被节流到 100ms
      this.map.render();
    },

    searchFeatures(keyword) {
      // 会被防抖到 300ms
      console.log("Searching:", keyword);
    },

    performHeavyTask() {
      // 性能监控
      const monitor = createPerformanceMonitor("heavy-task");

      monitor.start("processing");
      // ... 执行耗时操作
      const duration = monitor.end("processing");

      console.log(`Task took ${duration}ms`);
    },
  },
};
```

## 自定义图层组件

### 继承 BaseLayerOptimized

```vue
<script>
import BaseLayerOptimized from "@/packages/components/layers/BaseLayer.vue";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

export default {
  name: "my-custom-layer",
  extends: BaseLayerOptimized,
  inject: ["VMap"],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  mounted() {
    this.initLayer();
  },
  beforeDestroy() {
    this.dispose();
  },
  methods: {
    initLayer() {
      // 创建图层
      const source = new VectorSource();
      this.layer = new VectorLayer({ source });

      // 添加到地图
      this.map.addLayer(this.layer);

      // 绑定事件 (自动管理)
      const clickListener = this.map.on("click", this.handleClick);
      this.addListener(clickListener, "layer-click");

      // 添加定时器 (自动清理)
      const timer = setInterval(() => {
        this.refresh();
      }, 5000);
      this.addTimer(timer);

      // 添加动画帧 (自动清理)
      const rafId = requestAnimationFrame(() => {
        this.animate();
      });
      this.addRaf(rafId);
    },

    handleClick(evt) {
      console.log("Layer clicked");
    },

    refresh() {
      // 刷新图层
      const source = this.getSource();
      if (source) {
        source.changed();
      }
    },

    animate() {
      // 动画逻辑
    },

    dispose() {
      // 调用基类清理 (会自动清理所有监听器、定时器、动画帧)
      this.baseDispose();

      // 从地图移除图层
      if (this.layer && this.map) {
        this.map.removeLayer(this.layer);
      }

      // 其他自定义清理...
    },
  },
};
</script>
```

## 全局注册 (Vue 插件)

```javascript
// main.js
import Vue from "vue";
import OptimizedOL from "@/packages";

// 方式1: 使用 install 函数
Vue.use(OptimizedOL, {
  attachToPrototype: true, // 挂载到 Vue.prototype
});

// 现在可以在组件中使用:
// this.$olUtils.EventManager
// this.$olUtils.LayerManager
```

## 高级用法

### 性能监控

```javascript
import { createPerformanceMonitor } from "@/packages";

const monitor = createPerformanceMonitor("my-component");

export default {
  methods: {
    async loadData() {
      monitor.start("data-loading");

      const data = await fetch("/api/data");

      const duration = monitor.end("data-loading");
      console.log(`Data loaded in ${duration}ms`);
    },
  },
};
```

### 批量处理

```javascript
import { createBatchProcessor } from "@/packages";

const batchProcessor = createBatchProcessor((items) => {
  // 批量处理所有要素
  const source = layer.getSource();
  source.addFeatures(items);
}, 100);

// 添加要素 (会自动批量处理)
features.forEach((feature) => {
  batchProcessor.add(feature);
});

// 立即处理所有挂起的项
batchProcessor.flush();
```

## 最佳实践

1. **总是使用 EventManager**: 避免手动 `unByKey`
2. **图层使用 LayerManager**: 统一管理生命周期
3. **大数据场景启用 StyleCache**: 避免重复创建样式
4. **高频事件使用 throttle/debounce**: 如 pointermove, resize
5. **继承 BaseLayerOptimized**: 获得自动资源管理
6. **定期检查内存**: 使用浏览器开发者工具
7. **开发环境启用性能监控**: 发现瓶颈

## 常见问题

### Q: 如何与原版本组件共存?

A: 使用不同的组件名称,优化版本使用 `VMapOptimized`,原版本使用 `VMap`。

### Q: 需要全部迁移到优化版本吗?

A: 不需要。可以逐步迁移,优先迁移性能关键路径和问题组件。

### Q: 样式缓存大小如何选择?

A: 根据要素数量:

- < 100 要素: 不需要缓存
- 100-1000: 使用默认 1000
- > 1000: 考虑增加到 2000-5000

### Q: 事件节流延迟如何调整?

A: 根据实际需求:

- pointermove: 50-100ms
- resize: 200-300ms
- scroll: 100-200ms

---

更多信息请查看 [README.md](./README.md)
