/**
 * What a screen reader is told about a count of errors, such as a tab's: "1 error",
 * "3 errors", through the form's translation (`t('{count} errors', { count })`)
 */
export function errorCountText(
  t: (key: string, values?: Record<string, any>) => string,
  count: number
): string {
  return count === 1 ? t('1 error') : t('{count} errors', { count })
}

/** Styles that hide an element from sight but leave it to screen readers */
export const visuallyHidden: Record<string, string> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
}
