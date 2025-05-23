<!--
Component created to reduce the verbosity
of using <HeadlessField> in for each field

If you plan to use the <HeadlessField> components
this is the first thing to do in your app
-->

<template>
  <div v-bind="$attrs">
    <HeadlessField :name="name">
      <template #default="{ model, value, attrs, error, events, id }">
        <label
          v-if="label"
          :id="attrs['aria-labelledby']"
          :for="id"
          class="block" >
          {{ label }}
        </label>
        <slot
          :value="value"
          :attrs="attrs"
          :error="error"
          :events="events"
          :model="model"
          :id="id"
        />
        <div v-if="error"
             :id="attrs['aria-errormessage']"
             class="text-red-500">
          {{ error }}
        </div>
      </template>
    </HeadlessField>
  </div>
</template>

<script setup>
import { HeadlessField } from '../../../src'

defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: null
  }
})
</script> 