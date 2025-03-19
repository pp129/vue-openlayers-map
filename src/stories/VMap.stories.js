import VMap from "../components/map/index.vue";
import md from "./VMap.md?raw";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "VOlMap/Map",
  component: VMap,
  // tags: ["autodocs"],
  render: (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: { VMap },
    template: '<v-map v-bind="$props" />',
  }),
  parameters: {
    docs: {
      description: {
        component: md,
      },
    },
  },
};

export const Default = {
  args: {
    view: {
      center: [118.1689, 24.6478],
      zoom: 10,
    },
  },
};
