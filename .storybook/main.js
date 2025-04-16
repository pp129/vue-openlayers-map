/** @type { import('@storybook/vue-vite').StorybookConfig } */
const config = {
  framework: {
    name: "@storybook/vue-vite",
  },
  staticDirs: ["../public"],
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-storysource",
  ],
  docs: {
    autodocs: true,
    docsMode: true,
  },
  async viteFinal(config, options) {
    // Add your configuration here
    // config.server.proxy = {
    //   "/arcgis": {
    //     target: "http://172.16.34.120:6080/arcgis",
    //     changeOrigin: true,
    //   },
    // };
    // console.log(config);
    return config;
  },
};
export default config;
