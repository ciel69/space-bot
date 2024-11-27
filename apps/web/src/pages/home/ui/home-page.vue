<script setup lang="ts">
  import { initData } from '@telegram-apps/sdk-vue'
  import { Layout } from '@/shared/layout'
  import { GameBoard } from '@/widgets/game-board'
  import { Navigation } from '@/shared/navigation'
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
