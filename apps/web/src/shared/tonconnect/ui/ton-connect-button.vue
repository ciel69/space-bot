<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'
  import { useTonConnectUI } from '../composible/use-ton-connect-ui.ts'

  const props = withDefaults(defineProps<{
    id?: string
  }>(), { id: 'tonconnect-button' })

  const { setTonConnectUIOptions } = useTonConnectUI()

  onMounted(() => {
    setTonConnectUIOptions({ buttonRootId: props.id })
  })

  onUnmounted(() => {
    setTonConnectUIOptions({ buttonRootId: null })
  })
</script>

<template>
  <div :id :style="{ width: 'fit-content' }" />
</template>
