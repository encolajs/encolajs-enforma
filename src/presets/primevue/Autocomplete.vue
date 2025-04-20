<template>
  <AutoComplete
    v-bind="mergeProps($attrs, getConfig('pt.autocomplete') || {})"
    :model-value="displayValue"
    :suggestions="suggestions"
    :multiple="multiple"
    @complete="onComplete"
    @item-select="onItemSelect"
    @item-unselect="onItemUnselect"
    @change="onChange"
  />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { useAttrs, mergeProps } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'

interface AutoCompleteChangeEvent {
  value: string | string[]
  originalEvent: Event
}

interface AutoCompleteItem {
  value: string
  label?: string
}

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  options: {
    type: [Array, Object, Function],
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  valueAs: {
    type: String,
    default: 'array',
    validator: (value: string) => ['array', 'csv'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const $attrs = useAttrs()
const { getConfig } = useFormConfig()

const suggestions = ref<AutoCompleteItem[]>([])
const internalValue = ref<string[]>([])

// Convert external value to internal array
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === null || newValue === undefined) {
      internalValue.value = []
    } else if (Array.isArray(newValue)) {
      internalValue.value = newValue.map(String)
    } else if (typeof newValue === 'string') {
      internalValue.value = newValue
        ? newValue.split(',').map((s) => s.trim())
        : []
    }
  },
  { immediate: true }
)

// Compute display value based on multiple and valueAs
const displayValue = computed(() => {
  if (!props.multiple) {
    return internalValue.value[0] || ''
  }
  return internalValue.value
})

// Handle the complete event from PrimeVue Autocomplete
const onComplete = async (event: { query: string }) => {
  const query = event.query.toLowerCase()

  if (typeof props.options === 'function') {
    // If options is a function, call it to get the suggestions
    const result = await props.options()
    suggestions.value = Array.isArray(result)
      ? result.map((item) =>
          typeof item === 'string' ? { value: item } : item
        )
      : Object.entries(result).map(([key, value]) => ({
          value: String(key),
          label: String(value),
        }))
  } else if (Array.isArray(props.options)) {
    // If options is an array, filter it based on the query
    suggestions.value = props.options
      .map((item) => (typeof item === 'string' ? { value: item } : item))
      .filter(
        (item) =>
          String(item.value).toLowerCase().includes(query) ||
          (item.label && String(item.label).toLowerCase().includes(query))
      )
  } else if (typeof props.options === 'object') {
    // If options is an object, convert it to array and filter
    suggestions.value = Object.entries(props.options)
      .map(([key, value]) => ({ value: String(key), label: String(value) }))
      .filter(
        (item) =>
          item.value.toLowerCase().includes(query) ||
          item.label.toLowerCase().includes(query)
      )
  }
}

// Handle item selection
const onItemSelect = (event: {
  value: AutoCompleteItem | AutoCompleteItem[]
}) => {
  if (props.multiple) {
    internalValue.value = (event.value as AutoCompleteItem[]).map(
      (item) => item.value
    )
  } else {
    internalValue.value = [(event.value as AutoCompleteItem).value]
  }
  emitValue()
}

// Handle item unselection (for multiple mode)
const onItemUnselect = (event: { value: AutoCompleteItem[] }) => {
  internalValue.value = event.value.map((item) => item.value)
  emitValue()
}

// Handle direct input changes
const onChange = (event: AutoCompleteChangeEvent) => {
  if (props.multiple) {
    internalValue.value = Array.isArray(event.value)
      ? event.value.map(String)
      : [String(event.value)]
  } else {
    internalValue.value = [String(event.value)]
  }
  emitValue()
}

// Emit the value in the correct format
const emitValue = () => {
  let valueToEmit: string | string[]

  if (!props.multiple) {
    valueToEmit = internalValue.value[0] || ''
  } else if (props.valueAs === 'csv') {
    valueToEmit = internalValue.value.join(',')
  } else {
    valueToEmit = internalValue.value
  }

  emit('update:modelValue', valueToEmit)
  emit('change', valueToEmit)
}
</script>
