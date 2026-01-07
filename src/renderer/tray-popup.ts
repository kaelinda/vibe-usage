import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import TrayPopup from './components/tray-popup/TrayPopup.vue'

const app = createApp(TrayPopup)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)

app.mount('#app')
