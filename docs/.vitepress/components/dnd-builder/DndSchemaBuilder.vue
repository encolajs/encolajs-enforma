<template>
  <div class="vp-raw dnd-builder">
    <aside class="dnd-panel">
      <h3 class="dnd-panel-title">Palette</h3>
      <DndPalette />
    </aside>

    <section class="dnd-panel">
      <div class="dnd-panel-head">
        <h3 class="dnd-panel-title">Canvas</h3>
        <button type="button" class="dnd-button" @click="tree.clear()">
          Clear
        </button>
      </div>
      <DndNodeList :parent="null" />
      <p class="dnd-hint">
        Click an item to edit it. Fields are rendered before sections, unless a
        section is placed above a field: then the items next to it get a
        <code>position</code>.
      </p>
    </section>

    <div class="dnd-output">
      <section class="dnd-panel">
        <h3 class="dnd-panel-title">Form preview</h3>
        <Enforma
          :key="previewKey"
          :schema="tree.schema.value"
          :data="formData"
          :submit-handler="submitHandler"
        />
      </section>
      <section class="dnd-panel">
        <div class="dnd-panel-head">
          <h3 class="dnd-panel-title">JSON schema</h3>
          <button type="button" class="dnd-button" @click="copyJson">
            {{ copied ? 'Copied!' : 'Copy JSON' }}
          </button>
        </div>
        <pre class="dnd-json"><code>{{ json }}</code></pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Enforma } from '@'
import DndNodeList from './DndNodeList.vue'
import DndPalette from './DndPalette.vue'
import { provideDndSchemaTree } from './useDndSchemaTree'

const tree = provideDndSchemaTree()

const formData = reactive<Record<string, any>>({})
const json = computed<string>(() => JSON.stringify(tree.schema.value, null, 2))

// The form builds its validator once, from the rules found in the schema,
// so the preview is re-created when the rules change
const previewKey = computed<string>(() =>
  Object.entries(tree.schema.value)
    .filter(([, item]) => item.rules)
    .map(([name, item]) => `${name}:${item.rules}`)
    .join('|')
)

function submitHandler(): Promise<boolean> {
  return Promise.resolve(true)
}

const copied = ref(false)
async function copyJson(): Promise<void> {
  await navigator.clipboard.writeText(json.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<style scoped>
.dnd-builder {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
.dnd-output {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.dnd-panel {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}
.dnd-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.dnd-panel-head .dnd-panel-title {
  margin: 0;
}
.dnd-panel-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.dnd-button {
  padding: 2px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  cursor: pointer;
}
.dnd-button:hover {
  border-color: var(--vp-c-brand-1);
}
.dnd-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.dnd-json {
  max-height: 480px;
  margin: 0;
  padding: 10px;
  overflow: auto;
  border-radius: 6px;
  background: var(--vp-code-block-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.5;
}
@media (max-width: 960px) {
  .dnd-builder {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
