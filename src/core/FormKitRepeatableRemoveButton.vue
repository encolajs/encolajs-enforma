<template>
  <button
    type="button"
    :class="getConfig('classes.repeatable.remove_button')"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Remove
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'

defineEmits<{
  (e: 'click'): void
}>()

const { getConfig } = useFormConfig()
</script>
