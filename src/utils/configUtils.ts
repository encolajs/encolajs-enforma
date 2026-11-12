import { ConfigObject, DeepPartial } from '@/utils/useConfig'
import { isPlainObject, pathUtils } from './helpers'

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
 * Whether a value is a component rather than configuration: an SFC or a `defineComponent()`
 * object (setup or render), an async component, or a raw (`markRaw`) object. Components are
 * taken as they are, never merged into another or copied.
 */
function isComponent(value: any): boolean {
  return (
    typeof value.setup === 'function' ||
    typeof value.render === 'function' ||
    typeof value.template === 'string' ||
    '__asyncLoader' in value ||
    '__name' in value ||
    value.__v_skip === true
  )
}

/**
 * Whether a value is configuration that can be merged: an object (not an array) that is not a
 * component.
 */
function isMergeable(value: any): boolean {
  return isPlainObject(value) && !isComponent(value)
}

/**
 * Deep merges two objects, handling arrays and nested objects. Components (see `isComponent()`)
 * replace what they're merged into, and are kept as they are.
 */
export function deepMerge(target: any, source: any): any {
  if (source == null) {
    return target
  }

  // Return source directly if target is not an object
  if (!isMergeable(target)) {
    return source
  }

  // Return target if source is not an object
  if (!isMergeable(source)) {
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
    } else if (isMergeable(sourceValue)) {
      const targetValue = target[key]
      // Only recursively merge if targetValue is an object
      if (isMergeable(targetValue)) {
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
