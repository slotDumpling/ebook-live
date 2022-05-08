import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const Editor = () => import('../components/Editor.vue')
const Test  = () => import('../components/Test.vue')

const routes: Array<RouteRecordRaw> = [
  { path: '/editor/:id', component: Editor },
  { path: '/editor', component: Editor },
  { path: '/test', component: Test },
  { path: '/', redirect: '/editor' },
]

const router = createRouter({
  history: createWebHashHistory('/BookScript/'),
  routes
})

export default router
