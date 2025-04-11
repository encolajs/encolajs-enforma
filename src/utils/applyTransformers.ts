export default function applyTransformers(
  transformers: Function[],
  input: any,
  ...args: any[]): any {

  return (transformers || []).reduce(
    (input: any, transformer: Function) => {
      return transformer(input, ...args)
    },
    input
  )
}