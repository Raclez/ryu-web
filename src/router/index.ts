import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/category/:category',
    name: 'CategoryList',
    component: () => import('@/views/CategoryList.vue'),
    meta: {
      title: '分类'
    }
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: () => import('@/views/BlogDetail.vue'),
    meta: {
      title: '博客详情'
    }
  },
  // 404 路由，放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置，滚动到保存的位置
    if (savedPosition) {
      return savedPosition;
    }

    // 如果有hash，滚动到hash对应的元素
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }

    // 否则滚动到顶部
    return { top: 0 };
  }
});

// 全局前置守卫 - 设置页面标题
router.beforeEach((to, from, next) => {

  console.log('[路由跳转]', from.path, '→', to.path)
  // 设置标题
  document.title = `${to.meta.title || 'Blog'} - Ryu's Blog`;

  // 如果是分类详情页，设置标题为分类名
  if (to.name === 'CategoryList' && to.params.category) {
    document.title = `${to.params.category} - Ryu's Blog`;
  }

  next();
});

export default router;
