import { VMap, VTile } from "@/packages";

/**
 * VTile - 优化后的瓦片图层组件
 *
 * 核心优化：
 * - 继承 BaseLayer，统一资源管理
 * - 优化 dispose 逻辑，防止内存泄漏
 * - 支持鹰眼图配置
 * - 移除冗余 console.log
 */
export default {
  title: "Packages/VTile",
  component: VTile,
  tags: ["autodocs"],
  argTypes: {
    tileType: {
      control: "select",
      options: [
        "TD",
        "TD_IMG",
        "XYZ",
        "BD",
        "BD_DARK",
        "BD_BLUE",
        "GD",
        "GD_IMG",
        "OSM",
        "WMS",
        "ARCGIS_BLUE",
        "ARCGIS_WARM",
        "ARCGIS_NORMAL",
        "ARCGIS_GRAY",
        "FJ_BLUE",
        "GEOTIFF",
      ],
      description: "瓦片类型",
    },
    zIndex: {
      control: "number",
      description: "图层层级",
    },
    visible: {
      control: "boolean",
      description: "是否可见",
      defaultValue: true,
    },
  },
  render: (args) => ({
    components: { VMap, VTile },
    setup() {
      return { args };
    },
    template: `
      <v-map :view="{ center: [118.0894, 24.4798], zoom: 12, projection: 'EPSG:4326' }" style="width: 100%; height: 600px;">
        <v-tile
          :tile-type="args.tileType"
          :z-index="args.zIndex"
          :visible="args.visible"
          :overview-map="args.overviewMap"
        />
      </v-map>
    `,
  }),
  parameters: {
    docs: {
      description: {
        component: `
## VTile 瓦片图层组件

优化后的瓦片图层组件，支持多种地图服务和鹰眼图功能。

### 主要特性

- ✅ **多地图源支持**: 天地图、百度、高德、OpenStreetMap、WMS 等
- ✅ **鹰眼图功能**: 通过 overviewMap 属性配置鹰眼图
- ✅ **性能优化**: 完善的资源清理，防止内存泄漏
- ✅ **灵活配置**: 支持自定义瓦片源、投影坐标系等

### 使用示例

#### 基础使用
\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile tile-type="TD" />
  </v-map>
</template>
\`\`\`

#### 带鹰眼图
\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile 
      tile-type="GD"
      :overview-map="{
        collapsed: false,
        collapsible: true,
        rotateWithView: false,
        view: { projection: 'EPSG:4326' },
        tileType: 'TD'
      }"
    />
  </v-map>
</template>
\`\`\`

#### 自定义 XYZ 瓦片源
\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile 
      tile-type="XYZ"
      :xyz="{
        url: 'https://example.com/tiles/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous'
      }"
    />
  </v-map>
</template>
\`\`\`

### 支持的瓦片类型

| 类型 | 说明 |
|------|------|
| TD | 天地图矢量 |
| TD_IMG | 天地图影像 |
| GD | 高德地图 |
| GD_IMG | 高德影像 |
| BD | 百度地图 |
| BD_DARK | 百度暗色主题 |
| BD_BLUE | 百度蓝色主题 |
| OSM | OpenStreetMap |
| WMS | WMS 服务 |
| ARCGIS_* | ArcGIS 系列 |
| XYZ | 自定义 XYZ 瓦片 |

### Props

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| tileType | String | 瓦片类型 | 'TD' |
| zIndex | Number | 图层层级 | 0 |
| visible | Boolean | 是否可见 | true |
| overviewMap | Object | 鹰眼图配置 | - |
| xyz | Object | XYZ 瓦片配置 | {} |
| wms | Object | WMS 配置 | {} |
        `,
      },
    },
  },
};

/**
 * 天地图矢量
 */
export const TianDiTu = {
  args: {
    tileType: "TD",
    zIndex: 0,
    visible: true,
  },
};

/**
 * 天地图影像
 */
export const TianDiTuImage = {
  args: {
    tileType: "TD_IMG",
    zIndex: 0,
    visible: true,
  },
};

/**
 * 高德地图
 */
export const GaoDe = {
  args: {
    tileType: "GD",
    zIndex: 0,
    visible: true,
  },
};

/**
 * 百度地图
 */
export const Baidu = {
  args: {
    tileType: "BD",
    zIndex: 0,
    visible: true,
  },
};

/**
 * OpenStreetMap
 */
export const OSM = {
  args: {
    tileType: "OSM",
    zIndex: 0,
    visible: true,
  },
};

/**
 * ArcGIS 蓝色主题
 */
export const ArcGISBlue = {
  args: {
    tileType: "ARCGIS_BLUE",
    zIndex: 0,
    visible: true,
  },
};

/**
 * 带鹰眼图的地图
 */
export const WithOverviewMap = {
  args: {
    tileType: "GD",
    zIndex: 0,
    visible: true,
    overviewMap: {
      collapsed: false,
      collapsible: true,
      rotateWithView: false,
      view: {
        projection: "EPSG:4326",
      },
      tileType: "TD",
    },
  },
};
