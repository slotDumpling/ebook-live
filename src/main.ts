import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import './assets/global.css'

const app = createApp(App)
app.use(router).use(ElementPlus).mount('#app')
app.config.performance = true