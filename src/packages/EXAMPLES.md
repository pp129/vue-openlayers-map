# 📚 使用示例

本文档提供了 Vue OpenLayers 优化包的完整使用示例。

## 📁 示例文件位置

所有示例代码位于 `src/examples/` 目录下：

```
examples/
├── BasicMapExample/
│   └── index.vue          # 基础地图示例
├── ClusterExample/
│   └── index.vue          # 聚合图层示例
├── DrawExample/
│   └── index.vue          # 绘制工具示例
└── ... (其他示例)
```

## 🚀 快速开始

### 1. 安装依赖

确保项目中已安装所需依赖：

```bash
npm install
# or
pnpm install
```

### 2. 引入组件

```javascript
import { VMap, VTile, VVector, VSuperCluster, VDraw, VOverlay, VTrack } from "@/packages";
```

### 3. 引入工具函数

```javascript
import { EventManager, StyleCache, setFeature, setFeatures, flyTo, panTo } from "@/packages";
```

---

## 📖 示例说明

### 1. 基础地图示例 (BasicMapExample.vue)

展示了如何创建一个基础地图，包含：

- ✅ 基础瓦片图层（支持多种地图类型切换）
- ✅ 矢量图层（显示点标记）
- ✅ 覆盖物（信息弹窗）
- ✅ 地图交互（点击、飞行动画）

#### 核心代码

```vue
<template>
  <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
    <!-- 瓦片图层 -->
    <v-tile :tile-type="tileType" />

    <!-- 矢量图层 -->
    <v-vector :features="pointFeatures" />

    <!-- 覆盖物 -->
    <v-overlay v-if="overlayPosition" :position="overlayPosition">
      <div class="popup-content">
        <h3>{{ overlayData.title }}</h3>
        <p>{{ overlayData.description }}</p>
      </div>
    </v-overlay>
  </v-map>
</template>

<script>
import { VMap, VTile, VVector, VOverlay } from "@/packages";

export default {
  components: { VMap, VTile, VVector, VOverlay },
  data() {
    return {
      viewOptions: {
        center: [118.0894, 24.4798], // 厦门
        zoom: 12,
        projection: "EPSG:4326",
      },
      tileType: "TD", // 天地图
      pointFeatures: [
        {
          type: "point",
          coordinates: [118.0894, 24.4798],
          style: {
            icon: {
              src: "icon.png",
              scale: 0.8,
            },
          },
        },
      ],
    };
  },
};
</script>
```

#### 运行示例

```vue
<template>
  <BasicMapExample />
</template>

<script>
export default {
  name: "App",
  components: {
    BasicMapExample: () => import("@/examples/BasicMapExample/index.vue"),
  },
};
</script>
```

或通过路由访问：`/#/BasicMapExample`

---

### 2. 聚合图层示例 (ClusterExample.vue)

展示了如何使用聚合图层处理大量点数据：

- ✅ 高性能聚合（支持数千个点）
- ✅ 自定义聚合样式（分级显示）
- ✅ 动态调整聚合距离
- ✅ 点击聚合点放大地图

#### 核心代码

```vue
<template>
  <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
    <v-tile tile-type="TD" />

    <!-- 聚合图层 -->
    <v-super-cluster
      :features="clusterFeatures"
      :distance="60"
      :min-distance="40"
      :style="clusterStyle"
      @cluster-click="onClusterClick"
    />
  </v-map>
</template>

<script>
import { VMap, VTile, VSuperCluster } from "@/packages";

export default {
  components: { VMap, VTile, VSuperCluster },
  data() {
    return {
      clusterFeatures: [], // 点数据
      clusterStyle: [
        {
          min: 0,
          max: 10,
          circle: {
            radius: 15,
            fill: { color: "rgba(52, 211, 153, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            fill: { color: "#fff" },
            font: "bold 14px sans-serif",
          },
        },
        {
          min: 10,
          max: 50,
          circle: {
            radius: 20,
            fill: { color: "rgba(59, 130, 246, 0.8)" },
          },
        },
        // ... 更多样式分级
      ],
    };
  },
  methods: {
    onClusterClick(feature) {
      const features = feature.get("features");
      if (features.length > 1) {
        // 放大地图
        const extent = feature.getGeometry().getExtent();
        this.map.getView().fit(extent, { duration: 500 });
      }
    },
  },
};
</script>
```

#### 特性说明

| 属性         | 类型         | 说明             | 默认值 |
| ------------ | ------------ | ---------------- | ------ |
| features     | Array        | 点要素数组       | []     |
| distance     | Number       | 聚合距离（像素） | 60     |
| min-distance | Number       | 最小聚合距离     | 40     |
| style        | Array/Object | 聚合样式配置     | -      |

---

### 3. 绘制工具示例 (DrawExample.vue)

展示了如何使用绘制工具在地图上绘制要素：

- ✅ 支持多种绘制类型（点、线、面、圆、矩形）
- ✅ 自由绘制模式
- ✅ 右键结束绘制
- ✅ 绘制完成后保存要素

#### 核心代码

```vue
<template>
  <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
    <v-tile tile-type="TD" />

    <!-- 显示已绘制的要素 -->
    <v-vector :features="drawnFeatures" />

    <!-- 绘制工具 -->
    <v-draw
      v-if="isDrawing"
      :type="drawType"
      :style="drawStyle"
      :freehand="freehand"
      :end-right="endRight"
      @drawend="onDrawEnd"
    />
  </v-map>
</template>

<script>
import { VMap, VTile, VVector, VDraw } from "@/packages";

export default {
  components: { VMap, VTile, VVector, VDraw },
  data() {
    return {
      isDrawing: false,
      drawType: "Point", // Point, LineString, Polygon, Circle, Box
      freehand: false,
      endRight: true,
      drawnFeatures: [],
      drawStyle: {
        fill: { color: "rgba(67, 126, 255, 0.3)" },
        stroke: { color: "rgba(67, 126, 255, 1)", width: 2 },
      },
    };
  },
  methods: {
    onDrawEnd(feature) {
      // 将绘制的要素添加到数组
      const newFeature = {
        type: this.drawType,
        coordinates: feature.getGeometry().getCoordinates(),
        style: this.getFeatureStyle(),
      };
      this.drawnFeatures = [...this.drawnFeatures, newFeature];
    },
  },
};
</script>
```

#### 绘制类型说明

| 类型       | 说明   |
| ---------- | ------ |
| Point      | 点     |
| LineString | 线     |
| Polygon    | 多边形 |
| Circle     | 圆形   |
| Box        | 矩形   |

---

## 🔧 工具函数使用

### 1. 创建要素

```javascript
import { setFeature, setFeatures } from "@/packages";

// 创建单个要素
const feature = setFeature(
  {
    type: "point",
    coordinates: [118.0894, 24.4798],
    style: {
      icon: {
        src: "icon.png",
        scale: 0.8,
      },
    },
    properties: {
      name: "厦门",
    },
  },
  map
);

// 批量创建要素
const features = setFeatures(
  [
    { type: "point", coordinates: [118.0894, 24.4798] },
    { type: "point", coordinates: [118.1094, 24.4898] },
  ],
  map
);
```

### 2. 地图动画

```javascript
import { flyTo, panTo } from "@/packages";

// 飞行动画
flyTo(map, {
  center: [118.0894, 24.4798],
  zoom: 15,
  duration: 2000,
  flyZoom: 10, // 中间飞行的缩放级别
});

// 平移动画
panTo(map, {
  center: [118.0894, 24.4798],
  duration: 1000,
});
```

### 3. 事件管理

```javascript
import { EventManager } from "@/packages";

// 创建事件管理器
const eventManager = new EventManager();

// 添加事件（自动管理）
const listener = map.on("click", (evt) => {
  console.log("地图点击", evt);
});
eventManager.add(listener, "map-click");

// 移除单个事件
eventManager.remove("map-click");

// 移除所有事件
eventManager.removeAll();
```

### 4. 样式缓存

```javascript
import { StyleCache } from "@/packages";

// 创建样式缓存 (最大1000条)
const styleCache = new StyleCache(1000);

// 获取或创建样式
const getStyle = (key) => {
  let style = styleCache.get(key);
  if (!style) {
    style = createStyle(); // 创建新样式
    styleCache.set(key, style);
  }
  return style;
};
```

---

## 📝 常见问题

### Q1: 如何切换地图类型？

修改 `tile-type` 属性：

```vue
<v-tile :tile-type="tileType" />

<!-- 支持的类型 -->
<!-- TD: 天地图 -->
<!-- TD_IMG: 天地图影像 -->
<!-- GD: 高德地图 -->
<!-- GD_IMG: 高德影像 -->
<!-- BD: 百度地图 -->
<!-- OSM: OpenStreetMap -->
```

### Q2: 如何自定义要素样式？

```javascript
const feature = {
  type: "point",
  coordinates: [118.0894, 24.4798],
  style: {
    // 使用图标
    icon: {
      src: "icon.png",
      scale: 0.8,
      anchor: [0.5, 1], // 锚点
      rotation: 0, // 旋转角度
    },
    // 或使用圆形
    circle: {
      radius: 10,
      fill: { color: "rgba(255, 0, 0, 0.6)" },
      stroke: { color: "#fff", width: 2 },
    },
    // 添加文本
    text: {
      text: "标记",
      fill: { color: "#fff" },
      font: "bold 14px sans-serif",
      offsetY: -20,
    },
  },
};
```

### Q3: 如何处理大量点数据？

使用聚合图层：

```vue
<v-super-cluster :features="largeDataset" :distance="60" :min-distance="40" :style="clusterStyle" />
```

建议：

- 超过 100 个点时使用聚合
- 数据量超过 1000 时，考虑分页加载或视野内加载

### Q4: 如何监听地图事件？

```vue
<v-map @load="onMapLoad" @click="onMapClick" @pointermove="onPointerMove" @moveend="onMoveEnd">
</v-map>

<script>
export default {
  methods: {
    onMapClick(evt, map) {
      console.log("点击坐标:", evt.coordinate);
      // 获取点击的要素
      const features = map.getFeaturesAtPixel(evt.pixel);
    },
  },
};
</script>
```

---

## 🎯 最佳实践

### 1. 性能优化

```javascript
// ✅ 使用样式缓存
const styleCache = new StyleCache(1000);

// ✅ 使用聚合图层处理大量点
<v-super-cluster :features="largeDataset" />

// ✅ 限制地图缩放范围
const viewOptions = {
  center: [118, 24],
  zoom: 12,
  minZoom: 3,
  maxZoom: 18,
};
```

### 2. 内存管理

```javascript
// ✅ 使用 EventManager 管理事件
const eventManager = new EventManager();

// ✅ 组件销毁时清理资源
beforeDestroy() {
  this.eventManager.removeAll();
  this.styleCache.clear();
}
```

### 3. 代码组织

```javascript
// ✅ 集中管理地图配置
const MAP_CONFIG = {
  center: [118.0894, 24.4798],
  zoom: 12,
  projection: 'EPSG:4326',
};

// ✅ 使用计算属性
computed: {
  featureCount() {
    return this.features.length;
  },
},
```

---

## 📚 更多示例

完整示例代码请查看：

- `src/examples/BasicMapExample/index.vue`
- `src/examples/ClusterExample/index.vue`
- `src/examples/DrawExample/index.vue`

运行示例：

```bash
npm run dev
# 访问示例页面
# http://localhost:8888/#/BasicMapExample
# http://localhost:8888/#/ClusterExample
# http://localhost:8888/#/DrawExample
```

---

**最后更新**: 2026-01-21
