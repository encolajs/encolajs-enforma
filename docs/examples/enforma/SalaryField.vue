<template>
  <HeadlessField :name="minName">
    <template #default="min">
      <HeadlessField :name="maxName">
        <template #default="max">
          <div class="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
            <UInput
              :id="min.id"
              class="w-full"
              :color="min.error ? 'error' : undefined"
              :highlight="!!min.error"
              v-bind="min.attrs"
              v-on="min.events"
              placeholder="Min"
            />
            <span>-</span>
            <UInput
              :id="max.id"
              class="w-full"
              :color="max.error ? 'error' : undefined"
              :highlight="!!max.error"
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
import { HeadlessField } from '@'
import UInput from '@nuxt/ui/components/Input.vue'
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
