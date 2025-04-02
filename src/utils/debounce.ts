/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      window.clearTimeout(timeout)
    }

    timeout = window.setTimeout(later, wait)
  }
}
