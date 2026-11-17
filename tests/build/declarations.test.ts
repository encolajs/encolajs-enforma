// @vitest-environment node
// The package is "type": "module": under "moduleResolution": "node16" or "nodenext" a relative import
// in its declarations must name the file, or what it imports becomes `any` (issue #20), and require()
// needs declarations of its own, CommonJS ones (issue #24)
import { describe, expect, it } from 'vitest'
import {
  existsSync,
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
  completeDeclarations,
  toExportEquals,
} from '../../scripts/declarations.js'

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

  it('names the CommonJS file for a CommonJS declaration', () => {
    const content = [
      "export * from './utils/helpers';",
      "export { SchemaBuilder } from './schema-builder';",
      "export { default as Enforma } from './core/Enforma.vue';",
    ].join('\n')

    expect(
      addImportExtensions('/dist/index.d.ts', content, declarations, '.cjs')
    ).toBe(
      [
        "export * from './utils/helpers.cjs';",
        "export { SchemaBuilder } from './schema-builder/index.cjs';",
        "export { default as Enforma } from './core/Enforma.vue.cjs';",
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

describe('toExportEquals', () => {
  it('declares a default function as what require() returns', () => {
    const content = [
      "import { Component } from 'vue';",
      '/** Applies the preset */',
      'export default function usePreset(components?: Record<string, Component>): void;',
      '',
    ].join('\n')

    expect(toExportEquals('/dist/presets/preset.d.cts', content)).toBe(
      [
        "import { Component } from 'vue';",
        '/** Applies the preset */',
        'declare function usePreset(components?: Record<string, Component>): void;',
        'export = usePreset;',
        '',
      ].join('\n')
    )
  })

  it('declares a default value as what require() returns', () => {
    const content = [
      "declare const _default: import('vue').DefineComponent<{}>;",
      'export default _default;',
      '',
    ].join('\n')

    expect(toExportEquals('/dist/presets/Field.vue.d.cts', content)).toBe(
      [
        "declare const _default: import('vue').DefineComponent<{}>;",
        'export = _default;',
        '',
      ].join('\n')
    )
  })

  it('leaves a declaration with other exports as it is', () => {
    const named = [
      'export declare function createZodValidator(schema: any): FormValidator;',
      'export declare class ZodValidator {}',
    ].join('\n')
    const withType = [
      'export interface DefaultPresetOptions {}',
      'export default function useDefaultPreset(options?: DefaultPresetOptions): void;',
    ].join('\n')

    expect(toExportEquals('/dist/validators/zod.d.cts', named)).toBe(named)
    expect(toExportEquals('/dist/presets/default.d.cts', withType)).toBe(
      withType
    )
  })
})

describe('completeDeclarations', () => {
  const exports = {
    '.': {
      import: { types: './dist/index.d.ts', default: './dist/index.js' },
      require: { types: './dist/index.d.cts', default: './dist/index.cjs' },
    },
    './presets/preset': {
      import: {
        types: './dist/presets/preset.d.ts',
        default: './dist/presets/preset.js',
      },
      require: {
        types: './dist/presets/preset.d.cts',
        default: './dist/presets/preset.cjs',
      },
    },
  }

  /** A dist folder holding `files`, by path relative to it, given to `run` with the files' map. */
  async function withDist(
    files: Record<string, string>,
    run: (root: string, emitted: Map<string, string>) => Promise<void>
  ): Promise<void> {
    const root = mkdtempSync(join(tmpdir(), 'enforma-dts-'))
    try {
      const emitted = new Map<string, string>()
      for (const [file, content] of Object.entries(files)) {
        const path = join(root, 'dist', file)
        mkdirSync(join(path, '..'), { recursive: true })
        writeFileSync(path, content)
        emitted.set(path, content)
      }
      await run(root, emitted)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }

  const read = (root: string, file: string): string =>
    readFileSync(join(root, 'dist', file), 'utf-8')

  it('completes each declaration, and writes its CommonJS twin', async () => {
    await withDist(
      {
        'index.d.ts': "export * from './utils/helpers';\n",
        'utils/helpers.d.ts':
          'export declare function isPlainObject(value: any): boolean;\n',
        'index.d.ts.map': '{"sources":[\'./utils/helpers\']}',
      },
      async (root, emitted) => {
        await completeDeclarations({ root, exports: { '.': exports['.'] } })(
          emitted
        )

        expect(read(root, 'index.d.ts')).toBe(
          "export * from './utils/helpers.js';\n"
        )
        expect(read(root, 'index.d.cts')).toBe(
          "export * from './utils/helpers.cjs';\n"
        )
        expect(read(root, 'utils/helpers.d.cts')).toBe(
          'export declare function isPlainObject(value: any): boolean;\n'
        )
        expect(emitted.get(join(root, 'dist', 'index.d.cts'))).toBe(
          "export * from './utils/helpers.cjs';\n"
        )
        expect(read(root, 'index.d.ts.map')).toBe(
          '{"sources":[\'./utils/helpers\']}'
        )
        expect(existsSync(join(root, 'dist', 'index.d.ts.map.d.cts'))).toBe(
          false
        )
      }
    )
  })

  it('declares as `export =` the default of what package.json gives require()', async () => {
    const preset = 'export default function usePreset(): void;\n'
    await withDist(
      {
        'index.d.ts': "export { default as Field } from './Field.vue';\n",
        'Field.vue.d.ts':
          'declare const _default: any;\nexport default _default;\n',
        'presets/preset.d.ts': preset,
      },
      async (root, emitted) => {
        await completeDeclarations({ root, exports })(emitted)

        expect(read(root, 'presets/preset.d.cts')).toBe(
          'declare function usePreset(): void;\nexport = usePreset;\n'
        )
        expect(read(root, 'presets/preset.d.ts')).toBe(preset)
        // imported by another declaration, not by an app: its default stays a default
        expect(read(root, 'Field.vue.d.cts')).toBe(
          'declare const _default: any;\nexport default _default;\n'
        )
      }
    )
  })

  it('fails when package.json gives require() a declaration not emitted', async () => {
    await withDist(
      { 'index.d.ts': 'export declare const version: string;\n' },
      async (root, emitted) => {
        await expect(
          completeDeclarations({ root, exports })(emitted)
        ).rejects.toThrow('presets/preset.d.cts')
      }
    )
  })
})
