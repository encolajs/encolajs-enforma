<template>
  <HeadlessForm
    ref="form"
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
import { provide, ref, PropType } from 'vue'
import HeadlessForm from '@/headless/HeadlessForm'
import {
  formContextKey,
  formConfigKey,
  formSchemaKey,
} from '@/constants/symbols'
import { FieldSchema } from '@/types'
import { ValidationRules } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { useConfig } from '@/utils/useConfig'

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

const form = ref(null)

/**
 * Expose the form controller
 * This allows parent components to call methods like validate(), reset(), etc.
 */
defineExpose({
  form
})

provide(formContextKey, props.context)
provide(formSchemaKey, props.schema)
provide(formConfigKey, useConfig(props.config))

const { getConfig } = useFormConfig()
const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
