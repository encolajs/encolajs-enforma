/**
 * Configuration utility functions for merging and managing configuration objects
 */

import { DeepPartial, ConfigObject } from '../types/config'

/**
 * Deep merges multiple configuration objects, with later objects taking precedence
 */
export function mergeConfigs<T extends ConfigObject>(
  ...configs: DeepPartial<T>[]
): T {
  return configs.reduce((result, config) => {
    return deepMerge(result, config) as T
  }, {} as T)
}

/**
 * Deep merges two objects, handling arrays and nested objects
 */
export function deepMerge(target: any, source: any): any {
  if (source === undefined || source === null) {
    return target
  }

  const output = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else if (Array.isArray(source[key])) {
        // For arrays, replace the entire array rather than merging
        output[key] = [...source[key]]
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}

/**
 * Resolves a configuration path from a configuration object
 */
export function getConfigByPath(config: ConfigObject, path: string): any {
  if (!path) return config

  const parts = path.split('.')
  let current = config

  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined
    }

    current = current[part]
  }

  return current
}

/**
 * Applies a default configuration to a specific field type
 */
export function resolveFieldTypeConfig(
  config: ConfigObject,
  fieldType: string
): ConfigObject {
  const baseConfig = config.fieldTypes?.default || {}
  const typeConfig = config.fieldTypes?.[fieldType] || {}

  return deepMerge(baseConfig, typeConfig)
}

/**
 * Applies configuration overrides for a specific component
 */
export function applyComponentConfig(
  baseConfig: ConfigObject,
  componentName: string,
  overrides?: DeepPartial<ConfigObject>
): ConfigObject {
  const componentConfig = baseConfig.components?.[componentName] || {}

  if (!overrides) {
    return componentConfig
  }

  return deepMerge(componentConfig, overrides)
}

/**
 * Checks if a value is an object
 */
function isObject(item: any): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}
