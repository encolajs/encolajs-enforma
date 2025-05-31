import { Component } from 'vue'
import RepeatableAddButton from './primevue/RepeatableAddButton.vue'
import {
  InputText,
  Select,
  AutoComplete,
  DatePicker,
  ToggleSwitch,
  Button,
} from 'primevue'
import { FieldController, FieldControllerExport, FormController } from '@/types'
import {
  DeepPartial,
  EnformaConfig,
  setGlobalConfig,
  getGlobalConfig,
} from '@/utils/useConfig'
import { deepMerge } from '@/utils/configUtils'

const inputComponents: Record<string, Component> = {
  input: InputText,
  select: Select,
  autocomplete: AutoComplete,
  datepicker: DatePicker,
  toggle: ToggleSwitch,
  switch: ToggleSwitch,
}

/**
 * Function that ensures an input field is using a PrimeVue component
 * It uses the `fieldMap` to convert something like `select`
 * into the Select component from PrimeVue
 */
function usePrimeVueComponent(
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
      inputComponents[fieldProps.inputComponent] || InputText
  } else if (!fieldProps.inputComponent) {
    // default to InputText
    fieldProps.inputComponent = InputText
  }
  return fieldProps
}

/**
 * Most PrimeVue components use labelId and modelValue props
 * This function adds them to the input field component
 */
function setPrimeVueSpecificProps(
  fieldProps: any,
  field: FieldControllerExport,
  formState: FormController,
  config: any
) {
  fieldProps.inputProps.labelId = `label-${field.value.id}`
  fieldProps.inputProps.modelValue = field.value.value
  return fieldProps
}

/**
 * Applies the PrimeVue preset to the global configuration
 * This function modifies the global configuration
 * by merging the PrimeVue preset with the existing global configuration
 */
export default function usePrimeVuePreset(
  components?: Record<string, Component>
): void {
  /**
   * Because we don't know which PrimeVue components are used in an app
   * the developer must provide the list of components after importing them
   */
  if (components) {
    Object.keys(components).map(
      (key) => (inputComponents[key] = components[key])
    )
  }

  const currentConfig = getGlobalConfig()

  const primeVuePreset: DeepPartial<EnformaConfig> = {
    components: {
      // we're using the `pass-through` for most of the customization
      // this component is needed because of PrimeVue uses `label` for the prop
      repeatableAddButton: RepeatableAddButton,
    },
    /**
     * Pass-Through configuration
     * Props to be passed added to various components
     */
    pt: {
      actions: {
        class: 'flex gap-2',
      },
      error: {
        class: 'text-red-500',
      },
      submit: {
        as: Button,
      },
      reset: {
        as: Button,
        severity: 'secondary',
      },
      repeatable: {
        wrapper: {},
        items: {},
        item: {},
        actions: {},
        itemActions: {},
        add: {
          as: Button,
          severity: 'secondary',
          icon: 'pi pi-plus',
          content: 'Add', // this is passed as `label` inside the component
          type: 'button',
        },
        remove: {
          as: Button,
          severity: 'danger',
          icon: 'pi pi-trash',
          content: null,
          type: 'button',
        },
        moveUp: {
          as: Button,
          severity: 'secondary',
          icon: 'pi pi-arrow-up',
          content: null,
          type: 'button',
        },
        moveDown: {
          as: Button,
          severity: 'secondary',
          icon: 'pi pi-arrow-down',
          content: null,
          type: 'button',
        },
      },
    },
    /**
     * Functions to change the props of Enforma components before rendering
     */
    transformers: {
      field_props: [usePrimeVueComponent, setPrimeVueSpecificProps],
    },
  }

  // Merge the current config with the PrimeVue preset
  const mergedConfig = {
    ...currentConfig,
    // we are using deep merge to preserve values from the default preset
    // this would not be necessary if the primeVuePreset.pt would be complete
    pt: deepMerge(currentConfig.pt, primeVuePreset.pt),
    components: {
      ...currentConfig.components,
      ...primeVuePreset.components,
    },
    transformers: {
      ...currentConfig.transformers,
      // this will remove existing field_props transformers
      // which is not something that you want all the time
      // if you have your own transformers configured
      // before the preset they will be removed
      field_props: [
        ...(currentConfig.transformers?.field_props || []),
        ...(primeVuePreset.transformers?.field_props || []),
      ],
    },
  }

  // Set the global configuration
  setGlobalConfig(mergedConfig)
}
