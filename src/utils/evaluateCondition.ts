import { FormController } from '@/types'
import { EnformaConfig } from '@/utils/useConfig'
import { evaluateTemplateString } from '@/utils/exprEvaluator'
import { formReader, isFormController } from './formReader'

export function evaluateCondition(
  condition: string,
  formController: FormController | undefined,
  context: Record<string, any>,
  config: EnformaConfig
) {
  if (typeof condition !== 'string') {
    return condition
  }

  // A form whose `expressions.only` leaves `if` out keeps the condition as text
  const only = config?.expressions?.only
  if (Array.isArray(only) && !only.includes('if')) {
    return condition
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

  return evaluateTemplateString(condition, expressionContext, config)
}
