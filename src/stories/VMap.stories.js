import VMap from "../packages/components/map/index.vue";
import MapDefaultExample from "./Map/MapDefaultExample.vue";
import MapDefaultExampleRaw from "./Map/MapDefaultExample.vue?raw";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  id: "1-1",
  title: "地图/Map地图容器",
  component: VMap,
  // tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 默认示例
 *
 * 展示基础地图配置
 */
export const Default = {
  args: {
    view: {
      center: [118.1689, 24.6478],
      zoom: 10,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "基础地图示例，配置中心点和缩放级别",
      },
      source: {
        language: "html",
        code: MapDefaultExampleRaw,
      },
    },
  },
  render: () => ({
    components: { MapDefaultExample },
    template: "<MapDefaultExample />",
  }),
};
