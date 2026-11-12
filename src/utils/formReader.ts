/**
 * What an expression sees as `form`: the form's values, read without side effects.
 *
 * Expressions are given this rather than the form controller, for three reasons:
 * - reading a value through the controller registers a field for it, and a registered field is
 *   checked when the form is validated, even one that isn't shown;
 * - the controller has methods that change the form (`setFieldValue()`, `submit()`, `reset()`);
 * - a value read from the controller is the form's own object, which a method call in an
 *   expression could change (`form.tags.push(…)`).
 *
 * So `form.country` (or `form['address.city']`) gives a copy of that value, read through the
 * form's own keys only; `form.getFieldValue(path)` and `form.values()` give copies too; and the
 * form's state (`form.$isDirty`, `form.$isTouched`, `form.$isValidating`, `form.$isSubmitting`)
 * gives a boolean. Nothing else is reachable. Reading a value also reads the form's version, so
 * an expression worked out in a computed or a render is worked out again when the values change.
 */
import { unref } from 'vue'
import type { FormController } from '@/types'
import cloneFn from './cloneFn'

const STATE = ['$isDirty', '$isTouched', '$isValidating', '$isSubmitting']

const hasOwn = (value: any, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key)

/** The value at a dotted path, through own keys only; undefined where one is missing. */
function readPath(values: any, path: string): any {
  let current = values
  for (const key of path.split('.')) {
    if (
      current === null ||
      typeof current !== 'object' ||
      !hasOwn(current, key)
    ) {
      return undefined
    }
    current = current[key]
  }
  return current
}

/** A copy of a value an expression reads, so nothing it does reaches the form's own data. */
function copy(value: any): any {
  return value !== null && typeof value === 'object' ? cloneFn(value) : value
}

/** Whether a value is a form controller rather than plain data. */
export function isFormController(value: any): value is FormController {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.values === 'function' &&
    typeof value.getFieldValue === 'function'
  )
}

/** What an expression reads as `form`, for the controller `form`. */
export function formReader(form: FormController): Record<string, any> {
  // Read for its reactivity: the form bumps its version as its values change.
  const values = () => {
    void (form as any).$formVersion
    return form.values()
  }
  const methods: Record<string, Function> = {
    getFieldValue: (path: string) => copy(readPath(values(), String(path))),
    values: () => copy(values()),
  }

  return new Proxy(
    {},
    {
      get(_, prop) {
        if (typeof prop !== 'string') return undefined
        if (hasOwn(methods, prop)) return methods[prop]
        if (STATE.includes(prop)) return Boolean(unref((form as any)[prop]))
        return copy(readPath(values(), prop))
      },
      has(_, prop) {
        return (
          typeof prop === 'string' && readPath(values(), prop) !== undefined
        )
      },
      set: () => false,
      deleteProperty: () => false,
      defineProperty: () => false,
    }
  )
}
