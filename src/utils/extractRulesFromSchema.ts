import type { FormSchema, FieldSchema, ValidationRules } from '@/types'
import type { CustomMessagesConfig } from '@encolajs/validator'

/**
 * Extracts validation rules from a form schema
 * @param schema The form schema to extract rules from
 * @param fieldNamePrefix Optional prefix for field names (used for nested fields)
 * @returns The extracted validation rules
 */
export function extractRulesFromSchema(
  schema: FormSchema,
  fieldNamePrefix: string = ''
): ValidationRules {
  const rules: ValidationRules = {}

  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    const fullFieldName = fieldNamePrefix
      ? `${fieldNamePrefix}.${fieldName}`
      : fieldName

    // @ts-expect-error this is a field
    if (fieldConfig.rules && typeof fieldConfig.rules === 'string') {
      // @ts-expect-error this is a field
      rules[fullFieldName] = fieldConfig.rules
      // @ts-expect-error this is a repeatable
    } else if (fieldConfig.subfields) {
      const subRules = extractRulesFromSchema(
        // @ts-expect-error this is a repeatable
        fieldConfig.subfields,
        `${fullFieldName}.*`
      )
      Object.assign(rules, subRules)
    }
  }

  return rules
}

/**
 * Extracts custom validation messages from a form schema
 * @param schema The form schema to extract messages from
 * @param fieldNamePrefix Optional prefix for field names (used for nested fields)
 * @returns The extracted custom messages
 */
export function extractMessagesFromSchema(
  schema: FormSchema,
  fieldNamePrefix: string = ''
): CustomMessagesConfig {
  const messages: CustomMessagesConfig = {}

  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    const fullFieldName = fieldNamePrefix
      ? `${fieldNamePrefix}.${fieldName}`
      : fieldName

    // @ts-expect-error this is a field
    if (fieldConfig.messages && typeof fieldConfig.messages === 'object') {
      // @ts-expect-error this is a field
      const fieldMessages = fieldConfig.messages as Record<string, string>

      // Convert field messages to the correct format
      for (const [rule, message] of Object.entries(fieldMessages)) {
        messages[`${fullFieldName}:${rule}`] = message
      }
      // @ts-expect-error this is a repeatable
    } else if (fieldConfig.subfields) {
      const subMessages = extractMessagesFromSchema(
        // @ts-expect-error this is a repeatable
        fieldConfig.subfields,
        `${fullFieldName}.*`
      )
      Object.assign(messages, subMessages)
    }
  }

  return messages
}
