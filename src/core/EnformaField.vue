<template>
  <div v-bind="props.wrapperProps">
    <label
      v-if="!props.hideLabel && !props.showLabelNextToInput && props.label"
      v-bind="props.labelProps"
    >
      {{ t(props.label) }}
      <EnformaRequiredIndicator v-if="props.required" />
    </label>

    <div class="enforma-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.inputProps"
        v-on="props.inputEvents || {}"
      />
      <label
        v-if="props.showLabelNextToInput && props.label"
        v-bind="props.labelProps"
      >
        {{ t(props.label) }}
        <EnformaRequiredIndicator v-if="props.required" />
      </label>
    </div>

    <!-- Help text -->
    <div v-if="props.help" class="enforma-field-help" v-bind="props.helpProps">
      <span v-if="helpAsHtml" v-html="t(props.help)"></span>
      <span v-else>{{ t(props.help) }}</span>
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
import { EnformaFieldProps, useEnformaField } from './useEnformaField'
import { ComponentPublicInstance, PropType, useAttrs, computed } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { useFormConfig } from '@/utils/useFormConfig'
import EnformaRequiredIndicator from './EnformaRequiredIndicator.vue'

const originalProps = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: null },
  inputComponent: {
    type: [String, Object] as unknown as PropType<
      string | ComponentPublicInstance | null
    >,
    default: null,
  },
  hideLabel: { type: Boolean, default: false },
  showLabelNextToInput: { type: Boolean, default: false },
  required: { type: [Boolean, String], default: undefined },
  help: { type: String, default: null },
  useModelValue: { type: Boolean, default: false },
  labelProps: { type: Object, default: () => ({}) },
  errorProps: { type: Object, default: () => ({}) },
  helpProps: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  inputProps: { type: Object, default: () => ({}) },
  // these are here only because they might be passed from the schema
  // and this will exclude them being added as attributes to the wrapper
  section: { type: String, default: null },
  position: { type: Number, default: null },
  type: { type: String, default: null },
  rules: { type: String, default: null },
  messages: { type: Object, default: null },
}) as EnformaFieldProps
// Use the extracted composable
const { fieldController, props } = useEnformaField(originalProps)
// Import translation function directly
const { t } = useTranslation()
// Import form config for HTML rendering options
const { getConfig } = useFormConfig()

// Determine whether to render help and error messages as HTML
const helpAsHtml = computed(() => getConfig('pt.help.renderAsHtml', false))
const errorAsHtml = computed(() => getConfig('pt.error.renderAsHtml', false))
</script>
