<template>
  <HeadlessField :names="{end: endName, current: currentName}">
    <template #default="{end, current}">
      <div>
        <label :for="end.id">End</label>
        <DatePicker
          :id="end.id"
          :model-value="end.value"
          date-format="yy-mm-dd"
          fluid
          :disabled="current.value"
          v-bind="end.attrs"
          v-on="end.events"
          @date-select="(date) => end.events.change({value: formatDate(date)})"
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
import { HeadlessField } from '@/index'
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

const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

const onChangeCurrent = (value) => {
  props.form.setFieldValue(`experience.${props.index}.current`, value)
  props.form.setFieldValue(`experience.${props.index}.end`, null)
  props.form.validateField(`experience.${props.index}.end`, true)
}
</script> 