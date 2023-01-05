import Vue from 'vue'
import App from './App.vue'
import router from './Router'
import './plugins/element.js'

// 导入全局字体图标
import './assets/fonts/iconfont.css'

// 导入全局样式表
import './assets/css/global.css'

// 导入第三方 UI 组件
import TreeTable from 'vue-table-with-tree-grid'

// 全局网络请求包
import axios from 'axios'
// 配置请求的baseURL
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios 请求拦截器
axios.interceptors.request.use(config => {
  // 为请求对象添加 token 验证的 Authorization 字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 将 axios 挂载到 vue 的 http 上
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 注册第三方 UI 组件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
