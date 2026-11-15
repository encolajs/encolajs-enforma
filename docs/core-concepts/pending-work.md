# Pending Work

Some fields start work of their own while the user fills in the form: an upload that starts as a file is picked, a check that a username is free. The form shouldn't submit before that work is done. Hand the work to the form, and it waits for it.

> :notebook_with_decorative_cover: See it in the [File Upload recipe](/recipes/file-upload.md)

## Handing Work to the Form

`track()` takes a promise, and the path of the field it's for. The form waits until the promise settles, whether it resolves or rejects, and `track()` gives what the promise gives:

```js
const { id } = await form.track(upload(file), 'photo')
```

Given a function instead, `track()` calls it with an `AbortSignal`, which aborts when the form drops the work (see [Dropped Work](#dropped-work)). Pass it to `fetch()`, so the request stops:

```js
const { id } = await form.track((signal) => upload(file, signal), 'photo')
```

When the work starts and ends in different places, as a request that reports its progress in events does, register it with `beginPending()`. It gives `done()`, to call when the work ends, however it ends, and the signal:

```js
const { done, signal } = form.beginPending('photo')
request.onload = request.onerror = request.onabort = () => done()
```

Calling `done()` more than once does nothing. A path-less call (`form.track(promise)`, `form.beginPending()`) is work for the form itself, not a field.

A field can have several pieces of work running, as several files upload: it's pending until they're all done.

## While Work Is Pending

- `form.$isPending` is true, and so is `form['photo.$isPending']` for the field (both read-only)
- `submit()` returns `false` without validating, marking fields touched, or emitting an event. Pressing Enter in a field doesn't submit either. When work starts while the form validates, `submit()` returns `false` before calling the submit handler.
- the submit button is disabled, inside the form or [outside it](/recipes/form-in-modal.md). It doesn't show it's submitting: it's waiting.
- the form, and the field, are `aria-busy`
- an expression reads `form.$isPending`, to show a hint like "Waiting for the upload to finish"

Resetting the form still works.

## Dropped Work

The form stops waiting for work it no longer needs. It drops:

- all work, when the form is reset
- a field's work, when the field is removed: hidden by its `if`, or its row removed from a repeatable
- a field's work, when its path changes, as its row moves in a repeatable (moved, sorted, or another row added or removed before it)

Dropped work stops counting, its signal aborts, and `track()` rejects with an `AbortError` at once. So the code after `await form.track(…)`, which sets the field's value, doesn't run, and work that settles late can't set a value the form no longer expects. Skip the `AbortError` when you show errors:

```js
try {
  const { id } = await form.track((signal) => upload(file, signal), props.name)
  await form.setFieldValue(props.name, id)
} catch (error) {
  if (error.name !== 'AbortError') failure.value = error.message
}
```

Setting the field's value, and `commit()`, don't drop work.

## Failed Work

When the work fails, the form only stops waiting: `track()` rejects with the work's error, and the field's value and errors stay as they are. Show the error in the input. To refuse a submit without the upload, give the field a `required` rule: a failed upload leaves it empty.

## In Your Own Input

An input component in an `<Enforma>` gets the form with `inject(formControllerKey)`, and its field's path as its `name` prop:

```js
import { inject } from 'vue'
import { formControllerKey } from '@encolajs/enforma'

const props = defineProps({ name: String })
const form = inject(formControllerKey)

function onPick(file) {
  return form.track((signal) => upload(file, signal), props.name)
}
```

In a headless form, `useField()` gives `track()` and `beginPending()` for its own field, and `isPending`:

```js
const field = useField('photo', form)

const { id } = await field.value.track((signal) => upload(file, signal))
```
