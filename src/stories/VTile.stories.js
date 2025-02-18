import { VMap, VTile } from "../components";
import { Default as MapStoriies } from "./VMap.stories";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "VOlMap/Tile",
  // tags: ["autodocs"],
  decorators: [() => ({ template: '<div style="height: 60vh;width: 100%;"><story /></div>' })],
  component: VTile,
  render: (args, { argTypes }) => ({
    setup() {
      const mapOptions = MapStoriies.args;
      return {
        ...mapOptions,
        args,
      };
    },
    // props: Object.keys(argTypes),
    components: { VMap, VTile },
    template: `<v-map :view="args.view"><v-tile :tile-type="args.tileType" :xyz="args.xyz"></v-tile></v-map>`,
  }),
  args: {
    ...MapStoriies.args,
    tileType: "XYZ",
    xyz: {
      url: "http://172.16.34.120:6080/arcgis/rest/services/xiamen/MapServer/tile/{z}/{y}/{x}",
      projection: "EPSG:4490",
      crossOrigin: "anonymous",
    },
  },
};

export const Default = {};

// export const XYZ = {};
