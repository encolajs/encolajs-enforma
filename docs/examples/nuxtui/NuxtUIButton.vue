<template>
  <button
    v-bind="$attrs"
    class="nuxtui-button"
    :class="[
      `nuxtui-button-${color || 'primary'}`,
      `nuxtui-button-${variant || 'solid'}`
    ]"
  >
    <span v-if="icon" class="nuxtui-button-icon">{{ icon }}</span>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'ghost'
  icon?: string
  disabled?: boolean
}>()
</script>

<style scoped>
.nuxtui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
  outline: none;
}

.nuxtui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Primary color */
.nuxtui-button-primary.nuxtui-button-solid {
  background-color: #3b82f6;
  color: white;
}

.nuxtui-button-primary.nuxtui-button-solid:hover:not(:disabled) {
  background-color: #2563eb;
}

.nuxtui-button-primary.nuxtui-button-outline {
  background-color: transparent;
  border-color: #3b82f6;
  color: #3b82f6;
}

.nuxtui-button-primary.nuxtui-button-outline:hover:not(:disabled) {
  background-color: #eff6ff;
}

/* Neutral/Secondary color */
.nuxtui-button-neutral.nuxtui-button-outline,
.nuxtui-button-secondary.nuxtui-button-outline {
  background-color: transparent;
  border-color: #d1d5db;
  color: #374151;
}

.nuxtui-button-neutral.nuxtui-button-outline:hover:not(:disabled),
.nuxtui-button-secondary.nuxtui-button-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

/* Error color */
.nuxtui-button-error.nuxtui-button-solid {
  background-color: #ef4444;
  color: white;
}

.nuxtui-button-error.nuxtui-button-solid:hover:not(:disabled) {
  background-color: #dc2626;
}

/* Ghost variant */
.nuxtui-button-ghost {
  background-color: transparent;
  color: #6b7280;
}

.nuxtui-button-ghost:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.nuxtui-button:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
