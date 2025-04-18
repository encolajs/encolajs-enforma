/**
 * Composable for managing dynamic properties with expression evaluation
 */

import { computed, ComputedRef, inject } from 'vue'
import { formContextKey, formStateKey } from '@/constants/symbols'
import { FormController } from '@/types'
import {
  evaluateCondition,
  evaluateObject,
  ExpressionContext,
} from './exprEvaluator'
import { useFormConfig } from '@/utils/useFormConfig'

// Type for props that may contain expressions
export type DynamicProps = Record<string, any>

/**
 * Return type for useDynamicProps
 */
export interface UseDynamicPropsReturn {
  /**
   * Evaluate all expressions in the props object
   */
  evaluateProps: (props: DynamicProps) => DynamicProps

  /**
   * Evaluate a conditional expression
   */
  evaluateCondition: (
    condition: string | boolean | undefined
  ) => ComputedRef<boolean>

  /**
   * Get the current expression context
   */
  getContext: () => ExpressionContext
}

/**
 * Composable for working with dynamic props that may contain expressions
 */
export function useDynamicProps(
  localContext: Record<string, any> = {}
): UseDynamicPropsReturn {
  // Inject dependencies
  const formState = inject<FormController | undefined>(formStateKey, undefined)
  const formContext = inject<Record<string, any>>(formContextKey, {})
  const { formConfig, getConfig } = useFormConfig()

  /**
   * Create the context for expression evaluation
   */
  const getExpressionContext = (): ExpressionContext => {
    // Basic context from form state and external context
    return {
      // Form values from form state
      form: formState?.values() ?? {},
      // External context
      context: { ...formContext },
      // Validation errors
      errors: formState?.errors() ?? {},
      // Local context specific to this instance
      ...localContext,
    }
  }

  /**
   * Evaluates all expressions within props
   */
  const evaluateProps = (props: DynamicProps): DynamicProps => {
    const expressionContext = getExpressionContext()
    return evaluateObject(props, expressionContext, formConfig)
  }

  /**
   * Evaluates a conditional expression
   */
  const evaluateConditionForDynamicProps = (
    condition: string | boolean | undefined
  ): ComputedRef<any> => {
    return computed(() => {
      // assume the condition is true if not defined
      if (condition === undefined) {
        return true
      }

      if (typeof condition === 'boolean') {
        return condition
      }

      const expressionContext = getExpressionContext()
      return evaluateCondition(
        condition,
        expressionContext,
        getConfig('expressions', { delimiters: { start: '${', end: '}' } })
      )
    })
  }

  return {
    evaluateProps,
    evaluateCondition: evaluateConditionForDynamicProps,
    getContext: getExpressionContext,
  }
}
