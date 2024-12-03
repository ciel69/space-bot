<script setup lang="ts">
  import { withDefaults } from 'vue'

  withDefaults(defineProps<{
    /**
     * True if it is allowed to go back from this page.
     * @default true
     */
    back?: boolean;
    title: string;
  }>(), {
    back: true,
  })
</script>

<template>
  <div class="page">
    <h1>{{ title }}</h1>
    <div v-if="$slots.disclaimer" class="page__disclaimer">
      <slot name="disclaimer" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.page {
  padding: 0 10px;
  box-sizing: border-box;
}

.page__disclaimer {
  margin-bottom: 16px;
}
</style>
