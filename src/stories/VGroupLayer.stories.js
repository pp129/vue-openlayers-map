import { VGroupLayer } from "../components";
import GroupLayerPage from "./Group/index.vue";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "VOlMap/GroupLayer",
  tags: ["autodocs"],
  component: VGroupLayer,
};

export const Default = {
  render: () => ({
    components: { GroupLayerPage },
    template: `<group-layer-page />`,
  }),
};
