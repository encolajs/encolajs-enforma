<template>
  <button 
    @click="openStackBlitz" 
    class="stackblitz-button"
    :disabled="loading"
  >
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
import fieldsFormExampleRaw from '../stackblitz/src/components/FieldsFormExample.vue?raw'
import endDateFieldRaw from '../stackblitz/src/components/EndDateField.vue?raw'
import salaryFieldRaw from '../stackblitz/src/components/SalaryField.vue?raw'
import useFormConfigRaw from '../stackblitz/src/composables/useFormConfig.ts?raw'

const loading = ref(false)

const openStackBlitz = async () => {
  loading.value = true
  
  try {
    await sdk.openProject({
      title: 'Enforma Fields Example',
      description: 'Vue form library with field components example',
      template: 'node',
      files: {
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
        'src/App.vue': appVueRaw,
        'src/components/FieldsFormExample.vue': fieldsFormExampleRaw,
        'src/components/EndDateField.vue': endDateFieldRaw,
        'src/components/SalaryField.vue': salaryFieldRaw,
        'src/composables/useFormConfig.ts': useFormConfigRaw
      },
    }, {
      openFile: 'src/components/FieldsFormExample.vue'
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
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 16px;
}

.stackblitz-button:hover {
  background: #1565c0;
}

.stackblitz-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>