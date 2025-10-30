<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    v-bind="$attrs"
    @click="$emit('update:modelValue', !modelValue)"
    class="nuxtui-switch"
    :class="{ 'nuxtui-switch-checked': modelValue }"
  >
    <span class="nuxtui-switch-thumb" :class="{ 'nuxtui-switch-thumb-checked': modelValue }"></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: boolean
  id?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style scoped>
.nuxtui-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 2.75rem;
  height: 1.5rem;
  background-color: #d1d5db;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.2s;
  outline: none;
}

.nuxtui-switch:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.nuxtui-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nuxtui-switch-checked {
  background-color: #3b82f6;
}

.nuxtui-switch-thumb {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border-radius: 9999px;
  transition: transform 0.2s;
  transform: translateX(0.125rem);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.nuxtui-switch-thumb-checked {
  transform: translateX(1.375rem);
}
</style>
