import { VGraphic } from "../packages";
import GraphicExample from "./Graphic/GraphicExample.vue";
import GraphicExampleRaw from "./Graphic/GraphicExample.vue?raw";

export default {
  id: "2-7",
  title: "图层/Graphic图形图层",
  component: VGraphic,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * Canvas 图形图层示例
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "Canvas 图形图层示例。使用 Canvas 高效渲染大量点位",
      },
      source: {
        language: "html",
        code: GraphicExampleRaw,
      },
    },
  },
  render: () => ({
    components: { GraphicExample },
    template: "<GraphicExample />",
  }),
};
