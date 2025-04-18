<script setup>
import { inject, onMounted } from 'vue'

const props = defineProps({
  name: String,
  label: String,
})

const activeTab = inject('activeTab')
const registerTab = inject('registerTab')

onMounted(() => {
  registerTab({ name: props.name, label: props.label })
})
</script>

<template>
  <div v-show="activeTab === name">
    <slot />
  </div>
</template>
