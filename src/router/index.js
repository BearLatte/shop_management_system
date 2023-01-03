import Vue from 'vue'
import Router from 'vue-router'

// 导入登录组件
import Login from '../components/Login.vue'

// 导入后台主页组件
import Home from '../components/Home.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, _, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行  next('/login') 强制跳转
  
  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')

  next()
})

export default router
