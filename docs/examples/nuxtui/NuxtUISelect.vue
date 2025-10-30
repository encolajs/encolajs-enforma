<template>
  <div class="nuxtui-select-wrapper">
    <select
      v-bind="$attrs"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      class="nuxtui-select"
    >
      <option value="" disabled>{{ placeholder || 'Select an option' }}</option>
      <option
        v-for="item in items"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label || item.title }}
      </option>
    </select>
    <div class="nuxtui-select-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
  items?: Array<{ value: string; label?: string; title?: string }>
  placeholder?: string
  id?: string
  disabled?: boolean
  highlight?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style scoped>
.nuxtui-select-wrapper {
  position: relative;
  display: block;
  width: 100%;
}

.nuxtui-select {
  display: block;
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.875rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
  background-color: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.nuxtui-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.nuxtui-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.nuxtui-select[highlight="true"] {
  border-color: #ef4444;
}

.nuxtui-select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
}
</style>
