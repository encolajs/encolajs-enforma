<template>
  <template v-for="item in shownItems" :key="item.name">
    <!-- The form's slot for a field, `field(email)`, drawn instead of its component -->
    <EnformaFieldSlot v-if="item.slot" :name="item.name">
      <component
        :is="item.slot"
        :field="item.schema"
        :formController="formCtrl"
        :config="formConfig"
      />
    </EnformaFieldSlot>
    <component :is="item.component" v-else v-bind="item.props" />
  </template>
</template>

<script setup lang="ts">
// The items of a section of the form's schema (its fields, sub-sections and repeatables),
// drawn as EnformaSection draws them: in render order, those hidden by their `if` left out,
// each with its component or the form's slot for it. A kit's section component draws its
// own frame (a card) around them.
import { computed, inject } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import type { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import {
  useEnformaSection,
  type EnformaSectionItemKind,
} from './useEnformaSection'
import EnformaFieldSlot from './EnformaFieldSlot'

defineOptions({ name: 'EnformaSectionItems', inheritAttrs: false })

const props = defineProps<{
  /** The section's name in the schema: `default` for the root */
  name: string
  /**
   * Only the items of these kinds: a tabs section draws its own fields with
   * `['field', 'repeatable', 'content']`, and its sub-sections as tabs. All of them without it
   */
  kinds?: EnformaSectionItemKind[]
}>()

const { items } = useEnformaSection(() => props.name)
const shownItems = computed(() =>
  props.kinds
    ? items.value.filter((item) => props.kinds!.includes(item.kind))
    : items.value
)
const formCtrl = inject<FormController>(formControllerKey)
const { formConfig } = useFormConfig()
</script>
