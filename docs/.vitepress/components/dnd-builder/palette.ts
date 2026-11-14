export type PaletteKind =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'date'
  | 'section'

export interface PaletteItem {
  kind: PaletteKind
  label: string
  /** Short glyph shown next to the label */
  icon: string
  /** Prefix for the auto-generated schema key, e.g. `email` -> `email_1` */
  namePrefix: string
  /** Initial schema props for a new node */
  defaults: () => Record<string, any>
}

/**
 * The input components below are the ones registered for the Nuxt UI preset
 * by the docs' LiveDemo component
 */
export const paletteItems: PaletteItem[] = [
  {
    kind: 'text',
    label: 'Text',
    icon: 'T',
    namePrefix: 'text',
    defaults: () => ({
      type: 'field',
      inputComponent: 'input',
      inputProps: {},
    }),
  },
  {
    kind: 'email',
    label: 'Email',
    icon: '@',
    namePrefix: 'email',
    defaults: () => ({
      type: 'field',
      inputComponent: 'input',
      inputProps: { type: 'email' },
    }),
  },
  {
    kind: 'number',
    label: 'Number',
    icon: '#',
    namePrefix: 'number',
    defaults: () => ({
      type: 'field',
      inputComponent: 'input',
      inputProps: { type: 'number' },
    }),
  },
  {
    kind: 'textarea',
    label: 'Textarea',
    icon: '≡',
    namePrefix: 'textarea',
    defaults: () => ({
      type: 'field',
      inputComponent: 'textarea',
      inputProps: {},
    }),
  },
  {
    kind: 'select',
    label: 'Select',
    icon: '▾',
    namePrefix: 'select',
    defaults: () => ({
      type: 'field',
      inputComponent: 'select',
      inputProps: { items: ['Option 1', 'Option 2'] },
    }),
  },
  {
    kind: 'toggle',
    label: 'Toggle',
    icon: '✓',
    namePrefix: 'toggle',
    defaults: () => ({
      type: 'field',
      inputComponent: 'toggle',
      showLabelNextToInput: true,
    }),
  },
  {
    kind: 'date',
    label: 'Date',
    icon: '◷',
    namePrefix: 'date',
    defaults: () => ({
      type: 'field',
      inputComponent: 'datepicker',
      useModelValue: true,
    }),
  },
  {
    kind: 'section',
    label: 'Section',
    icon: '§',
    namePrefix: 'section',
    defaults: () => ({
      type: 'section',
      titleComponent: 'h3',
    }),
  },
]

export function getPaletteItem(kind: PaletteKind): PaletteItem {
  return paletteItems.find((item) => item.kind === kind) as PaletteItem
}
