import { createRouter, createWebHistory } from 'vue-router';
import Default from '../layouts/Default.vue';

const routes = [
  {
    path: '/',
    component: Default,
    children: [
      {
        path: '/',
        name: 'home',
        exact: true,
        component: () => import('../pages/Home.vue')
      },
    ]
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  if (to.params.pathMatch) {
    to.path = '/' + to.params.pathMatch.join('/');
  }
  next();
});
export default router;
