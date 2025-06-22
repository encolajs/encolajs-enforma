<template>
  <HeadlessField :name="minName">
    <template #default="min">
      <HeadlessField :name="maxName">
        <template #default="max">
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
          <div v-if="min.error"
               :id="min.attrs['aria-errormessage']"
               class="text-red-500">
            {{ min.error }}
          </div>
          <div v-else-if="max.error"
               :id="max.attrs['aria-errormessage']"
               class="text-red-500">
            {{ max.error }}
          </div>
        </template>
      </HeadlessField>
    </template>
  </HeadlessField>
</template>

<script setup>
import { HeadlessField } from '@encolajs/enforma'
import { InputText } from 'primevue'
import { useAttrs } from 'vue'

const attrs = useAttrs()

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const minName = props.name + '.min'
const maxName = props.name + '.max'
</script>