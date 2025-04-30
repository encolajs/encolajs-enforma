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
    @form_initialized="emit('form_initialized', $event)"
    @reset="emit('reset', $event)"
  >
    <template #default>
      <slot name="default">
        <component
          :is="schemaComponent"
          v-if="transformedSchema"
          :schema="transformedSchema"
        />
      </slot>

      <slot name="actions">
        <div v-bind="getConfig('pt.actions') || {}">
          <component :is="submitButton" />
          <component :is="resetButton" v-if="showResetButton" />
        </div>
      </slot>
    </template>
  </HeadlessForm>
</template>

<script setup lang="ts">
import {
  provide,
  ref,
  onMounted,
  PropType,
  reactive,
  computed,
  useSlots,
} from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
  formFieldSlotsKey,
} from '@/constants/symbols'
import { FormSchema } from '@/types'
import { ValidationRules } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { useConfig } from '@/utils/useConfig'
import applyTransformers from '@/utils/applyTransformers'
import { evaluateSchema } from '@/utils/evaluateSchema'
import { de } from 'vuetify/locale'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  schema: {
    type: Object as unknown as PropType<FormSchema>,
    default: null,
  },
  rules: {
    type: Object as unknown as PropType<ValidationRules>,
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
  'form_initialized',
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
const { getConfig } = useFormConfig(false)

// Apply form props transformers to handle schema, context, and config in a single pipeline
const transformedProps = computed(() => {
  const formPropsTransformers = getConfig(
    'transformers.form_props',
    []
  ) as Function[]

  const schema = evaluateSchema(props.schema, form.value || {}, props.context, formConfig)

  if (formPropsTransformers.length === 0) {
    return {
      schema: schema,
      context: props.context || {},
      config: formConfig,
    }
  }

  // Create a single props object containing schema, context and config
  const formProps = {
    schema: schema ? { ...schema } : null,
    context: props.context ? { ...props.context } : {},
    config: { ...formConfig },
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

provide(formContextKey, transformedContext.value)
provide(formSchemaKey, transformedSchema.value)
provide(formConfigKey, transformedFormConfig.value)

// Get slots and provide them for field customization
const $slots = useSlots()
provide(formFieldSlotsKey, $slots)

const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
