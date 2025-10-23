import type { FormValidator } from './types'
import type { CustomMessagesConfig } from '@encolajs/validator'
import { useValidation } from '@/utils/useValidation'

class EncolaValidatorAdapter implements FormValidator {
  private validator: any
  private errors: Record<string, string[]> = {}

  constructor(
    rules: Record<string, string>,
    customMessages?: CustomMessagesConfig
  ) {
    const validation = useValidation()
    this.validator = validation.makeValidator(rules, customMessages)
  }

  async validate(data: any): Promise<boolean> {
    const isValid = await this.validator.validate(data)
    if (isValid) {
      this.errors = {}
    } else {
      this.errors = this.validator.getErrors()
    }
    return isValid
  }

  async validatePath(path: string, data: any): Promise<boolean> {
    const isValid = await this.validator.validatePath(path, data)
    if (isValid) {
      delete this.errors[path]
    } else {
      this.errors[path] = this.validator.getErrorsForPath(path)
    }
    return isValid
  }

  getErrors(): Record<string, string[]> {
    return { ...this.errors }
  }

  getErrorsForPath(path: string): string[] {
    return this.errors[path] || []
  }

  getDependentFields(path: string): string[] {
    return this.validator.getDependentFields?.(path) || []
  }

  clearErrorsForPath(path: string): void {
    delete this.errors[path]
    this.validator.clearErrorsForPath?.(path)
  }

  reset(): void {
    this.errors = {}
    this.validator.reset?.()
  }
}

export function createEncolaValidator(
  rules: Record<string, string>,
  customMessages?: CustomMessagesConfig
): FormValidator {
  return new EncolaValidatorAdapter(rules, customMessages)
}
