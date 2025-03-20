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
 * Extract groups of props based on prefixes
 *
 * For example: extractPropGroups({ input_class: 'foo', label_class: 'bar' }, ['input', 'label'])
 * Returns: { input: { class: 'foo' }, label: { class: 'bar' } }
 */
export function extractPropGroups(
  props: Record<string, any>,
  prefixes: string[]
): Record<string, Record<string, any>> {
  const result: Record<string, Record<string, any>> = {}

  // Initialize result objects for each prefix
  prefixes.forEach((prefix) => {
    result[prefix] = {}
  })

  // Extract prefixed properties
  Object.entries(props).forEach(([key, value]) => {
    for (const prefix of prefixes) {
      const prefixWithUnderscore = `${prefix}_`

      if (key.startsWith(prefixWithUnderscore)) {
        const propKey = key.substring(prefixWithUnderscore.length)
        result[prefix][propKey] = value
      }
    }
  })

  return result
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

/**
 * Prepare props for component rendering, merging with defaults
 * and resolving expressions
 */
export function prepareComponentProps(
  props: Record<string, any>,
  componentName: string,
  config: FormKitConfig,
  context?: ExpressionContext
): Record<string, any> {
  // Get component-specific props
  const componentProps = getComponentProps(props, componentName)

  // Get default props for component from config
  const defaultProps = config.fieldProps?.[componentName] || {}

  // Merge defaults with component props
  const mergedProps = deepMerge(defaultProps, componentProps)

  // Evaluate expressions if context is provided
  if (context) {
    return evaluateProps(mergedProps, context, config)
  }

  return mergedProps
}

/**
 * Check if an object contains dynamic expressions
 */
export function hasDynamicProps(
  props: Record<string, any>,
  config: FormKitConfig
): boolean {
  const { start, end } = config.expressions.delimiters

  // Check for expressions in string values
  const hasExpression = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return obj.includes(start) && obj.includes(end)
    }

    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.values(obj).some((value) => hasExpression(value))
    }

    if (Array.isArray(obj)) {
      return obj.some((item) => hasExpression(item))
    }

    return false
  }

  return hasExpression(props)
}
