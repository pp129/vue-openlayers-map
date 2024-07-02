import VMap from "@/components/map/index.vue";

VMap.install = function (Vue) {
  Vue.component(VMap.name, VMap);
};

export default VMap;
