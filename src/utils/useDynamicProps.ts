/**
 * Composable for managing dynamic properties with expression evaluation
 */

import { computed, ComputedRef, inject } from 'vue'
import { formContextKey, formControllerKey } from '@/constants/symbols'
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
   * Returns an object with computed refs for properties that contain expressions
   */
  evaluateProps: (props: DynamicProps) => Record<string, ComputedRef<any> | any>

  /**
   * Evaluate a conditional expression
   * Returns a computed ref that will automatically update when the context changes
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
  const formState = inject<FormController | undefined>(formControllerKey, undefined)
  const formContext = inject<Record<string, any>>(formContextKey, {})
  const { formConfig, getConfig } = useFormConfig()

  /**
   * Create the context for expression evaluation
   */
  const getExpressionContext = (): ExpressionContext => {
    // Create context object with the three main keys
    return {
      // Form controller (not just values)
      form: formState ?? {},
      // External context
      context: { ...formContext },
      // Form configuration
      config: formConfig,
      // Local context specific to this instance (for backward compatibility)
      ...localContext,
    }
  }

  /**
   * Evaluates all expressions within props
   * Returns an object with computed refs for properties that contain expressions
   */
  const evaluateProps = (props: DynamicProps): Record<string, ComputedRef<any> | any> => {
    // Pass getExpressionContext as function to ensure reactivity
    return evaluateObject(props, getExpressionContext, formConfig)
  }

  /**
   * Evaluates a conditional expression
   * Returns a computed ref that will automatically update when the context changes
   */
  const evaluateConditionForDynamicProps = (
    condition: string | boolean | undefined
  ): ComputedRef<boolean> => {
    // Pass getExpressionContext as function to ensure reactivity
    return evaluateCondition(
      condition,
      getExpressionContext,
      getConfig('expressions', { delimiters: { start: '${', end: '}' } })
    )
  }

  return {
    evaluateProps,
    evaluateCondition: evaluateConditionForDynamicProps,
    getContext: getExpressionContext,
  }
}
