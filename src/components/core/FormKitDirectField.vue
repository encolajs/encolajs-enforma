<template>
  <FormKitFieldWrapper
    :name="name"
    :id="fieldId"
    :label="label"
    :required="isRequired"
    :help-text="helpText"
    :error-message="error"
    :show-error="shouldShowError"
    :visible="isVisible"
    :label-props="labelProps"
    :error-props="errorProps"
    :help-props="helpProps"
    :wrapper-props="wrapperProps"
  >
    <component
      :is="resolvedComponent"
      :id="fieldId"
      :name="name"
      :value="value"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :readonly="isReadonly"
      :required="isRequired"
      v-bind="inputAttrs"
      v-on="inputEvents"
    />
  </FormKitFieldWrapper>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType } from 'vue'
import FormKitFieldWrapper from './FormKitFieldWrapper.vue'
import {
  FIELD_REGISTRY,
  FORM_CONTEXT,
  FORM_KIT_CONFIG,
  FORM_STATE,
} from '../../constants/symbols'
import { FieldRegistry } from '../../composables/useFieldRegistry'
import { FormKitConfig } from '../../types/config'
import { DEFAULT_CONFIG } from '../../constants/defaults'
import { FormStateReturn } from '../../types'
import { useDynamicProps } from '../../composables/useDynamicProps'
import { useConditions } from '../../composables/useConditions'
import { useConfig } from '../../composables/useConfig'

export default defineComponent({
  name: 'FormKitDirectField',

  components: {
    FormKitFieldWrapper,
  },

  props: {
    // Field identification
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'text',
    },

    // Display options
    label: {
      type: String,
      default: null,
    },
    helpText: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },

    // Validation and state
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: [Boolean, String],
      default: false,
    },
    readonly: {
      type: [Boolean, String],
      default: false,
    },
    visible: {
      type: [Boolean, String],
      default: true,
    },

    // Component props by section
    inputProps: {
      type: Object,
      default: () => ({}),
    },
    labelProps: {
      type: Object,
      default: () => ({}),
    },
    errorProps: {
      type: Object,
      default: () => ({}),
    },
    helpProps: {
      type: Object,
      default: () => ({}),
    },
    wrapperProps: {
      type: Object,
      default: () => ({}),
    },

    // Default value
    default: {
      type: null,
      default: null,
    },

    // Component override
    component: {
      type: [String, Object],
      default: null,
    },
  },

  setup(props) {
    // Inject dependencies
    const formState = inject<FormStateReturn | undefined>(FORM_STATE, undefined)
    const fieldRegistry = inject<FieldRegistry | undefined>(
      FIELD_REGISTRY,
      undefined
    )
    const config = inject<FormKitConfig>(FORM_KIT_CONFIG, DEFAULT_CONFIG)

    // Setup dynamic props evaluation
    const { evaluateProps, evaluateCondition } = useDynamicProps()
    const { evaluateIf } = useConditions()
    const { config: mergedConfig } = useConfig()

    // Field ID for DOM reference
    const fieldId = computed(
      () => `field-${props.name.replace(/[\[\]\.]/g, '-')}`
    )

    // Initialize field in form state if needed
    if (formState && props.default !== null) {
      const currentValue = formState.getFieldValue(props.name)
      if (currentValue === undefined) {
        formState.setFieldValue(props.name, props.default)
      }
    }

    // Get field value from form state
    const value = computed(() => {
      if (!formState) return props.default
      return formState.getFieldValue(props.name)
    })

    // Get field error from form state
    const error = computed(() => {
      if (!formState) return null
      const field = formState.getField(props.name)
      return field?.error || null
    })

    // Determine if we should show validation errors
    const shouldShowError = computed(() => {
      if (!formState || !error.value) return false

      const field = formState.getField(props.name)
      const showErrorsOn = config.behavior.showErrorsOn

      if (showErrorsOn === 'always') return true
      if (showErrorsOn === 'touched' && field?.isTouched) return true
      if (showErrorsOn === 'dirty' && field?.isDirty) return true
      if (formState.submitted.value) return true

      return false
    })

    // Evaluate conditions
    const isVisible = computed(() => evaluateCondition(props.visible).value)
    const isDisabled = computed(() => evaluateCondition(props.disabled).value)
    const isReadonly = computed(() => evaluateCondition(props.readonly).value)
    const isRequired = computed(() => props.required)

    // Resolve the component to use
    const resolvedComponent = computed(() => {
      // If a component is explicitly provided, use it
      if (props.component) {
        return props.component
      }

      // Otherwise, try to resolve from field registry
      if (fieldRegistry) {
        const component = fieldRegistry.resolveFieldType(props.type)
        if (component) {
          return component
        }
      }

      // Fall back to component from config
      const componentName =
        config.components.input[props.type] || config.components.input.text

      return componentName
    })

    // Input attributes with dynamic props evaluation
    const inputAttrs = computed(() => {
      return evaluateProps({
        ...props.inputProps,
        class: [
          config.fieldProps.input?.class,
          props.inputProps?.class,
          error.value ? 'formkit-has-error' : '',
        ]
          .filter(Boolean)
          .join(' '),
      }).value
    })

    // Event handlers for the input
    const inputEvents = computed(() => {
      if (!formState) return {}

      return {
        input: (event: Event) => {
          const target = event.target as HTMLInputElement
          const value = target?.value !== undefined ? target.value : event
          formState.setFieldValue(props.name, value, 'input')
        },
        change: (event: Event) => {
          const target = event.target as HTMLInputElement
          const value = target?.value !== undefined ? target.value : event
          formState.setFieldValue(props.name, value, 'change')
        },
        blur: () => {
          formState.touchField(props.name)
        },
      }
    })

    return {
      fieldId,
      value,
      error,
      shouldShowError,
      isVisible,
      isDisabled,
      isReadonly,
      isRequired,
      resolvedComponent,
      inputAttrs,
      inputEvents,
    }
  },
})
</script>
