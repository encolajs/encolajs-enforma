/**
 * Function for evaluating schemas with expression evaluation
 */
import {
  FieldSchema,
  FormController,
  FormSchema,
  RepeatableSchema,
  RepeatableTableSchema,
  SectionSchema,
} from '@/types'
import {
  evaluateObject,
  evaluateTemplateString,
  ExpressionContext,
} from './exprEvaluator'
import { EnformaConfig } from './useConfig'

// Type for props that may contain expressions
export type DynamicProps = Record<string, any>

/**
 * Evaluates a schema by processing each item and evaluating expressions
 */
export function evaluateSchema<T>(
  schema: T,
  formController: FormController | undefined,
  context: Record<string, any>,
  config: EnformaConfig
): T {
  if (typeof schema !== 'object' || Array.isArray(schema)) {
    return schema
  }

  const expressionContext = {
    // Form controller (not just values)
    form: formController ?? {},
    // External context
    context: { ...context },
    // Form configuration
    config,
  }

  return evaluateObject(
    schema as Record<string, any>,
    expressionContext,
    config
  ) as T
}
