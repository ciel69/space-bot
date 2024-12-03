import { createApp } from 'vue'
import { init, backButton, initData, swipeBehavior, miniApp, themeParams, viewport } from '@telegram-apps/sdk-vue'

import { Assets } from 'pixi.js'
import spaceWebSrc from '@/assets/space.webp'
import App from './app.vue'
import { router } from './providers/router-provider/router-provider'

init()

export const app = createApp(App).use(router)
if (backButton.isSupported()) {
    backButton.mount()
}
miniApp.mount()
themeParams.mount()
initData.restore()

if (swipeBehavior.mount.isAvailable()) {
    swipeBehavior.mount()
    swipeBehavior.disableVertical()
}
viewport.mount().then(() => {
    // Define components-related CSS variables.
    viewport.bindCssVars()
    miniApp.bindCssVars()
    themeParams.bindCssVars()
}).catch((e: string) => {
    console.error('Something went wrong mounting the viewport', e)
})

await Assets.load({
    alias: 'spiceOne',
    src: spaceWebSrc,
})
