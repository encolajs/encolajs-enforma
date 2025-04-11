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

  // Return source directly if target is not an object
  if (!isObject(target)) {
    return source
  }

  // Return target if source is not an object
  if (!isObject(source)) {
    return target
  }

  // Create output only once we know both are objects
  const output = { ...target }

  // Loop through source keys and directly access both objects
  const sourceKeys = Object.keys(source)
  for (let i = 0; i < sourceKeys.length; i++) {
    const key = sourceKeys[i]
    const sourceValue = source[key]

    if (Array.isArray(sourceValue)) {
      // For arrays, replace the entire array rather than merging
      output[key] = sourceValue.slice() // Faster than spread for arrays
    } else if (isObject(sourceValue)) {
      const targetValue = target[key]
      // Only recursively merge if targetValue is an object
      if (isObject(targetValue)) {
        output[key] = deepMerge(targetValue, sourceValue)
      } else {
        // If targetValue is not an object, assign sourceValue directly
        output[key] = { ...sourceValue }
      }
    } else {
      // For primitive values, assign directly
      output[key] = sourceValue
    }
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
