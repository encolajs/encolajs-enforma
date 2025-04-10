<template>
  <button
    type="button"
    :class="getConfig('classes.repeatable.move_down_button')"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    Move Down
  </button>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'

defineEmits<{
  (e: 'click'): void
}>()

const { getConfig } = useFormConfig()
</script>
