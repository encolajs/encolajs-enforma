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
        <component
          :is="getConfig('pt.collapsible.toggle.as')"
          :id="headerId"
          type="button"
          :aria-expanded="open ? 'true' : 'false'"
          :aria-controls="bodyId"
          v-bind="getPassThroughProps('pt.collapsible.toggle')"
          @click="open = !open"
        >
          {{ title }}
          <EnformaErrorBadge
            :as="getConfig('pt.collapsible.badge.as')"
            :count="panel.errorCount"
            v-bind="getPassThroughProps('pt.collapsible.badge')"
          />
        </component>
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

    <!-- Drawn while closed too (unmount-on-hide off): its fields are checked -->
    <component
      :is="getConfig('pt.collapsible.body.as')"
      :id="bodyId"
      v-model:open="open"
      :unmount-on-hide="false"
      v-bind="getPassThroughProps('pt.collapsible.body')"
    >
      <template #content>
        <EnformaPanel :panel="panel">
          <EnformaSectionItems :name="name" />
        </EnformaPanel>
      </template>
    </component>
  </div>
</template>

<script setup lang="ts">
// A section that opens and closes as a Nuxt UI collapsible (UCollapsible, given to the preset
// as `collapsible`): a UButton (`button`) with its title and its count of errors (`badge`)
// opens and closes it, its description under it.
import { mergeProps } from 'vue'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaCollapsible } from '@/core/useEnformaCollapsible'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'NuxtUICollapsible' })

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
    open?: boolean | null
  }>(),
  { open: undefined }
)

const { getConfig, getPassThroughProps } = useFormConfig()
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
