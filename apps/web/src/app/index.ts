import { createApp } from 'vue'
import App from './app.vue'
import { router } from './providers/router-provider/router-provider'

export const app = createApp(App).use(router)
