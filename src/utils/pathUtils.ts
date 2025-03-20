/**
 * Utility functions for handling field paths in the form kit
 */

/**
 * Get a value from an object by path string
 */
export function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) {
    return undefined
  }

  // Handle array notation with regex
  const parts = path
    .replace(/\[(\w+)\]/g, '.$1') // Convert array notation to dot notation
    .replace(/^\./, '') // Remove leading dot
    .split('.') // Split by dots

  let current = obj

  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined
    }

    current = current[part]
  }

  return current
}

/**
 * Set a value in an object by path string
 */
export function setValueByPath(obj: any, path: string, value: any): any {
  if (!obj || !path) {
    return obj
  }

  // Handle array notation with regex
  const parts = path
    .replace(/\[(\w+)\]/g, '.$1') // Convert array notation to dot notation
    .replace(/^\./, '') // Remove leading dot
    .split('.') // Split by dots

  const result = { ...obj }
  let current = result

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const isLast = i === parts.length - 1

    // If we're at the last part, set the value
    if (isLast) {
      current[part] = value
    } else {
      // Otherwise, ensure the path exists
      // Create an object or array based on the next part
      const nextPart = parts[i + 1]
      const isNextPartNumeric = /^\d+$/.test(nextPart)

      // Initialize if doesn't exist or is a different type than needed
      if (
        current[part] === undefined ||
        current[part] === null ||
        typeof current[part] !== 'object'
      ) {
        current[part] = isNextPartNumeric ? [] : {}
      }

      // Move to the next level
      current = current[part]
    }
  }

  return result
}

/**
 * Normalize a field path (handles different notations)
 */
export function normalizePath(path: string): string {
  return path
    .replace(/\[(\w+)\]/g, '.$1') // Convert array notation to dot notation
    .replace(/^\./, '') // Remove leading dot
}

/**
 * Check if a path is a child of another path
 */
export function isChildPath(childPath: string, parentPath: string): boolean {
  const normalizedChild = normalizePath(childPath)
  const normalizedParent = normalizePath(parentPath)

  return (
    normalizedChild.startsWith(normalizedParent + '.') ||
    normalizedChild.startsWith(normalizedParent + '[')
  )
}

/**
 * Get the parent path of a path
 */
export function getParentPath(path: string): string {
  const normalizedPath = normalizePath(path)
  const lastDotIndex = normalizedPath.lastIndexOf('.')

  if (lastDotIndex === -1) {
    return ''
  }

  return normalizedPath.substring(0, lastDotIndex)
}

/**
 * Get all parent paths of a path
 */
export function getAllParentPaths(path: string): string[] {
  const result: string[] = []
  let current = path

  while (current) {
    current = getParentPath(current)
    if (current) {
      result.push(current)
    }
  }

  return result
}

/**
 * Get the last segment of a path
 */
export function getLastSegment(path: string): string {
  const normalizedPath = normalizePath(path)
  const lastDotIndex = normalizedPath.lastIndexOf('.')

  if (lastDotIndex === -1) {
    return normalizedPath
  }

  return normalizedPath.substring(lastDotIndex + 1)
}

/**
 * Joins path segments into a single path
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .filter((segment) => segment)
    .join('.')
    .replace(/\.{2,}/g, '.') // Replace consecutive dots with a single dot
    .replace(/^\./, '') // Remove leading dot
}

/**
 * Check if a path uses array notation
 */
export function hasArrayNotation(path: string): boolean {
  return /\[\d+\]/.test(path)
}

/**
 * Convert a path with array notation to dot notation
 */
export function arrayToDotNotation(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1')
}

/**
 * Convert a path with dot notation to array notation
 */
export function dotToArrayNotation(path: string): string {
  return path.replace(/\.(\d+)(?=\.|$)/g, '[$1]')
}
