<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow mb-4">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <h1 class="text-xl font-semibold text-center">FormKit Playground</h1>
      </div>
    </nav>
    <AppHeader />

    <div class="max-w-7xl mx-auto px-4">
      <div id="page-content" class="bg-white rounded shadow p-4">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
</script>