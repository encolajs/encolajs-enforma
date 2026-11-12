// @vitest-environment node
// Every component, compiled as Vite's dev server compiles it (the docs, an app importing the source),
// imports from Vue only what Vue exports at runtime. In development the template is compiled apart from
// the script (`inlineTemplate: false`, for hot reload), so the script keeps every import the template
// might use: a type imported as a value (`import { Component } from 'vue'`) is kept when the template
// has a tag of that name (`<component :is>`), and the page fails as it loads. The library build inlines
// the template and drops it, so the tests and the build never notice. Import types with `type`.
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, compileScript } from 'vue/compiler-sfc'
import ts from 'typescript'
import * as vue from 'vue'

const src = fileURLToPath(new URL('../src', import.meta.url))

/** Every .vue file under `dir`. */
const componentsIn = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return componentsIn(path)
    return entry.name.endsWith('.vue') ? [path] : []
  })

/** The names a component's script, compiled for development, imports from 'vue'. */
function vueImportsOf(file: string): string[] {
  const { descriptor } = parse(readFileSync(file, 'utf8'), { filename: file })
  const script = compileScript(descriptor, {
    id: file,
    inlineTemplate: false,
    fs: {
      fileExists: existsSync,
      readFile: (path) => readFileSync(path, 'utf8'),
    },
  })
  // TypeScript removed, as esbuild removes it for Vite: what remains is what runs
  const js = ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
    },
  }).outputText
  return [...js.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']vue["']/g)].flatMap(
    ([, names]) =>
      names
        .split(',')
        .map((name) => name.trim().split(/\s+as\s+/)[0])
        .filter(Boolean)
  )
}

describe('components compiled for development', () => {
  it.each(componentsIn(src).map((file) => [file.slice(src.length + 1), file]))(
    '%s imports from Vue only what Vue exports',
    (_, file) => {
      const missing = vueImportsOf(file).filter((name) => !(name in vue))
      expect(missing).toEqual([])
    }
  )
})
