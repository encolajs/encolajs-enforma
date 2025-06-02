<template>
  <DefaultTheme.Layout>
    <template #layout-bottom>
      <ClientOnly>
        <AnnouncementBar />
      </ClientOnly>
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import AnnouncementBar from '../components/AnnouncementBar.vue'
</script>

<style>
.VPFooter {
  padding-bottom: 72px !important;
}
</style>