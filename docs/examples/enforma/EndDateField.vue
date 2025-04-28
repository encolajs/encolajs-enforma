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
          date-format="yy-mm-dd"
          fluid
          :disabled="isCurrentlyWorking"
          v-bind="end.attrs"
          @update:modelValue="end.events['update:modelValue']"
        />

        <HeadlessField :name="currentName">
          <template #default="current">
            <div class="flex align-center mt-2">
              <ToggleSwitch
                :id="current.id"
                class="me-2"
                :model-value="current.value"
                v-bind="current.attrs"
                :true-value="true"
                :false-value="false"
                @change="(evt) => onChangeCurrent(evt.srcElement?.checked)"
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
import { DatePicker, ToggleSwitch } from 'primevue'
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
  debugger
  form.setFieldValue(currentName, value)
  form.setFieldValue(endName, null)
  form.validateField(endName, true)
}
</script>