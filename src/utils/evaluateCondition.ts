import { FormController } from '@/types'
import { EnformaConfig } from '@/utils/useConfig'
import { evaluateTemplateString } from '@/utils/exprEvaluator'

export function evaluateCondition(
  condition: string,
  formController: FormController | undefined,
  context: Record<string, any>,
  config: EnformaConfig
) {
  if (typeof condition !== 'string') {
    return condition
  }

  const expressionContext = {
    // Form controller (not just values)
    form: formController ?? {},
    // External context
    context: { ...context },
    // Form configuration
    config,
  }

  return evaluateTemplateString(condition, expressionContext, config)
}
