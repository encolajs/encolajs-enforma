/** A debounced function, whose pending call can be cancelled */
export type Debounced<T extends (...args: any[]) => any> = ((
  ...args: Parameters<T>
) => void) & {
  /** Drops the pending call, if there is one */
  cancel: () => void
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): Debounced<T> {
  let timeout: number | null = null

  const cancel = (): void => {
    if (timeout !== null) {
      window.clearTimeout(timeout)
      timeout = null
    }
  }

  const debounced = function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null
      func(...args)
    }

    cancel()
    timeout = window.setTimeout(later, wait)
  }

  return Object.assign(debounced, { cancel })
}
