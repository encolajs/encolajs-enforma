/**
 * Utility functions for working with component props
 */

import { FormKitConfig } from '../types/config'
import { evaluateObject, ExpressionContext } from './exprEvaluator'
import { deepMerge } from './configUtils'

/**
 * Evaluate dynamic props with expressions
 */
export function evaluateProps(
  props: Record<string, any>,
  context: ExpressionContext,
  config: FormKitConfig
): Record<string, any> {
  return evaluateObject(props, context, config)
}

/**
 * Merges props objects similar to Object.assign but with special handling for 'class' property
 * The 'class' values from all objects are concatenated instead of the last one overriding previous ones
 *
 * @param {...Object} propsObjects - Props objects to be merged
 * @returns {Object} - A new object with all props merged
 */
function mergeProps(...propsObjects) {
  // Filter out null and undefined props objects
  const validObjects = propsObjects.filter((props) => props != null)

  if (validObjects.length === 0) {
    return {}
  }

  // Start with an empty result object
  const result = {}

  // Collect all class values
  const classValues = []

  // Process each props object
  for (const obj of validObjects) {
    // Extract the class value if it exists
    if ('class' in obj && obj.class != null) {
      // If it's an array or object, handle it specially
      if (Array.isArray(obj.class)) {
        classValues.push(...obj.class.filter(Boolean))
      } else if (typeof obj.class === 'object' && !Array.isArray(obj.class)) {
        // For object class syntax (like in Vue), add class names that have truthy values
        for (const [key, value] of Object.entries(obj.class)) {
          if (value) {
            classValues.push(key)
          }
        }
      } else {
        // Handle string or other primitive class values
        classValues.push(obj.class)
      }
    }

    // Copy all other properties (except class) to the result
    for (const key in obj) {
      if (key !== 'class') {
        result[key] = obj[key]
      }
    }
  }

  // Apply the concatenated class values if there are any
  if (classValues.length > 0) {
    // Filter out empty strings and join with spaces
    result.class = classValues.filter(Boolean).join(' ').trim()
  }

  return result
}
/**
 * Normalize props by applying defaults and resolving expressions
 */
export function normalizeProps(
  props: Record<string, any>,
  defaults: Record<string, any> = {},
  context?: ExpressionContext,
  config?: FormKitConfig
): Record<string, any> {
  // Merge defaults with provided props
  const mergedProps = deepMerge(defaults, props)

  // Evaluate expressions if context and config provided
  if (context && config) {
    return evaluateProps(mergedProps, context, config)
  }

  return mergedProps
}

/**
 * Filter props by keys to create a new props object
 */
export function filterProps(
  props: Record<string, any>,
  keys: string[]
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => keys.includes(key))
  )
}

/**
 * Omit specified keys from props object
 */
export function omitProps(
  props: Record<string, any>,
  keys: string[]
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !keys.includes(key))
  )
}

/**
 * Get props for a specific component from props object
 *
 * For example: getComponentProps({ input_class: 'foo', label_class: 'bar' }, 'input')
 * Returns: { class: 'foo' }
 */
export function getComponentProps(
  props: Record<string, any>,
  component: string
): Record<string, any> {
  const prefix = `${component}_`
  const result: Record<string, any> = {}

  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith(prefix)) {
      const propKey = key.substring(prefix.length)
      result[propKey] = value
    }
  })

  return result
}
