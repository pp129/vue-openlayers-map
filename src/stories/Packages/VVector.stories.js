import { VMap, VTile, VVector } from "@/packages";

/**
 * VVector - 优化后的矢量图层组件
 *
 * 核心优化：
 * - 继承 BaseLayer，统一资源管理
 * - 样式缓存优化，提升渲染性能
 * - 完善的要素更新机制
 * - 支持聚合和动画
 */
export default {
  title: "Packages/VVector",
  component: VVector,
  tags: ["autodocs"],
  render: (args) => ({
    components: { VMap, VTile, VVector },
    setup() {
      return { args };
    },
    template: `
      <v-map :view="{ center: [118.0894, 24.4798], zoom: 13, projection: 'EPSG:4326' }" style="width: 100%; height: 600px;">
        <v-tile tile-type="TD" />
        <v-vector
          :features="args.features"
          :z-index="args.zIndex"
          :visible="args.visible"
        />
      </v-map>
    `,
  }),
  parameters: {
    docs: {
      description: {
        component: `
## VVector 矢量图层组件

优化后的矢量图层组件，支持点、线、面等多种要素类型。

### 主要特性

- ✅ **样式缓存**: LRU 缓存优化，提升渲染性能
- ✅ **多要素类型**: 支持点、线、面、圆等
- ✅ **灵活样式**: 支持 Icon、Circle、Stroke、Fill 等样式
- ✅ **动态更新**: 支持要素的增删改查
- ✅ **事件监听**: 支持点击、悬停等交互事件

### 使用示例

#### 点要素
\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile tile-type="TD" />
    <v-vector :features="pointFeatures" />
  </v-map>
</template>

<script>
export default {
  data() {
    return {
      pointFeatures: [
        {
          type: 'point',
          coordinates: [118.0894, 24.4798],
          style: {
            circle: {
              radius: 8,
              fill: { color: 'rgba(255, 0, 0, 0.8)' },
              stroke: { color: '#fff', width: 2 }
            },
            text: {
              text: '厦门',
              fill: { color: '#fff' },
              offsetY: -20
            }
          }
        }
      ]
    };
  }
};
</script>
\`\`\`

#### 线要素
\`\`\`vue
<template>
  <v-vector :features="lineFeatures" />
</template>

<script>
export default {
  data() {
    return {
      lineFeatures: [
        {
          type: 'line',
          coordinates: [
            [118.05, 24.45],
            [118.10, 24.48],
            [118.12, 24.50]
          ],
          style: {
            stroke: {
              color: '#ff5722',
              width: 3
            }
          }
        }
      ]
    };
  }
};
</script>
\`\`\`

#### 面要素
\`\`\`vue
<template>
  <v-vector :features="polygonFeatures" />
</template>

<script>
export default {
  data() {
    return {
      polygonFeatures: [
        {
          type: 'polygon',
          coordinates: [[
            [118.05, 24.45],
            [118.10, 24.45],
            [118.10, 24.50],
            [118.05, 24.50],
            [118.05, 24.45]
          ]],
          style: {
            fill: {
              color: 'rgba(33, 150, 243, 0.3)'
            },
            stroke: {
              color: '#2196f3',
              width: 2
            }
          }
        }
      ]
    };
  }
};
</script>
\`\`\`

### Feature 配置

| 属性 | 类型 | 说明 | 必填 |
|------|------|------|------|
| type | String | 要素类型: point/line/polygon/circle | ✅ |
| coordinates | Array | 坐标数组 | ✅ |
| style | Object | 样式配置 | ❌ |
| properties | Object | 自定义属性 | ❌ |

### Style 配置

#### Circle 样式
\`\`\`javascript
{
  circle: {
    radius: 8,
    fill: { color: 'rgba(255, 0, 0, 0.8)' },
    stroke: { color: '#fff', width: 2 }
  }
}
\`\`\`

#### Icon 样式
\`\`\`javascript
{
  icon: {
    src: '/path/to/icon.png',
    scale: 1,
    anchor: [0.5, 1]
  }
}
\`\`\`

#### Text 样式
\`\`\`javascript
{
  text: {
    text: '标签文字',
    fill: { color: '#333' },
    font: '14px sans-serif',
    offsetY: -20
  }
}
\`\`\`

### Props

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| features | Array | 要素数组 | [] |
| zIndex | Number | 图层层级 | 10 |
| visible | Boolean | 是否可见 | true |
| declutter | Boolean | 文本避让 | false |
        `,
      },
    },
  },
};

/**
 * 点要素 - 单个标记
 */
export const SinglePoint = {
  args: {
    features: [
      {
        type: "point",
        coordinates: [118.0894, 24.4798],
        style: {
          circle: {
            radius: 10,
            fill: { color: "rgba(255, 0, 0, 0.8)" },
            stroke: { color: "#fff", width: 3 },
          },
          text: {
            text: "厦门市",
            fill: { color: "#fff" },
            font: "bold 14px sans-serif",
            offsetY: -25,
            backgroundFill: { color: "rgba(0, 0, 0, 0.7)" },
            padding: [3, 6, 3, 6],
          },
        },
      },
    ],
    zIndex: 10,
    visible: true,
  },
};

/**
 * 多个点要素
 */
export const MultiplePoints = {
  args: {
    features: [
      {
        type: "point",
        coordinates: [118.0694, 24.4698],
        style: {
          circle: {
            radius: 8,
            fill: { color: "rgba(76, 175, 80, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            text: "点 A",
            fill: { color: "#fff" },
            offsetY: -20,
          },
        },
      },
      {
        type: "point",
        coordinates: [118.0894, 24.4798],
        style: {
          circle: {
            radius: 8,
            fill: { color: "rgba(33, 150, 243, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            text: "点 B",
            fill: { color: "#fff" },
            offsetY: -20,
          },
        },
      },
      {
        type: "point",
        coordinates: [118.1094, 24.4898],
        style: {
          circle: {
            radius: 8,
            fill: { color: "rgba(255, 152, 0, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            text: "点 C",
            fill: { color: "#fff" },
            offsetY: -20,
          },
        },
      },
    ],
    zIndex: 10,
    visible: true,
  },
};

/**
 * 线要素
 */
export const LineString = {
  args: {
    features: [
      {
        type: "line",
        coordinates: [
          [118.06, 24.46],
          [118.08, 24.47],
          [118.1, 24.48],
          [118.11, 24.5],
        ],
        style: {
          stroke: {
            color: "#ff5722",
            width: 4,
            lineDash: [10, 5],
          },
        },
      },
    ],
    zIndex: 10,
    visible: true,
  },
};

/**
 * 面要素
 */
export const Polygon = {
  args: {
    features: [
      {
        type: "polygon",
        coordinates: [
          [
            [118.07, 24.47],
            [118.1, 24.47],
            [118.1, 24.5],
            [118.07, 24.5],
            [118.07, 24.47],
          ],
        ],
        style: {
          fill: {
            color: "rgba(33, 150, 243, 0.3)",
          },
          stroke: {
            color: "#2196f3",
            width: 2,
          },
        },
      },
    ],
    zIndex: 10,
    visible: true,
  },
};

/**
 * 圆形区域
 */
export const Circle = {
  args: {
    features: [
      {
        type: "circle",
        coordinates: [118.0894, 24.4798],
        radius: 2000, // 半径（米）
        style: {
          fill: {
            color: "rgba(255, 152, 0, 0.2)",
          },
          stroke: {
            color: "#ff9800",
            width: 2,
          },
        },
      },
    ],
    zIndex: 10,
    visible: true,
  },
};

/**
 * 混合要素
 */
export const Mixed = {
  args: {
    features: [
      // 面
      {
        type: "polygon",
        coordinates: [
          [
            [118.07, 24.47],
            [118.1, 24.47],
            [118.1, 24.5],
            [118.07, 24.5],
            [118.07, 24.47],
          ],
        ],
        style: {
          fill: { color: "rgba(76, 175, 80, 0.2)" },
          stroke: { color: "#4caf50", width: 2 },
        },
      },
      // 线
      {
        type: "line",
        coordinates: [
          [118.06, 24.46],
          [118.11, 24.51],
        ],
        style: {
          stroke: { color: "#ff5722", width: 3 },
        },
      },
      // 点
      {
        type: "point",
        coordinates: [118.0894, 24.4798],
        style: {
          circle: {
            radius: 10,
            fill: { color: "rgba(255, 0, 0, 0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            text: "中心点",
            fill: { color: "#fff" },
            offsetY: -25,
            backgroundFill: { color: "rgba(0, 0, 0, 0.7)" },
            padding: [3, 6, 3, 6],
          },
        },
      },
    ],
    zIndex: 10,
    visible: true,
  },
};
