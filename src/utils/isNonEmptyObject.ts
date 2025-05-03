export default function (variable: any) {
  if (typeof variable === 'object' && variable !== null && !Array.isArray(variable)) {
    return Object.keys(variable).length > 0
  }

  return false
}
