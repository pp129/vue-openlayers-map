import { VMap, VTile, VHeatmap } from "@/packages";

/**
 * VHeatmap - 热力图组件
 */
export default {
  title: "Packages/VHeatmap",
  component: VHeatmap,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## VHeatmap 热力图组件

优化后的热力图组件，用于展示数据密度分布。

### 主要特性

- ✅ **高性能渲染**: 支持大量数据点
- ✅ **渐变配置**: 自定义颜色渐变
- ✅ **模糊半径**: 可调节模糊效果
- ✅ **权重支持**: 支持数据权重

### 使用示例

\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile tile-type="TD" />
    <v-heatmap :data="heatmapData" :radius="20" :blur="15" />
  </v-map>
</template>

<script>
export default {
  data() {
    return {
      heatmapData: [
        { lon: 118.08, lat: 24.47, weight: 0.8 },
        { lon: 118.09, lat: 24.48, weight: 0.6 },
        { lon: 118.10, lat: 24.49, weight: 1.0 }
      ]
    };
  }
};
</script>
\`\`\`

### Props

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| data | Array | 热力数据 | [] |
| radius | Number | 模糊半径 | 15 |
| blur | Number | 模糊程度 | 10 |
| gradient | Array | 颜色渐变 | - |
        `,
      },
    },
  },
};

export const Basic = {
  render: () => ({
    components: { VMap, VTile, VHeatmap },
    data() {
      return {
        viewOptions: {
          center: [118.0894, 24.4798],
          zoom: 12,
          projection: "EPSG:4326",
        },
        heatmapData: [],
      };
    },
    mounted() {
      // 生成随机热力数据
      const center = [118.0894, 24.4798];
      const data = [];

      for (let i = 0; i < 200; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.05;

        data.push({
          lon: center[0] + Math.cos(angle) * radius,
          lat: center[1] + Math.sin(angle) * radius,
          weight: Math.random(),
        });
      }

      this.heatmapData = data;
    },
    template: `
      <v-map :view="viewOptions" style="width: 100%; height: 600px;">
        <v-tile tile-type="TD" />
        <v-heatmap :data="heatmapData" :radius="20" :blur="15" />
      </v-map>
    `,
  }),
};
