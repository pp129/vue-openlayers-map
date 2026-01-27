import { VMap, VTile } from "../packages";
import { Default as MapStoriies } from "./VMap.stories";
import TileDefaultExample from "./Tile/TileDefaultExample.vue";
import TileDefaultExampleRaw from "./Tile/TileDefaultExample.vue?raw";
import TileXYZExample from "./Tile/TileXYZExample.vue";
import TileXYZExampleRaw from "./Tile/TileXYZExample.vue?raw";
import TileWMS from "./TileWMS/index.vue";
import TileWMSRaw from "./TileWMS/index.vue?raw";
import OverviewMapExample from "./OverviewMapExample/index.vue";
import OverviewMapExampleRaw from "./OverviewMapExample/index.vue?raw";
import TileMaskExample from "./TileMask/index.vue";
import TileMaskExampleRaw from "./TileMask/index.vue?raw";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  id: "2-2",
  title: "图层/Tile瓦片图层",
  // tags: ["autodocs"],
  component: VTile,
  render: (args, { argTypes }) => ({
    setup() {
      const mapOptions = MapStoriies.args;
      const tileType = args.tileType;
      const xyz = args.xyz;
      return {
        view: mapOptions.view,
        tileType,
        xyz,
      };
    },
    components: { VMap, VTile },
    template: `
      <v-map :view="view">
        <v-tile :tile-type="tileType" :xyz="xyz"></v-tile>
      </v-map>
    `,
  }),
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 默认示例 - 天地图
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "使用天地图作为底图",
      },
      source: {
        language: "html",
        code: TileDefaultExampleRaw,
      },
    },
  },
  render: () => ({
    components: { TileDefaultExample },
    template: "<TileDefaultExample />",
  }),
};

/**
 * XYZ 瓦片示例
 *
 * 展示如何使用自定义 XYZ 瓦片服务
 */
export const XYZ = {
  parameters: {
    docs: {
      description: {
        story: "使用自定义 XYZ 瓦片服务（ArcGIS World Imagery）",
      },
      source: {
        language: "html",
        code: TileXYZExampleRaw,
      },
    },
  },
  render: () => ({
    components: { TileXYZExample },
    template: "<TileXYZExample />",
  }),
};

export const WMS = {
  parameters: {
    docs: {
      description: {
        story: "使用 WMS 服务",
      },
      source: {
        language: "html",
        code: TileWMSRaw,
      },
    },
  },
  render: () => ({
    components: { TileWMS },
    template: "<TileWMS />",
  }),
};

export const overviewMap = {
  parameters: {
    docs: {
      description: {
        story: "overview map",
      },
      source: {
        language: "html",
        code: OverviewMapExampleRaw,
      },
    },
  },
  render: () => ({
    components: { OverviewMapExample },
    template: "<OverviewMapExample />",
  }),
};

export const TileMask = {
  parameters: {
    docs: {
      description: {
        story: "tile mask",
      },
      source: {
        language: "html",
        code: TileMaskExampleRaw,
      },
    },
  },
  render: () => ({
    components: { TileMaskExample },
    template: "<TileMaskExample />",
  }),
};
