/**
 * Utility functions for evaluating expressions within the form library
 * Fields (i.e. EnformaField components) can receive props that are dynamic
 * This means the prop's value is actually a formula/expression
 * that has to be derived at "runtime" and depends on the state of the form
 */
import { computed, ComputedRef } from 'vue'
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
  // The form controller (not just form values)
  form: Record<string, any>
  // External context passed to the form
  context?: Record<string, any>
  // Form configuration
  config?: Record<string, any>
  // Additional properties for backward compatibility
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
 * A prop that starts with the start delimiter and ends with the end delimiter
 * will be evaluated. Eg: `${form.price > 100}`
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
 * Returns a computed ref that will automatically update when the context changes
 */
export function evaluateExpression(
  expression: string,
  context: ExpressionContext | (() => ExpressionContext),
  options: EvaluationOptions = {}
): ComputedRef<any> {
  // Input validation
  if (!expression) {
    return computed(() => undefined)
  }

  return computed(() => {
    // Get context (either from function or use directly)
    let currentContext = typeof context === 'function' ? context() : context

    if (!currentContext || typeof currentContext !== 'object') {
      currentContext = { form: {}, context: {} } as ExpressionContext
    }

    try {
      // Get or create the evaluation function (memoized)
      const evaluator = memoizedCreateEvaluator(expression)

      // Create a safe context copy to prevent modifications to the original
      const safeContext = { ...currentContext }

      // Evaluate the expression synchronously
      return evaluator(safeContext)
    } catch (error) {
      // Handle the error and provide helpful debugging information
      const expressionError =
        error instanceof ExpressionError
          ? error
          : new ExpressionError(
              `Runtime error evaluating expression: ${
                (error as Error).message
              }`,
              expression,
              error as Error,
              currentContext
            )

      // Log the error with appropriate level of detail
      logExpressionError(expressionError, expression, currentContext)

      // Return a safe fallback value
      return undefined
    }
  })
}

/**
 * Evaluates a conditional expression (used for if/show properties)
 * These are special expressions that return a boolean
 * Returns a computed ref that will automatically update when the context changes
 */
export function evaluateCondition(
  condition: string | boolean | undefined,
  context: ExpressionContext | (() => ExpressionContext),
  options: EvaluationOptions = {}
): ComputedRef<boolean> {
  // Handle special cases
  if (condition === undefined || condition === null) {
    return computed(() => true)
  }

  if (typeof condition === 'boolean') {
    return computed(() => condition)
  }

  if (typeof condition === 'number') {
    return computed(() => condition !== 0)
  }

  if (condition === '') {
    return computed(() => false)
  }

  // For string conditions, evaluate as expression
  return computed(() => {
    try {
      const currentContext = typeof context === 'function' ? context() : context
      // Since evaluateExpression now returns a computed ref, we need to get the value
      const exprRef = evaluateExpression(condition, currentContext, options)
      return Boolean(exprRef.value)
    } catch (error) {
      // Specific error for conditions to distinguish from regular expressions
      const currentContext = typeof context === 'function' ? context() : context
      const conditionError =
        error instanceof ExpressionError
          ? new ExpressionError(
              `Error evaluating condition: ${error.message}`,
              condition,
              error.originalError,
              currentContext
            )
          : new ExpressionError(
              `Error evaluating condition: ${(error as Error).message}`,
              condition,
              error as Error,
              currentContext
            )

      logExpressionError(conditionError, condition, currentContext)

      // Conditions fail closed (return false) for security
      return false
    }
  })
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
 * Returns a computed ref that will automatically update when the context changes
 */
export function evaluateTemplateString(
  template: string,
  context: ExpressionContext | (() => ExpressionContext),
  config: EnformaConfig
): ComputedRef<any> {
  // Input validation
  if (!template || typeof template !== 'string') {
    return computed(() => String(template || ''))
  }

  if (!config || typeof config !== 'object') {
    throw new ExpressionError(
      'Invalid configuration provided to evaluateTemplateString',
      String(template),
      undefined,
      {
        template,
        context: typeof context === 'function' ? context() : context,
        config,
      }
    )
  }

  return computed(() => {
    try {
      const currentContext = typeof context === 'function' ? context() : context
      const { start, end } =
        config.expressions?.delimiters ?? DEFAULT_OPTIONS.delimiters

      // Check if the entire string is an expression
      if (template.startsWith(start) && template.endsWith(end)) {
        const expressionStr = template.substring(
          start.length,
          template.length - end.length
        )

        try {
          // Since evaluateExpression returns computed ref now, we need to get its value
          const exprRef = evaluateExpression(
            expressionStr,
            currentContext,
            config.expressions
          )
          const result = exprRef.value

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
            currentContext
          )
          logExpressionError(templateError, expressionStr, currentContext)

          // Return original template on error as a fallback
          return template
        }
      }

      // If not a complete expression, return as is
      return template
    } catch (error) {
      // Handle unexpected errors
      const currentContext = typeof context === 'function' ? context() : context
      logExpressionError(
        new ExpressionError(
          `Unexpected error in template evaluation: ${
            (error as Error).message
          }`,
          template,
          error as Error
        ),
        template
      )
      return template
    }
  })
}

/**
 * Evaluates all expressions in an object and replaces them with results
 * Returns an object with computed refs for properties containing expressions
 */
export function evaluateObject<T extends Record<string, any>>(
  obj: T,
  context: ExpressionContext | (() => ExpressionContext),
  config: EnformaConfig
): Record<string, ComputedRef<any> | any> {
  // Input validation
  if (obj == null || typeof obj !== 'object') {
    return obj
  }

  if (!config || typeof config !== 'object') {
    throw new ExpressionError(
      'Invalid configuration provided to evaluateObject',
      'Object evaluation',
      undefined,
      { context: typeof context === 'function' ? context() : context, config }
    )
  }

  try {
    // Create a shallow copy to avoid mutating the original
    const result: Record<string, ComputedRef<any> | any> = {}

    // Track any errors that occur during evaluation
    const errors: ExpressionError[] = []

    for (const key in obj) {
      try {
        const value = obj[key]

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
          // For arrays, we need to compute each element that contains expressions
          result[key] = computed(() => {
            const currentContext =
              typeof context === 'function' ? context() : context
            return value.map((item: any) => {
              try {
                if (
                  typeof item === 'string' &&
                  containsExpression(item, config)
                ) {
                  // Use the value of the computed ref
                  const computedItem = evaluateTemplateString(
                    item,
                    currentContext,
                    config
                  )
                  return computedItem.value
                } else if (item && typeof item === 'object') {
                  // For objects in arrays, recursively evaluate
                  const evaluatedObj = evaluateObject(
                    item,
                    currentContext,
                    config
                  )

                  // Convert any computed refs to their values
                  const resolvedObj: Record<string, any> = {}
                  for (const objKey in evaluatedObj) {
                    const objValue = evaluatedObj[objKey]
                    resolvedObj[objKey] =
                      objValue && objValue.value !== undefined
                        ? objValue.value
                        : objValue
                  }

                  return resolvedObj
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
          })
        } else {
          // For non-expressions, just pass the value through
          result[key] = value
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
        // For errors, keep the original value
        result[key] = obj[key]
      }
    }

    // Log any errors that occurred during evaluation
    if (errors.length > 0 && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Enforma] ${errors.length} expression errors occurred during object evaluation:`,
        errors.map((e) => e.message)
      )
    }

    return result
  } catch (error) {
    // Handle unexpected errors during object evaluation
    const objError = new ExpressionError(
      `Error evaluating object expressions: ${(error as Error).message}`,
      'Object evaluation',
      error as Error,
      { context: typeof context === 'function' ? context() : context }
    )
    logExpressionError(objError, 'Object evaluation')

    // Return original object as fallback
    return obj
  }
}
