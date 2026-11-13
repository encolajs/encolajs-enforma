<template>
  <UApp>
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-4">{{title}}</h1>
      <FieldsFormExample />
    </div>
  </UApp>
</template>

<script setup>
import UApp from '@nuxt/ui/components/App.vue'
import FieldsFormExample from './components/FieldsFormExample.vue';
</script>
