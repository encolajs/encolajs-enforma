<script setup>
import ProfileForm from './file-upload/ProfileForm.vue'
</script>

# File Upload

A photo field uploads the file as soon as the user picks it, and the form stores what the server answers: the id of the uploaded file. Until the upload is done, the form can't be submitted.

The form doesn't upload anything itself. The input hands its upload to the form with `track()`, and the form waits for it ([see Pending Work](/core-concepts/pending-work.md)):

- the submit button is disabled (without showing it's submitting), and `submit()` returns `false`;
- the form, and the field, are `aria-busy`;
- `$isPending` is true, for a hint like "Waiting for the upload to finish".

Pick a file under 1 MB to see it upload, one over 1 MB to see it fail, and Reset while it uploads to see the form drop it.

<ClientOnly>
    <LiveDemo :component="ProfileForm"></LiveDemo>
</ClientOnly>

## The Input

The input is a component of your own, given to the field as its `inputComponent`:

```vue
<EnformaField name="photo" label="Photo" :input-component="UploadInput" />
```

It gets the form with `inject(formControllerKey)`, and its field's path as its `name` prop. When a file is picked, it gives `track()` the upload and the path, then sets the field's value to the id:

```js
const { id } = await form.track((signal) => upload(file, signal), props.name)
await form.setFieldValue(props.name, id)
```

`track()` takes the upload as a function, which it calls with a signal. Pass the signal to `fetch()`: when the form drops the upload, the signal aborts, and the request stops. The form drops it when:

- the form is reset;
- the field is removed (hidden by its `if`, or its row removed from a repeatable);
- the field's path changes, as its row moves in a repeatable.

A dropped upload makes `track()` reject with an `AbortError`, so the line that sets the value doesn't run, and an upload that answers late can't set a value the form no longer expects. The input clears itself instead of showing an error.

A failed upload makes `track()` reject with the upload's error, which the input shows. The form only stops waiting: the field keeps no value, so a `required` rule refuses the submit.

> [!WARNING] Don't pass Enforma's `value`, `onInput` or `onChange` to the `<input type="file">`
> They read and set the input's value, which for a file input is the file's path. The input below binds the other attributes (`id`, `aria-*`) and sets the field's value with `setFieldValue()`.

## Source Code

::: code-group
<<< @/recipes/file-upload/UploadInput.vue [UploadInput.vue]
<<< @/recipes/file-upload/upload.js [upload.js]
<<< @/recipes/file-upload/ProfileForm.vue [ProfileForm.vue]
:::

## Showing the Progress

`fetch()` can't tell how much of the file it has sent, `XMLHttpRequest` can. Its progress arrives in events, and so does its end, so register the upload with `beginPending()` instead of `track()`: it gives `done()`, to call however the request ends, and the signal:

```js
const progress = ref(0)

function onPick(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const { done, signal } = form.beginPending(props.name)
  const request = new XMLHttpRequest()
  signal.addEventListener('abort', () => request.abort())

  request.upload.onprogress = (e) => (progress.value = e.loaded / e.total)
  request.onload = () => {
    if (request.status < 300 && !signal.aborted) {
      form.setFieldValue(props.name, JSON.parse(request.responseText).id)
    }
    done()
  }
  request.onerror = request.onabort = request.ontimeout = () => done()

  const body = new FormData()
  body.append('file', file)
  request.open('POST', '/api/uploads')
  request.send(body)
}
```

Every way the request can end calls `done()`: one it misses keeps the form waiting until it's reset. Calling `done()` twice, or after the form dropped the upload, does nothing.

For several files, a headless form, or work that isn't an upload, see [Pending Work](/core-concepts/pending-work.md).
