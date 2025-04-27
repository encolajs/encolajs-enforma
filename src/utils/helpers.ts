/**
 * Shared helper functions used across the Enforma codebase
 */

/**
 * Checks if a value is a plain object (not null, not an array, but an object)
 */
export function isPlainObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Resolves a value that may be either a direct value or a function that returns a value
 */
export function resolveValue<T>(valueOrFn: T | (() => T)): T {
  return typeof valueOrFn === 'function' ? (valueOrFn as Function)() : valueOrFn
}

/**
 * Helper for working with object paths using dot notation
 */
export const pathUtils = {
  /**
   * Gets a value from an object by path
   */
  get: <T = any>(
    obj: any,
    path: string,
    defaultValue?: T
  ): T | null | undefined => {
    if (obj == null || !path) {
      return defaultValue
    }

    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current == null) {
        return defaultValue
      }
      current = current[key]
    }

    return current === undefined ? defaultValue : current
  },

  /**
   * Sets a value in an object by path, creating intermediate objects if needed
   */
  set: (obj: any, path: string, value: any): any => {
    if (obj == null || !path) {
      return obj
    }

    const parts = path.split('.')
    const lastPart = parts.pop()!

    const target = parts.reduce((curr, part) => {
      if (!curr[part] || typeof curr[part] !== 'object') {
        const nextPart = parts[parts.indexOf(part) + 1]
        curr[part] = !isNaN(Number(nextPart)) ? [] : {}
      }
      return curr[part]
    }, obj)

    target[lastPart] = value
    return obj
  },
}

/**
 * Safely executes a function with standardized error handling
 */
export function safeExecute<T>(
  fn: () => T,
  errorContext: string,
  fallbackValue: T,
  logError = true
): T {
  try {
    return fn()
  } catch (error) {
    if (logError && process.env.NODE_ENV !== 'production') {
      console.error(`[Enforma] Error in ${errorContext}:`, error)
    }
    return fallbackValue
  }
}

/**
 * Generates a unique ID for fields
 */
export function generateId(prefix: string, base?: string): string {
  const random = Math.random().toString(36).substring(2, 10)
  const baseStr = base ? base.replace(/[^a-zA-Z0-9_]/g, '_') : ''
  return `${prefix}_${baseStr}${baseStr ? '_' : ''}${random}`
}
