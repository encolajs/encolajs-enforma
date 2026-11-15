<template>
  <Enforma
    ref="form"
    :data="data"
    :validator="validator"
    :submit-handler="save"
    :show-reset-button="true"
  >
    <EnformaField name="name" label="Name" />
    <EnformaField
      name="photo"
      label="Photo (up to 1 MB)"
      :input-component="UploadInput"
    />

    <!-- the submit button is disabled meanwhile -->
    <p v-if="form?.$isPending">Waiting for the upload to finish…</p>
  </Enforma>

  <pre v-if="saved">Saved: {{ saved }}</pre>
</template>

<script setup>
import { ref } from 'vue'
import { Enforma, EnformaField } from '@'
import { createEncolaValidator } from '@/validators/encolaValidator'
import UploadInput from './UploadInput.vue'

const form = ref(null)
const data = ref({ name: 'Jane Doe', photo: null })
const saved = ref(null)

// a failed upload leaves the photo empty, and the rule refuses the submit
const validator = createEncolaValidator({
  name: 'required',
  photo: 'required',
})

async function save(values) {
  saved.value = JSON.stringify(values)
}
</script>
