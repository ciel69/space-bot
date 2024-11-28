<script setup lang="ts">

</script>

<template>
  <div class="navigation">
    <div class="navigation-item">
      <router-link to="/">War</router-link>
    </div>
    <div class="navigation-item">
      <router-link to="/map">Map</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.navigation {
  display: flex;
  justify-content: center;
  &-item {
    padding: 20px;
    border: 1px solid;
  }
}
</style>
