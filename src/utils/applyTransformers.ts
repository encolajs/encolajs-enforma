import { safeExecute } from './helpers'

/**
 * Applies a series of transformer functions to an input value
 * It uses the "pipeline" pattern where each transformer's result
 * is passed to the next transformer
 */
export default function applyTransformers(
  transformers: Function[],
  input: any,
  ...args: any[]
): any {
  if (
    !transformers ||
    !Array.isArray(transformers) ||
    transformers.length === 0
  ) {
    return input
  }

  return transformers.reduce((currentValue: any, transformer: Function) => {
    // Apply each transformer safely, falling back to current value if it fails
    return safeExecute(
      () => transformer(currentValue, ...args),
      `transformer ${transformer.name || 'anonymous'}`,
      currentValue,
      true
    )
  }, input)
}
