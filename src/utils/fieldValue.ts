import type { FormController } from '@/types'

/**
 * The value of the field at `path`, read as the form's values change (it depends on the
 * form's version). A field reads its own value with it, never as `form[path]`: the
 * controller's proxy gives its own method there for a field named like one (`track`,
 * `commit`, `reset`, `values`…)
 */
export function fieldValue(form: FormController, path: string): any {
  void (form as any).$formVersion
  return form.getFieldValue(path)
}
