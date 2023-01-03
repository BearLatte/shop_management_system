import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局字体图标
import './assets/fonts/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

// 全局网络请求包
import axios from 'axios'
// 配置请求的baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 将 axios 挂载到 vue 的 http 上
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
