<script setup>
import { ref, provide } from 'vue'

const activeTab = ref(null)
const tabs = ref([])

function registerTab(tab) {
  tabs.value.push(tab)
  if (activeTab.value === null) {
    activeTab.value = tab.name
  }
}

provide('activeTab', activeTab)
provide('registerTab', registerTab)

function selectTab(name) {
  activeTab.value = name
}
</script>

<template>
  <div class="tabs">
    <div class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="['tab-button', { active: activeTab === tab.name }]"
        @click="selectTab(tab.name)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-panels">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.custom-tabs {
}

/* Tab header bar */
.tab-nav {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
}

/* Tab buttons */
.tab-button {
  position: relative;
  padding: 0.75rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
  color: var(--vp-c-text-2);
}

/* Active tab */
.tab-button.active {
  color: var(--vp-c-brand);
  border-bottom: 2px solid var(--vp-c-brand);
}

/* Tab content container */
.tab-panel > *:not([data-active="true"]) {
  display: none;
}

.tab-panel {
  padding: 1rem;
}
</style>