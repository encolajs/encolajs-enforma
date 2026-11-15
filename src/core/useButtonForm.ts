/**
 * The form a submit or reset button acts on.
 *
 * A button outside its form (in a modal's footer, or beside a page's title) is given the form
 * through its `form` prop: a ref to the `<Enforma>`, or the controller from `useForm()`. A
 * button in its form is given none, and acts on the form it's in. A given form is `null` until
 * its `<Enforma>` mounts, and the button waits for it.
 */
import { computed, inject, unref, type ComputedRef } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import type { FormController } from '@/types'

export interface ButtonForm {
  /** The form's controller (or a ref to its `<Enforma>`), null while there's none */
  controller: ComputedRef<FormController | null>
  /** Whether the form is submitting */
  isSubmitting: ComputedRef<boolean>
  /** Whether the form waits for pending work (an upload), and won't submit */
  isPending: ComputedRef<boolean>
  /**
   * The form's id, for the button's `form` attribute, when the button is given its form. A
   * button in its form is left to that form, which may be a host's own, with no id.
   */
  formId: ComputedRef<string | undefined>
  /** Warns, in development, when the button that was clicked belongs to no `<form>` */
  checkFormOwner(event: Event): void
}

/** The form the `button` acts on: `form()`, the one it's given, or the one it's in. */
export function useButtonForm(
  form: () => object | null | undefined,
  button: string
): ButtonForm {
  const injected = inject<FormController | null>(formControllerKey, null)
  const controller = computed(() => {
    const given = form()
    return (given === undefined ? injected : given) as FormController | null
  })

  if (
    process.env.NODE_ENV !== 'production' &&
    form() === undefined &&
    !injected
  ) {
    console.warn(
      `[Enforma] <${button}> is outside any form and given none: pass it the form with :form`
    )
  }

  // A ref to an <Enforma> reads its state unwrapped, a controller as refs
  const isSubmitting = computed(() => !!unref(controller.value?.$isSubmitting))
  const isPending = computed(() => !!unref(controller.value?.$isPending))
  const formId = computed(() =>
    form() ? unref(controller.value?.$formId) : undefined
  )

  function checkFormOwner(event: Event): void {
    if (process.env.NODE_ENV === 'production') return
    const element = (event?.target as Element | null)?.closest?.('button')
    if (element && !element.form) {
      console.warn(
        `[Enforma] <${button}> has no <form> it belongs to` +
          (formId.value
            ? `: no <form id="${formId.value}"> is on the page (bind the controller's $formAttrs to your <form>)`
            : ': give it the form with :form')
      )
    }
  }

  return { controller, isSubmitting, isPending, formId, checkFormOwner }
}
