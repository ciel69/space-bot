<script setup lang="ts">
  import { onMounted } from 'vue'
  import { backButton } from '@telegram-apps/sdk-vue'

  import { Layout } from '@/shared/layout'
  import { GameBoard } from '@/widgets/game-board'

  onMounted(() => {
    backButton.show()
  })
</script>

<template>
  <Layout>
    <GameBoard />
  </Layout>
</template>

<style scoped>

</style>
