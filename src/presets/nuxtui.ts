import { Component } from 'vue'
import Field from '@/presets/nuxtui/Field.vue'
import { FieldControllerExport, FormController } from '@/types'
import {
  DeepPartial,
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '@/utils/useConfig'
import { deepMerge } from '@/utils/configUtils'

// Define default component mapping to Nuxt UI components
// These will be dynamically imported by the developer
const inputComponents: Record<string, any> = {}

/**
 * Function that ensures an input field uses a Nuxt UI component
 * It maps field types like 'select' to Nuxt UI components like 'USelect'
 */
function useNuxtUIComponent(
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
      inputComponents[fieldProps.inputComponent] || inputComponents.input
  } else if (!fieldProps.inputComponent) {
    // default to UInput
    fieldProps.inputComponent = inputComponents.input
  }
  return fieldProps
}

/**
 * Nuxt UI components use v-model with modelValue
 * This function adds proper Nuxt UI-specific props to input components
 */
function setNuxtUISpecificProps(
  fieldProps: any,
  field: FieldControllerExport,
  formController: FormController,
  config: any
) {
  // Setup Nuxt UI-specific props
  fieldProps.inputProps = fieldProps.inputProps || {}

  // Ensure we have an id for the field
  fieldProps.inputProps.id = field.value.id
  fieldProps.inputProps.name = field.value.name

  // Set modelValue for v-model binding
  fieldProps.inputProps.modelValue = field.value.value
  delete fieldProps.inputProps.value

  // Handle error states - use highlight prop for UInput and USelect
  if (field.value.errors && field.value.errors.length > 0) {
    fieldProps.inputProps.highlight = true
    fieldProps.inputProps.color = 'error'
  }

  // Handle disabled state
  if (field.value.disabled) {
    fieldProps.inputProps.disabled = true
  }

  // Handle placeholder
  if (
    fieldProps.inputProps.placeholder === undefined &&
    field.value.placeholder
  ) {
    fieldProps.inputProps.placeholder = field.value.placeholder
  }

  return fieldProps
}

/**
 * Applies the Nuxt UI preset to the global configuration
 * This function modifies the global configuration
 * by merging the Nuxt UI preset with the existing global configuration
 *
 * @param components - Record of component names to Nuxt UI components
 *                     Example: { input: UInput, select: USelect, switch: USwitch, toggle: USwitch }
 *
 * @example
 * ```ts
 * import { useNuxtUIPreset } from 'enforma'
 * import { UInput, USelect, USwitch, UButton } from '#components'
 *
 * useNuxtUIPreset({
 *   input: UInput,
 *   select: USelect,
 *   switch: USwitch,
 *   toggle: USwitch,
 *   button: UButton,
 * })
 * ```
 */
export default function useNuxtUIPreset(
  components?: Record<string, Component>
): void {
  /**
   * Because we don't know which Nuxt UI components are used in an app
   * the developer must provide the list of components after importing them
   */
  if (components) {
    Object.keys(components).forEach((key) => {
      inputComponents[key] = components[key]
    })
  }

  // Get the current global configuration
  const currentConfig = getGlobalConfig()

  // Define the Nuxt UI preset configuration
  const nuxtUIPreset: DeepPartial<EnformaConfig> = {
    /**
     * Pass-Through configuration
     * Props to be passed to various components
     */
    pt: {
      wrapper: {
        class: 'nuxtui-field-wrapper',
      },
      label: {
        class: 'nuxtui-label',
      },
      input: {
        class: 'nuxtui-input',
      },
      error: {
        class: 'nuxtui-error',
      },
      help: {
        class: 'nuxtui-help',
      },
      actions: {
        class: 'flex gap-2',
      },
      submit: {
        as: inputComponents.button,
        color: 'primary',
        variant: 'solid',
        label: 'Submit',
      },
      reset: {
        as: inputComponents.button,
        color: 'neutral',
        variant: 'outline',
        label: 'Reset',
      },
      repeatable: {
        wrapper: {
          class: 'nuxtui-repeatable',
        },
        items: {
          class: 'space-y-4',
        },
        item: {
          class: 'nuxtui-repeatable-item',
        },
        actions: {
          class: 'flex gap-2',
        },
        itemActions: {
          class: 'flex gap-2',
        },
        add: {
          as: inputComponents.button,
          color: 'primary',
          variant: 'soft',
          icon: 'i-lucide-plus',
          label: 'Add',
        },
        remove: {
          as: inputComponents.button,
          color: 'error',
          variant: 'ghost',
          icon: 'i-lucide-trash-2',
          size: 'sm',
        },
        moveUp: {
          as: inputComponents.button,
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-lucide-arrow-up',
          size: 'sm',
        },
        moveDown: {
          as: inputComponents.button,
          color: 'neutral',
          variant: 'ghost',
          icon: 'i-lucide-arrow-down',
          size: 'sm',
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
      field_props: [useNuxtUIComponent, setNuxtUISpecificProps],
    },
  }

  // Merge the current config with the Nuxt UI preset
  const mergedConfig = {
    ...currentConfig,
    pt: deepMerge(currentConfig.pt, nuxtUIPreset.pt),
    components: {
      ...(currentConfig.components || {}),
      ...(nuxtUIPreset.components || {}),
    },
    transformers: {
      ...currentConfig.transformers,
      field_props: [
        ...(currentConfig.transformers?.field_props || []),
        ...(nuxtUIPreset.transformers?.field_props || []),
      ],
    },
  }

  // Set the global configuration
  setGlobalConfig(mergedConfig)
}
