import { Component } from 'vue'
import Field from '@/presets/rekaui/Field.vue'
import { FieldControllerExport, FormController } from '@/types'
import {
  DeepPartial,
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '@/utils/useConfig'
import { deepMerge } from '@/utils/configUtils'

// Define default component mapping to Reka UI components
// These will be provided by the developer when calling useRekauiPreset
const inputComponents: Record<string, any> = {}

/**
 * Function that ensures an input field uses a Reka UI component
 * It maps field types like 'select' to Reka UI components
 */
function useRekauiComponent(
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
      inputComponents[fieldProps.inputComponent] ||
      inputComponents.input ||
      'input'
  } else if (!fieldProps.inputComponent) {
    // default to input element
    fieldProps.inputComponent = inputComponents.input || 'input'
  }
  return fieldProps
}

/**
 * Most Reka UI components use v-model with modelValue prop
 * This function adds proper Reka UI-specific props to input components
 */
function setRekauiSpecificProps(
  fieldProps: any,
  field: FieldControllerExport,
  formController: FormController,
  config: any
) {
  // Setup Reka UI-specific props
  fieldProps.inputProps = fieldProps.inputProps || {}

  // Ensure we have an id for the field
  fieldProps.inputProps.id = field.value.id

  // Set modelValue for v-model binding
  fieldProps.inputProps.modelValue = field.value.value
  delete fieldProps.inputProps.value

  // Handle error states - set invalid/error data attribute
  if (field.value.errors && field.value.errors.length > 0) {
    fieldProps.inputProps['data-invalid'] = true
  }

  // Handle disabled state
  if (field.value.disabled) {
    fieldProps.inputProps.disabled = true
  }

  // For native inputs, add name attribute
  if (!fieldProps.inputComponent || fieldProps.inputComponent === 'input') {
    fieldProps.inputProps.name = field.value.name
  }

  return fieldProps
}

/**
 * Applies the Reka UI preset to the global configuration
 * This function modifies the global configuration
 * by merging the Reka UI preset with the existing global configuration
 *
 * @param components - Record of component names to Reka UI components
 *                     Example: { input: YourInputComponent, select: YourSelectComponent, switch: YourSwitchComponent }
 *
 * @example
 * ```ts
 * import { useRekauiPreset } from '@encolajs/enforma/presets/rekaui'
 * import MyInput from './components/MyInput.vue'
 * import MySelect from './components/MySelect.vue'
 * import MySwitch from './components/MySwitch.vue'
 *
 * useRekauiPreset({
 *   input: MyInput,
 *   select: MySelect,
 *   switch: MySwitch,
 *   toggle: MySwitch,
 * })
 * ```
 */
export default function useRekauiPreset(
  components?: Record<string, Component>
): void {
  /**
   * Because we don't know which Reka UI components are used in an app
   * the developer must provide the list of components after importing them
   */
  if (components) {
    Object.keys(components).forEach((key) => {
      inputComponents[key] = components[key]
    })
  }

  // Get the current global configuration
  const currentConfig = getGlobalConfig()

  // Define the Reka UI preset configuration
  const rekauiPreset: DeepPartial<EnformaConfig> = {
    /**
     * Pass-Through configuration
     * Props to be passed to various components
     */
    pt: {
      wrapper: {
        class: 'rekaui-field-wrapper',
      },
      label: {
        class: 'rekaui-label',
      },
      input: {
        class: 'rekaui-input',
      },
      error: {
        class: 'rekaui-error',
      },
      help: {
        class: 'rekaui-help',
      },
      actions: {
        class: 'rekaui-actions flex gap-2',
      },
      submit: {
        as: inputComponents.button,
        content: 'Submit',
        variant: 'primary',
      },
      reset: {
        as: inputComponents.button,
        content: 'Reset',
        variant: 'outline',
      },
      repeatable: {
        wrapper: {
          class: 'rekaui-repeatable',
        },
        items: {
          class: 'rekaui-repeatable-items',
        },
        item: {
          class: 'rekaui-repeatable-item',
        },
        actions: {
          class: 'rekaui-repeatable-actions flex gap-2',
        },
        itemActions: {
          class: 'rekaui-repeatable-item-actions flex gap-2',
        },
        add: {
          as: inputComponents.button,
          content: 'Add',
          variant: 'secondary',
          icon: '+',
        },
        remove: {
          as: inputComponents.button,
          content: 'Remove',
          variant: 'ghost',
          icon: '×',
        },
        moveUp: {
          as: inputComponents.button,
          content: '↑',
          variant: 'ghost',
        },
        moveDown: {
          as: inputComponents.button,
          content: '↓',
          variant: 'ghost',
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
      field_props: [useRekauiComponent, setRekauiSpecificProps],
    },
  }

  // Merge the current config with the Reka UI preset
  const mergedConfig = {
    ...currentConfig,
    pt: deepMerge(currentConfig.pt, rekauiPreset.pt),
    components: {
      ...(currentConfig.components || {}),
      ...(rekauiPreset.components || {}),
    },
    transformers: {
      ...currentConfig.transformers,
      field_props: [
        ...(currentConfig.transformers?.field_props || []),
        ...(rekauiPreset.transformers?.field_props || []),
      ],
    },
  }

  // Set the global configuration
  setGlobalConfig(mergedConfig)
}
