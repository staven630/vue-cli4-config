import "./registerServiceWorker";
import "@/icons";
import "moment/locale/zh-cn";

import Vue from "vue";
import Router from "vue-router";

import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

Vue.use(router);
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    // document.dispatchEvent(new Event("render-event"));
  }
}).$mount("#app");
