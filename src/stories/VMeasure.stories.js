import { VMeasure } from "../packages";
import MeasureExample from "./Measure/MeasureExample.vue";
import MeasureExampleRaw from "./Measure/MeasureExample.vue?raw";

export default {
  id: "3-2",
  title: "工具/Measure测量工具",
  component: VMeasure,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 测量工具示例
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "测量工具示例。支持距离测量和面积测量",
      },
      source: {
        language: "html",
        code: MeasureExampleRaw,
      },
    },
  },
  render: () => ({
    components: { MeasureExample },
    template: "<MeasureExample />",
  }),
};
