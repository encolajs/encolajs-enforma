import type { FormValidator } from './types'
import * as v from 'valibot'
import { pathUtils } from '@/utils/helpers'

export class ValibotValidator implements FormValidator {
  private errors: Record<string, string[]> = {}

  constructor(private schema: v.ObjectSchema<any, any>) {}

  async validate(data: any): Promise<boolean> {
    const result = await v.safeParseAsync(this.schema, data)

    if (result.success) {
      this.errors = {}
      return true
    }

    this.errors = {}
    if (result.issues) {
      result.issues.forEach((issue: any) => {
        if (issue.path) {
          const path = issue.path.map((p: any) => p.key).join('.')
          if (!this.errors[path]) {
            this.errors[path] = []
          }
          this.errors[path].push(issue.message)
        }
      })
    }

    return false
  }

  async validatePath(path: string, data: any): Promise<boolean> {
    try {
      const value = pathUtils.get(data, path)
      const fieldSchema = this.getFieldSchema(path)

      if (!fieldSchema) {
        delete this.errors[path]
        return true
      }

      const result = await v.safeParseAsync(fieldSchema, value)

      if (result.success) {
        delete this.errors[path]
        return true
      }

      if (result.issues) {
        this.errors[path] = result.issues.map((i: any) => i.message)
      }
      return false
    } catch (error: any) {
      return false
    }
  }

  private getFieldSchema(path: string): any {
    const parts = path.split('.')
    let schema: any = this.schema

    for (const part of parts) {
      if (schema.type === 'object' && schema.entries) {
        schema = schema.entries[part]
        if (!schema) return null
      } else if (schema.type === 'array') {
        schema = schema.item
      } else {
        return null
      }
    }

    return schema
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

export function createValibotValidator(
  schema: v.ObjectSchema<any, any>
): FormValidator {
  return new ValibotValidator(schema)
}
