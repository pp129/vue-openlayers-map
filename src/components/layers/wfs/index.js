import VWfs from "@/components/layers/wfs/index.vue";

VWfs.install = function (Vue) {
  Vue.component(VWfs.name, VWfs);
};

export default VWfs;
