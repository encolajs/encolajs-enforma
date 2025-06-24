<template>
  <button 
    @click="openStackBlitz" 
    class="stackblitz-button"
    :disabled="loading"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 32 32" width="1em" height="1em"><path d="M5.853 18.647h8.735L9.45 31l16.697-17.647h-8.735L22.55 1z"></path></svg>
    {{ loading ? 'Opening...' : 'Open in StackBlitz' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import sdk from '@stackblitz/sdk'
import packageJsonRaw from '../stackblitz/package.json?raw'
import packageLockJsonRaw from '../stackblitz/package-lock.json?raw'
import indexHtmlRaw from '../stackblitz/index.html?raw'
import tsconfigRaw from '../stackblitz/tsconfig.json?raw'
import viteConfigRaw from '../stackblitz/vite.config.ts?raw'
import mainTsRaw from '../stackblitz/src/main.ts?raw'
import appVueRaw from '../stackblitz/src/App.vue?raw'
import fieldsFormExampleRaw from '../../examples/enforma/FieldsFormExample.vue?raw'
import mixedFormExampleRaw from '../../examples/enforma/MixedFormExample.vue?raw'
import schemaFormExampleRaw from '../../examples/enforma/SchemaFormExample.vue?raw'
import endDateFieldRaw from '../../examples/enforma/EndDateField.vue?raw'
import salaryFieldRaw from '../../examples/enforma/SalaryField.vue?raw'
import useFormConfigRaw from '../../examples/headless/useFormConfig.ts?raw'

const loading = ref(false)

const props = defineProps({
  title: {
    type: String,
    default: 'Enforma Example'
  },
  openFile: {
    type: String,
    default: 'App.vue'
  },
  component: {
    type: String,
    default: 'FieldsFormExample'
  },
})

const files = {
  '.stackblitzrc': `{
  "installDependencies": true,
  "startCommand": "npm run dev"
}`,
  'package.json': packageJsonRaw,
  'package-lock.json': packageLockJsonRaw,
  'vite.config.ts': viteConfigRaw,
  'tsconfig.json': tsconfigRaw,
  'index.html': indexHtmlRaw,
  'src/main.ts': mainTsRaw,
  'src/App.vue': appVueRaw.replaceAll('FieldsFormExample', props.component, true).replaceAll('{{title}}', props.title, true),
  'src/components/FieldsFormExample.vue': fieldsFormExampleRaw,
  'src/components/MixedFormExample.vue': mixedFormExampleRaw,
  'src/components/SchemaFormExample.vue': schemaFormExampleRaw,
  'src/components/EndDateField.vue': endDateFieldRaw,
  'src/components/SalaryField.vue': salaryFieldRaw,
  'src/composables/useFormConfig.ts': useFormConfigRaw
}

Object.keys(files).map((k) => {
  let file = files[k]
  file = file.replace(`from '@'`, `from '@encolajs/enforma'`)
  file = file.replace(`from "@"`, `from '@encolajs/enforma'`)
  file = file.replace('headless/useFormConfig', 'composables/useFormConfig')


  files[k] = file
})


const openStackBlitz = async () => {
  loading.value = true
  
  try {
    await sdk.openProject({
      title: props.title,
      description: 'Example for the Enforma, a VueJS form library',
      template: 'node',
      files,
    }, {
      openFile: props.openFile,
      width: 800,
    })
  } catch (error) {
    console.error('Failed to open StackBlitz:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.stackblitz-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  margin-bottom: 1rem;
}

.stackblitz-button:hover {
  background: #1565c0;
}

.stackblitz-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.stackblitz-button svg {
  display: inline-block;
  margin-right: 0.5rem;
  margin-bottom: -0.1rem;
}
</style>