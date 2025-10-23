import type { FormValidator } from './types'

export class NoopValidator implements FormValidator {
  async validate(data: any): Promise<boolean> {
    return true
  }

  async validatePath(path: string, data: any): Promise<boolean> {
    return true
  }

  getErrors(): Record<string, string[]> {
    return {}
  }

  getErrorsForPath(path: string): string[] {
    return []
  }

  getDependentFields(path: string): string[] {
    return []
  }

  clearErrorsForPath(path: string): void {}

  reset(): void {}
}
