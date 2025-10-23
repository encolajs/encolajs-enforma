import type { FormValidator } from './types'
import { ObjectSchema, ValidationError } from 'yup'

export class YupValidator implements FormValidator {
  private errors: Record<string, string[]> = {}

  constructor(private schema: ObjectSchema<any>) {}

  async validate(data: any): Promise<boolean> {
    try {
      await this.schema.validate(data, { abortEarly: false })
      this.errors = {}
      return true
    } catch (error: any) {
      if (error instanceof ValidationError) {
        this.errors = {}
        error.inner.forEach((err: any) => {
          if (err.path) {
            if (!this.errors[err.path]) {
              this.errors[err.path] = []
            }
            this.errors[err.path].push(err.message)
          }
        })
      }
      return false
    }
  }

  async validatePath(path: string, data: any): Promise<boolean> {
    try {
      await this.schema.validateAt(path, data)
      delete this.errors[path]
      return true
    } catch (error: any) {
      if (error instanceof ValidationError) {
        this.errors[path] = [error.message]
      }
      return false
    }
  }

  getErrors(): Record<string, string[]> {
    return { ...this.errors }
  }

  getErrorsForPath(path: string): string[] {
    return this.errors[path] || []
  }

  getDependentFields(path: string): string[] {
    return []
  }

  clearErrorsForPath(path: string): void {
    delete this.errors[path]
  }

  reset(): void {
    this.errors = {}
  }
}

export function createYupValidator(schema: ObjectSchema<any>): FormValidator {
  return new YupValidator(schema)
}
