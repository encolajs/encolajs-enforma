/**
 * Utility functions for evaluating expressions within the form kit
 */

import { EnformaConfig } from '@/utils/useConfig'

/**
 * Custom error class for expression evaluation errors
 */
export class ExpressionError extends Error {
  expression: string
  context?: Record<string, any>
  originalError?: Error

  constructor(
    message: string,
    expression: string,
    originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = 'ExpressionError'
    this.expression = expression
    this.originalError = originalError
    this.context = context

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExpressionError)
    }
  }
}

/**
 * Utility function to safely log evaluation errors
 */
function logExpressionError(
  error: Error | ExpressionError,
  expression: string,
  context?: any
): void {
  if (process.env.NODE_ENV !== 'production') {
    if (error instanceof ExpressionError) {
      console.error(`[Enforma Expression Error] ${error.message}`, {
        expression: error.expression,
        originalError: error.originalError,
        context: error.context,
      })
    } else {
      console.error(
        `[Enforma Expression Error] Error evaluating expression: ${expression}`,
        {
          error,
          expression,
          context,
        }
      )
    }
  } else {
    // In production, use simpler logging
    console.error(`[Enforma] Expression evaluation error: ${error.message}`)
  }
}

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
  // Basic validation of the expression
  if (!expression || typeof expression !== 'string') {
    throw new ExpressionError('Invalid expression provided', String(expression))
  }

  // Check for potentially unsafe expressions (basic security check)
  if (
    /\b(window|document|globalThis|eval|Function|setTimeout|setInterval)\b/.test(
      expression
    )
  ) {
    throw new ExpressionError(
      'Expression contains potentially unsafe references',
      expression
    )
  }

  try {
    const funcBody = `
      with (context) {
        try {
          return ${expression};
        } catch (error) {
          // Capture and rethrow with more context
          throw new Error('Runtime error evaluating expression: ' + error.message);
        }
      }
    `
    return new Function('context', funcBody) as (ctx: any) => any
  } catch (error) {
    // Function creation error (typically syntax error)
    throw new ExpressionError(
      `Failed to create evaluator function: ${(error as Error).message}`,
      expression,
      error as Error
    )
  }
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
  // Input validation
  if (!expression) {
    return undefined
  }

  if (!context || typeof context !== 'object') {
    context = { form: {}, context: {} } as ExpressionContext
  }

  // Merge default options
  const config = { ...DEFAULT_OPTIONS, ...options }

  try {
    // Get or create the evaluation function (memoized)
    const evaluator = memoizedCreateEvaluator(expression)

    // Create a safe context copy to prevent modifications to the original
    const safeContext = { ...context }

    // Evaluate the expression synchronously
    return evaluator(safeContext)
  } catch (error) {
    // Handle the error and provide helpful debugging information
    const expressionError =
      error instanceof ExpressionError
        ? error
        : new ExpressionError(
            `Runtime error evaluating expression: ${(error as Error).message}`,
            expression,
            error as Error,
            context
          )

    // Log the error with appropriate level of detail
    logExpressionError(expressionError, expression, context)

    // Return a safe fallback value
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
  // Handle special cases
  if (condition === undefined || condition === null) {
    return true
  }

  if (typeof condition === 'boolean') {
    return condition
  }

  if (typeof condition === 'number') {
    return condition !== 0
  }

  if (condition === '') {
    return false
  }

  // For string conditions, evaluate as expression
  try {
    const result = evaluateExpression(condition, context, options)
    return Boolean(result)
  } catch (error) {
    // Specific error for conditions to distinguish from regular expressions
    const conditionError =
      error instanceof ExpressionError
        ? new ExpressionError(
            `Error evaluating condition: ${error.message}`,
            condition,
            error.originalError,
            context
          )
        : new ExpressionError(
            `Error evaluating condition: ${(error as Error).message}`,
            condition,
            error as Error,
            context
          )

    logExpressionError(conditionError, condition, context)

    // Conditions fail closed (return false) for security
    return false
  }
}

/**
 * Checks if a string contains expression delimiters
 */
export function containsExpression(
  value: string,
  config: EnformaConfig
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
  config: EnformaConfig
): string {
  // Input validation
  if (!template || typeof template !== 'string') {
    return String(template || '')
  }

  if (!config || typeof config !== 'object') {
    throw new ExpressionError(
      'Invalid configuration provided to evaluateTemplateString',
      String(template),
      undefined,
      { template, context, config }
    )
  }

  try {
    const { start, end } =
      config.expressions?.delimiters ?? DEFAULT_OPTIONS.delimiters

    // Check if the entire string is an expression
    if (template.startsWith(start) && template.endsWith(end)) {
      const expressionStr = template.substring(
        start.length,
        template.length - end.length
      )

      try {
        const result = evaluateExpression(
          expressionStr,
          context,
          config.expressions
        )

        // Handle different result types appropriately
        if (result === undefined || result === null) {
          return ''
        }

        return result
      } catch (error) {
        const templateError = new ExpressionError(
          `Error evaluating template expression: ${(error as Error).message}`,
          expressionStr,
          error as Error,
          context
        )
        logExpressionError(templateError, expressionStr, context)

        // Return original template on error as a fallback
        return template
      }
    }

    // If not a complete expression, return as is
    return template
  } catch (error) {
    // Handle unexpected errors
    logExpressionError(
      new ExpressionError(
        `Unexpected error in template evaluation: ${(error as Error).message}`,
        template,
        error as Error
      ),
      template
    )
    return template
  }
}

/**
 * Evaluates all expressions in an object and replaces them with results
 */
export function evaluateObject<T extends Record<string, any>>(
  obj: T,
  context: ExpressionContext,
  config: EnformaConfig
): T {
  // Input validation
  if (obj == null || typeof obj !== 'object') {
    return obj
  }

  if (!config || typeof config !== 'object') {
    throw new ExpressionError(
      'Invalid configuration provided to evaluateObject',
      'Object evaluation',
      undefined,
      { context, config }
    )
  }

  try {
    // Create a shallow copy to avoid mutating the original
    const result: Record<string, any> = { ...obj }

    // Track any errors that occur during evaluation
    const errors: ExpressionError[] = []

    for (const key in result) {
      try {
        const value = result[key]

        // Handle string expressions
        if (typeof value === 'string' && containsExpression(value, config)) {
          result[key] = evaluateTemplateString(value, context, config)
        }
        // Handle nested objects (non-arrays)
        else if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = evaluateObject(value, context, config)
        }
        // Handle arrays
        else if (Array.isArray(value)) {
          result[key] = value.map((item) => {
            try {
              if (
                typeof item === 'string' &&
                containsExpression(item, config)
              ) {
                return evaluateTemplateString(item, context, config)
              } else if (item && typeof item === 'object') {
                return evaluateObject(item, context, config)
              }
              return item
            } catch (itemError) {
              // Collect error but don't interrupt processing
              errors.push(
                new ExpressionError(
                  `Error evaluating array item: ${
                    (itemError as Error).message
                  }`,
                  String(item),
                  itemError as Error
                )
              )
              return item // Return original on error
            }
          })
        }
      } catch (keyError) {
        // Collect errors by key but continue processing other keys
        errors.push(
          new ExpressionError(
            `Error evaluating key '${key}': ${(keyError as Error).message}`,
            `obj.${key}`,
            keyError as Error
          )
        )
      }
    }

    // Log any errors that occurred during evaluation
    if (errors.length > 0 && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Enforma] ${errors.length} expression errors occurred during object evaluation:`,
        errors.map((e) => e.message)
      )
    }

    return result as T
  } catch (error) {
    // Handle unexpected errors during object evaluation
    const objError = new ExpressionError(
      `Error evaluating object expressions: ${(error as Error).message}`,
      'Object evaluation',
      error as Error,
      { context }
    )
    logExpressionError(objError, 'Object evaluation')

    // Return original object as fallback
    return obj
  }
}
