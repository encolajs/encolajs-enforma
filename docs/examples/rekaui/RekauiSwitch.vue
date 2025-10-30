<template>
  <SwitchRoot v-model="localValue" v-bind="$attrs" class="rekaui-switch-root">
    <SwitchThumb class="rekaui-switch-thumb" />
  </SwitchRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'

const props = defineProps<{
  modelValue?: boolean
  id?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped>
.rekaui-switch-root {
  all: unset;
  width: 42px;
  height: 25px;
  background-color: #ccc;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.rekaui-switch-root[data-state="checked"] {
  background-color: #007bff;
}

.rekaui-switch-root:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.rekaui-switch-root[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.rekaui-switch-thumb {
  display: block;
  width: 21px;
  height: 21px;
  background-color: white;
  border-radius: 9999px;
  transition: transform 0.2s;
  transform: translateX(2px);
  will-change: transform;
}

.rekaui-switch-root[data-state="checked"] .rekaui-switch-thumb {
  transform: translateX(19px);
}
</style>
