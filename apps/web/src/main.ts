import { app } from './app'
import './style.css'
import { TonConnectUIPlugin } from '@/shared/tonconnect'

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
// import './mockEnv.ts';

app.use(TonConnectUIPlugin, {
    manifestUrl: new URL('/tonconnect-manifest.json', window.location.href).toString(),
})
app.mount('#app')
