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
      {
        path: '/formkit-fields',
        name: 'formkit-fields',
        exact: true,
        component: () => import('../pages/FormKitFields.vue')
      },
      {
        path: '/formkit-schema',
        name: 'formkit-schema',
        exact: true,
        component: () => import('../pages/FormKitSchema.vue')
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

export default router;
