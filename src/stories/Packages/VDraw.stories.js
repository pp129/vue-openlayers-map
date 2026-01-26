import { VMap, VTile, VDraw } from "@/packages";

/**
 * VDraw - 优化后的绘制工具组件
 */
export default {
  title: "Packages/VDraw",
  component: VDraw,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## VDraw 绘制工具组件

优化后的地图绘制工具，支持点、线、面、圆等多种图形绘制。

### 主要特性

- ✅ **多种绘制类型**: Point、LineString、Polygon、Circle
- ✅ **完善的交互**: 支持修改、删除、撤销
- ✅ **样式自定义**: 灵活的样式配置
- ✅ **事件回调**: 绘制完成、修改等事件

### 使用示例

\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile tile-type="TD" />
    <v-draw 
      :active="drawActive"
      :draw-type="drawType"
      @drawend="onDrawEnd"
    />
  </v-map>
</template>

<script>
export default {
  data() {
    return {
      drawActive: false,
      drawType: 'Point'
    };
  },
  methods: {
    onDrawEnd(feature) {
      console.log('绘制完成', feature);
    }
  }
};
</script>
\`\`\`

### Props

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| active | Boolean | 是否激活绘制 | false |
| drawType | String | 绘制类型 | 'Point' |
| style | Object | 绘制样式 | - |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| drawend | (feature) | 绘制完成 |
| drawstart | (event) | 开始绘制 |
        `,
      },
    },
  },
};

export const Basic = {
  render: () => ({
    components: { VMap, VTile, VDraw },
    data() {
      return {
        viewOptions: {
          center: [118.0894, 24.4798],
          zoom: 13,
          projection: "EPSG:4326",
        },
        drawActive: true,
        drawType: "Point",
      };
    },
    template: `
      <div>
        <v-map :view="viewOptions" style="width: 100%; height: 600px;">
          <v-tile tile-type="TD" />
          <v-draw 
            :active="drawActive" 
            :draw-type="drawType"
            @drawend="feature => console.log('绘制完成', feature)"
          />
        </v-map>
        <div style="margin-top: 10px;">
          <label style="margin-right: 10px;">
            <input type="radio" value="Point" v-model="drawType" /> 点
          </label>
          <label style="margin-right: 10px;">
            <input type="radio" value="LineString" v-model="drawType" /> 线
          </label>
          <label style="margin-right: 10px;">
            <input type="radio" value="Polygon" v-model="drawType" /> 面
          </label>
          <label style="margin-right: 10px;">
            <input type="radio" value="Circle" v-model="drawType" /> 圆
          </label>
        </div>
      </div>
    `,
  }),
};
