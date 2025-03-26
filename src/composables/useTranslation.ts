import { getCurrentInstance } from 'vue'

/**
 * Simple fallback translation function that just returns the key
 */
export function fallbackTranslate(
  key: string,
  values?: Record<string, any>
): string {
  if (!key) return ''

  // Simple interpolation support
  if (values && typeof key === 'string') {
    return key.replace(/\{(\w+)\}/g, (_, name) => {
      return values[name] !== undefined ? String(values[name]) : `{${name}}`
    })
  }

  return key
}

/**
 * A simple composable to provide a translation function that uses
 * Vue i18n's $t if available, otherwise falls back to returning the key
 */
export function useTranslation() {
  const instance = getCurrentInstance()

  function t(key: string, values?: Record<string, any>): string {
    // If i18n is available, use it
    if (instance?.proxy && '$t' in instance.proxy) {
      return (instance.proxy as any).$t(key, values)
    }

    // Otherwise just return the key with simple interpolation
    return fallbackTranslate(key, values)
  }

  return { t }
}
