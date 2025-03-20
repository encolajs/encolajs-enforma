/**
 * Type definitions for validation integration
 */

import { CustomMessagesConfig } from '@encolajs/validator'
import { ValidatorFactory, Validator } from '@encolajs/validator'

/**
 * Validation rules record
 */
export type ValidationRules = Record<string, string>

/**
 * Configuration for validator creation
 */
export interface ValidatorConfig {
  rules: ValidationRules
  messages?: CustomMessagesConfig
  factory?: ValidatorFactory
}

/**
 * Options for field validation
 */
export interface ValidationOptions {
  validateOn?: 'input' | 'change' | 'blur' | 'submit'
  showErrorsOn?: 'touched' | 'dirty' | 'always' | 'submitted'
  validateOnMount?: boolean
  validateDependentFields?: boolean
  validateAllOnSubmit?: boolean
}

/**
 * Validation results
 */
export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
  fieldsWithErrors: string[]
}

/**
 * Extended validation rules that include conditionals
 */
export interface ConditionalValidationRules {
  [key: string]:
    | {
        rules: string
        if?: string | boolean
      }
    | string
}

/**
 * Utility to convert conditional rules to standard rules
 */
export function flattenConditionalRules(
  rules: ConditionalValidationRules
): ValidationRules {
  const result: ValidationRules = {}

  for (const [path, value] of Object.entries(rules)) {
    if (typeof value === 'string') {
      result[path] = value
    } else {
      // For conditional rules, we create a validation rule that is processed
      // by the validator with conditional logic
      result[path] = value.rules
    }
  }

  return result
}

/**
 * Extract field names from validation rules
 */
export function extractFieldsFromRules(rules: ValidationRules): string[] {
  return Object.keys(rules).map((rule) => {
    // Remove array notation from rules
    return rule.replace(/\[\*\]$/, '')
  })
}

/**
 * Determine if a field has conditional validation rules
 */
export function hasConditionalValidation(
  rules: ConditionalValidationRules,
  fieldName: string
): boolean {
  const rule = rules[fieldName]
  return typeof rule === 'object' && rule.if !== undefined
}

/**
 * Get dependent fields from a validation rule
 */
export function getDependentFields(
  rule: string,
  allRules: ValidationRules
): string[] {
  // Extract field references from the rule
  const fieldRefs: string[] = []
  const referenceMatches = rule.match(
    /(?:same_as|confirmed|matches_field):@(\w+)/g
  )

  if (referenceMatches) {
    for (const match of referenceMatches) {
      const field = match.split(':@')[1]
      if (field) {
        fieldRefs.push(field)
      }
    }
  }

  // Also check required_if and required_unless rules
  const conditionalMatches = rule.match(
    /(?:required_if|required_unless):(\w+),/g
  )

  if (conditionalMatches) {
    for (const match of conditionalMatches) {
      const field = match.split(':')[1]?.split(',')[0]
      if (field) {
        fieldRefs.push(field)
      }
    }
  }

  return fieldRefs
}

/**
 * Build validation dependencies map
 */
export function buildValidationDependencies(
  rules: ValidationRules
): Record<string, string[]> {
  const dependencies: Record<string, string[]> = {}

  // Initialize with empty arrays
  Object.keys(rules).forEach((field) => {
    dependencies[field] = []
  })

  // Build dependencies for each field
  Object.entries(rules).forEach(([field, rule]) => {
    const dependentFields = getDependentFields(rule, rules)

    // For each dependent field, add this field as a dependency
    dependentFields.forEach((depField) => {
      if (dependencies[depField]) {
        dependencies[depField].push(field)
      } else {
        dependencies[depField] = [field]
      }
    })
  })

  return dependencies
}
