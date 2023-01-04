import Vue from 'vue'
import Router from 'vue-router'

// 导入登录组件
import Login from './components/Login.vue'

// 导入后台主页组件
import Home from './components/Home.vue'

// 导入欢迎页面组件
import Welcome from './components/Welcome.vue'

// 导入用户列表组件
import Users from './components/user/Users.vue'

// 导入权限列表组件
import Rights from './components/power/Rights.vue'

// 导入角色列表组件
import Roles from './components/power/Roles.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, _, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行  next('/login') 强制跳转

  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')

  next()
})

export default router
