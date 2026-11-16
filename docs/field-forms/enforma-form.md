# `<Enforma/>` Component

<TabNav :items="[
{ label: 'Usage', link: '/field-forms/enforma-form' },
{ label: 'API', link: '/field-forms/enforma-form_api' },
{ label: 'FormController API', link: '/field-forms/enforma-form-controller_api' },
]" />

`Enforma` is the root component for creating forms with Enforma. It manages form state, validation, and submission handling.

> :notebook_with_decorative_cover: Complete working example [here](/examples/fields.md)

## Basic Usage

```vue
<template>
  <Enforma
    :data="formData"
    :validator="validator"
    :submitHandler="submit"
    :config="formConfig">
    <!-- Form fields go here -->
    <EnformaField name="firstName" label="First Name" />
    <EnformaField name="lastName" label="Last Name" />

    <EnformaSubmitButton>Submit</EnformaSubmitButton>
  </Enforma>
</template>

<script setup>
import { ref } from 'vue';
import { createEncolaValidator } from '@encolajs/enforma/validators/encola';

const formData = {
  firstName: '',
  lastName: ''
};

const validator = createEncolaValidator({
  firstName: 'required|min_length:2',
  lastName: 'required|min_length:2',
});

const formConfig = {
  // optional form-level configuration options
}

function submit(data) {
  console.log('Form submitted:', data);
  // Process form data
}
</script>
```

::: warning DEPRECATED
The `:rules` and `:messages` props are deprecated in v1.3.0. Use the `:validator` prop instead.

**Old way (deprecated):**
```vue
<Enforma :data="formData" :rules="{ firstName: 'required' }" />
```

**New way (recommended):**
```vue
<script setup>
import { createEncolaValidator } from '@encolajs/enforma/validators/encola'
const validator = createEncolaValidator({ firstName: 'required' })
</script>
<template>
  <Enforma :data="formData" :validator="validator" />
</template>
```
:::

For more details check out:
- [form rendering modes](/core-concepts/rendering-modes.md) for how to render fields inside the form
- [validation system](/core-concepts/validation.md) for understanding the options available for validation
- [form-level configuration](/core-concepts/configuration.md) for how to customize specific forms

## Server-Side Validation

Add server-side validation errors to your forms using the [FormController](enforma-form-controller_api.md) which gives you (some) access to the form from outside the `<Enforma>` component 

```javascript

const submitHandler = async function (data, formController) {
  try {
    // Submit to API
    const response = await api.createUser(data);
    return response;
  } catch (error) {
    // Handle 422 Validation errors from API
    if (error.response?.status === 422) {
      // Process API validation errors
      const serverErrors = error.response.data.errors;
      
      // Set errors on form - will automatically trigger UI updates
      formController.setErrors(serverErrors);
      
      // Example output format from server:
      // {
      //   'email': ['This email is already registered'],
      //   'username': ['Username must be unique']
      // }
    }
  }
}
```

Errors set this way stay until the field's value changes or the form is submitted again (or reset, or committed). Checking the field's rules doesn't remove them, such as when the user leaves the field without changing it: they show after the rules' own errors, and `validate()` says `false` while they show.

## Access Forms from Outside

Most of the times forms are self-contained, meaning that whatever happens in a form (clicking on fields, submitting etc) is triggered by elements inside the form.

When a button has to be outside the form, like Save in a modal's footer or beside the page title, hide the form's own buttons and give the form to `<EnformaSubmitButton>` (or `<EnformaResetButton>`) through a ref. The button submits the form, Enter in a field does too, and the button shows when the form is submitting. See the [Buttons Outside the Form recipe](/recipes/form-in-modal.md).

```vue {3,4,7}
<template>
  <Enforma
    ref="formRef"
    :show-submit-button="false"
    ... rest of the props
  />
  <EnformaSubmitButton :form="formRef" />
</template>

<script setup>
import { ref } from 'vue'

const formRef = ref(null)

// rest of the configuration goes here
</script>
```

The ref holds the form's FormController: call its methods (`formRef.value.submit()`, `formRef.value.setFieldValue('name', 'John')`) and read its state (`formRef.value.$isSubmitting`, `formRef.value.$isChanged`), which follows the form as it changes. It's `null` until the form has mounted.

Read more on the FormController [here](enforma-form-controller_api.md)
