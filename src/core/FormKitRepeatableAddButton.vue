<template>
  <button
    type="button"
    :class="getConfig('classes.repeatable.add_button')"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Add
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
useFormConfig()

defineEmits<{
  (e: 'click'): void
}>()

const { getConfig } = useFormConfig()
</script>
