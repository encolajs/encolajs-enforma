---
layout: home
sidebar: true

title: EncolaJS Enforma
titleTemplate: Complete form solution for VueJS applications

hero:
  name: EncolaJS Enforma
  text: Build powerful forms with ease
  tagline: Create everything from simple forms to complex, dynamic forms. Support for both field-based and schema forms. 30+ built-in validation rules. Presets for you favorite UI library.
  image:
    src: /enforma-hero.png
    alt: EncolaJS Enforma

  actions:
    - theme: brand
      text: Get Started
      link: /getting-started.md

    - theme: alt
      text: View on GitHub
      link: https://github.com/encolajs/encolajs-enforma

features:
  - icon: 📊
    title: Complex Data Handling
    details: Built-in support for nested forms, repeatable fields, and complex data structures.
  - icon: ✅
    title: Powerful Validation
    details: Comprehensive validation system with built-in rules and custom validation support.
  - icon: 📝
    title: Schema-Driven Forms
    details: Define your forms using a simple, declarative JSON schema. No more boilerplate code.
  - icon: 🎨
    title: UI Framework Integration
    details: Ready-to-use integrations with popular UI frameworks like PrimeVue, Vuetify and Quasar.
  - icon: 🔄
    title: Reactive State
    details: Form state is fully reactive and accessible throughout your component tree.
  - icon: 🧩
    title: Headless Architecture
    details: Complete control over your UI with headless components and composables.
---

<script setup>
import MailerLiteForm from '.vitepress/components/MailerLiteForm.vue'
</script>

<div class="text-center">
<h3>Launching Soon!</h3>

<p>Enforma is still under development but we plan to launch by the end of June 2025.<br>Don't miss out! Subscribe to our mailing list for the official launch announcement of Enforma library.</p>

<!-- MailerLite Universal -->
<ClientOnly>
    <MailerLiteForm />
</ClientOnly>
<!-- End MailerLite Universal -->


</div>

<style>
.VPHero .image {
  max-width: 100%;
}
.VPHero .image-container {
  max-width: 100% !important;
  transform: none;
  padding: 0;
  margin: 0;
}
.VPHero .image-bg {
  display: none;
}
.VPHero .image-src {
  width: 100% !important;
  max-width: 100% !important;
  max-height: none;
  top: 0;
  left: 0;
  position: relative;
  transform: none;
}
</style>