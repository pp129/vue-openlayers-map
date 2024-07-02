import VDraw from "@/components/layers/draw/index.vue";

VDraw.install = (Vue) => {
  Vue.component(VDraw.name, VDraw);
};

export default VDraw;
