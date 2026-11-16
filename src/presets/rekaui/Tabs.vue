<template>
  <div
    v-bind="mergeProps($attrs, getPassThroughProps('pt.tabs.root'))"
    :data-orientation="orientation"
  >
    <EnformaSectionIntro :section="section" />

    <!-- Its own fields and content, above the tabs -->
    <EnformaSectionItems
      :name="name"
      :kinds="['field', 'repeatable', 'content']"
    />

    <!-- unmount-on-hide off: every panel is drawn, one shown, so the fields of the others are checked -->
    <TabsRoot
      v-if="tabs.length > 0"
      :model-value="active ?? tabs[0].name"
      :orientation="orientation"
      :unmount-on-hide="false"
      :style="vertical ? { display: 'flex', gap: '1rem' } : undefined"
      @update:model-value="(value: string | number) => (active = String(value))"
    >
      <TabsList
        v-bind="getPassThroughProps('pt.tabs.list')"
        :style="
          vertical ? { display: 'flex', flexDirection: 'column' } : undefined
        "
      >
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.name"
          :value="tab.name"
          v-bind="getPassThroughProps('pt.tabs.tab')"
        >
          {{ labelOf(tab) }}
          <EnformaErrorBadge
            :as="getConfig('pt.tabs.badge.as')"
            :count="panelFor(tab.name).errorCount"
            v-bind="getPassThroughProps('pt.tabs.badge')"
          />
        </TabsTrigger>
      </TabsList>
      <TabsContent
        v-for="tab in tabs"
        :key="tab.name"
        :value="tab.name"
        v-bind="getPassThroughProps('pt.tabs.panel')"
        :style="vertical ? { flex: '1' } : undefined"
      >
        <EnformaPanel :panel="panelFor(tab.name)">
          <EnformaSectionIntro :section="tab.schema" hide-title />
          <EnformaSectionItems :name="tab.name" />
        </EnformaPanel>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<script setup lang="ts">
// A section drawn as Reka UI tabs (TabsRoot, TabsList, TabsTrigger, TabsContent): its
// sub-sections are the tabs, its own fields and content above them. Vertical tabs sit beside
// their panels. Each tab counts its errors in a badge, and opens as focusField() goes to a
// field inside it.
import { computed, mergeProps } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import { useFormConfig } from '@/utils/useFormConfig'
import { useEnformaTabs } from '@/core/useEnformaTabs'
import EnformaSectionIntro from '@/core/EnformaSectionIntro.vue'
import EnformaSectionItems from '@/core/EnformaSectionItems.vue'
import EnformaPanel from '@/core/EnformaPanel'
import EnformaErrorBadge from '@/core/EnformaErrorBadge.vue'

defineOptions({ name: 'RekaUITabs' })

const props = defineProps<{
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
  active?: string | null
  orientation?: 'horizontal' | 'vertical' | null
}>()

const { getConfig, getPassThroughProps } = useFormConfig()
const {
  schema: section,
  orientation,
  tabs,
  active,
  labelOf,
  panelFor,
} = useEnformaTabs(
  () => props.name,
  () => props
)

const vertical = computed(() => orientation.value === 'vertical')
</script>
