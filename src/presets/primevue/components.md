This file contains a list of components that are going to be implemented for the PrimeVue preset. The components are wrappers around PrimeVue components. 

They extend the PrimeVue components in the following ways:
1. the custom props are processed locally 
2. based on processing of custom props we determine what props are passed down to the PrimeVue component
3. additional props are passed to the PrimeVue component as they are
4. events fired by PrimeVue components are passed up to the wrapper component
5. events attached to the custom component are passed down to the PrimeVue component

Additional details:
1. The custom components should add as little overhead as possible
2. The custom components don't show the error, they just show the input field component since the error is displayed in the EnformaField component. 
3. Adding extra markup (eg: wrapping the PrimeVue component in a div) should be done only if necessary.

Each section describes a component like so:
- it mentions the documentation page of the original PrimeVue component
- it shows a list of props that are specific to our implemention.


# Autocomplete
Docs: https://primevue.org/autocomplete/
Custom props:
- options: 
    - type: Array[any] | Object<string, any> | Function<Promise<Array[any] | Object<string, any>>>
    - purpose: This is the list of options displayed in the dropdown
- multiple: 
    - type: boolean
    - default: false
    - purpose: to determine wheter or not multiple selection is allowed
- valueAs:
    - type: String (one of "array" or "csv")
    - default: array
    - purpose: determines whether or not the value received by the field and passed back to the form is a CSV (comma separated values) string or an array.    


# Checkbox
Docs: https://primevue.org/checkbox/
Custom props:
- value:
    - type: any
    - purpose: what is the value sent to the form if the item is checked
- uncheckedValue: 
    - type: any
    - default: null
    - purpose: what is the value sent to the form if the item is unchecked
- label:
    - type: string
    - purpose: text displayed next to the field
- isRequired:
    - type: boolean
    - purpose: show required symbol after the label            

# CheckboxSet
Docs: https://primevue.org/checkbox/
Custom props:
- options: 
    - type: Array[any] | Object<string, any> | Function<Promise<Array[any] | Object<string, any>>>
    - purpose: This is the list of options displayed in the dropdown
- valueAs:
    - type: String (one of "array" or "csv")
    - default: array
    - purpose: determines whether or not the value received by the field and passed back to the form is a CSV (comma separated values) string or an array.    


Color
Colorpicker
Currency
Date
Datepicker
Datetime-local
Dropdown
Email
File
Form
Group
Hidden
List
Mask
Meta
Month
Number
Password
Radio
Range
Rating
Repeater
Search
Select
Slider
Submit
Taglist
Telephone
Text
Textarea
Time
Toggle
Toggle Buttons
Transfer List
Unit
URL
Week