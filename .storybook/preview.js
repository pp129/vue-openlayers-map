/** @type { import('@storybook/vue').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [() => ({ template: '<div style="height: 60vh;width: 100%;"><story /></div>' })],
};

export default preview;
