import { VRoute } from "../packages";
import RouteExample from "./Route/RouteExample.vue";
import RouteExampleRaw from "./Route/RouteExample.vue?raw";

export default {
  id: "9-3",
  title: "其他/Route路径规划",
  component: VRoute,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 路径规划示例
 * 支持 ArcGIS 和 GraphHopper 路由服务
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "路径规划示例。点击地图添加途经点，至少 2 个点可规划路径。支持 ArcGIS 和 GraphHopper 两种路由服务。",
      },
      source: {
        language: "html",
        code: RouteExampleRaw,
      },
    },
  },
  render: () => ({
    components: { RouteExample },
    template: "<RouteExample />",
  }),
};
