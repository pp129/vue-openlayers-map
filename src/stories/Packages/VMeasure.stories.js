import { VMap, VTile, VMeasure } from "@/packages";

/**
 * VMeasure - 测量工具组件
 */
export default {
  title: "Packages/VMeasure",
  component: VMeasure,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## VMeasure 测量工具组件

优化后的地图测量工具，支持距离和面积测量。

### 主要特性

- ✅ **距离测量**: 支持多段线距离测量
- ✅ **面积测量**: 支持多边形面积测量
- ✅ **实时显示**: 绘制过程中实时显示测量结果
- ✅ **单位转换**: 自动选择合适的单位

### 使用示例

\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile tile-type="TD" />
    <v-measure 
      :active="measureActive"
      :measure-type="measureType"
      @measureend="onMeasureEnd"
    />
  </v-map>
</template>

<script>
export default {
  data() {
    return {
      measureActive: false,
      measureType: 'LineString' // 'LineString' 或 'Polygon'
    };
  },
  methods: {
    onMeasureEnd(result) {
      console.log('测量结果', result);
    }
  }
};
</script>
\`\`\`

### Props

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| active | Boolean | 是否激活测量 | false |
| measureType | String | 测量类型 | 'LineString' |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| measureend | (result) | 测量完成 |
        `,
      },
    },
  },
};

export const Basic = {
  render: () => ({
    components: { VMap, VTile, VMeasure },
    data() {
      return {
        viewOptions: {
          center: [118.0894, 24.4798],
          zoom: 13,
          projection: "EPSG:4326",
        },
        measureActive: true,
        measureType: "LineString",
      };
    },
    template: `
      <div>
        <v-map :view="viewOptions" style="width: 100%; height: 600px;">
          <v-tile tile-type="TD" />
          <v-measure 
            :active="measureActive" 
            :measure-type="measureType"
            @measureend="result => console.log('测量结果', result)"
          />
        </v-map>
        <div style="margin-top: 10px;">
          <label style="margin-right: 20px;">
            <input type="radio" value="LineString" v-model="measureType" /> 距离测量
          </label>
          <label>
            <input type="radio" value="Polygon" v-model="measureType" /> 面积测量
          </label>
        </div>
      </div>
    `,
  }),
};
