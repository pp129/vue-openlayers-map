import { VEcharts } from "../packages";
import EchartsExample from "./EchartsExample/index.vue";
import EchartsExampleRaw from "./EchartsExample/index.vue?raw";

export default {
  id: "2-9",
  title: "图层/Echarts图层",
  component: VEcharts,
  parameters: {
    docs: {
      description: {
        story: "Echarts 图层示例。",
      },
      source: {
        language: "html",
        code: EchartsExampleRaw,
      },
    },
  },
  render: () => ({
    components: { EchartsExample },
    template: "<EchartsExample />",
  }),
};

export const Default = {};
