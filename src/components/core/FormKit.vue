<template>
  <div>
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
    >
      <template #default="formState">
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
      </template>
    </HeadlessForm>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, useAttrs, PropType } from 'vue'
import HeadlessForm from '../headless/HeadlessForm'
import FormKitSchema from './FormKitSchema.vue'
import { mergeConfigs } from '../../utils/configUtils'
import { getGlobalConfig } from '../../composables/useConfig'
import { formContextKey, formConfigKey } from '../../constants/symbols'

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
])

const $attrs = useAttrs()

const formRef = ref(null)

defineExpose({
  formRef,
})

const formConfig = computed(() => {
  // Get the global config once
  const globalConfig = getGlobalConfig()
  // Create a new object to avoid reactivity issues
  return mergeConfigs(globalConfig, props.config || {})
})
provide(formConfigKey, formConfig.value)
provide(formContextKey, props.context)
</script>
