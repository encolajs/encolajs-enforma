/**
 * Composable for managing dynamic properties with expression evaluation
 */

import { computed, ComputedRef, inject } from 'vue'
import { FORM_CONTEXT, FORM_KIT_CONFIG, FORM_STATE } from '../constants/symbols'
import { FormKitConfig } from '../types/config'
import { DEFAULT_CONFIG } from '../constants/defaults'
import { FormStateReturn } from '../types'
import {
  ExpressionContext,
  evaluateObject,
  evaluateCondition,
} from '../utils/exprEvaluator'

// Type for props that may contain expressions
export type DynamicProps = Record<string, any>

/**
 * Return type for useDynamicProps
 */
export interface UseDynamicPropsReturn {
  /**
   * Evaluate all expressions in the props object
   */
  evaluateProps: <T extends DynamicProps>(props: T) => ComputedRef<T>

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
  const formState = inject<FormStateReturn | undefined>(FORM_STATE, undefined)
  const formContext = inject<Record<string, any>>(FORM_CONTEXT, {})
  const config = inject<FormKitConfig>(FORM_KIT_CONFIG, DEFAULT_CONFIG)

  /**
   * Create the context for expression evaluation
   */
  const getContext = (): ExpressionContext => {
    // Basic context from form state and external context
    const context: ExpressionContext = {
      // Form values from form state
      form: formState?.getData() || {},
      // External context
      context: { ...formContext },
      // Validation errors
      errors: formState?.errors || {},
      // Local context specific to this instance
      ...localContext,
    }

    return context
  }

  /**
   * Evaluates all expressions within props
   */
  const evaluateProps = <T extends DynamicProps>(props: T): ComputedRef<T> => {
    return computed(() => {
      const context = getContext()
      return evaluateObject<T>(props, context, config)
    })
  }

  /**
   * Evaluates a conditional expression
   */
  const evaluateConditionForDynamicProps = (
    condition: string | boolean | undefined
  ): ComputedRef<any> => {
    return computed(() => {
      if (condition === undefined) {
        return true
      }

      if (typeof condition === 'boolean') {
        return condition
      }

      const context = getContext()
      return evaluateCondition(condition, context, config.expressions)
    })
  }

  return {
    evaluateProps,
    evaluateCondition: evaluateConditionForDynamicProps,
    getContext,
  }
}
