import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/admin',
    component: () => import('../layout/AdminLayout.vue'),
    meta: { requiresRole: 0 },
    children: [
      { path: '', redirect: '/admin/users' },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('../views/admin/UserManage.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('../views/admin/CategoryManage.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'products',
        name: 'ProductManage',
        component: () => import('../views/admin/ProductManage.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'orders',
        name: 'OrderManage',
        component: () => import('../views/admin/OrderManage.vue'),
        meta: { title: '订单管理' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('../layout/CustomerLayout.vue'),
    meta: { requiresRole: 1 },
    children: [
      { path: '', name: 'Home', component: () => import('../views/customer/Home.vue'), meta: { title: '首页' } },
      { path: 'cart', name: 'Cart', component: () => import('../views/customer/Cart.vue'), meta: { title: '购物车' } },
      { path: 'orders', name: 'MyOrders', component: () => import('../views/customer/MyOrders.vue'), meta: { title: '我的订单' } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `PopTrade - ${to.meta.title}` : 'PopTrade';
  const userStore = useUserStore();
  if (to.meta.requiresRole !== undefined && !userStore.user) {
    return next('/login');
  }
  if (userStore.user && to.meta.requiresRole !== undefined && userStore.user.role !== to.meta.requiresRole) {
    return next(userStore.user.role === 0 ? '/admin' : '/');
  }
  next();
});

export default router;
