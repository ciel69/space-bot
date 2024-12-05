<script setup lang="ts">
  // import { retrieveLaunchParams } from '@telegram-apps/sdk-vue'
  // import axios from 'axios'

  import { onBeforeMount } from 'vue'
  import { Layout } from '@/shared/layout'
  // import { GameBoard } from '@/widgets/game-board'
  import { Navigation } from '@/shared/navigation'
  import { WarCard } from '@/widgets/war-card'

  // const { initDataRaw } = retrieveLaunchParams()

  // const dataRes = ref({})

  const sendAuthData = async () => {
    // try {
    //   const response = await axios.post('/api/telegram/auth', { initData: initDataRaw })
    //   console.log(response.data) // Результат валидации
    //   dataRes.value = response.data
    // } catch (error) {
    //   console.error('Ошибка авторизации:', error)
    // }
  }

  onBeforeMount(() => {
    sendAuthData()
  })

</script>

<template>
  <Layout>
    <WarCard />
    <template #navigation>
      <Navigation />
    </template>
  </Layout>
</template>

<style scoped>

</style>
