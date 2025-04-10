<template>
  <button
    type="button"
    :class="getConfig('classes.repeatable.move_up_button')"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Move Up
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'

defineEmits<{
  (e: 'click'): void
}>()

const { getConfig } = useFormConfig()
</script>
