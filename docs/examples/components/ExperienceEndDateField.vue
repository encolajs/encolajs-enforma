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
        <label :for="end.id">End</label>
        <DatePicker
          :id="end.id"
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
import { HeadlessField } from '../../../src/index'
import { DatePicker, ToggleSwitch } from 'primevue'

const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  form: {
    type: Object,
    required: true
  }
})

const endName = `experience.${props.index}.end`
const currentName = `experience.${props.index}.current`

const onChangeCurrent = (value) => {
  props.form.setFieldValue(`experience.${props.index}.current`, value)
  props.form.setFieldValue(`experience.${props.index}.end`, null)
  props.form.validateField(`experience.${props.index}.end`, true)
}
</script> 