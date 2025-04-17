import { VMap, VVector, VTile } from "../components";
import { Default as MapStoriies } from "./VMap.stories";
import md from "./VTile.md?raw";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "VOlMap/Vector",
  // tags: ["autodocs"],
  component: VVector,
  render: (args, { argTypes }) => ({
    setup() {
      return {
        args,
      };
    },
    // props: Object.keys(argTypes),
    components: { VMap, VVector },
    template: `
      <v-map v-bind="args.map">
        <v-vector v-bind="args.layer"></v-vector>
      </v-map>
    `,
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
    map: MapStoriies.args,
    layer: {
      features: [
        {
          id: "point1",
          coordinates: [118.124742, 24.487405],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              src: new URL("../assets/img/point_1.png", import.meta.url).href,
            },
          },
          properties: {
            name: "feature1",
            level: 2,
          },
        },
      ],
    },
  },
};

export const Modify = {
  parameters: {
    docs: {
      description: {
        story: "",
      },
    },
  },
  args: {
    map: MapStoriies.args,
    layer: {
      features: [
        {
          id: "point1",
          coordinates: [118.124742, 24.487405],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              src: new URL("../assets/img/point_2.png", import.meta.url).href,
            },
          },
          properties: {
            name: "feature1",
            level: 2,
          },
        },
      ],
      modify: true,
    },
  },
  render: (args, { argTypes }) => ({
    setup() {
      return {
        args,
      };
    },
    // props: Object.keys(argTypes),
    components: { VMap, VVector, VTile },
    template: `
      <v-map v-bind="args.map">
        <v-tile tile-type="BD"></v-tile>
        <v-vector v-bind="args.layer"></v-vector>
      </v-map>
    `,
  }),
};
