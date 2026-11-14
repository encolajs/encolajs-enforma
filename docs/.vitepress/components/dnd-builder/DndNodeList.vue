<template>
  <div class="dnd-list-wrap">
    <VueDraggable
      v-model="list"
      class="dnd-list"
      group="schema"
      handle=".dnd-handle"
      ghost-class="dnd-ghost"
      :animation="150"
    >
      <div
        v-for="node in list"
        :key="node.id"
        class="dnd-node"
        :class="{
          'dnd-node--section': node.children,
          'dnd-node--selected': node.id === tree.selectedId.value,
        }"
      >
        <div class="dnd-node-header" @click="toggleSelected(node)">
          <span class="dnd-handle" title="Drag to move" @click.stop>⠿</span>
          <span class="dnd-icon">{{ getPaletteItem(node.kind).icon }}</span>
          <span class="dnd-node-name">{{ node.name }}</span>
          <span class="dnd-node-label">
            {{ node.children ? node.props.title : node.props.label }}
          </span>
          <button
            type="button"
            class="dnd-remove"
            :title="`Remove ${node.name}`"
            @click.stop="tree.remove(node)"
          >
            ✕
          </button>
        </div>
        <DndNodeEditor v-if="node.id === tree.selectedId.value" :node="node" />
        <DndNodeList v-if="node.children" :parent="node" />
      </div>
    </VueDraggable>
    <div v-if="!list.length" class="dnd-empty">
      {{
        parent
          ? 'Drop fields or sections here'
          : 'Drag items from the palette here'
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import DndNodeEditor from './DndNodeEditor.vue'
import { getPaletteItem } from './palette'
import { useDndSchemaTree } from './useDndSchemaTree'
import type { BuilderNode } from './useDndSchemaTree'

defineOptions({ name: 'DndNodeList' })

const props = defineProps<{
  /** The section whose children are listed; `null` for the root */
  parent: BuilderNode | null
}>()

const tree = useDndSchemaTree()

const list = computed<BuilderNode[]>({
  get: () => tree.getChildren(props.parent),
  set: (value) => tree.setChildren(props.parent, value),
})

function toggleSelected(node: BuilderNode): void {
  tree.selectedId.value = tree.selectedId.value === node.id ? null : node.id
}
</script>

<style scoped>
.dnd-list-wrap {
  position: relative;
}
.dnd-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 44px;
}
.dnd-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  pointer-events: none;
}
.dnd-node {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
}
.dnd-node--section {
  background: var(--vp-c-bg-soft);
}
.dnd-node--section > .dnd-list-wrap {
  margin: 0 8px 8px 24px;
}
.dnd-node--selected {
  border-color: var(--vp-c-brand-1);
}
.dnd-node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;
}
.dnd-handle {
  color: var(--vp-c-text-3);
  cursor: grab;
  user-select: none;
}
.dnd-icon {
  display: inline-flex;
  flex-shrink: 0;
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
.dnd-node-name {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-1);
}
.dnd-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--vp-c-text-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dnd-remove {
  padding: 0 4px;
  border: none;
  background: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.dnd-remove:hover {
  color: var(--vp-c-danger-1);
}
.dnd-ghost {
  opacity: 0.4;
}
</style>
