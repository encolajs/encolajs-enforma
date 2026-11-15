import { isPlainObject } from './helpers'

/**
 * Whether two values are the same, compared in depth: primitives by value (NaN equal to
 * itself), dates by time, arrays item by item, plain objects key by key. Other objects
 * (class instances, files) only when they are the same object
 */
export function isDeepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false
    }
    return a.every((item, index) => isDeepEqual(item, b[index]))
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    return keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        isDeepEqual(a[key], b[key])
    )
  }
  return false
}
