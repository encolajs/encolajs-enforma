/**
 * Function for evaluating schemas with expression evaluation
 */
import { FormController, FormSchema } from '@/types'
import {
  evaluateObject,
  ExpressionContext,
} from './exprEvaluator'
import { EnformaConfig } from './useConfig'

// Type for props that may contain expressions
export type DynamicProps = Record<string, any>

/**
 * Evaluates a schema by processing each item and evaluating expressions
 */
export function evaluateSchema(
  schema: FormSchema,
  formController: FormController | undefined,
  context: Record<string, any>,
  config: EnformaConfig
): FormSchema {
  if (typeof schema !== 'object' || Array.isArray(schema)) {
    return schema
  }
  /**
   * Create the context for expression evaluation
   */
  const getExpressionContext = (): ExpressionContext => {
    // Create context object with the three main keys
    return {
      // Form controller (not just values)
      form: formController ?? {},
      // External context
      context: { ...context },
      // Form configuration
      config,
    }
  }

  return evaluateObject(schema, getExpressionContext, config)
}