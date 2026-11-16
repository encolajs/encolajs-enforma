// Around a field the form's slot draws instead of its component (`field(email)`): the form
// checks the field while the slot is drawn, as it checks a field whose component is. It answers
// focusField() for the field, opening the panels holding it, scrolling what the slot draws
// into view and focusing the element with the field's id, when the slot gave one that id. The
// panels count the field while it has errors. It draws the slot, and nothing of its own.
import {
  defineComponent,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
} from 'vue'
import { formControllerKey } from '@/constants/symbols'
import type { FormController } from '@/types'
import {
  hasErrorsAt,
  inputIn,
  rootElementOf,
  useFocusTarget,
} from './useFocusTarget'

export default defineComponent({
  name: 'EnformaFieldSlot',

  props: {
    /** The field's path */
    name: { type: String, required: true },
  },

  setup(props, { slots }) {
    const formCtrl = inject<FormController | undefined>(
      formControllerKey,
      undefined
    )
    // The field's state, which the form checks, until the slot goes (a field hidden by its `if`)
    formCtrl?.getField(props.name)
    onBeforeUnmount(() => formCtrl?.removeField(props.name))

    const instance = getCurrentInstance()
    const element = () => rootElementOf(instance)
    useFocusTarget(formCtrl, {
      path: () => props.name,
      element,
      input: () =>
        formCtrl?.hasField(props.name)
          ? inputIn(element(), formCtrl.getField(props.name)._id)
          : null,
      hasError: () => hasErrorsAt(formCtrl, props.name),
    })
    return () => slots.default?.()
  },
})
