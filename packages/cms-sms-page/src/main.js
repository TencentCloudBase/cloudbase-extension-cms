import Vue from "vue";
import App from "./App.vue";

Vue.config.productionTip = false;
Vue.config.ignoredElements = [/^wx/];

if (process.env.VUE_APP_CLOUDRESOURCE) {
  try {
    const cloudResource = JSON.parse(process.env.VUE_APP_CLOUDRESOURCE);
    window.cloudResource = cloudResource;
  } catch (error) {}
}

new Vue({
  render: (h) => h(App),
}).$mount("#app");
