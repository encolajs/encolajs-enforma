<script setup>
import { useData, useRoute } from 'vitepress'
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    // [{ label: 'Intro', link: '/guide/intro' }]
  },
})

const { site } = useData()
const route = useRoute()

const base = computed(() => site.value.base.replace(/\/$/, ''))

// normalize to remove trailing slashes and .html
const normalize = (path) => path.replace(/\/$/, '').replace(/\.html$/, '')

const currentPath = computed(() => normalize(route.path))

const buildHref = (link) => {
  const normalized = link.replace(/\/$/, '')
  return `${base.value}${normalized}.html`
}

const isActive = (link) => {
  return currentPath.value === normalize(`${base.value}${link}`)
}
</script>

<template>
  <div class="tab-nav">
    <a
      v-for="item in items"
      :key="item.link"
      :href="buildHref(item.link)"
      class="tab-button"
      :class="{ active: isActive(item.link) }"
    >
      {{ item.label }}
    </a>
  </div>
</template>

<style scoped>
.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.tab-button {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.tab-button:hover {
  color: var(--vp-c-text-1);
}

.tab-button.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}
</style>
