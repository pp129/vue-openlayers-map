import { VGroupLayer } from "../packages";
import GroupLayerExample from "./Group/index.vue";
import GroupLayerExampleRaw from "./Group/index.vue?raw";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  id: "2-1",
  title: "图层/GroupLayer图层组",
  // tags: ["autodocs"],
  component: VGroupLayer,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 图层组基础示例
 *
 * 展示如何使用 VGroupLayer 组件管理多个矢量图层，
 * 并通过控制面板调整可见性和透明度
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "图层组基础示例。包含一个图层组（蓝/红/绿三个图层）和一个独立图层（黄色），可通过右上角控制面板调整",
      },
      source: {
        language: "html",
        code: GroupLayerExampleRaw,
      },
    },
  },
  render: () => ({
    components: { GroupLayerExample },
    template: "<GroupLayerExample />",
  }),
};
