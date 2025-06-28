<template>
  <DefaultTheme.Layout>
    <template #layout-top>
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
  padding-bottom: 80px !important;
}
body {
  --vp-layout-top-height: 60px;
}
</style>
