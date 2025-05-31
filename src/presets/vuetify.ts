import { Component } from 'vue'
import Field from '@/presets/vuetify/Field.vue'
import { FieldControllerExport, FormController } from '@/types'
import { VTextField, VSelect, VSwitch, VBtn } from 'vuetify/components'
import {
  DeepPartial,
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '@/utils/useConfig'
import { deepMerge } from '@/utils/configUtils'

// Define default component mapping to Vuetify components
// These will be dynamically imported from 'vuetify/components'
const inputComponents: Record<string, any> = {
  input: VTextField,
  select: VSelect,
  toggle: VSwitch,
  switch: VSwitch,
}

/**
 * Function that ensures an input field uses a Vuetify component
 * It maps field types like 'select' to Vuetify components like 'VSelect'
 */
function useVuetifyComponent(
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
      inputComponents[fieldProps.inputComponent] || VTextField
  } else if (!fieldProps.inputComponent) {
    // default to InputText
    fieldProps.inputComponent = VTextField
  }
  return fieldProps
}

/**
 * Most Vuetify components use v-model and label props
 * This function adds proper Vuetify-specific props to input components
 */
function setVuetifySpecificProps(
  fieldProps: any,
  field: FieldControllerExport,
  formController: FormController,
  config: any
) {
  // Setup Vuetify-specific props
  fieldProps.inputProps = fieldProps.inputProps || {}

  // Ensure we have an id for the field
  fieldProps.inputProps.id = field.value.id

  // Set modelValue for v-model binding
  fieldProps.inputProps.modelValue = field.value.value
  delete fieldProps.inputProps.value

  // Handle error states
  if (field.value.errors && field.value.errors.length > 0) {
    fieldProps.inputProps.error = true
    fieldProps.inputProps.errorMessages = field.value.errors
  }

  // Handle labels - Vuetify uses label prop
  if (fieldProps.label) {
    fieldProps.inputProps.label = fieldProps.label
    delete fieldProps.label
    delete fieldProps.labelProps
    fieldProps.hideLabel = true
  }
  if (fieldProps.help) {
    fieldProps.inputProps.hint = fieldProps.help
    fieldProps.inputProps.persistentHint = true
    delete fieldProps.help
    delete fieldProps.helpProps
  }
  fieldProps.inputProps.hideDetails = 'auto'

  return fieldProps
}

/**
 * Applies the Vuetify preset to the global configuration
 * This function modifies the global configuration
 * by merging the Vuetify preset with the existing global configuration
 */
export default function useVuetifyPreset(
  components?: Record<string, Component>
): void {
  /**
   * Because we don't know which Vuetify components are used in an app
   * the developer must provide the list of components after importing them
   */
  if (components) {
    Object.keys(components).map(
      (key) => (inputComponents[key] = components[key])
    )
  }

  // Get the current global configuration
  const currentConfig = getGlobalConfig()

  // Define the Vuetify preset configuration
  const vuetifyPreset: DeepPartial<EnformaConfig> = {
    /**
     * Pass-Through configuration
     * Props to be passed to various components
     */
    pt: {
      actions: {
        class: 'd-flex gap-2',
      },
      error: {
        class: 'text-error text-caption',
      },
      submit: {
        as: VBtn,
        color: 'primary',
      },
      reset: {
        as: VBtn,
        variant: 'outlined',
        color: 'secondary',
      },
      repeatable: {
        wrapper: {},
        items: {},
        item: {},
        actions: {},
        itemActions: {},
        add: {
          as: VBtn,
          icon: 'mdi-plus',
          color: 'success',
        },
        remove: {
          as: VBtn,
          icon: 'mdi-delete',
          size: 'small',
          color: 'error',
        },
        moveUp: {
          as: VBtn,
          icon: 'mdi-arrow-up',
          size: 'small',
          color: 'info',
        },
        moveDown: {
          as: VBtn,
          icon: 'mdi-arrow-down',
          size: 'small',
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
      field_props: [useVuetifyComponent, setVuetifySpecificProps],
    },
  }

  // Merge the current config with the Vuetify preset
  const mergedConfig = {
    ...currentConfig,
    pt: deepMerge(currentConfig.pt, vuetifyPreset.pt),
    components: {
      ...(currentConfig.components || {}),
      ...(vuetifyPreset.components || {}),
    },
    transformers: {
      ...currentConfig.transformers,
      field_props: [
        ...(currentConfig.transformers?.field_props || []),
        ...(vuetifyPreset.transformers?.field_props || []),
      ],
    },
  }

  // Set the global configuration
  setGlobalConfig(mergedConfig)
}
