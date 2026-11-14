<template>
  <VueDraggable
    v-model="items"
    class="dnd-palette"
    :group="{ name: 'schema', pull: 'clone', put: false }"
    :sort="false"
    :clone="tree.createNode"
  >
    <div
      v-for="item in items"
      :key="item.kind"
      class="dnd-palette-item"
      role="button"
      tabindex="0"
      :title="`Drag onto the canvas or click to add a ${item.label.toLowerCase()}`"
      @click="tree.append(item)"
      @keydown.enter.prevent="tree.append(item)"
      @keydown.space.prevent="tree.append(item)"
    >
      <span class="dnd-icon">{{ item.icon }}</span>
      {{ item.label }}
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { paletteItems } from './palette'
import { useDndSchemaTree } from './useDndSchemaTree'

const tree = useDndSchemaTree()
const items = ref(paletteItems)
</script>

<style scoped>
.dnd-palette {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dnd-palette-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  cursor: grab;
  user-select: none;
}
.dnd-palette-item:hover,
.dnd-palette-item:focus-visible {
  border-color: var(--vp-c-brand-1);
  outline: none;
}
.dnd-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 600;
}
</style>
