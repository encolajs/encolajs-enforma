<!--
Nuxt UI's UInputDate works with CalendarDate objects (from @internationalized/date)
This wrapper lets the form data hold regular Date objects instead,
so it can be registered as the `datepicker` input component of the Nuxt UI preset
-->
<template>
  <UInputDate
    :model-value="calendarDate"
    @update:model-value="onUpdate"
  />
</template>

<script setup>
import { computed } from 'vue'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import UInputDate from '@nuxt/ui/components/InputDate.vue'

const props = defineProps({
  modelValue: { type: [Date, String], default: null },
})

const emit = defineEmits(['update:modelValue'])

const calendarDate = computed(() => {
  if (!props.modelValue) {
    return undefined
  }
  const date = new Date(props.modelValue)
  if (isNaN(date.getTime())) {
    return undefined
  }
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
})

function onUpdate(value) {
  emit('update:modelValue', value ? value.toDate(getLocalTimeZone()) : null)
}
</script>
