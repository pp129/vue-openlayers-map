# Storybook 文档索引

本目录包含 Vue OpenLayers 优化包的完整文档和示例。

## 📚 文档结构

### 1. 介绍与概览

- **Introduction.mdx** - 包的整体介绍、特性说明、快速开始指南

### 2. 优化对比

- **Comparison.mdx** - 详细的性能对比、优化技术说明、实测数据

### 3. 核心组件

#### 地图容器

- **VMap.stories.js** - 地图容器组件，提供统一的地图实例管理

#### 图层组件

- **VTile.stories.js** - 瓦片图层，支持多种地图源和鹰眼图
- **VVector.stories.js** - 矢量图层，支持点线面等要素

#### 功能组件

- **VPath.stories.js** - 轨迹回放组件，支持大数据量轨迹
- **VDraw.stories.js** - 绘制工具组件
- **VMeasure.stories.js** - 测量工具组件
- **VHeatmap.stories.js** - 热力图组件

### 4. 工具函数

- **Performance.stories.js** - 性能优化工具集文档

## 🎯 文档特点

### 详细的使用示例

每个组件都包含：

- 基础使用示例
- 进阶配置示例
- 实战案例

### 完整的 API 文档

- Props 属性说明
- Events 事件列表
- Methods 方法文档
- 配置项详解

### 性能优化指南

- 优化技巧
- 最佳实践
- 常见问题

### 可交互的演示

- 实时预览
- 参数调整
- 代码示例

## 📖 查看文档

### 启动 Storybook

```bash
npm run storybook
```

### 访问路径

- 介绍页面: `Packages/介绍`
- 优化对比: `Packages/优化对比`
- VMap: `Packages/VMap`
- VTile: `Packages/VTile`
- VVector: `Packages/VVector`
- VPath: `Packages/VPath`
- 性能工具: `Packages/Utils/Performance`

## 🔧 文档维护

### 添加新组件文档

1. 在 `src/stories/Packages/` 创建 `ComponentName.stories.js`
2. 使用以下模板：

```javascript
import { VMap, YourComponent } from "@/packages";

export default {
  title: "Packages/YourComponent",
  component: YourComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `组件说明（支持 Markdown）`,
      },
    },
  },
};

export const Basic = {
  render: () => ({
    components: { VMap, YourComponent },
    // ...
  }),
};
```

### 添加 MDX 文档

1. 在 `src/stories/Packages/` 创建 `Topic.mdx`
2. 导入 Meta：

```jsx
import { Meta } from '@storybook/blocks';

<Meta title="Packages/Topic" />

# 文档标题

内容...
```

## 📝 文档规范

### 标题层级

- H1: 组件/主题名称
- H2: 主要章节
- H3: 子章节
- H4: 详细说明

### 代码块

使用语法高亮：
\`\`\`vue
// Vue 代码
\`\`\`

\`\`\`javascript
// JavaScript 代码
\`\`\`

### 表格

使用 Markdown 表格展示配置项

### 提示框

使用彩色背景块突出重要信息

## 🎨 样式指南

### 颜色使用

- 主题色: `#1890ff`
- 成功: `#52c41a`
- 警告: `#faad14`
- 危险: `#f5222d`
- 信息: `#13c2c2`

### 图标

- ✅ 完成/成功
- ❌ 错误/禁止
- ⚠️ 警告
- 💡 提示
- 🚀 性能/快速
- 📚 文档
- 🔧 工具

## 📊 示例数据

### 厦门市坐标

- 中心: `[118.0894, 24.4798]`
- 投影: `EPSG:4326`
- 缩放: `12-13`

### 其他城市

- 北京: `[116.4074, 39.9042]`
- 上海: `[121.4737, 31.2304]`
- 广州: `[113.2644, 23.1291]`

## 🤝 贡献文档

欢迎完善文档！提交 PR 时请确保：

- [ ] 代码示例可运行
- [ ] 说明清晰完整
- [ ] 符合文档规范
- [ ] 包含实际效果截图（如适用）
