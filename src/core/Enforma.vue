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
import { provide, ref, onMounted, PropType, reactive, computed } from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
} from '@/constants/symbols'
import { FieldSchema, FormSchema } from '@/types'
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
    type: Object as PropType<FormSchema>,
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

// Apply form props transformers to handle schema, context, and config in a single pipeline
const transformedProps = computed(() => {
  const formPropsTransformers = getConfig('transformers.form_props', []) as Function[]
  
  if (formPropsTransformers.length === 0) {
    return {
      schema: props.schema,
      context: props.context || {},
      config: formConfig
    }
  }
  
  // Create a single props object containing schema, context and config
  const formProps = {
    schema: props.schema ? { ...props.schema } : null,
    context: props.context ? { ...props.context } : {},
    config: { ...formConfig }
  }
  
  // Apply all transformers at once to the combined props
  return applyTransformers(
    formPropsTransformers,
    formProps,
    form.value // Pass the form controller
  )
})

// Extract the transformed props into individual reactive properties
const transformedSchema = computed(() => transformedProps.value.schema)
const transformedContext = computed(() => transformedProps.value.context)
const transformedFormConfig = computed(() => transformedProps.value.config)

provide(formContextKey, transformedContext)
provide(formSchemaKey, transformedSchema)
provide(formConfigKey, transformedFormConfig)

const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
