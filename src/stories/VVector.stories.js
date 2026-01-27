import { VMap, VVector, VTile } from "../packages";
import { Default as MapStoriies } from "./VMap.stories";
import GeoJsonBasicExample from "./GeoJson/GeoJsonBasicExample.vue";
import GeoJsonBasicExampleRaw from "./GeoJson/GeoJsonBasicExample.vue?raw";
import FeatureHoverExample from "./Hover/index.vue";
import FeatureHoverExampleRaw from "./Hover/index.vue?raw";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  id: "2-3",
  title: "图层/Vector矢量图层",
  // tags: ["autodocs"],
  component: VVector,
  render: (args, { argTypes }) => ({
    setup() {
      return {
        args,
      };
    },
    // props: Object.keys(argTypes),
    components: { VMap, VVector },
    template: `
      <v-map v-bind="args.map">
        <v-vector v-bind="args.layer"></v-vector>
      </v-map>
    `,
  }),
  parameters: {
    docs: {
      description: {
        component: "",
      },
    },
  },
};

export const Default = {
  args: {
    map: MapStoriies.args,
    layer: {
      features: [
        {
          id: "point1",
          coordinates: [118.124742, 24.487405],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              src: new URL("../assets/img/point_1.png", import.meta.url).href,
            },
          },
          properties: {
            name: "feature1",
            level: 2,
          },
        },
      ],
    },
  },
};

export const Modify = {
  parameters: {
    docs: {
      description: {
        story: "",
      },
    },
  },
  args: {
    map: MapStoriies.args,
    layer: {
      features: [
        {
          id: "point1",
          coordinates: [118.124742, 24.487405],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              src: new URL("../assets/img/point_2.png", import.meta.url).href,
            },
          },
          properties: {
            name: "feature1",
            level: 2,
          },
        },
      ],
      modify: true,
    },
  },
  render: (args, { argTypes }) => ({
    setup() {
      return {
        args,
      };
    },
    // props: Object.keys(argTypes),
    components: { VMap, VVector, VTile },
    template: `
      <v-map v-bind="args.map">
        <v-tile tile-type="BD"></v-tile>
        <v-vector v-bind="args.layer"></v-vector>
      </v-map>
    `,
  }),
};

/**
 * GeoJSON 基础示例
 *
 * 展示如何使用 geoJson 属性加载 GeoJSON 格式的点数据，
 * 以及要素级别样式与图层统一样式的优先级关系
 */
export const GeoJsonBasic = {
  parameters: {
    docs: {
      description: {
        story: "GeoJSON 基础示例。展示样式优先级：Feature.properties.style（红色/绿色点）> layerStyle（蓝色点）",
      },
      source: {
        language: "html",
        code: GeoJsonBasicExampleRaw,
      },
    },
  },
  render: () => ({
    components: { GeoJsonBasicExample },
    template: "<GeoJsonBasicExample />",
  }),
};

export const FeatureHover = {
  parameters: {
    docs: {
      description: {
        story: "Feature 鼠标悬停示例",
      },
      source: {
        language: "html",
        code: FeatureHoverExampleRaw,
      },
    },
  },
  render: () => ({
    components: { FeatureHoverExample },
    template: "<FeatureHoverExample />",
  }),
};
