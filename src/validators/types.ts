export interface FormValidator {
  validate(data: any): Promise<boolean>
  validatePath(path: string, data: any): Promise<boolean>
  getErrors(): Record<string, string[]>
  getErrorsForPath(path: string): string[]
  getDependentFields(path: string): string[]
  clearErrorsForPath(path: string): void
  reset(): void
}
