<template>
  <HeadlessForm
    ref="formRef"
    :data="data"
    :rules="rules"
    :custom-messages="messages"
    :submit-handler="submitHandler"
    :validate-on="config.validateOn"
    @submit="emit('submit', $event)"
    @submit-error="emit('submit-error', $event)"
    @validation-error="emit('validation-error', $event)"
  >
    <template #default="formState">
      <form v-bind="$attrs" @submit.prevent="formState.submit" novalidate>
        <slot name="default" v-bind="formState">
          <FormKitSchema v-if="schema" :schema="schema" />
        </slot>

        <slot name="actions" v-bind="{ formState, formConfig }">
          <div class="formkit-actions">
            <component :is="formConfig.components.submitButton" />
            <component
              :is="formConfig.components.resetButton"
              v-if="showResetButton"
            />
          </div>
        </slot>
      </form>
    </template>
  </HeadlessForm>
</template>

<script setup lang="ts">
import {
  computed,
  provide,
  ref,
  useAttrs,
  defineExpose,
  defineEmits,
  PropType,
} from 'vue'
import HeadlessForm from '../headless/HeadlessForm'
import FormKitSchema from './FormKitSchema.vue'
import { mergeConfigs } from '../../utils/configUtils'
import { getGlobalConfig } from '../../composables/useConfig'
import { formContextKey, formConfigKey } from '../../constants/symbols'
import { FormProxy } from '@/types'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  schema: {
    type: Object,
    default: null,
  },
  rules: {
    type: Object,
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
    type: Function as PropType<(form: FormProxy, data: any) => Promise<any>>,
    required: true,
  },
  showResetButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['submit-success', 'submit-error', 'reset'])

const $attrs = useAttrs()

const formRef = ref(null)

defineExpose({
  formRef,
})

const onSubmit = async (data: any) => {
  try {
    await props.submitHandler(formRef.value, data)
    emit('submit-success', data)
  } catch (error) {
    emit('submit-error', error)
    throw error
  }
}

const formConfig = computed(() => {
  // Get the global config once
  const globalConfig = getGlobalConfig()
  // Create a new object to avoid reactivity issues
  return mergeConfigs(globalConfig, props.config || {})
})
provide(formConfigKey, formConfig.value)
provide(formContextKey, props.context)
</script>
