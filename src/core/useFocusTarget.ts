/**
 * What makes a part of the form (an Enforma field) answer `focusField(path)`: it registers with
 * the panels holding it, which count it while it has errors, and with the form controller,
 * which places it on the page and asks it to show itself.
 */
import {
  nextTick,
  onBeforeUnmount,
  type ComponentInternalInstance,
  type VNode,
} from 'vue'
import { formFocusTargetsKey } from '@/constants/symbols'
import type { FocusTarget, FormController } from '@/types'
import { registerInPanels, type EnformaPanelState } from './useEnformaPanel'

export interface FocusTargetOptions {
  /** The path it answers for, read as it's needed */
  path: () => string
  /** The element scrolled into view, which also places it on the page */
  element: () => Element | null | undefined
  /** The element focused, when there is one that can take focus */
  input?: () => HTMLElement | null | undefined
  /** Whether it has errors, which the panels holding it count */
  hasError: () => boolean
}

/**
 * The first element a component draws: its root element, or the first element of the
 * fragment it draws (a slot giving several nodes)
 */
export function rootElementOf(
  instance: ComponentInternalInstance | null
): Element | null {
  let tree: VNode | null | undefined = instance?.subTree
  // A component drawing another (a slot's function): what that one draws
  while (tree?.component) tree = tree.component.subTree
  if (!tree || typeof Element === 'undefined') return null
  if (tree.el instanceof Element) return tree.el
  // A fragment: its nodes sit between its two anchors
  for (
    let node = (tree.el as Node | null)?.nextSibling;
    node && node !== tree.anchor;
    node = node.nextSibling
  ) {
    if (node instanceof Element) return node
  }
  return null
}

/** The element with the id `id`: `root` itself, one inside it, or one elsewhere in the page */
export function elementById(
  root: Element | null | undefined,
  id: string | null | undefined
): HTMLElement | null {
  if (!id) return null
  if (root?.id === id) return root as HTMLElement
  const inRoot = root?.querySelector<HTMLElement>(
    `[id="${id.replace(/["\\]/g, '\\$&')}"]`
  )
  if (inRoot) return inRoot
  return typeof document === 'undefined' ? null : document.getElementById(id)
}

/**
 * Whether the field at `path` has errors, without giving it a state where it has none (the
 * form would then check it). Read again as validate() ends and as array items move
 */
export function hasErrorsAt(
  formCtrl: FormController | undefined,
  path: string
): boolean {
  if (!formCtrl) return false
  void formCtrl.$isValidating?.value
  void (formCtrl as any).$formVersion
  return (
    formCtrl.hasField(path) && formCtrl.getField(path).$errors.value.length > 0
  )
}

/**
 * Whether an element is hidden: it, or an element around it, has the `hidden` attribute (Reka
 * UI's and Nuxt UI's closed panels) or `display: none` in its style (`v-show`)
 */
function isHidden(element: Element): boolean {
  for (let node: Element | null = element; node; node = node.parentElement) {
    if ((node as HTMLElement).hidden) return true
    if ((node as HTMLElement).style?.display === 'none') return true
  }
  return false
}

/**
 * Waits 16ms: a timer rather than an animation frame, which a browser doesn't give a tab in the
 * background
 */
const nextFrame = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 16))

/**
 * Waits until the element shows, 16ms at a time, for a second at most: a UI library's panel
 * may show what it holds some ticks after it is opened
 */
async function shown(element: Element): Promise<void> {
  const until = Date.now() + 1000
  while (isHidden(element) && Date.now() < until) await nextFrame()
}

/**
 * Opens the panels, the outermost first, a tick after each so what they show is drawn, waits
 * until the element shows, then scrolls it to the middle of the view (smoothly, unless the
 * user asks for less motion) and focuses the input without scrolling again
 */
export async function revealAndFocus(
  panels: EnformaPanelState[],
  element: () => Element | null | undefined,
  input?: () => HTMLElement | null | undefined
): Promise<void> {
  for (const panel of panels) {
    await panel.reveal()
    await nextTick()
  }
  const target = element()
  if (!target) return
  if (isHidden(target)) await shown(target)
  const lessMotion =
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView?.({
    block: 'center',
    behavior: lessMotion ? 'auto' : 'smooth',
  })
  input?.()?.focus?.({ preventScroll: true })
}

/**
 * After a refused submit, goes to the first field with errors (`focusFirstError()`) once its
 * error is drawn, unless the form's config turns it off (`behavior.focusFirstError: false`)
 */
export function goToFirstError(
  formCtrl: FormController,
  config: { behavior?: { focusFirstError?: boolean } } | null | undefined
): void {
  if (config?.behavior?.focusFirstError === false) return
  void nextTick(() => formCtrl.focusFirstError())
}

/**
 * Registers the calling component (in its `setup()`) as what answers `focusField()` for its
 * path, until it unmounts
 */
export function useFocusTarget(
  formCtrl: FormController | undefined,
  options: FocusTargetOptions
): void {
  const panels = registerInPanels({
    path: options.path,
    hasError: options.hasError,
  })
  const target: FocusTarget = {
    path: options.path,
    element: options.element,
    focus: () => revealAndFocus(panels(), options.element, options.input),
  }
  const register = (formCtrl as any)?.[formFocusTargetsKey] as
    | ((target: FocusTarget) => () => void)
    | undefined
  const unregister = register?.(target)
  if (unregister) onBeforeUnmount(unregister)
}
