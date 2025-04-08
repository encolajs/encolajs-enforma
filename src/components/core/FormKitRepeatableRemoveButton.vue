<template>
  <button
    type="button"
    class="formkit-repeatable-remove-button"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Remove
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>()
</script>
