import { VMap } from "@/packages";

/**
 * VMap - 优化后的地图组件
 *
 * 核心优化：
 * - 使用 provide/inject 统一管理地图实例
 * - 完善的生命周期管理
 * - 支持多种投影坐标系
 * - 内置性能优化
 */
export default {
  title: "Packages/VMap",
  component: VMap,
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: "text",
      description: "地图宽度",
      defaultValue: "100%",
    },
    height: {
      control: "text",
      description: "地图高度",
      defaultValue: "600px",
    },
    view: {
      control: "object",
      description: "视图配置",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
## VMap 地图组件

优化后的地图容器组件，提供统一的地图实例管理和性能优化。

### 主要特性

- ✅ **统一实例管理**: 通过 provide/inject 向子组件提供地图实例
- ✅ **完善生命周期**: 自动处理组件挂载和卸载
- ✅ **多投影支持**: 支持 EPSG:4326、EPSG:3857、百度、高德等坐标系
- ✅ **性能优化**: 内置防抖和节流，优化交互性能
- ✅ **灵活配置**: 支持自定义视图、交互、控件等

### 使用示例

\`\`\`vue
<template>
  <v-map :view="viewOptions" @load="onMapLoad">
    <v-tile tile-type="TD" />
    <v-vector :features="features" />
  </v-map>
</template>

<script>
import { VMap, VTile, VVector } from '@/packages';

export default {
  components: { VMap, VTile, VVector },
  data() {
    return {
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 12,
        projection: 'EPSG:4326'
      },
      features: []
    };
  },
  methods: {
    onMapLoad(map) {
      console.log('地图加载完成', map);
    }
  }
};
</script>
\`\`\`

### View 配置项

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| center | Array | 地图中心坐标 | [0, 0] |
| zoom | Number | 缩放级别 | 10 |
| projection | String | 投影坐标系 | 'EPSG:3857' |
| rotation | Number | 旋转角度（弧度） | 0 |
| minZoom | Number | 最小缩放级别 | - |
| maxZoom | Number | 最大缩放级别 | - |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| load | (map) | 地图加载完成 |
| click | (event) | 地图点击事件 |
| dblclick | (event) | 地图双击事件 |
| pointermove | (event) | 鼠标移动事件 |
        `,
      },
    },
  },
};

/**
 * 基础示例 - 厦门市地图
 */
export const Basic = {
  args: {
    width: "100%",
    height: "600px",
    view: {
      center: [118.0894, 24.4798],
      zoom: 12,
      projection: "EPSG:4326",
    },
  },
};

/**
 * 北京市地图
 */
export const Beijing = {
  args: {
    width: "100%",
    height: "600px",
    view: {
      center: [116.4074, 39.9042],
      zoom: 11,
      projection: "EPSG:4326",
    },
  },
};

/**
 * 自定义尺寸
 */
export const CustomSize = {
  args: {
    width: "800px",
    height: "400px",
    view: {
      center: [121.4737, 31.2304],
      zoom: 10,
      projection: "EPSG:4326",
    },
  },
};

/**
 * 带旋转的地图
 */
export const WithRotation = {
  args: {
    width: "100%",
    height: "600px",
    view: {
      center: [113.2644, 23.1291],
      zoom: 11,
      projection: "EPSG:4326",
      rotation: Math.PI / 6, // 旋转30度
    },
  },
};
