/**
 * Configuration utility functions for merging and managing configuration objects
 */

import { ConfigObject, DeepPartial } from '@/utils/useConfig'

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
      if (Array.isArray(source[key])) {
        // For arrays, replace the entire array rather than merging
        output[key] = [...source[key]]
      } else if (isObject(source[key])) {
        output[key] = Object.assign(output[key] || {}, { ...source[key] })
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}

/**
 * Checks if a value is an object
 */
function isObject(item: any): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Safely retrieves a value by path
 */
export function _get<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || !path) {
    return defaultValue
  }

  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue
    }
    current = current[key]
  }

  return current !== undefined && current !== null ? current : defaultValue
}
