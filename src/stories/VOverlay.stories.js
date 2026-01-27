import { VOverlay } from "../packages";
import OverlayExample from "./Overlay/OverlayExample.vue";
import OverlayExampleRaw from "./Overlay/OverlayExample.vue?raw";

export default {
  id: "9-1",
  title: "其他/Overlay弹框",
  component: VOverlay,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * Popup 弹窗示例
 * 点击地图要素显示信息弹窗
 */
export const Popup = {
  parameters: {
    docs: {
      description: {
        story: "点击地图上的点标记查看信息弹窗，展示了覆盖物的典型用法。",
      },
      source: {
        language: "html",
        code: OverlayExampleRaw,
      },
    },
  },
  render: () => ({
    components: { OverlayExample },
    template: "<OverlayExample />",
  }),
};
