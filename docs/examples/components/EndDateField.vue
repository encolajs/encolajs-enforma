<!--
This custom field that  is a wrapper for
a <HeadlessField> component that renders 2 input fields

It doesn't render the errors, or label, it just renders the inputs
-->
<template>
  <HeadlessField :names="{end: endName, current: currentName}">
    <template #default="{end, current}">
      <div>
        <DatePicker
          :id="end.id"
          :model-value="end.value"
          date-format="yy-mm-dd"
          fluid
          :disabled="current.value"
          v-bind="end.attrs"
          v-on="end.events"
          @update:modelValue="(date) => end.events.change({value: date})"
        />
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
      </div>
    </template>
  </HeadlessField>
</template>

<script setup>
import { formStateKey, HeadlessField } from '../../../src/'
import { DatePicker, ToggleSwitch } from 'primevue'
import { inject } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const endName = props.name
const currentName = endName.replace('.end', '.current')

const form = inject(formStateKey)

const onChangeCurrent = (value) => {
  form.setFieldValue(currentName, value)
  form.setFieldValue(endName, null)
  form.validateField(endName, true)
}
</script>