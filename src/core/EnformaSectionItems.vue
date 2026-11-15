<template>
  <template v-for="item in items" :key="item.name">
    <!-- The form's slot for a field, `field(email)`, drawn instead of its component -->
    <component
      :is="item.slot"
      v-if="item.slot"
      :field="item.schema"
      :formController="formCtrl"
      :config="formConfig"
    />
    <component :is="item.component" v-else v-bind="item.props" />
  </template>
</template>

<script setup lang="ts">
// The items of a section of the form's schema (its fields, sub-sections and repeatables),
// drawn as EnformaSection draws them: in render order, those hidden by their `if` left out,
// each with its component or the form's slot for it. A kit's section component draws its
// own frame (a card) around them.
import { inject } from 'vue'
import { formControllerKey } from '@/constants/symbols'
import type { FormController } from '@/types'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaSection } from './useEnformaSection'

defineOptions({ name: 'EnformaSectionItems', inheritAttrs: false })

const props = defineProps<{
  /** The section's name in the schema: `default` for the root */
  name: string
}>()

const { items } = useEnformaSection(() => props.name)
const formCtrl = inject<FormController>(formControllerKey)
const { formConfig } = useFormConfig()
</script>
