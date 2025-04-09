<template>
  <button
    type="button"
    class="formkit-repeatable-move-down-button"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Move Down
  </button>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'click'): void
}>()
</script>
