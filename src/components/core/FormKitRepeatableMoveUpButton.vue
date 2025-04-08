<template>
  <button
    type="button"
    class="formkit-repeatable-move-up-button"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Move Up
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>()
</script>
