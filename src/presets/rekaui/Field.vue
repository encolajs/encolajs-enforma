<template>
  <div v-bind="props.wrapperProps" class="rekaui-field">
    <!-- Label -->
    <label
      v-if="!props.hideLabel && props.label"
      :for="fieldController.value.id"
      v-bind="props.labelProps"
      class="rekaui-field-label"
    >
      {{ props.label }}
      <span
        v-if="props.required"
        v-bind="requiredProps"
        class="rekaui-field-required"
      >
        {{ requiredProps?.text || '*' }}
      </span>
    </label>

    <!-- Input component -->
    <div class="rekaui-field-input">
      <component
        :is="props.inputComponent"
        v-model="fieldController.value"
        v-bind="props.inputProps"
        v-on="props.inputEvents"
      />
    </div>

    <!-- Help text -->
    <div v-if="props.help" class="rekaui-field-help" v-bind="props.helpProps">
      {{ props.help }}
    </div>

    <!-- Error message -->
    <div
      v-if="fieldController.error"
      class="rekaui-field-error"
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
  help: { type: String, default: null },
  useModelValue: { type: Boolean, default: true },
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

// Get required marker props from config
const requiredProps = computed(() => getConfig('pt.required', { text: '*' }))
</script>

<style scoped>
.rekaui-field {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rekaui-field-label {
  font-weight: 500;
  font-size: 14px;
}

.rekaui-field-required {
  color: red;
  margin-left: 2px;
}

.rekaui-field-help {
  font-size: 12px;
  color: #666;
}

.rekaui-field-error {
  font-size: 12px;
  color: #dc2626;
}
</style>
