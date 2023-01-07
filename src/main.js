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

// 导入第三方富文本编辑器的库
import VueQuillEditor from 'vue-quill-editor'

// 导入富文本编辑器需要的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


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

// 将富文本编辑器组件注册为全局可用的组件
Vue.use(VueQuillEditor)

// 创建一个全局的时间过滤器
Vue.filter('dateFormatter', function (originValue) {
  const date = new Date(originValue)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDate() + '').padStart(2, '0')

  const hour = (date.getHours() + '').padStart(2, '0')
  const minute = (date.getMinutes() + '').padStart(2, '0')
  const second = (date.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
