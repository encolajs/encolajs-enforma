<template>
  <Button
    v-bind="$attrs"
    severity="primary"
    type="submit"
    :loading="formState.isSubmitting.value"
    :disabled="formState.isSubmitting.value"
  >
    {{ formState.isSubmitting.value ? 'Submitting...' : 'Submit' }}
  </Button>
</template>
<script setup lang="ts">
import { Button } from 'primevue'
import { inject } from 'vue'
import { formStateKey } from '@/constants/symbols'

const formState = inject(formStateKey)
</script>
