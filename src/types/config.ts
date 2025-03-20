/**
 * Type definitions for the configuration system
 */

/**
 * Represents a generic configuration object
 */
export type ConfigObject = Record<string, any>

/**
 * Makes all properties in T optional and recursive
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

/**
 * Configuration for field components
 */
export interface FieldPropsConfig {
  wrapper: ConfigObject
  label: {
    class?: string
    required?: {
      class?: string
      text?: string
    }
    [key: string]: any
  }
  input: ConfigObject
  error: ConfigObject
  help: ConfigObject
  section: ConfigObject
  [key: string]: any
}

/**
 * Configuration for form behavior
 */
export interface BehaviorConfig {
  validateOn: 'input' | 'change' | 'blur' | 'submit'
  syncOn: 'input' | 'change' | 'blur' | 'submit'
  showErrorsOn: 'touched' | 'dirty' | 'focus' | 'always'
  autoTrimValues: boolean
  autoCommitOnValid: boolean
  [key: string]: any
}

/**
 * Configuration for field type definitions
 */
export interface FieldTypeConfig {
  component: string
  props: ConfigObject
  [key: string]: any
}

/**
 * Configuration for field type mappings
 */
export interface FieldTypesConfig {
  default: FieldTypeConfig
  [fieldType: string]: FieldTypeConfig
}

/**
 * Configuration for expression handling
 */
export interface ExpressionsConfig {
  delimiters: {
    start: string
    end: string
  }
  conditionals: {
    allowComplex: boolean
    timeout: number
  }
  [key: string]: any
}

/**
 * Complete form kit configuration
 */
export interface FormKitConfig {
  fieldProps: FieldPropsConfig
  behavior: BehaviorConfig
  fieldTypes: FieldTypesConfig
  messages: Record<string, string>
  expressions: ExpressionsConfig
  components: {
    field: ConfigObject
    input: Record<string, string>
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Configuration providers can be objects or functions
 */
export type ConfigProvider =
  | DeepPartial<FormKitConfig>
  | (() => DeepPartial<FormKitConfig>)
