import { safeExecute } from './helpers'

/**
 * Applies a series of transformer functions to an input value
 * @param transformers Array of transformer functions to apply
 * @param input The value to transform
 * @param args Additional arguments to pass to each transformer
 * @returns The transformed value
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
