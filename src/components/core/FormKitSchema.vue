<template>
  <div v-bind="$attrs"></div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'

const $attrs = useAttrs()
</script>
