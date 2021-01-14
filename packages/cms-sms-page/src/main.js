import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.config.ignoredElements = [/^wx/]

console.log(process.env.NODE_ENV)

// 仅在开发模式下替换 cloudResource
if (process.env.VUE_APP_CLOUDRESOURCE && process.env.NODE_ENV === 'development') {
  try {
    const cloudResource = JSON.parse(process.env.VUE_APP_CLOUDRESOURCE)
    window.cloudResource = cloudResource
  } catch (error) {}
}

new Vue({
  render: (h) => h(App),
}).$mount('#app')
