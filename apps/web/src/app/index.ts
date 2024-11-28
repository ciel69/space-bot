import { createApp } from 'vue'
import { init, backButton, initData, swipeBehavior } from '@telegram-apps/sdk-vue'

import App from './app.vue'
import { router } from './providers/router-provider/router-provider'

init()

export const app = createApp(App).use(router)
backButton.mount()
initData.restore()

if (swipeBehavior.mount.isAvailable()) {
    swipeBehavior.mount()
    swipeBehavior.disableVertical()
}
