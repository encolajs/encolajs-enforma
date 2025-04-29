# Mixed Forms

##### :notebook_with_decorative_cover: For a complete working example check out the [mixed form example](/examples/mixed-form.md)

Here are some situations when having the ability to use mixed forms might be helpful:

### Testing Ideas

**Scenario**: You have a form with a schema and you want to try, on a specific field, how would the UI look if you were using a different component. 

**Solution**: Use a mixture of form with a schema, where the default slot contains individual fields and sections 

### Conflicts Between Libraries  

**Scenario**: One of the components of your favorite UI library does not work well with Enforma components.

**Solution**: Until a solution is provided by the 3rd-party library you can create your own `EnformaField` component or use a headless field component

### Complex Layouts

**Scenario**: The form has complex layout (tabs, sidebar etc) and you want to see the form working before starting implementing custom components for the schema

**Solution**: Use a schema based form where the default slots had the structure that you need with individual `EnformaField` and `EnformaSection` components 
