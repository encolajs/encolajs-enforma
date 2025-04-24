<template>
  <HeadlessForm
    ref="form"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
    :validate-on="config.validateOn"
    @submit_success="emit('submit_success', $event)"
    @submit_error="emit('submit_error', $event)"
    @validation_error="emit('validation_error', $event)"
    @field_change="emit('field_change', $event)"
    @field_focus="emit('field_focus', $event)"
    @field_blur="emit('field_blur', $event)"
    @form-initialized="emit('form-initialized', $event)"
    @reset="emit('reset', $event)"
  >
    <template #default="formCtrl">
      <slot name="default" v-bind="formCtrl">
        <component :is="schemaComponent" v-if="transformedSchema" :schema="transformedSchema" />
      </slot>

      <slot name="actions" v-bind="{ formCtrl, formConfig }">
        <div v-bind="getConfig('pt.actions')">
          <component :is="submitButton" />
          <component :is="resetButton" v-if="showResetButton" />
        </div>
      </slot>
    </template>
  </HeadlessForm>
</template>

<script setup lang="ts">
import { provide, ref, onMounted, PropType, defineExpose, reactive, computed } from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
} from '@/constants/symbols'
import { FieldSchema, EnformaSchema } from '@/types'
import { ValidationRules } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { useConfig } from '@/utils/useConfig'
import applyTransformers from '@/utils/applyTransformers'

export interface FormSchema {
  [key: string]: FieldSchema
}

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  schema: {
    type: Object as PropType<EnformaSchema>,
    default: null,
  },
  rules: {
    type: Object as PropType<ValidationRules>,
    default: () => ({}),
  },
  context: {
    type: Object,
    default: () => ({}),
  },
  messages: {
    type: Object,
    default: () => ({}),
  },
  config: {
    type: Object,
    default: () => ({}),
  },
  submitHandler: {
    type: Function as PropType<(data: any) => Promise<any>>,
    required: true,
  },
  showResetButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'submit_success',
  'submit_error',
  'validation_error',
  'reset',
  'field_change',
  'field_focus',
  'field_blur',
  'form-initialized',
])

const form = ref()

/**
 * Expose the form controller
 * This allows parent components to call methods like validate(), reset(), etc.
 */
const exposedController = reactive({})
defineExpose(exposedController)
onMounted(() => {
  if (form.value) {
    Object.assign(exposedController, form.value)
  }
})

const formConfig = useConfig(props.config)
const { getConfig } = useFormConfig()

// Apply schema transformers if defined in config
const transformedSchema = computed(() => {
  if (!props.schema) return null
  
  const schemaTransformers = getConfig('transformers.schema', []) as Function[]
  
  if (schemaTransformers.length === 0) {
    return props.schema
  }
  
  return applyTransformers(
    schemaTransformers,
    { ...props.schema }, // Create a copy to avoid mutating the original
    form.value // Pass the form controller
  )
})

// Apply context transformers if defined in config
const transformedContext = computed(() => {
  if (!props.context) return {}
  
  const contextTransformers = getConfig('transformers.context', []) as Function[]
  
  if (contextTransformers.length === 0) {
    return props.context
  }
  
  return applyTransformers(
    contextTransformers,
    { ...props.context }, // Create a copy to avoid mutating the original
    form.value // Pass the form controller
  )
})

// Apply form config transformers if defined in config
const transformedFormConfig = computed(() => {
  const formConfigTransformers = getConfig('transformers.form_config', []) as Function[]
  
  if (formConfigTransformers.length === 0) {
    return formConfig
  }
  
  return applyTransformers(
    formConfigTransformers,
    { ...formConfig }, // Create a copy to avoid mutating the original
    form.value // Pass the form controller
  )
})

provide(formContextKey, transformedContext)
provide(formSchemaKey, transformedSchema)
provide(formConfigKey, transformedFormConfig)

const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
