<template>
  <div class="dnd-editor">
    <label class="dnd-editor-row">
      <span>Name</span>
      <input v-model="name" type="text" spellcheck="false" />
      <small v-if="nameError" class="dnd-editor-error">{{ nameError }}</small>
    </label>

    <template v-if="node.children">
      <label class="dnd-editor-row">
        <span>Title</span>
        <input v-model="node.props.title" type="text" />
      </label>
    </template>

    <template v-else>
      <label class="dnd-editor-row">
        <span>Label</span>
        <input v-model="node.props.label" type="text" />
      </label>
      <label v-if="node.props.inputProps" class="dnd-editor-row">
        <span>Placeholder</span>
        <input v-model="node.props.inputProps.placeholder" type="text" />
      </label>
      <label class="dnd-editor-row">
        <span>Help text</span>
        <input v-model="node.props.help" type="text" />
      </label>
      <label v-if="node.kind === 'select'" class="dnd-editor-row">
        <span>Options (one per line)</span>
        <textarea v-model="options" rows="3" />
      </label>
      <label class="dnd-editor-check">
        <input v-model="required" type="checkbox" />
        Required
      </label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDndSchemaTree } from './useDndSchemaTree'
import type { BuilderNode } from './useDndSchemaTree'

const props = defineProps<{
  node: BuilderNode
}>()

const tree = useDndSchemaTree()

// the name is edited as a draft so invalid values don't reach the schema
const name = ref(props.node.name)
const nameError = ref<string | null>(null)
watch(name, (value) => {
  nameError.value = tree.rename(props.node, value)
})
watch(
  () => props.node.name,
  (value) => {
    if (!nameError.value) {
      name.value = value
    }
  }
)

const required = computed<boolean>({
  get: () => !!props.node.props.required,
  set: (value) => {
    props.node.props.required = value
    props.node.props.rules = value ? 'required' : undefined
  },
})

// a draft too, so empty lines can be typed while only the filled ones reach the schema
const options = ref<string>(
  (props.node.props.inputProps?.items || []).join('\n')
)
watch(options, (value) => {
  props.node.props.inputProps.items = value
    .split('\n')
    .map((option) => option.trim())
    .filter(Boolean)
})
</script>

<style scoped>
.dnd-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px 10px;
  border-top: 1px solid var(--vp-c-divider);
  cursor: default;
}
.dnd-editor-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.dnd-editor-row input,
.dnd-editor-row textarea {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-family: inherit;
}
.dnd-editor-row input:focus,
.dnd-editor-row textarea:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}
.dnd-editor-error {
  color: var(--vp-c-danger-1);
}
.dnd-editor-check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}
</style>
