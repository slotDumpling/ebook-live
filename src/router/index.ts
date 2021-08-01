import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Editor from '../components/Editor.vue'
import Test from '../components/Test.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/editor', component: Editor },
  { path: '/test', component: Test },
  { path: '/', redirect: '/editor' }
]

const router = createRouter({
  history: createWebHashHistory('/BookScript/'),
  routes
})

export default router
