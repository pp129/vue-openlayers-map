import VImage from "../packages/components/layers/image/index.vue";
import ImageExample from "./Image/ImageExample.vue";
import ImageExampleRaw from "./Image/ImageExample.vue?raw";
import ImageWms from "./ImageWMS/index.vue";
import ImageWmsRaw from "./ImageWMS/index.vue?raw";

export default {
  id: "2-4",
  title: "图层/Image图片图层",
  component: VImage,
  parameters: {
    docs: {
      description: {
        component: ``,
      },
    },
  },
};

/**
 * 图片图层基础示例
 */
export const Default = {
  parameters: {
    docs: {
      description: {
        story: "静态图片图层示例。在指定范围内显示图片",
      },
      source: {
        language: "html",
        code: ImageExampleRaw,
      },
    },
  },
  render: () => ({
    components: { ImageExample },
    template: "<ImageExample />",
  }),
};

export const ImageWMS = {
  parameters: {
    docs: {
      description: {
        story: "WMS图片图层示例。在指定范围内显示WMS图片",
      },
      source: {
        language: "html",
        code: ImageWmsRaw,
      },
    },
  },
  render: () => ({
    components: { ImageWms },
    template: "<ImageWms />",
  }),
};
