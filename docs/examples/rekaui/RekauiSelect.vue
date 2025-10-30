<template>
  <SelectRoot v-model="localValue" v-bind="$attrs">
    <SelectTrigger class="rekaui-select-trigger">
      <SelectValue :placeholder="placeholder || 'Select an option'" />
      <SelectIcon class="rekaui-select-icon">▼</SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent class="rekaui-select-content" position="popper">
        <SelectViewport class="rekaui-select-viewport">
          <SelectItem
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            class="rekaui-select-item"
          >
            <SelectItemText>{{ item.label || item.title }}</SelectItemText>
            <SelectItemIndicator class="rekaui-select-indicator">✓</SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
} from 'reka-ui'

const props = defineProps<{
  modelValue?: string
  items?: Array<{ value: string; label?: string; title?: string }>
  placeholder?: string
  id?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value as string)
})
</script>

<style scoped>
.rekaui-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.rekaui-select-trigger:hover {
  border-color: #80bdff;
}

.rekaui-select-trigger:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.rekaui-select-icon {
  margin-left: 0.5rem;
  font-size: 0.75rem;
}

.rekaui-select-content {
  background: white;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow: auto;
}

.rekaui-select-viewport {
  padding: 0.25rem 0;
}

.rekaui-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.rekaui-select-item:hover {
  background-color: #f8f9fa;
}

.rekaui-select-item[data-highlighted] {
  background-color: #e9ecef;
  outline: none;
}

.rekaui-select-item[data-state="checked"] {
  background-color: #e7f1ff;
  font-weight: 500;
}

.rekaui-select-indicator {
  color: #007bff;
  margin-left: 0.5rem;
}
</style>
