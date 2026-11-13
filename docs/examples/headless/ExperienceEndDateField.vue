<!--
This custom field that  is a wrapper for
a <HeadlessField> component that renders 2 input fields

We are nesting one HeadlessField inside each other because
1. the fields depend on each other (i.e. the datepicker's disable property
depends on the toggleswitch's value)
2. we want to show the error message for the date after the toggleswitch
-->

<template>
  <div>
    <!-- End date field with current field nested inside -->
    <HeadlessField :name="endName">
      <template #default="end">
        <div>
          <label :for="end.id">End</label>
          <DatePicker
            :id="end.id"
            :model-value="end.value"
            class="w-full"
            :disabled="isCurrentlyWorking"
            :color="end.error ? 'error' : undefined"
            :highlight="!!end.error"
            v-bind="end.attrs"
            @blur="end.events.blur"
            @focus="end.events.focus"
            @update:model-value="(date) => end.events.change({value: date})"
          />
          
          <!-- Current position field nested inside end date field -->
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
          
          <!-- Error message after both fields -->
          <div v-if="end.error"
               :id="end.attrs['aria-errormessage']"
               class="text-red-500">
            {{ end.error }}
          </div>
        </div>
      </template>
    </HeadlessField>
  </div>
</template>

<script setup>
import { HeadlessField } from '../../../src/index'
import USwitch from '@nuxt/ui/components/Switch.vue'
// Nuxt UI's UInputDate with Date objects as values
import DatePicker from '../nuxtui/DatePicker.vue'
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  form: {
    type: Object,
    required: true
  }
})

const endName = props.name
const currentName = endName.replace('.end', '.current')

// Compute the current value to ensure it's always up-to-date
const isCurrentlyWorking = computed(() => props.form[currentName])

const onChangeCurrent = (value) => {
  props.form.setFieldValue(currentName, value)
  if (value) {
    props.form.setFieldValue(endName, null)
    props.form.validateField(endName, true)
  }
}
</script>