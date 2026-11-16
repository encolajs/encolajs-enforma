// Around a field the form's slot draws instead of its component (`field(email)`): it answers
// focusField() for the field, opening the panels holding it, scrolling what the slot draws
// into view and focusing the element with the field's id, when the slot gave one that id. The
// panels count the field while it has errors. It draws the slot, and nothing of its own.
import { defineComponent, getCurrentInstance, inject } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import type { FormController } from '@/types'
import {
  elementById,
  hasErrorsAt,
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
    const instance = getCurrentInstance()
    const element = () => rootElementOf(instance)
    useFocusTarget(formCtrl, {
      path: () => props.name,
      element,
      input: () =>
        formCtrl?.hasField(props.name)
          ? elementById(element(), formCtrl.getField(props.name)._id)
          : null,
      hasError: () => hasErrorsAt(formCtrl, props.name),
    })
    return () => slots.default?.()
  },
})
