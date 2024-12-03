import { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/pages/home/ui/home-page.vue'),
    },
    {
        path: '/map',
        name: 'map',
        component: () => import('@/pages/map/ui/map-page.vue'),
    },
    {
        path: '/wallet',
        name: 'wallet',
        component: () => import('@/pages/wallet/ui/wallet-page.vue'),
    },
]
