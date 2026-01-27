import { VDraw } from "../packages";
import DrawExample from "./Draw/DrawExample.vue";
import DrawExampleRaw from "./Draw/DrawExample.vue?raw";

export default {
  id: "3-1",
  title: "工具/Draw绘制工具",
  component: VDraw,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 绑制工具基础示例
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "绑制工具示例。支持点、线、面、圆等多种绑制类型",
      },
      source: {
        language: "html",
        code: DrawExampleRaw,
      },
    },
  },
  render: () => ({
    components: { DrawExample },
    template: "<DrawExample />",
  }),
};
