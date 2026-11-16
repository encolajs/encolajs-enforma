// Gives the fields inside it the panel (a tab, a collapsible) they are in: `focusField()`
// opens it before it goes to one of them, and the panel counts those with errors.
// It draws its default slot, and nothing of its own.
import { defineComponent, inject, provide, type PropType } from 'vue'
import { enformaPanelScopeKey } from '@/constants/symbols'
import type { EnformaPanelScope, EnformaPanelState } from './useEnformaPanel'

export default defineComponent({
  name: 'EnformaPanel',

  props: {
    /** The panel, from `useEnformaPanel()` */
    panel: {
      type: Object as PropType<EnformaPanelState>,
      required: true,
    },
  },

  setup(props, { slots }) {
    const parent = inject<EnformaPanelScope | null>(enformaPanelScopeKey, null)
    provide<EnformaPanelScope>(enformaPanelScopeKey, {
      get panel() {
        return props.panel
      },
      parent,
    })
    return () => slots.default?.()
  },
})
