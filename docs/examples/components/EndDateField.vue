<!--
This component is a wrapper for a <HeadlessField> component
that renders 2 input fields

This should be done when you want to render multiple inputs
in the same "block" that interact with each other, otherwise
you could get away with just using <HeadlessField>s
just like it was done in the Salary min/max section
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
        <div v-if="end.error"
             :id="end.attrs['aria-errormessage']"
             class="text-red-500">
          {{ end.error }}
        </div>
      </div>
    </template>
  </HeadlessField>
</template>

<script setup>
import { formStateKey, HeadlessField } from '../../../src/index'
import { DatePicker, ToggleSwitch } from 'primevue'

const props = defineProps({
  name: {
    type: string,
    required: true
  }
})

const endName = props.name
const currentName = endName.replace('.end', '.current')

const form = inject(formStateKey)

const onChangeCurrent = (value) => {
  form.setFieldValue(`experience.${props.index}.current`, value)
  form.setFieldValue(`experience.${props.index}.end`, null)
  form.validateField(`experience.${props.index}.end`, true)
}
</script> 