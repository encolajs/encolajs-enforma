<template>
  <div
    :id="wrapperAttrs.id"
    :class="wrapperClasses"
    v-bind="wrapperAttrs"
    v-show="visible"
  >
    <!-- Label -->
    <label
      v-if="hasLabel"
      :for="labelAttrs.for"
      :class="labelClasses"
      v-bind="labelAttrs"
    >
      {{ label }}
      <span
        v-if="showRequiredIndicator"
        :class="requiredClasses"
        v-bind="requiredAttrs"
        >{{ requiredIndicator }}</span
      >
    </label>

    <!-- Field content slot -->
    <slot name="default"></slot>

    <!-- Help text -->
    <div v-if="helpText" :class="helpClasses" v-bind="helpAttrs">
      {{ helpText }}
    </div>

    <!-- Error message -->
    <div v-if="showError" :class="errorClasses" v-bind="errorAttrs">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { FORM_KIT_CONFIG } from '../../constants/symbols'
import { FormKitConfig } from '../../types/config'
import { DEFAULT_CONFIG } from '../../constants/defaults'
import { FieldWrapperProps } from '../../types/field'
import { useConfig } from '../../composables/useConfig'
import { useDynamicProps } from '../../composables/useDynamicProps'

export default defineComponent({
  name: 'FormKitFieldWrapper',

  props: {
    // Field identity
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      default: null,
    },

    // Display options
    label: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    helpText: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    showError: {
      type: Boolean,
      default: false,
    },
    visible: {
      type: Boolean,
      default: true,
    },

    // Component props
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
  },

  setup(props) {
    // Inject configuration
    const config = inject<FormKitConfig>(FORM_KIT_CONFIG, DEFAULT_CONFIG)
    const { config: mergedConfig } = useConfig()
    const { evaluateProps } = useDynamicProps()

    // Compute field ID
    const fieldId = computed(() => props.id || `field-${props.name}`)

    // Extract config props for each component part
    const fieldConfig = mergedConfig.value.fieldProps

    // Determine if we should show the label
    const hasLabel = computed(() => !!props.label)

    // Determine if we should show the required indicator
    const showRequiredIndicator = computed(
      () => props.required && fieldConfig.label?.required
    )

    // Get required indicator text from config
    const requiredIndicator = computed(
      () => fieldConfig.label?.required?.text || '*'
    )

    // Compute classes
    const wrapperClasses = computed(() =>
      [
        fieldConfig.wrapper?.class,
        props.wrapperProps?.class,
        props.errorMessage ? 'formkit-has-error' : '',
        props.required ? 'formkit-required' : '',
      ]
        .filter(Boolean)
        .join(' ')
    )

    const labelClasses = computed(() =>
      [fieldConfig.label?.class, props.labelProps?.class]
        .filter(Boolean)
        .join(' ')
    )

    const requiredClasses = computed(() =>
      [fieldConfig.label?.required?.class, props.labelProps?.requiredClass]
        .filter(Boolean)
        .join(' ')
    )

    const errorClasses = computed(() =>
      [fieldConfig.error?.class, props.errorProps?.class]
        .filter(Boolean)
        .join(' ')
    )

    const helpClasses = computed(() =>
      [fieldConfig.help?.class, props.helpProps?.class]
        .filter(Boolean)
        .join(' ')
    )

    // Compute attribute objects
    const wrapperAttrs = computed(() => ({
      id: `wrapper-${fieldId.value}`,
      ...evaluateProps(props.wrapperProps || {}).value,
    }))

    const labelAttrs = computed(() => ({
      for: fieldId.value,
      ...evaluateProps(props.labelProps || {}).value,
    }))

    const requiredAttrs = computed(() => ({
      ...evaluateProps(props.labelProps?.required || {}).value,
    }))

    const errorAttrs = computed(() => ({
      id: `error-${props.name.replace(/[\[\]\.]/g, '-')}`,
      ...evaluateProps(props.errorProps || {}).value,
    }))

    const helpAttrs = computed(() => ({
      id: `help-${props.name.replace(/[\[\]\.]/g, '-')}`,
      ...evaluateProps(props.helpProps || {}).value,
    }))

    return {
      fieldId,
      hasLabel,
      showRequiredIndicator,
      requiredIndicator,
      wrapperClasses,
      labelClasses,
      requiredClasses,
      errorClasses,
      helpClasses,
      wrapperAttrs,
      labelAttrs,
      requiredAttrs,
      errorAttrs,
      helpAttrs,
    }
  },
})
</script>
