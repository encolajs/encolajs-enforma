<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Enforma Fields Example</h1>
    <FieldsFormExample />
  </div>
</template>

<script setup>
import FieldsFormExample from './components/FieldsFormExample.vue';
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 2rem;
}
.grid {
  display: grid;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.gap-4 {
  gap: 1rem;
}
.col-start-1 {
  grid-column-start: 1;
}
.col-start-2 {
  grid-column-start: 2;
}
.col-end-2 {
  grid-column-end: 2;
}
.col-end-3 {
  grid-column-end: 3;
}
.mb-4 {
  margin-bottom: 1rem;
}
.mt-8 {
  margin-top: 2rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.me-2 {
  margin-right: 0.5rem;
}
.w-full {
  width: 100%;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.align-center {
  align-items: center;
}
.gap-1 {
  gap: 0.25rem;
}
.gap-2 {
  gap: 0.5rem;
}
.text-red-500 {
  color: #ef4444;
}
.toggle-field .p-toggleswitch {
  margin-right: 0.5rem;
}
</style>
