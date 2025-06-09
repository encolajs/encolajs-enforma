<template>
  <HeadlessForm
    ref="form"
    :data="data"
    :rules="effectiveRules"
    :custom-messages="effectiveMessages"
    :submit-handler="submitHandler"
    :validate-on="config.validateOn"
    @submit_success="emit('submit_success', $event)"
    @submit_error="emit('submit_error', $event)"
    @validation_fail="emit('validation_fail', $event)"
    @field_changed="emit('field_changed', $event)"
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
        <div v-if="showSubmitButton" v-bind="getConfig('pt.actions') || {}">
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
  toRaw,
  watch,
  nextTick,
} from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
  formFieldSlotsKey,
  fieldRulesCollectorKey,
} from '@/constants/symbols'
import { FormSchema } from '@/types'
import { ValidationRules } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { useConfig } from '@/utils/useConfig'
import applyTransformers from '@/utils/applyTransformers'
import {
  extractRulesFromSchema,
  extractMessagesFromSchema,
} from '@/utils/extractRulesFromSchema'
import isNonEmptyObject from '@/utils/isNonEmptyObject'

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
  showSubmitButton: {
    type: Boolean,
    default: true,
  },
  showResetButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'submit_success',
  'submit_error',
  'validation_fail',
  'reset',
  'field_changed',
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

// Field rules and messages collector
const fieldRules = reactive<ValidationRules>({})
const fieldMessages = reactive<Record<string, any>>({})

const fieldRulesCollector = {
  registerField(
    fieldName: string,
    rules?: string,
    messages?: Record<string, any>
  ) {
    if (rules) {
      // Parse rules string format like "required|email"
      fieldRules[fieldName] = rules
    }
    if (messages && Object.keys(messages).length > 0) {
      // Convert nested format to flat format
      Object.keys(messages).forEach((ruleName) => {
        const flatKey = `${fieldName}:${ruleName}`
        fieldMessages[flatKey] = messages[ruleName]
      })
    }
  },
  unregisterField(fieldName: string) {
    delete fieldRules[fieldName]
    // Remove all messages for this field
    Object.keys(fieldMessages).forEach((key) => {
      if (key.startsWith(`${fieldName}:`)) {
        delete fieldMessages[key]
      }
    })
  },
}

const effectiveRules = computed(() => {
  const schemaRules = extractRulesFromSchema(props.schema || {})
  if (Object.keys(schemaRules).length > 0) {
    return schemaRules
  }

  // Merge field-level rules
  const mergedRules = { ...fieldRules }

  // Props rules take highest precedence
  if (props.rules && Object.keys(props.rules).length > 0) {
    return { ...mergedRules, ...props.rules }
  }

  return mergedRules
})

// Use either schema messages or provided messages
const effectiveMessages = computed(() => {
  const schemaMessages = extractMessagesFromSchema(props.schema || {})
  if (Object.keys(schemaMessages).length > 0) {
    return schemaMessages
  }

  // Merge field-level messages (already in flat format)
  const mergedMessages = { ...fieldMessages }

  // Props messages take highest precedence
  if (props.messages && Object.keys(props.messages).length > 0) {
    return { ...mergedMessages, ...props.messages }
  }

  return mergedMessages
})

// Apply form props transformers to handle schema, context, and config in a single pipeline
const transformedProps = computed(() => {
  const formPropsTransformers = getConfig(
    'transformers.form_props',
    []
  ) as Function[]

  if (formPropsTransformers.length === 0) {
    return {
      schema: props.schema,
      context: props.context || {},
      config: formConfig,
    }
  }

  // Create a single props object containing schema, context and config
  const formProps = {
    schema: props.schema ? { ...props.schema } : null,
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
provide(fieldRulesCollectorKey, fieldRulesCollector)

// Get slots and provide them for field customization
const $slots = useSlots()
provide(formFieldSlotsKey, $slots)

const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
