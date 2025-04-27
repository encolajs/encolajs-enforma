function deepClone(value: any): any {
  if (value === null || typeof value !== 'object') {
    return value // primitives
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags)
  }

  if (value instanceof Map) {
    const clonedMap = new Map()
    value.forEach((v, k) => {
      clonedMap.set(deepClone(k), deepClone(v))
    })
    return clonedMap
  }

  if (value instanceof Set) {
    const clonedSet = new Set()
    value.forEach((v) => {
      clonedSet.add(deepClone(v))
    })
    return clonedSet
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item))
  }

  // For plain objects
  const clonedObj = {}
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      (clonedObj as Record<string, any>)[key] = deepClone(value[key])
    }
  }

  // Also clone symbol-keyed properties
  const symbolKeys = Object.getOwnPropertySymbols(value)
  for (const sym of symbolKeys) {
    (clonedObj as Record<symbol, any>)[sym] = deepClone(value[sym])
  }

  return clonedObj
}

/**
 * Default clone function for form data
 * Used when resetting forms to initial state
 * @param data Form data to clone
 * @returns Cloned form data
 */
export default function cloneFn(data: any) {
  // Check if the data object has a clone method
  if (data.clone && typeof data.clone === 'function') {
    return data.clone()
  }

  return deepClone(data)
}
