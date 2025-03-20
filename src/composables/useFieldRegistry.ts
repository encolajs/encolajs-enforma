/**
 * Composable for managing field component registration and resolution
 */

import { inject, provide, reactive, Component } from 'vue'
import { FIELD_REGISTRY, FORM_KIT_CONFIG } from '../constants/symbols'
import { DEFAULT_CONFIG } from '../constants/defaults'
import { FormKitConfig } from '../types/config'
import { deepMerge } from '../utils/configUtils'

/**
 * Registry for field components
 */
export interface FieldRegistry {
  components: Record<string, Component>
  register: (name: string, component: Component) => void
  registerMany: (components: Record<string, Component>) => void
  resolve: (name: string) => Component | undefined
  resolveFieldType: (
    fieldType: string,
    defaultComponent?: Component
  ) => Component | undefined
}

// Global registry that persists across instances
const globalRegistry: Record<string, Component> = {}

/**
 * Register a component in the global registry
 */
export function registerGlobalComponent(
  name: string,
  component: Component
): void {
  globalRegistry[name] = component
}

/**
 * Register multiple components in the global registry
 */
export function registerGlobalComponents(
  components: Record<string, Component>
): void {
  Object.entries(components).forEach(([name, component]) => {
    globalRegistry[name] = component
  })
}

/**
 * Reset the global registry
 */
export function resetGlobalRegistry(): void {
  Object.keys(globalRegistry).forEach((key) => {
    delete globalRegistry[key]
  })
}

/**
 * Composable for managing field component registration and resolution
 */
export function useFieldRegistry(): FieldRegistry {
  // Try to inject existing registry from ancestor components
  const existingRegistry = inject<FieldRegistry | undefined>(
    FIELD_REGISTRY,
    undefined
  )

  // If registry already exists in context, return it
  if (existingRegistry) {
    return existingRegistry
  }

  // Create new registry
  const localRegistry: Record<string, Component> = reactive({})

  // Inject config for field type resolution
  const config = inject<FormKitConfig>(FORM_KIT_CONFIG, DEFAULT_CONFIG)

  /**
   * Register a component in the local registry
   */
  function register(name: string, component: Component): void {
    localRegistry[name] = component
  }

  /**
   * Register multiple components at once
   */
  function registerMany(components: Record<string, Component>): void {
    Object.entries(components).forEach(([name, component]) => {
      localRegistry[name] = component
    })
  }

  /**
   * Resolve a component by name, checking local then global registry
   */
  function resolve(name: string): Component | undefined {
    return localRegistry[name] || globalRegistry[name]
  }

  /**
   * Resolve a field type to a component based on configuration
   */
  function resolveFieldType(
    fieldType: string,
    defaultComponent?: Component
  ): Component | undefined {
    // Get component name from field type config
    const fieldTypeConfig =
      config.fieldTypes[fieldType] || config.fieldTypes.default
    const componentName = fieldTypeConfig?.component

    if (!componentName) {
      return defaultComponent
    }

    // Resolve the component
    const component = resolve(componentName)

    // Return the component or default
    return component || defaultComponent
  }

  // Create registry object
  const registry: FieldRegistry = {
    // Merge local and global components for computed property
    get components() {
      return deepMerge({}, { ...globalRegistry, ...localRegistry })
    },
    register,
    registerMany,
    resolve,
    resolveFieldType,
  }

  // Provide the registry to descendants
  provide(FIELD_REGISTRY, registry)

  return registry
}
