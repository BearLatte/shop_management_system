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

// 商品列表导航组件
import GoodsList from './components/goods/GoodsList.vue'

// 商品分类参数组件
import Parameters from './components/goods/Parameters.vue'

// 商品分类组件
import Categories from './components/goods/Categories.vue'

// 导入添加商品组件
import AddGoods from './components/goods/AddGoods.vue'

// 导入商品编辑组件
import EditGoods from './components/goods/EditGoods.vue'

// 导入订单组件
import Order from './components/order/Order.vue'

// 导入数据报表组件
import Report from './components/report/Report.vue'

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
        { path: '/roles', component: Roles },
        { path: '/goods', component: GoodsList },
        { path: '/params', component: Parameters },
        { path: '/categories', component: Categories },
        { path: '/goods/add', component: AddGoods },
        { path: '/goods/edit/:goodsId', component: EditGoods, props: true },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
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
