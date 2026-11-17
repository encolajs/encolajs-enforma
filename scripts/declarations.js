import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

// The declarations vite-plugin-dts emits, completed for "moduleResolution": "node16" and "nodenext",
// once every declaration is written and it is known which file each import points at.
//
// The package is "type": "module", so TypeScript reads each `.d.ts` as an ES module, where a relative
// import must name the file (issue #20). Their imports are completed with `.js`, which TypeScript
// reads as `.d.ts` under every resolution mode:
//   ./utils/helpers     -> ./utils/helpers.js            (utils/helpers.d.ts)
//   ./schema-builder    -> ./schema-builder/index.js     (schema-builder/index.d.ts)
//   ..                  -> ../index.js                   (index.d.ts)
//   ./core/Enforma.vue  -> ./core/Enforma.vue.js         (core/Enforma.vue.d.ts)
//
// require() loads the CommonJS build, which a `.d.ts` would declare an ES module (issue #24). So each
// `.d.ts` gets a CommonJS twin, `.d.cts`, its imports completed with `.cjs` (read as `.d.cts`), for
// package.json to give `require()`

const posix = path.posix

const toPosix = (file) => file.split(path.sep).join('/')

const isRelative = (specifier) =>
  specifier === '.' ||
  specifier === '..' ||
  specifier.startsWith('./') ||
  specifier.startsWith('../')

const hasExtension = (specifier) => /\.(js|mjs|cjs|json)$/.test(specifier)

const parse = (file, content) =>
  ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true)

/** The string literals naming a module: `import … from`, `export … from` and `import('…')` types. */
function moduleSpecifiersOf(sourceFile) {
  const specifiers = []
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier)
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      specifiers.push(node.argument.literal)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return specifiers
}

/**
 * The relative imports of one declaration file, with the extension TypeScript needs to find their
 * declaration among `declarations` (the paths of every declaration file emitted)
 *
 * @param {string} file the declaration file's path
 * @param {string} content its content
 * @param {Set<string>} declarations the paths of every `.d.ts` emitted, `/`-separated
 * @param {'.js' | '.cjs'} extension `.cjs` for a CommonJS declaration (`.d.cts`)
 * @returns {string} the content, its relative imports completed
 */
export function addImportExtensions(
  file,
  content,
  declarations,
  extension = '.js'
) {
  const sourceFile = parse(file, content)
  const directory = posix.dirname(toPosix(file))
  let result = content
  // from the last to the first, so the positions of those before stay right
  const specifiers = moduleSpecifiersOf(sourceFile).reverse()
  for (const literal of specifiers) {
    const specifier = literal.text
    if (!isRelative(specifier) || hasExtension(specifier)) continue
    const target = posix.join(directory, specifier)
    let completed
    if (declarations.has(`${target}.d.ts`)) {
      completed = `${specifier}${extension}`
    } else if (declarations.has(`${target}/index.d.ts`)) {
      completed = `${specifier.replace(/\/$/, '')}/index${extension}`
    } else {
      throw new Error(
        `${file}: the declaration of '${specifier}' was not emitted, so its import cannot be completed`
      )
    }
    // inside the quotes, keeping them
    const start = literal.getStart(sourceFile) + 1
    const end = literal.getEnd() - 1
    result = result.slice(0, start) + completed + result.slice(end)
  }
  return result
}

const hasModifier = (node, kind) =>
  ts.canHaveModifiers(node) &&
  (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === kind)

const isExported = (statement) =>
  ts.isExportAssignment(statement) ||
  ts.isExportDeclaration(statement) ||
  hasModifier(statement, ts.SyntaxKind.ExportKeyword)

/**
 * The CommonJS declaration of an entry whose only export is its default. Rollup builds such an entry
 * as `module.exports = …` (`output.exports: 'auto'`), which `export default` would declare as
 * `exports.default`: an app's `import usePreset from …` would read `require(…).default`, undefined.
 * Any other declaration is returned as it is
 *
 * @param {string} file the declaration file's path
 * @param {string} content its content
 * @returns {string} the content, its default export declared as `export =`
 */
export function toExportEquals(file, content) {
  const sourceFile = parse(file, content)
  const exported = sourceFile.statements.filter(isExported)
  if (exported.length !== 1) return content
  const [statement] = exported
  // the statement starts after its comments, which stay where they are
  const before = content.slice(0, statement.getStart(sourceFile))
  const after = content.slice(statement.getEnd())
  // declare const _default: …; export default _default;
  if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
    const value = statement.expression.getText(sourceFile)
    return `${before}export = ${value};${after}`
  }
  // export default function usePreset(…): void;
  if (
    (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
    statement.name &&
    hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
  ) {
    const modifiers = ts.getModifiers(statement)
    const unmodified = statement.getText(sourceFile).slice(
      // `export default` dropped
      modifiers[modifiers.length - 1].getEnd() - statement.getStart(sourceFile)
    )
    const name = statement.name.text
    return `${before}declare${unmodified}\nexport = ${name};${after}`
  }
  return content
}

/** The declarations package.json's `exports` gives `require()`: each `types` under a `require` condition. */
function requiredDeclarations(exports, root) {
  const found = new Set()
  const visit = (value, required) => {
    if (!value || typeof value !== 'object') return
    for (const [condition, target] of Object.entries(value)) {
      if (required && condition === 'types' && typeof target === 'string') {
        found.add(posix.join(toPosix(root), target))
      } else {
        visit(target, required || condition === 'require')
      }
    }
  }
  visit(exports, false)
  return found
}

/**
 * For vite-plugin-dts's `afterBuild`: completes the relative imports of every declaration it wrote,
 * and writes the CommonJS twin (`.d.cts`) of each
 *
 * @param {{ root: string, exports: object }} options the package's directory and package.json's
 *   `exports`, whose `require` conditions name the CommonJS declarations an app loads
 * @returns {(emittedFiles: Map<string, string>) => Promise<void>} the hook, which is given each file
 *   written, by path, with its content
 */
export function completeDeclarations({ root, exports }) {
  const required = requiredDeclarations(exports, root)

  return async (emittedFiles) => {
    const written = [...emittedFiles].filter(([file]) => file.endsWith('.d.ts'))
    const declarations = new Set(written.map(([file]) => toPosix(file)))
    const twins = new Set(
      [...declarations].map((file) => file.replace(/\.d\.ts$/, '.d.cts'))
    )
    const missing = [...required].filter((file) => !twins.has(file))
    if (missing.length) {
      throw new Error(
        `package.json's exports give require() ${missing.join(
          ', '
        )}, which no declaration emitted becomes`
      )
    }

    await Promise.all(
      written.map(async ([file, content]) => {
        const esm = addImportExtensions(file, content, declarations)
        const twin = file.replace(/\.d\.ts$/, '.d.cts')
        let cjs = addImportExtensions(file, content, declarations, '.cjs')
        if (required.has(toPosix(twin))) cjs = toExportEquals(twin, cjs)
        await Promise.all([
          writeFile(file, esm, 'utf-8'),
          writeFile(twin, cjs, 'utf-8'),
        ])
        emittedFiles.set(file, esm)
        emittedFiles.set(twin, cjs)
      })
    )
  }
}
