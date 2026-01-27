import { VPath } from "../packages";
import PathExample from "./Path/PathExample.vue";
import PathExampleRaw from "./Path/PathExample.vue?raw";

export default {
  id: "9-2",
  title: "其他/Path轨迹回放",
  component: VPath,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 轨迹回放示例
 * 8000个轨迹点，5秒间隔
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "轨迹回放示例。生成 8000 个轨迹点，时间间隔 5 秒，支持播放控制和倍速调节。",
      },
      source: {
        language: "html",
        code: PathExampleRaw,
      },
    },
  },
  render: () => ({
    components: { PathExample },
    template: "<PathExample />",
  }),
};
