import VRoute from "@/components/layers/route/index.vue";

VRoute.install = (Vue) => {
  Vue.component(VRoute.name, VRoute);
};

export default VRoute;
