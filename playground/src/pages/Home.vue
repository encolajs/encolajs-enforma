<template>
  <h1 class="text-2xl font-bold mb-4">Form with headless components</h1>
  <p class="mb-12">
    This page is designed to demonstrate how to use the headless components in a form.<br>
    This gives the greatest flexibility in terms of styling and layout.<br>
    However to reduce verbosity the code implements a <code>AppFormKitField</code>
    component which wraps the <code>HeadlessField</code> component
  </p>
  
  <Tabs value="0">
    <TabList>
      <Tab value="0">Preview</Tab>
      <Tab value="1">Source</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="0">
        <HeadlessForm />
      </TabPanel>
      <TabPanel value="1">
        <div class="source-code">
          <pre><code class="language-js">{{ sourceCode }}</code></pre>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup>
import {Tabs, Tab, TabList, TabPanel} from 'primevue'
import HeadlessForm from '../examples/HeadlessForm.vue';
import { ref, onMounted } from 'vue';
import sourceCodeRaw from '../examples/HeadlessForm.vue?raw'
import 'prismjs/themes/prism.css'
import Prism from 'prismjs'

const sourceCode = ref(sourceCodeRaw);

onMounted(() => {
  Prism.highlightAll();
});
</script>

<style>
.source-code {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
}

.source-code pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.source-code code {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>