import VImage from "@/components/layers/image/index.vue";

VImage.install = (Vue) => {
  Vue.component(VImage.name, VImage);
};

export default VImage;
