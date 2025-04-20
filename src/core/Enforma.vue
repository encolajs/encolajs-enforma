<template>
  <HeadlessForm
    ref="formRef"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
    :validate-on="config.validateOn"
    @submit-success="emit('submit-success', $event)"
    @submit-error="emit('submit-error', $event)"
    @validation-error="emit('validation-error', $event)"
    @field-changed="emit('field-changed', $event)"
    @field-focused="emit('field-focused', $event)"
    @field-blurred="emit('field-blurred', $event)"
    @form-initialized="emit('form-initialized', $event)"
    @reset="emit('reset', $event)"
  >
    <template #default="formCtrl">
      <slot name="default" v-bind="formCtrl">
        <component :is="schemaComponent" v-if="schema" :schema="schema" />
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
import { computed, provide, ref, PropType } from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import { mergeConfigs } from '@/utils/configUtils'
import { getGlobalConfig } from '@/utils/useConfig'
import { formContextKey, formConfigKey } from '@/constants/symbols'
import { FieldSchema } from '@/types'
import { ValidationRules } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'

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
  'submit-success',
  'submit-error',
  'validation-error',
  'reset',
  'field-changed',
  'field-focused',
  'field-blurred',
  'form-initialized',
])

const formRef = ref(null)

/**
 * Methods for directly working with the form's event system
 */
const on = (event, handler) => {
  if (formRef.value) {
    formRef.value.on(event, handler)
  }
  return { off: () => off(event, handler) }
}

const off = (event, handler) => {
  if (formRef.value) {
    formRef.value.off(event, handler)
  }
}

/**
 * Expose the formRef and convenience methods
 * This allows parent components to call methods like validate(), reset(), etc.
 * It also provides direct access to the event system via on() and off()
 */
defineExpose({
  formRef,
  on,
  off,
})

const formConfig = computed(() => {
  // Get the global config once
  const globalConfig = getGlobalConfig()
  // Create a new object to avoid reactivity issues
  return mergeConfigs(globalConfig, props.config || {})
})
provide(formConfigKey, formConfig)
provide(formContextKey, props.context)

const { getConfig } = useFormConfig(props.config)
const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
