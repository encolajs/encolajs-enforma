<template>
  <button
    type="button"
    class="formkit-repeatable-add-button"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Add
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>()
</script>
