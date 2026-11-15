<!--
An input that uploads the file as soon as it's picked. The form waits for the upload
(form.track()), and won't submit before it's done. The field's value is the id the server
stores the file under.
-->
<template>
  <div>
    <input
      ref="input"
      type="file"
      :name="name"
      v-bind="inputAttrs"
      @change="onPick"
    />
    <p v-if="uploading">Uploading {{ fileName }}…</p>
    <p v-else-if="failure" role="alert">{{ failure }}</p>
    <p v-else-if="modelValue">Uploaded {{ fileName }}</p>
  </div>
</template>

<script setup>
import { computed, inject, ref, useAttrs, watch } from 'vue'
import { formControllerKey } from '@'
import { upload } from './upload'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // the field's path, which Enforma gives its input
  name: { type: String, required: true },
  modelValue: { type: String, default: null },
})

const form = inject(formControllerKey)
const input = ref(null)
const uploading = ref(false)
const fileName = ref('')
const failure = ref('')

// Enforma's attributes for the input (id, aria-*), without its value and listeners: those
// read and set the <input>'s value, which for a file input is the file's path, not its id
const attrs = useAttrs()
const inputAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([key]) => !['value', 'invalid'].includes(key) && !/^on[A-Z]/.test(key)
    )
  )
)

async function onPick(event) {
  const file = event.target.files?.[0]
  if (!file) return
  fileName.value = file.name
  failure.value = ''
  uploading.value = true
  try {
    // the form is pending until the upload settles
    const { id } = await form.track(
      (signal) => upload(file, signal),
      props.name
    )
    await form.setFieldValue(props.name, id)
  } catch (error) {
    // the form dropped the upload: it was reset, or the field removed
    if (error.name === 'AbortError') return clear()
    failure.value = error.message
  } finally {
    uploading.value = false
  }
}

// the form's value cleared (reset): the input lets go of its file too
watch(
  () => props.modelValue,
  (value) => value || clear()
)

function clear() {
  fileName.value = ''
  if (input.value) input.value.value = ''
}
</script>
