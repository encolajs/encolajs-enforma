<!--
This custom field that  is a wrapper for
a <HeadlessField> component that renders 2 input fields

It doesn't render the errors, or label, it just renders the inputs
-->
<template>
  <HeadlessField :name="endName">
      <template #default="end">
        <DatePicker
          :id="end.id"
          :model-value="end.value"
          class="w-full"
          :disabled="isCurrentlyWorking"
          :color="end.error ? 'error' : undefined"
          :highlight="!!end.error"
          v-bind="end.attrs"
          @update:model-value="(date) => end.events.change({value: date})"
        />

        <HeadlessField :name="currentName">
          <template #default="current">
            <div class="flex align-center mt-2">
              <USwitch
                :id="current.id"
                class="me-2"
                :model-value="current.value"
                v-bind="current.attrs"
                @update:model-value="onChangeCurrent"
              />
              <span @click="onChangeCurrent(!current.value)">Currently working here</span>
            </div>
          </template>
        </HeadlessField>
      </template>
    </HeadlessField>
</template>

<script setup>
import { formControllerKey, HeadlessField } from '@'
import USwitch from '@nuxt/ui/components/Switch.vue'
// Nuxt UI's UInputDate with Date objects as values
import DatePicker from '../nuxtui/DatePicker.vue'
import { inject, computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const endName = props.name
const currentName = endName.replace('.end', '.current')

const form = inject(formControllerKey)
const isCurrentlyWorking = computed(() => form[currentName])

const onChangeCurrent = (value) => {
  form.setFieldValue(currentName, value)
  form.setFieldValue(endName, null)
  form.validateField(endName, true)
}
</script>
