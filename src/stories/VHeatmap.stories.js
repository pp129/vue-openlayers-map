import { VHeatmap } from "../packages";
import HeatmapExample from "./Heatmap/HeatmapExample.vue";
import HeatmapExampleRaw from "./Heatmap/HeatmapExample.vue?raw";

export default {
  id: "2-5",
  title: "图层/Heatmap热力图",
  component: VHeatmap,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 热力图示例
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "热力图示例。根据点位权重显示热力分布",
      },
      source: {
        language: "html",
        code: HeatmapExampleRaw,
      },
    },
  },
  render: () => ({
    components: { HeatmapExample },
    template: "<HeatmapExample />",
  }),
};
