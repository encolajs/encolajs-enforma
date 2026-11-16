<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.collapsible.root'))"
    :data-state="open ? 'open' : 'closed'"
  >
    <div v-bind="getPassThroughProps('pt.collapsible.header')">
      <component
        :is="section.titleComponent || 'h2'"
        v-bind="
          mergeProps(
            section.titleProps || {},
            getPassThroughProps('pt.collapsible.title')
          )
        "
      >
        <button
          :id="headerId"
          type="button"
          :aria-expanded="open ? 'true' : 'false'"
          :aria-controls="bodyId"
          v-bind="getPassThroughProps('pt.collapsible.toggle')"
          @click="open = !open"
        >
          {{ title }}
          <EnformaErrorBadge
            :count="panel.errorCount"
            v-bind="getPassThroughProps('pt.collapsible.badge')"
          />
        </button>
      </component>
      <!-- Under the title, read while the collapsible is closed -->
      <component
        :is="section.descriptionComponent || 'p'"
        v-if="section.description"
        v-bind="
          mergeProps(
            section.descriptionProps || {},
            getPassThroughProps('pt.collapsible.description')
          )
        "
      >
        {{ section.description }}
      </component>
    </div>

    <!-- Drawn while closed too: its fields are checked -->
    <div
      v-show="open"
      :id="bodyId"
      role="region"
      :aria-labelledby="headerId"
      v-bind="getPassThroughProps('pt.collapsible.body')"
    >
      <EnformaPanel :panel="panel">
        <EnformaSectionItems :name="name" />
      </EnformaPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
// A section that opens and closes: its title is the button doing it, with how many of its
// fields have errors, its description under it; its items are its body. Open at first,
// unless `props.open` is false. It opens as focusField() goes to one of its fields.
import { mergeProps } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaCollapsible } from './useEnformaCollapsible'
import EnformaSectionItems from './EnformaSectionItems.vue'
import EnformaPanel from './EnformaPanel'
import EnformaErrorBadge from './EnformaErrorBadge.vue'

defineOptions({ name: 'EnformaCollapsible' })

// `open` left out stays undefined, not false (as a Boolean prop would be): open at first
const props = withDefaults(
  defineProps<{
    name: string
    title?: string
    titleComponent?: string | object
    titleProps?: object | null
    description?: string
    descriptionComponent?: string | object
    descriptionProps?: object | null
    section?: string | null
    position?: number | null
    columns?: number | Record<string, number> | null
    span?: number | Record<string, number> | null
    /** Whether it is open at first: it is, unless this is false */
    open?: boolean | null
  }>(),
  { open: undefined }
)

const { getPassThroughProps } = useFormConfig()
const {
  schema: section,
  title,
  open,
  panel,
  headerId,
  bodyId,
} = useEnformaCollapsible(
  () => props.name,
  () => props
)
</script>
