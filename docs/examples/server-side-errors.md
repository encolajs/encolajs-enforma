<script setup>
import ServerSideErrorsExample from './features/ServerSideErrorsExample.vue'
import StackBlitzButton from '../.vitepress/components/StackBlitzButton.vue'
</script>

# Server-side Validation Errors

The `submitHandler()` in the code source shows how you could handle validation errors from the server

<StackBlitzButton 
  title="Enforma Fields Example"
  open-file="src/components/ServerSideErrorsExample.vue"
  component="ServerSideErrorsExample"
/>

<ClientOnly>
    <LiveDemo :component="ServerSideErrorsExample"></LiveDemo>
</ClientOnly>

## Sample code for handling errors from the server

```js
const submitHandler = async function (formData, formController) {
  try {
    const response = await fetch('https://api.example.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })

    // the status code returned by the server 
    // when there are validation errors
    if (response.status === 422) {
      const errorData = await response.json()

      if (errorData.errors) {
        //---------------------------------------
        // this is where the magic happens
        // you have access to the formController
        //---------------------------------------
        formController.setErrors(errorData.errors)
        alert('Validation failed. Fix the errors and try again')
      } else {
        alert('Validation failed, but no error details provided.')
      }
      return
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    alert('Data submitted successfully!')
  } catch (error) {
    alert(`An error occurred: ${error.message}`)
  }
}
```

## Source code

::: code-group
<<< @/examples/features/ServerSideErrorsExample.vue
:::

