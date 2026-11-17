// @vitest-environment node
// The package is "type": "module": under "moduleResolution": "node16" or "nodenext" a relative import
// in its declarations must name the file, or what it imports becomes `any` (issue #20)
import { describe, expect, it } from 'vitest'
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  addImportExtensions,
  addImportExtensionsToEmitted,
} from '../../scripts/dtsImportExtensions.js'

const declarations = new Set([
  '/dist/index.d.ts',
  '/dist/types.d.ts',
  '/dist/utils/helpers.d.ts',
  '/dist/schema-builder/index.d.ts',
  '/dist/core/Enforma.vue.d.ts',
  '/dist/core/useEnformaField.d.ts',
])

describe('addImportExtensions', () => {
  it('names the file of each relative import, export and import type', () => {
    const content = [
      "import { FormSchema } from './types';",
      "export * from './utils/helpers';",
      "export { SchemaBuilder } from './schema-builder';",
      "export { default as Enforma } from './core/Enforma.vue';",
      "export type Validator = import('./types').FormValidator;",
    ].join('\n')

    expect(addImportExtensions('/dist/index.d.ts', content, declarations)).toBe(
      [
        "import { FormSchema } from './types.js';",
        "export * from './utils/helpers.js';",
        "export { SchemaBuilder } from './schema-builder/index.js';",
        "export { default as Enforma } from './core/Enforma.vue.js';",
        "export type Validator = import('./types.js').FormValidator;",
      ].join('\n')
    )
  })

  it('resolves parent directories, `..` included', () => {
    const content = [
      "import { FieldController } from '../types';",
      "export type Validator = import('..').FormValidator;",
      "export { useEnformaField } from './useEnformaField';",
    ].join('\n')

    expect(
      addImportExtensions('/dist/core/Enforma.vue.d.ts', content, declarations)
    ).toBe(
      [
        "import { FieldController } from '../types.js';",
        "export type Validator = import('../index.js').FormValidator;",
        "export { useEnformaField } from './useEnformaField.js';",
      ].join('\n')
    )
  })

  it('leaves packages, completed imports and comments as they are', () => {
    const content = [
      '/**',
      " * import MySwitch from './components/MySwitch.vue'",
      ' */',
      "import { Component } from 'vue';",
      "import { CustomMessagesConfig } from '@encolajs/validator';",
      'import { FormSchema } from "./types.js";',
      "export type Ref = import('vue').Ref;",
    ].join('\n')

    expect(addImportExtensions('/dist/index.d.ts', content, declarations)).toBe(
      content
    )
  })

  it('completes an import only once', () => {
    const once = addImportExtensions(
      '/dist/index.d.ts',
      "export * from './utils/helpers';",
      declarations
    )

    expect(addImportExtensions('/dist/index.d.ts', once, declarations)).toBe(
      once
    )
  })

  it('fails on an import whose declaration was not emitted', () => {
    expect(() =>
      addImportExtensions(
        '/dist/index.d.ts',
        "export * from './missing';",
        declarations
      )
    ).toThrow("'./missing'")
  })
})

describe('addImportExtensionsToEmitted', () => {
  it('rewrites the declarations written, and only those', async () => {
    const dist = mkdtempSync(join(tmpdir(), 'enforma-dts-'))
    try {
      mkdirSync(join(dist, 'utils'))
      const index = join(dist, 'index.d.ts')
      const helpers = join(dist, 'utils', 'helpers.d.ts')
      const map = join(dist, 'index.d.ts.map')
      const files = new Map([
        [index, "export * from './utils/helpers';\n"],
        [
          helpers,
          'export declare function isPlainObject(value: any): boolean;\n',
        ],
        [map, '{"sources":[\'./utils/helpers\']}'],
      ])
      files.forEach((content, file) => writeFileSync(file, content))

      await addImportExtensionsToEmitted(files)

      expect(readFileSync(index, 'utf-8')).toBe(
        "export * from './utils/helpers.js';\n"
      )
      expect(files.get(index)).toBe("export * from './utils/helpers.js';\n")
      expect(readFileSync(map, 'utf-8')).toBe(
        '{"sources":[\'./utils/helpers\']}'
      )
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })
})
