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
import { formReader, isFormController } from './formReader'

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
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return schema
  }

  // Only the keys `expressions.only` lists are evaluated, when it lists any: the others are
  // kept as they are, text with `${…}` in it included.
  const only = config?.expressions?.only
  if (
    Array.isArray(only) &&
    !Object.keys(schema).some((key) => only.includes(key))
  ) {
    return schema
  }

  const expressionContext = {
    // The form's values, read without side effects (see formReader.ts)
    form: isFormController(formController)
      ? formReader(formController)
      : formController ?? {},
    // External context
    context: { ...context },
    // Form configuration
    config,
  }

  if (!Array.isArray(only)) {
    return evaluateObject(
      schema as Record<string, any>,
      expressionContext,
      config
    ) as T
  }

  const result: Record<string, any> = { ...(schema as Record<string, any>) }
  for (const key of Object.keys(result)) {
    if (only.includes(key)) {
      result[key] = evaluateObject(
        { [key]: result[key] },
        expressionContext,
        config
      )[key]
    }
  }
  return result as T
}
