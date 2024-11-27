<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <div class="layout-content">
      <slot />
    </div>
    <div class="layout-navigation">
      <slot name="navigation" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &-content {
    height: 100%;
  }

  &-navigation {
    padding: 5px;
    border-top: 1px solid #f6f6f6;
    height: 80px;
  }
}
</style>
