<template>
  <Button
    v-bind="$attrs"
    severity="secondary"
    type="submit"
    :disabled="formState.isSubmitting.value"
  >
    {{ 'Reset' }}
  </Button>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
import { inject } from 'vue'
import { formStateKey } from '../../constants/symbols'

const formState = inject(formStateKey)
</script>
