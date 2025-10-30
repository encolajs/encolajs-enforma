<template>
  <button
    v-bind="$attrs"
    class="rekaui-button"
    :class="buttonClasses"
  >
    <span v-if="icon" class="rekaui-button-icon">{{ icon }}</span>
    <slot>{{ content || label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  content?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  icon?: string
  disabled?: boolean
  type?: string
}>()

const buttonClasses = computed(() => {
  return [
    props.variant ? `rekaui-button-${props.variant}` : 'rekaui-button-primary'
  ]
})
</script>

<style scoped>
.rekaui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.25rem;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
  outline: none;
  text-decoration: none;
}

.rekaui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Primary variant (default) */
.rekaui-button-primary {
  background-color: #007bff;
  color: white;
}

.rekaui-button-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.rekaui-button-primary:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Secondary variant */
.rekaui-button-secondary {
  background-color: #6c757d;
  color: white;
}

.rekaui-button-secondary:hover:not(:disabled) {
  background-color: #5a6268;
}

.rekaui-button-secondary:focus {
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
}

/* Outline variant */
.rekaui-button-outline {
  background-color: transparent;
  border-color: #ced4da;
  color: #495057;
}

.rekaui-button-outline:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.rekaui-button-outline:focus {
  box-shadow: 0 0 0 0.2rem rgba(206, 212, 218, 0.25);
}

/* Ghost variant */
.rekaui-button-ghost {
  background-color: transparent;
  color: #6c757d;
}

.rekaui-button-ghost:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.rekaui-button-ghost:focus {
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.15);
}

.rekaui-button-icon {
  display: inline-flex;
  align-items: center;
}
</style>
