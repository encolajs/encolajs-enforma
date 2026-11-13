/**
 * Utility functions for evaluating expressions within the form library
 * Fields (i.e. EnformaField components) can receive props that are dynamic
 * This means the prop's value is actually a formula/expression
 * that has to be derived at "runtime" and depends on the state of the form
 */
import { ComputedRef } from 'vue'
import {
  ConstantFunctionProvider,
  ConstantNode,
  ExpressionFunction,
  ExpressionLanguage,
  GetAttrNode,
  Node,
  ParsedExpression,
} from '@andreasnicolaou/typescript-expression-language'
import { EnformaConfig, ExpressionFunctions } from '@/utils/useConfig'

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
      console.error(`[Enforma] Expression error: ${error.message}`, {
        expression: error.expression,
        originalError: error.originalError,
        context: error.context,
      })
    } else {
      console.error(`[Enforma] Expression evaluation error: ${expression}`, {
        error,
        expression,
        context,
      })
    }
  } else {
    // In production, use simpler logging
    console.error(`[Enforma] Expression evaluation error: ${error.message}`)
  }
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
  functions?: ExpressionFunctions
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

/** Names the language reads as an operator or a constant, so a function can't be called by them */
const RESERVED_NAMES = new Set([
  'and',
  'or',
  'not',
  'in',
  'xor',
  'contains',
  'matches',
  'true',
  'false',
  'null',
])
const FUNCTION_NAME = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/** Expressions are interpreted, never compiled into code */
function noCompiling(): never {
  throw new Error('Enforma does not compile expressions')
}

/**
 * An expression language: Symfony's ExpressionLanguage, as
 * @andreasnicolaou/typescript-expression-language implements it. It parses an expression and
 * interprets it, so no string ever becomes code (no `new Function`, no `eval`): expressions run
 * under a Content Security Policy without `'unsafe-eval'`, and can only reach the names they
 * are given (`form`, `context`, `config`). `constant()` and `enum()`, which would read globals,
 * allow nothing. Parsed expressions are cached.
 *
 * `functions` (a config's `expressions.functions`) can be called by their names, after the
 * built-in ones, so a function named like a built-in one replaces it. They get the arguments
 * only, and are called without `this`.
 */
function createLanguage(
  functions: ExpressionFunctions = {}
): ExpressionLanguage {
  const language = new ExpressionLanguage(null, [
    new ConstantFunctionProvider([]),
  ])
  for (const [name, fn] of Object.entries(functions)) {
    if (
      typeof fn !== 'function' ||
      !FUNCTION_NAME.test(name) ||
      RESERVED_NAMES.has(name.toLowerCase())
    ) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[Enforma] The expression function "${name}" is left out: it must be a function, named with letters, digits and _, and not after an operator (and, or, not, in, xor, contains, matches) or true, false, null`
        )
      }
      continue
    }
    language.register(
      name,
      new ExpressionFunction(
        name,
        noCompiling,
        (_values: unknown, ...args: any[]) => fn(...args)
      )
    )
  }
  return language
}

/** The language for expressions with no functions of a project's own */
const defaultLanguage = createLanguage()

/**
 * The languages with a project's functions, by the functions they have. There are few (one per
 * set of functions), so past MAX_LANGUAGES the least recently used one is dropped: functions
 * written inline in a form's `:config` are new on each mount.
 */
const languages = new Map<string, ExpressionLanguage>()
const MAX_LANGUAGES = 20
const functionIds = new WeakMap<Function, number>()
let lastFunctionId = 0

function functionId(fn: unknown): number {
  if (typeof fn !== 'function') {
    return 0
  }
  let id = functionIds.get(fn)
  if (id === undefined) {
    id = ++lastFunctionId
    functionIds.set(fn, id)
  }
  return id
}

/**
 * The language with these functions. A language can't take a function once it has parsed an
 * expression, so each set of functions has a language of its own. A set is known by its names
 * and functions rather than by the object holding them: each form's config has its own copy.
 */
function getLanguage(functions?: ExpressionFunctions): ExpressionLanguage {
  const names = functions ? Object.keys(functions).sort() : []
  if (!functions || names.length === 0) {
    return defaultLanguage
  }

  const key = JSON.stringify(
    names.map((name) => [name, functionId(functions[name])])
  )
  let language = languages.get(key)
  if (language) {
    // Set again below, as the most recently used
    languages.delete(key)
  } else {
    language = createLanguage(functions)
    if (languages.size >= MAX_LANGUAGES) {
      languages.delete(languages.keys().next().value as string)
    }
  }
  languages.set(key, language)
  return language
}

/**
 * Property names an expression can't read, at any depth. Through them an expression could reach
 * a prototype (`{}.__proto__`) and change it for the whole page (`….__defineGetter__(…)`).
 */
const BLOCKED_KEYS = new Set([
  '__proto__',
  'prototype',
  'constructor',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
])

function assertReadable(key: unknown): void {
  if (BLOCKED_KEYS.has(String(key))) {
    throw new Error(`"${String(key)}" can't be read in an expression`)
  }
}

/** The expressions guardExpression() has checked: the language caches them, so each is checked once. */
const guarded = new WeakSet<ParsedExpression>()

/**
 * Keeps an expression away from the BLOCKED_KEYS. Every property an expression reads goes through
 * a GetAttrNode (`a.b`, `a.b()`, `a['b']`, `a[b]`), on a name or on a literal alike:
 * - a key written in the expression is checked here, and a blocked one is an error;
 * - a key worked out when the expression runs (`a[b]`) is checked each time it is worked out.
 *
 * This reads the language's syntax tree, so the library is pinned to an exact version: the
 * expression tests in tests/core/SchemaForms.test.ts fail if a new version changes it.
 */
function guardExpression(parsed: ParsedExpression): void {
  if (guarded.has(parsed)) {
    return
  }

  const reads: GetAttrNode[] = []
  const stack: Node[] = [parsed.getNodes()]
  while (stack.length > 0) {
    const node = stack.pop() as Node
    if (node instanceof GetAttrNode) {
      reads.push(node)
    }
    for (const child of Object.values(node.nodes ?? {})) {
      if (child instanceof Node) {
        stack.push(child)
      }
    }
  }

  // Every written key first, so a rejected expression is left as it was
  for (const read of reads) {
    const key = read.nodes.attribute
    if (key instanceof ConstantNode) {
      assertReadable(key.attributes.value)
    }
  }

  for (const read of reads) {
    const key = read.nodes.attribute
    if (
      read.attributes.type === GetAttrNode.ARRAY_CALL &&
      !(key instanceof ConstantNode)
    ) {
      const checkedKey: Node = Object.create(key)
      checkedKey.evaluate = (functions, values): any => {
        const value = key.evaluate(functions, values)
        assertReadable(value)
        return value
      }
      read.nodes.attribute = checkedKey
    }
  }

  guarded.add(parsed)
}

/**
 * Safely evaluates an expression string against a context
 * Returns a computed ref that will automatically update when the context changes
 */
export function evaluateExpression(
  expression: string,
  context: ExpressionContext | (() => ExpressionContext),
  options: EvaluationOptions = {}
): any {
  // Input validation
  if (!expression) {
    return expression
  }

  // Get context (either from function or use directly)
  let currentContext = typeof context === 'function' ? context() : context

  if (!currentContext || typeof currentContext !== 'object') {
    currentContext = { form: {}, context: {} } as ExpressionContext
  }

  try {
    // Only the context's own names can be read: an expression naming another is an error
    const values = { ...currentContext }
    const language = getLanguage(options?.functions)
    const parsed = language.parse(expression.trim(), Object.keys(values))
    guardExpression(parsed)
    return language.evaluate(parsed, values)
  } catch (error) {
    // Handle the error and provide helpful debugging information
    const expressionError =
      error instanceof ExpressionError
        ? error
        : new ExpressionError(
            `Runtime error evaluating expression: ${(error as Error).message}`,
            expression,
            error as Error,
            currentContext
          )

    // Log the error with appropriate level of detail
    logExpressionError(expressionError, expression, currentContext)

    // Return a safe fallback value
    return undefined
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
 * Returns a computed ref that will automatically update when the context changes
 */
export function evaluateTemplateString(
  template: string,
  context: ExpressionContext | (() => ExpressionContext),
  config: EnformaConfig
): any {
  // Input validation
  if (!template || typeof template !== 'string') {
    return template as unknown as ComputedRef<any>
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
        const result = evaluateExpression(
          expressionStr,
          currentContext,
          config.expressions
        )

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

  if (obj.dep) {
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
          const currentContext =
            typeof context === 'function' ? context() : context

          // For arrays, we need to compute each element that contains expressions
          result[key] = value.map((item: any) => {
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
                return computedItem?.value || computedItem
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
      errors.map((e) => {
        console.warn(
          `[Enforma] Expression error occurred during object evaluation:`,
          e.message
        )
      })
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
