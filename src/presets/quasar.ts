import { Component } from 'vue'
import Field from '@/presets/quasar/Field.vue'
import { FieldControllerExport, FormController } from '@/types'
import { QInput, QSelect, QToggle, QBtn } from 'quasar'
import {
  DeepPartial,
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '@/utils/useConfig'
import { deepMerge } from '@/utils/configUtils'

// Define default component mapping to Quasar components
// These will be dynamically imported from 'quasar'
const inputComponents: Record<string, any> = {
  input: QInput,
  select: QSelect,
  toggle: QToggle,
  switch: QToggle,
}

/**
 * Function that ensures an input field uses a Quasar component
 * It maps field types like 'select' to Quasar components like 'QSelect'
 */
function useQuasarComponent(
  fieldProps: any,
  field: FieldControllerExport,
  formState: FormController,
  config: any
) {
  if (
    fieldProps.inputComponent &&
    'object' !== typeof fieldProps.inputComponent
  ) {
    // if the component is not already a Vue component
    fieldProps.inputComponent =
      inputComponents[fieldProps.inputComponent] || QInput
  } else if (!fieldProps.inputComponent) {
    // default to QInput
    fieldProps.inputComponent = QInput
  }
  return fieldProps
}

/**
 * Most Quasar components use v-model and label props
 * This function adds proper Quasar-specific props to input components
 */
function setQuasarSpecificProps(
  fieldProps: any,
  field: FieldControllerExport,
  formController: FormController,
  config: any
) {
  // Setup Quasar-specific props
  fieldProps.inputProps = fieldProps.inputProps || {}

  // Ensure we have an id for the field
  fieldProps.inputProps.id = field.value.id

  // Set modelValue for v-model binding
  fieldProps.inputProps.modelValue = field.value.value
  delete fieldProps.inputProps.value

  // Handle error states
  if (field.value.errors && field.value.errors.length > 0) {
    fieldProps.inputProps.error = true
    fieldProps.inputProps.errorMessage = field.value.errors[0]
  }

  // Handle labels - Quasar uses label prop
  if (fieldProps.label) {
    fieldProps.inputProps.label = fieldProps.label
    delete fieldProps.label
    delete fieldProps.labelProps
    fieldProps.hideLabel = true
  }
  if (fieldProps.help) {
    fieldProps.inputProps.hint = fieldProps.help
    delete fieldProps.help
    delete fieldProps.helpProps
  }

  return fieldProps
}

/**
 * Applies the Quasar preset to the global configuration
 * This function modifies the global configuration
 * by merging the Quasar preset with the existing global configuration
 */
export default function useQuasarPreset(
  components?: Record<string, Component>
): void {
  /**
   * Because we don't know which Quasar components are used in an app
   * the developer must provide the list of components after importing them
   */
  if (components) {
    Object.keys(components).map(
      (key) => (inputComponents[key] = components[key])
    )
  }

  // Get the current global configuration
  const currentConfig = getGlobalConfig()

  // Define the Quasar preset configuration
  const quasarPreset: DeepPartial<EnformaConfig> = {
    /**
     * Pass-Through configuration
     * Props to be passed to various components
     */
    pt: {
      actions: {
        class: 'q-gutter-sm',
      },
      error: {
        class: 'text-negative text-caption',
      },
      submit: {
        as: QBtn,
        color: 'primary',
      },
      reset: {
        as: QBtn,
        outline: true,
        color: 'secondary',
      },
      repeatable: {
        wrapper: {},
        items: {},
        item: {},
        actions: {},
        itemActions: {},
        add: {
          as: QBtn,
          round: true,
          size: 'sm',
          icon: 'add',
          color: 'positive',
        },
        remove: {
          as: QBtn,
          round: true,
          size: 'sm',
          icon: 'delete',
          color: 'negative',
        },
        moveUp: {
          as: QBtn,
          round: true,
          size: 'sm',
          icon: 'arrow_upward',
          color: 'info',
        },
        moveDown: {
          as: QBtn,
          round: true,
          size: 'sm',
          icon: 'arrow_downward',
          color: 'info',
        },
      },
    },
    /**
     * Default components to be used inside Enforma forms
     */
    components: {
      field: Field,
    },
    /**
     * Functions to transform props of Enforma components before rendering
     */
    transformers: {
      field_props: [useQuasarComponent, setQuasarSpecificProps],
    },
  }

  // Merge the current config with the Quasar preset
  const mergedConfig = {
    ...currentConfig,
    pt: deepMerge(currentConfig.pt, quasarPreset.pt),
    components: {
      ...(currentConfig.components || {}),
      ...(quasarPreset.components || {}),
    },
    transformers: {
      ...currentConfig.transformers,
      field_props: [
        ...(currentConfig.transformers?.field_props || []),
        ...(quasarPreset.transformers?.field_props || []),
      ],
    },
  }

  // Set the global configuration
  setGlobalConfig(mergedConfig)
}
