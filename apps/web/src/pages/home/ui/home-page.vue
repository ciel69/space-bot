<script setup lang="ts">
  import { parseInitData } from '@telegram-apps/sdk-vue'
  import { Layout } from '@/shared/layout'
  import { GameBoard } from '@/widgets/game-board'
  import { Navigation } from '@/shared/navigation'

  const initData = parseInitData(null)
</script>

<template>
  <Layout>
    <GameBoard />
    <template #navigation>
      <pre>{{ initData }}</pre>
      <Navigation />
    </template>
  </Layout>
</template>

<style scoped>

</style>
