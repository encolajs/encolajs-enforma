import type { FormValidator } from './types'
import { z } from 'zod'
import { pathUtils } from '@/utils/helpers'

export class ZodValidator implements FormValidator {
  private errors: Record<string, string[]> = {}

  constructor(private schema: z.ZodObject<any>) {}

  async validate(data: any): Promise<boolean> {
    const result = await this.schema.safeParseAsync(data)

    if (result.success) {
      this.errors = {}
      return true
    }

    this.errors = {}
    result.error.issues.forEach((issue: any) => {
      const path = issue.path.join('.')
      if (!this.errors[path]) {
        this.errors[path] = []
      }
      this.errors[path].push(issue.message)
    })

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

      await fieldSchema.parseAsync(value)
      delete this.errors[path]
      return true
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        this.errors[path] = error.issues.map((i: any) => i.message)
      }
      return false
    }
  }

  private getFieldSchema(path: string): z.ZodTypeAny | null {
    const parts = path.split('.')
    let schema: any = this.schema

    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        if (schema instanceof z.ZodArray) {
          schema = schema.element
        } else {
          return null
        }
      } else if (schema instanceof z.ZodObject) {
        schema = schema.shape[part]
        if (!schema) return null
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

export function createZodValidator(schema: z.ZodObject<any>): FormValidator {
  return new ZodValidator(schema)
}
