<template>
  <Content
    class="vp-doc"
  />
</template>
<script setup>
import { Content } from 'vitepress'
</script>
<style scoped>
.vp-doc {
  max-width: calc(var(--vp-layout-max-width) - 64px);
  margin: 2rem auto;
}
</style>