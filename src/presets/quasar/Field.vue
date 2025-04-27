<template>
  <div v-bind="props.wrapper" class="quasar-field">
    <div class="enforma-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.input"
        v-on="fieldController.events"
      />
    </div>

    <!-- Error message -->
    <div v-if="fieldController.error" class="enforma-field-error" v-bind="props.error">
      {{ fieldController.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEnformaField } from '../../core/useEnformaField'
import { ComponentPublicInstance, PropType } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { useFormConfig } from '@/utils/useFormConfig'

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  inputComponent: {
    type: [String, Object] as PropType<string | ComponentPublicInstance | null>,
    default: null,
  },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: [Boolean, String], default: undefined },
  help: { type: String, default: null },
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  // these are here only because they might be passed from the schema
  // they are not actually used for rendering
  section: { type: String, default: null },
  position: { type: Number, default: null },
})
// Use the extracted composable
const {
  fieldOptions,
  fieldController,
  props,
} = useEnformaField(originalProps)
// Import translation function directly
const { t } = useTranslation()
// Get the required indicator directly
const { getConfig } = useFormConfig()
const requiredIndicator = getConfig('pt.required.text', '*')
</script>

<style scoped>
.quasar-field {
  margin-bottom: 16px;
}
.enforma-field-error {
  padding-top: 4px;
}
</style>
