import { VSuperCluster } from "../packages";
import ClusterExample from "./Cluster/ClusterExample.vue";
import ClusterExampleRaw from "./Cluster/ClusterExample.vue?raw";

export default {
  id: "2-6",
  title: "图层/Cluster聚合图层",
  component: VSuperCluster,
};

/**
 * 聚合图层基础示例
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "聚合图层示例。根据聚合数量显示不同颜色：绿色(<10)、蓝色(10-50)、红色(>50)",
      },
      source: {
        language: "html",
        code: ClusterExampleRaw,
      },
    },
  },
  render: () => ({
    components: { ClusterExample },
    template: "<ClusterExample />",
  }),
};
