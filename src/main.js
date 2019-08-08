import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

Vue.config.productionTip = false;

import moment from "moment";
import "moment/locale/zh-cn";

console.log(moment().format("dddd"));

new Vue({
  router,
  store,
  render: h => h(App),
  mounted() {
    // document.dispatchEvent(new Event("render-event"));
  }
}).$mount("#app");
