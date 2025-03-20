/**
 * Composable for evaluating conditional expressions in forms
 */

import { computed, ComputedRef, inject, ref, Ref, watch } from 'vue'
import { FORM_CONTEXT, FORM_KIT_CONFIG, FORM_STATE } from '../constants/symbols'
import { FormKitConfig } from '../types/config'
import { DEFAULT_CONFIG } from '../constants/defaults'
import { FormStateReturn } from '../types'
import { evaluateCondition, ExpressionContext } from '../utils/exprEvaluator'

/**
 * Return type for useConditions
 */
export interface UseConditionsReturn {
  /**
   * Evaluate a condition with reactive dependencies
   */
  evaluateIf: (condition: string | boolean | undefined) => ComputedRef<boolean>

  /**
   * Evaluate multiple conditions
   */
  evaluateMany: (
    conditions: Record<string, string | boolean | undefined>
  ) => ComputedRef<Record<string, boolean>>

  /**
   * Track conditions and evaluate them when dependencies change
   */
  trackCondition: (
    name: string,
    condition: string | boolean | undefined
  ) => Ref<boolean>

  /**
   * Get all tracked conditions
   */
  trackedConditions: ComputedRef<Record<string, boolean>>
}

/**
 * Composable for working with conditional expressions in forms
 */
export function useConditions(
  localContext: Record<string, any> = {}
): UseConditionsReturn {
  // Inject dependencies
  const formState = inject<FormStateReturn | undefined>(FORM_STATE, undefined)
  const formContext = inject<Record<string, any>>(FORM_CONTEXT, {})
  const config = inject<FormKitConfig>(FORM_KIT_CONFIG, DEFAULT_CONFIG)

  // Track conditions and their results
  const conditions = ref<Record<string, string | boolean | undefined>>({})
  const results = ref<Record<string, boolean>>({})

  /**
   * Create the context for expression evaluation
   */
  const getContext = (): ExpressionContext => {
    // Basic context from form state and external context
    return {
      // Form values from form state
      form: formState?.getData() || {},
      // External context
      context: { ...formContext },
      // Validation errors
      errors: formState?.errors || {},
      // Local context specific to this instance
      ...localContext,
    }
  }

  /**
   * Evaluate a condition with current context
   */
  const evaluateIf = (
    condition: string | boolean | undefined
  ): ComputedRef<boolean> => {
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

  /**
   * Evaluate multiple conditions at once
   */
  const evaluateMany = (
    conditionsToEvaluate: Record<string, string | boolean | undefined>
  ): ComputedRef<Record<string, boolean>> => {
    return computed(() => {
      const result: Record<string, boolean> = {}
      const context = getContext()

      for (const [key, condition] of Object.entries(conditionsToEvaluate)) {
        if (condition === undefined) {
          result[key] = true
        } else if (typeof condition === 'boolean') {
          result[key] = condition
        } else {
          result[key] = evaluateCondition(
            condition,
            context,
            config.expressions
          )
        }
      }

      return result
    })
  }

  /**
   * Track a named condition and re-evaluate when dependencies change
   */
  const trackCondition = (
    name: string,
    condition: string | boolean | undefined
  ): Ref<boolean> => {
    // Store the condition
    conditions.value[name] = condition

    // Initial evaluation
    results.value[name] = evaluateIf(condition).value

    // Create a ref for this specific condition result
    const result = computed(() => results.value[name])

    // Watch for form state changes to re-evaluate
    if (formState) {
      watch(
        () => formState.getData(),
        () => {
          results.value[name] = evaluateIf(condition).value
        },
        { deep: true }
      )
    }

    return result
  }

  /**
   * Get all tracked conditions
   */
  const trackedConditions = computed(() => results.value)

  return {
    evaluateIf,
    evaluateMany,
    trackCondition,
    trackedConditions,
  }
}
