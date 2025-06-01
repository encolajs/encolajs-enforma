<template>
  <div v-bind="props.wrapperProps" class="quasar-field">
    <div class="enforma-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.inputProps"
        v-on="props.inputEvents"
      />
    </div>

    <!-- Error message -->
    <div
      v-if="fieldController.error"
      class="enforma-field-error"
      v-bind="props.errorProps"
    >
      <span v-if="errorAsHtml" v-html="fieldController.error"></span>
      <span v-else>{{ fieldController.error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEnformaField } from '../../core/useEnformaField'
import { ComponentPublicInstance, PropType, computed } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'

defineOptions({
  inheritAttrs: false,
})

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
  useModelValue: { type: Boolean, default: true },
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
const { fieldController, props } = useEnformaField(originalProps)
// Import form config for HTML rendering options
const { getConfig } = useFormConfig()

// Determine whether to render error messages as HTML
const errorAsHtml = computed(() => getConfig('pt.error.renderAsHtml', false))
</script>

<style scoped>
.quasar-field {
  margin-bottom: 16px;
}
.enforma-field-error {
  padding-top: 4px;
}
</style>
