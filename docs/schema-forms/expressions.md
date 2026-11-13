# Expressions

A schema prop can hold an expression: a string like `'${form.age >= 18}'` that Enforma works out against the form's state as it renders (see [Dynamic Props](/schema-forms/dynamic-props.md)). This page covers the language expressions are written in, the functions they can call, how to add functions of your own, and what expressions can't do.

## How expressions run

Enforma reads expressions with [`@andreasnicolaou/typescript-expression-language`](https://github.com/andreasnicolaou/typescript-expression-language), a TypeScript port of [Symfony's ExpressionLanguage](https://symfony.com/doc/current/reference/formats/expression_language.html). It parses an expression and interprets it: no expression is ever turned into code with `new Function()` or `eval()`, so forms work under a Content Security Policy without `'unsafe-eval'`. Each expression is parsed once, then read from a cache.

A prop is an expression when its whole string is one: it starts with `${` and ends with `}`.

```js
// An expression
label: '${form.accountType == "business" ? "Company name" : "Full name"}'

// Text: an expression can't be part of a string
label: 'Hello ${form.name}'

// Join strings with ~ instead
label: '${"Hello " ~ form.name}'
```

The delimiters can be changed with the `expressions.delimiters` option, and `expressions.only` limits the schema keys whose expressions are evaluated (see [Configuration](/core-concepts/configuration.md#expressions-configuration-expressions)).

When an expression fails (a syntax error, a name it can't read, a function that throws), Enforma logs the error in the console and the prop's value is `undefined`.

## What an expression can read

An expression can read three names. Naming anything else (`window`, `document`, `localStorage`…) is an error.

- `form` - the form's **values**, read without changing anything:
  - `form.country`, `form['address.city']` - a value, by its path (a copy of it)
  - `form.getFieldValue(path)` - the same, as a method
  - `form.values()` - all the values (a copy)
  - `form.$isDirty`, `form.$isTouched`, `form.$isValidating`, `form.$isSubmitting` - the form's state
- `context` - the form's `context` prop. Expressions can read its data and call its functions: `context.statesOf(form.country)`
- `config` - the form's configuration

Since `form` gives copies, nothing an expression does reaches the form's data, and reading a value doesn't register a field for it.

## Syntax

The language looks like JavaScript, but it is its own. What it has:

### Values

- Strings, in single or double quotes: `'CH'`, `"business"`. A `\` escapes a quote or a backslash
- Numbers: `42`, `3.14`, `.5`, `1e3`, `1_000_000`
- `true`, `false` and `null`
- Arrays: `['CH', 'GB']`
- Hashes: `{ currency: 'EUR', amount: 10 }`
- Comments: `/* … */`

### Reading properties

- `form.address.city` - a property
- `form['address.city']`, `context.labels[form.country]` - a property by its key, written or worked out
- `context.format(form.price)` - a method of an object
- `form.tags.length`, `form.tags[0]` - arrays and objects have their properties and methods, strings and numbers don't (see [Limits](#limits))
- `form.partner?.name` - `null` when `form.partner` is `null`. `?.` only guards against `null`: a value that's missing is `undefined`, and reading a property of it is still an error
- `form.partner.name ?? 'none'` - `'none'` when `form.partner` or its `name` is missing or `null`

### Operators

- **Logic**: `not` or `!`, `and` or `&&`, `or` or `||`, `xor`
- **Comparison**: `==` and `!=` (they convert types, as in JavaScript: `1 == '1'` is `true`), `===` and `!==` (they don't), `<`, `>`, `<=`, `>=`
- **Membership**: `in` and `not in`: `form.country in ['CH', 'GB']`, `form.country not in ['CH', 'GB']`
- **Strings**:
  - `~` joins: `form.firstName ~ ' ' ~ form.lastName`
  - `contains`, `starts with`, `ends with`: `form.email ends with '@example.com'`
  - `matches` tests a regular expression, written with its delimiters: `form.zip matches '/^[0-9]{4}$/'`
- **Arithmetic**: `+`, `-`, `*`, `/`, `%`, `**` (power). Dividing by `0` is an error
- **Ranges**: `1..5` gives `[1, 2, 3, 4, 5]`: `form.age in 18..65`
- **Bitwise**: `&`, `|`, `^`, `<<`, `>>`, and `~` as a unary operator
- **Conditions**:
  - `a ? b : c`
  - `a ?: b` - `a` when it is truthy, `b` otherwise
  - `a ? b` - `b` when `a` is truthy, `null` otherwise
  - `a ?? b` - `b` when `a` is `null` or missing

Most operators bind as they do in JavaScript. Two don't:

- `~` binds tighter than `+` and `-`: `'Total: ' ~ 1 + 2` is `'Total: 12'`. Put arithmetic in parentheses: `'Total: ' ~ (form.price + form.tax)`
- `not` binds tighter than `in`: `not form.country in ['CH']` is `(not form.country) in ['CH']`. Use `not in`

## Built-in functions

- `min(…)` and `max(…)` - the smallest and largest of their arguments, or of an array: `max(form.price, 10)`, `min([1, 2])`
- `count(value)` - the items of an array, or the keys of an object (not the characters of a string)
- `isset(value, …)` - `true` when none of its arguments is missing or `null`
- `now()` - the current time, in milliseconds

Symfony's `constant()` and `enum()` are switched off: they would read globals.

## Adding functions

Functions you add with the `expressions.functions` option can be called by their names in every expression.

For the whole project, add them in the plugin's options:

```js
import { EnformaPlugin } from '@encolajs/enforma'

app.use(EnformaPlugin, {
  expressions: {
    functions: {
      upper: (value) => String(value ?? '').toUpperCase(),
      price: (amount, currency = 'EUR') =>
        new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount),
    },
  },
})
```

```js
const schema = {
  country: { help: '${"Shipping to " ~ upper(form.country)}' },
  total: { label: '${"Total: " ~ price(form.total)}' },
}
```

For one form, add them in its `config`. They are merged with the project's functions, name by name:

```vue
<Enforma
  :data="data"
  :schema="schema"
  :config="{ expressions: { functions: { discount: (total) => total * 0.9 } } }"
/>
```

Use project functions for helpers every form needs. For logic that belongs to one form, a function of its `context` (`context.discount(form.total)`) does the same.

How functions are called:

- A function gets the arguments the expression passes, and nothing else. It's called without `this`. If it needs the form's values, pass them: `eligible(form.values(), context.user)`
- A function named like a built-in one (`min`, `max`, `count`, `isset`, `now`) replaces it
- A name is made of letters, digits and `_`, and doesn't start with a digit. It can't be `and`, `or`, `not`, `in`, `xor`, `contains`, `matches`, `true`, `false` or `null`, which the language reads as operators or values. A function that doesn't fit is left out, with a warning in the console
- When a function throws, the error is logged and the expression's value is `undefined`

In TypeScript, the option's type is `ExpressionFunctions`:

```ts
import type { ExpressionFunctions } from '@encolajs/enforma'

const functions: ExpressionFunctions = {
  upper: (value: string) => value.toUpperCase(),
}
```

## Limits

Expressions can't:

- **Use JavaScript-only syntax**: arrow functions, template literals, `new`, assignments (`=`, `+=`, `++`), `typeof`, `instanceof`, spread (`...`). Move such logic into a function, of your project or of the form's `context`
- **Read properties of strings and numbers**: `form.name.length` and `form.name.toUpperCase()` are errors. Add a function for it (`upper(form.name)`)
- **Change the form**: `form` gives copies of the values and has no `setFieldValue()`, `submit()` or `reset()`
- **Read globals**: only `form`, `context` and `config` can be named
- **Read these properties**, at any depth, whether the name is written in the expression or worked out when it runs: `__proto__`, `prototype`, `constructor`, `__defineGetter__`, `__defineSetter__`, `__lookupGetter__`, `__lookupSetter__`. An expression reading one fails, so a value stored under one of these keys can't be read by an expression
- **Nest deeper than 256 levels**
- **Be part of a string**: `'Hello ${form.name}'` stays as it is

## Expressions from data

If a schema comes from somewhere you don't fully control (a database, an API, a CMS), keep in mind:

- `expressions.only` limits the keys whose expressions are evaluated. With `{ expressions: { only: ['if'] } }`, a label holding `${…}` stays text
- An expression can read everything in `context` and `config`, and call any of their functions and methods, array methods such as `push()` included. Give `context` only what expressions need
- Every expression can call the project's functions: add only functions that are safe to call with any arguments
- `matches` runs a regular expression taken from the expression, and a crafted one can take very long to run
