<template>
  <h1 class="text-2xl font-bold mb-4">Form with headless components</h1>
  <p class="mb-12">
    This page is designed to demonstrate how to use the headless components in a form.<br>
    This gives the greatest flexibility in terms of styling and layout.<br>
    However to reduce verbosity the code implements a <code>AppFormKitField</code>
    component which wraps the <code>HeadlessField</code> component
  </p>

  <HeadlessForm />
</template>

<script setup>
import HeadlessForm from '../examples/HeadlessForm.vue';
</script>