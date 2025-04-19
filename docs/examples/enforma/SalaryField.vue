<template>
  <HeadlessField :names="{min: minName, max: maxName}">
    <template #default="{min, max}">
      <div class="flex gap-1 items-center">
        <InputText
          :id="min.id"
          style="width: 100px"
          v-bind="min.attrs"
          v-on="min.events"
          placeholder="Min"
        />
        <span>-</span>
        <InputText
          :id="max.id"
          style="width: 100px"
          v-bind="max.attrs"
          v-on="max.events"
          placeholder="Max"
        />
      </div>
    </template>
  </HeadlessField>
</template>

<script setup>
import { HeadlessField } from '@'
import { InputText } from 'primevue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const minName = props.name + '.min'
const maxName = props.name + '.max'
</script>