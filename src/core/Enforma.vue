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
  'submit_success',
  'submit_error',
  'validation_error',
  'reset',
  'field_change',
  'field_focus',
  'field_blur',
  'form-initialized',
])

const form = ref(null)

/**
 * Expose the form controller
 * This allows parent components to call methods like validate(), reset(), etc.
 */
defineExpose({
  form,
})

const formConfig = useConfig(props.config)

provide(formContextKey, props.context)
provide(formSchemaKey, props.schema)
provide(formConfigKey, formConfig)

const { getConfig } = useFormConfig()
const submitButton = getConfig('components.submitButton')
const resetButton = getConfig('components.resetButton')
const schemaComponent = getConfig('components.schema')
</script>
