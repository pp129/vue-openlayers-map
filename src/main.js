import "./polyfills";
import Vue from "vue";
import router from "./router";
import App from "./App.vue";
import olMap from "@/packages";

Vue.config.productionTip = false;

Vue.use(olMap);

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
