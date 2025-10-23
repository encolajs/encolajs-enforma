const MIGRATION_GUIDE_URL = 'https://encolajs.com/enforma/migration'

export function warnRulesDeprecation(
  context: 'useForm' | 'HeadlessForm'
): void {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  let baseMessage: string
  let oldExample: string
  let newExample: string

  switch (context) {
    case 'useForm':
      baseMessage = 'Passing rules object to useForm() is deprecated.'
      oldExample = '  useForm(data, { email: "required|email" })'
      newExample = `  import { createEncolaValidator } from "@encolajs/enforma"
  useForm(data, createEncolaValidator({ email: "required|email" }))`
      break

    case 'HeadlessForm':
      baseMessage =
        'The :rules prop on HeadlessForm is deprecated.\nUse :validator prop instead.'
      oldExample = '  <HeadlessForm :rules="{ email: \'required|email\' }" />'
      newExample = `  import { createEncolaValidator } from "@encolajs/enforma"
  <HeadlessForm :validator="createEncolaValidator({ email: 'required|email' })" />`
      break
  }

  console.warn(
    `[Enforma] DEPRECATED: ${baseMessage}
Migration guide: ${MIGRATION_GUIDE_URL}

Instead of:
${oldExample}

Use:
${newExample}`
  )
}
