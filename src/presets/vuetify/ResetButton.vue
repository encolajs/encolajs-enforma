<template>
  <v-btn
    v-bind="mergeProps($attrs, getConfig('pt.repeatable.reset'))"
    type="button"
    variant="outlined"
    @click="formState.reset()"
  >
    {{ t('Reset') }}
  </v-btn>
</template>

<script setup lang="ts">
import { useFormConfig } from '@/utils/useFormConfig'
import { inject, mergeProps, useAttrs } from 'vue'
import { useTranslation } from '@/utils/useTranslation'
import { formControllerKey } from '@/constants/symbols'
import { FormController } from '@/types'
import { VBtn } from 'vuetify/components'

const $attrs = useAttrs()
const formState = inject(formControllerKey) as FormController
const { t } = useTranslation()
const { getConfig } = useFormConfig()
</script>
