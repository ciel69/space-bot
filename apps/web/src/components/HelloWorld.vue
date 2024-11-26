<script setup lang="ts">
import {onBeforeMount, ref, useTemplateRef} from 'vue'
import { Application } from 'pixi.js';

defineProps<{ msg: string }>()

const count = ref(0)
const field = useTemplateRef('field')

onBeforeMount(async () => {
  const app = new Application();

  await app.init({ background: '#1099bb', resizeTo: window });

  field.value?.appendChild(app.canvas);
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  <div ref="field" class="field-play"></div>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
.field-play {
  width: 100%;
}
</style>
