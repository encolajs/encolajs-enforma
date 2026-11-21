<template>
  <HeadlessForm
    :id="id"
    ref="form"
    :data="data"
    :validator="formValidator"
    :rules="deprecatedRules"
    :custom-messages="effectiveMessages"
    :submit-handler="submitHandler"
    :validate-on="config.validateOn"
    :field-order="fieldOrder"
    @submit_success="emit('submit_success', $event)"
    @submit_error="emit('submit_error', $event)"
    @validation_fail="onValidationFail"
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
  inject,
  provide,
  ref,
  PropType,
  computed,
  useSlots,
  toRaw,
  watch,
  nextTick,
} from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import EnformaSchema from './EnformaSchema.vue'
import { fieldsInRenderOrder } from './useEnformaSection'
import { goToFirstError } from './useFocusTarget'
import EnformaSubmitButton from './EnformaSubmitButton.vue'
import EnformaResetButton from './EnformaResetButton.vue'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
  formFieldSlotsKey,
  formControllerSelfKey,
  enformaConfigKey,
} from '@/constants/symbols'
import { FormController, FormSchema } from '@/types'
import { ValidationRules } from '@/types'
import type { FormValidator } from '@/validators/types'
import {
  validatorFromRules,
  warnSchemaRulesLeftOut,
} from '@/validators/fromRules'
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
  validator: {
    type: Object as PropType<FormValidator>,
    default: undefined,
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
  // The <form>'s id, read once, as the form is made. Without it, one is made up
  id: {
    type: String,
    default: undefined,
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

// The form's messages: its schema's, or those it is given
const effectiveMessages = computed(() => {
  const schemaMessages = extractMessagesFromSchema(props.schema || {})
  if (Object.keys(schemaMessages).length > 0) {
    return schemaMessages
  }
  return props.messages || {}
})

// What checks the form, settled once, as the form is made: the validator it is given, else
// one made from its schema's `rules` and `messages` (those of @encolajs/validator). Validation
// is set up for the whole form; a field gives none. The deprecated `rules` prop alone is
// handed on as rules, which warn of their deprecation
const schemaRules = extractRulesFromSchema(props.schema || {})
const schemaRulePaths = Object.keys(schemaRules)

if (props.validator && schemaRulePaths.length > 0) {
  warnSchemaRulesLeftOut(schemaRulePaths)
}

const formValidator: FormValidator | undefined =
  props.validator ??
  (schemaRulePaths.length > 0
    ? validatorFromRules(
        schemaRules,
        effectiveMessages.value,
        inject(enformaConfigKey, null)
      )
    : undefined)

const deprecatedRules =
  schemaRulePaths.length === 0 && isNonEmptyObject(props.rules)
    ? props.rules
    : undefined

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

// A refused submit goes to the first field with errors, after the form's listeners have heard
// of it and its errors are drawn
function onValidationFail(formController: FormController, paths: string[]) {
  emit('validation_fail', formController, paths)
  goToFirstError(formController, transformedFormConfig.value)
}

// Get slots and provide them for field customization
const $slots = useSlots()
provide(formFieldSlotsKey, $slots)

// Enforma's own components unless the config names others
const submitButton = getConfig('components.submitButton') || EnformaSubmitButton
const resetButton = getConfig('components.resetButton') || EnformaResetButton
const schemaComponent = getConfig('components.schema') || EnformaSchema
</script>
