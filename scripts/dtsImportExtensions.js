import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

// The package is "type": "module", so under "moduleResolution": "node16" or "nodenext" TypeScript
// reads its declarations as ES modules, where a relative import must name the file: `./utils/helpers`,
// `./schema-builder` and `./core/Enforma.vue` resolve to nothing, and what they export becomes `any`.
// The declarations are emitted from the source as written, so their imports are completed here, once
// every declaration is written and it is known which file each import points at:
//   ./utils/helpers     -> ./utils/helpers.js            (utils/helpers.d.ts)
//   ./schema-builder    -> ./schema-builder/index.js     (schema-builder/index.d.ts)
//   ..                  -> ../index.js                   (index.d.ts)
//   ./core/Enforma.vue  -> ./core/Enforma.vue.js         (core/Enforma.vue.d.ts)
// TypeScript reads `x.js` as `x.d.ts` under every resolution mode (node10, node16, nodenext, bundler)

const posix = path.posix

const toPosix = (file) => file.split(path.sep).join('/')

const isRelative = (specifier) =>
  specifier === '.' ||
  specifier === '..' ||
  specifier.startsWith('./') ||
  specifier.startsWith('../')

const hasExtension = (specifier) => /\.(js|mjs|cjs|json)$/.test(specifier)

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
 * @param {Set<string>} declarations the paths of every declaration file emitted, `/`-separated
 * @returns {string} the content, its relative imports completed
 */
export function addImportExtensions(file, content, declarations) {
  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true
  )
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
      completed = `${specifier}.js`
    } else if (declarations.has(`${target}/index.d.ts`)) {
      completed = `${specifier.replace(/\/$/, '')}/index.js`
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

/**
 * For vite-plugin-dts's `afterBuild`: completes the relative imports of every declaration it wrote
 *
 * @param {Map<string, string>} emittedFiles each file written, by path, with its content
 * @returns {Promise<void>}
 */
export async function addImportExtensionsToEmitted(emittedFiles) {
  const declarations = new Set(
    [...emittedFiles.keys()]
      .map(toPosix)
      .filter((file) => file.endsWith('.d.ts'))
  )
  await Promise.all(
    [...emittedFiles]
      .filter(([file]) => file.endsWith('.d.ts'))
      .map(async ([file, content]) => {
        const completed = addImportExtensions(file, content, declarations)
        if (completed === content) return
        await writeFile(file, completed, 'utf-8')
        emittedFiles.set(file, completed)
      })
  )
}
