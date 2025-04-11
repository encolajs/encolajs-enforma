/**
 * Utility functions for evaluating expressions within the form kit
 */

import { FormKitConfig } from '@/utils/useConfig'

/**
 * Simple memoization helper for caching function results
 */
function memoize<T extends (...args: any[]) => any>(fn: T, maxSize = 100): T {
  const cache = new Map<string, any>()
  
  return ((...args: any[]) => {
    // Create a cache key from the arguments
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    
    // Add result to cache, maintain max size
    cache.set(key, result)
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    return result
  }) as T
}

/**
 * Context for expression evaluation
 */
export interface ExpressionContext {
  form: Record<string, any>
  context?: Record<string, any>
  errors?: Record<string, string[]>
  [key: string]: any
}

/**
 * Options for expression evaluation
 */
export interface EvaluationOptions {
  delimiters?: {
    start: string
    end: string
  }
}

/**
 * Default options for expression evaluation
 */
const DEFAULT_OPTIONS: EvaluationOptions = {
  delimiters: {
    start: '${',
    end: '}',
  },
}

/**
 * Creates and returns an evaluator function for the given expression
 * This is the part we want to memoize as function creation is expensive
 */
function createEvaluator(expression: string): (ctx: any) => any {
  const funcBody = `
    with (context) {
      try {
        return ${expression};
      } catch (error) {
        return undefined;
      }
    }
  `
  return new Function('context', funcBody) as (ctx: any) => any
}

// Memoized version of createEvaluator to avoid recreating functions
const memoizedCreateEvaluator = memoize(createEvaluator)

/**
 * Safely evaluates an expression string against a context
 */
export function evaluateExpression(
  expression: string,
  context: ExpressionContext,
  options: EvaluationOptions = {}
): any {
  // Merge default options
  const config = { ...DEFAULT_OPTIONS, ...options }

  try {
    // Get or create the evaluation function (memoized)
    const evaluator = memoizedCreateEvaluator(expression)

    // Evaluate the expression synchronously
    return evaluator(context)
  } catch (error) {
    console.error(`Error evaluating expression: ${expression}`, error)
    return undefined
  }
}

/**
 * Evaluates a conditional expression (used for if/show properties)
 */
export function evaluateCondition(
  condition: string | boolean | undefined,
  context: ExpressionContext,
  options: EvaluationOptions = {}
): boolean {
  if (condition === undefined) {
    return true
  }

  if (typeof condition === 'boolean') {
    return condition
  }

  try {
    const result = evaluateExpression(condition, context, options)
    return Boolean(result)
  } catch (error) {
    console.error(`Error evaluating condition: ${condition}`, error)
    return false
  }
}

/**
 * Checks if a string contains expression delimiters
 */
export function containsExpression(
  value: string,
  config: FormKitConfig
): boolean {
  const { start, end } =
    config.expressions?.delimiters ?? DEFAULT_OPTIONS.delimiters
  return value.includes(start) && value.includes(end)
}

/**
 * Evaluates all expressions within a string and replaces them with results
 */
export function evaluateTemplateString(
  template: string,
  context: ExpressionContext,
  config: FormKitConfig
): string {
  const { start, end } =
    config.expressions?.delimiters ?? DEFAULT_OPTIONS.delimiters

  if (template.startsWith(start) && template.endsWith(end)) {
    const expressionStr = template.substring(
      start.length,
      template.length - end.length
    )
    try {
      return evaluateExpression(expressionStr, context, config.expressions)
    } catch (error) {
      console.error(`Error evaluating expression: ${expressionStr}`, error)
    }
  }

  return template
}

/**
 * Evaluates all expressions in an object and replaces them with results
 */
export function evaluateObject<T extends Record<string, any>>(
  obj: T,
  context: ExpressionContext,
  config: FormKitConfig
): T {
  if (obj == null || typeof obj !== 'object') {
    return obj
  }

  const result: Record<string, any> = { ...obj }

  for (const key in result) {
    const value = result[key]

    if (typeof value === 'string' && containsExpression(value, config)) {
      result[key] = evaluateTemplateString(value, context, config)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = evaluateObject(value, context, config)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string' && containsExpression(item, config)) {
          return evaluateTemplateString(item, context, config)
        } else if (item && typeof item === 'object') {
          return evaluateObject(item, context, config)
        }
        return item
      })
    }
  }

  return result as T
}
