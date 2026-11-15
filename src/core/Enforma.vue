<template>
  <HeadlessForm
    ref="form"
    :data="data"
    :rules="effectiveRules"
    :custom-messages="effectiveMessages"
    :submit-handler="submitHandler"
    :validate-on="config.validateOn"
    :field-order="fieldOrder"
    @submit_success="emit('submit_success', $event)"
    @submit_error="emit('submit_error', $event)"
    @validation_fail="
      (formController, paths) => emit('validation_fail', formController, paths)
    "
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
  PropType,
  reactive,
  computed,
  useSlots,
  toRaw,
  watch,
  nextTick,
} from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import EnformaSchema from './EnformaSchema.vue'
import { fieldsInRenderOrder } from './useEnformaSection'
import EnformaSubmitButton from './EnformaSubmitButton.vue'
import EnformaResetButton from './EnformaResetButton.vue'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
  formFieldSlotsKey,
  fieldRulesCollectorKey,
  formControllerSelfKey,
} from '@/constants/symbols'
import { FormController, FormSchema } from '@/types'
import { ValidationRules } from '@/types'
import { useConfig } from '@/utils/useConfig'
import applyTransformers from '@/utils/applyTransformers'
import {
  extractRulesFromSchema,
  extractMessagesFromSchema,
} from '@/utils/extractRulesFromSchema'
import isNonEmptyObject from '@/utils/isNonEmptyObject'
import { pathUtils } from '@/utils/helpers'

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
    default: undefined,
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
 * Expose the form controller, so a parent holding a ref to this form can call its methods
 * (submit(), validate(), reset()…) and read its state ($isSubmitting, $isChanged…).
 * Everything is read from the controller as it's asked for, so the state is the current one
 * and a computed reading it is worked out again as it changes. Before the form has mounted
 * there's no controller, and nothing is read.
 *
 * The controller is taken from the HeadlessForm's ref, not used as that ref: the ref also
 * holds the HeadlessForm's own properties ($el, $props, $emit…), which would stand in for
 * this component's. A key the controller lacks is read from the target, where Vue keeps its
 * marks.
 */
const controller = (): any => form.value?.[formControllerSelfKey]?.()
const exposedController = new Proxy({} as Record<string | symbol, any>, {
  get(target, key) {
    const ctrl = controller()
    return ctrl && key in ctrl ? ctrl[key] : Reflect.get(target, key)
  },
  has: (target, key) => {
    const ctrl = controller()
    return (!!ctrl && key in ctrl) || Reflect.has(target, key)
  },
}) as FormController
defineExpose(exposedController)

// The form's own config: the global one with the form's `config` on top. It reaches every
// part of the form (fields, sections, buttons), which read it through useFormConfig().
const formConfig = useConfig(props.config)
const getConfig = <T = any>(path: string, defaultValue?: T) =>
  pathUtils.get<T>(formConfig, path, defaultValue)

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

  // Props rules take higher precedence
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
// The schema's fields in the order they render: a refused submit's failing fields follow it
const fieldOrder = () => fieldsInRenderOrder(transformedSchema.value)
const transformedContext = computed(() => transformedProps.value.context)
const transformedFormConfig = computed(() => transformedProps.value.config)

// Provided as computeds, so a changed schema or context reaches the fields without a remount
provide(formContextKey, transformedContext)
provide(formSchemaKey, transformedSchema)
provide(formConfigKey, transformedFormConfig)
provide(fieldRulesCollectorKey, fieldRulesCollector)

// Get slots and provide them for field customization
const $slots = useSlots()
provide(formFieldSlotsKey, $slots)

// Enforma's own components unless the config names others
const submitButton = getConfig('components.submitButton') || EnformaSubmitButton
const resetButton = getConfig('components.resetButton') || EnformaResetButton
const schemaComponent = getConfig('components.schema') || EnformaSchema
</script>
