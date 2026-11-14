import { computed, inject, provide, ref } from 'vue'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { getPaletteItem } from './palette'
import type { PaletteItem, PaletteKind } from './palette'

export interface BuilderNode {
  /** Stable id used for rendering and drag & drop */
  id: string
  kind: PaletteKind
  /** The key of this node in the generated schema */
  name: string
  /** Schema props: type, label/title, inputComponent, inputProps etc. */
  props: Record<string, any>
  /** Only sections have children */
  children?: BuilderNode[]
}

export interface DndSchemaTree {
  nodes: Ref<BuilderNode[]>
  selectedId: Ref<string | null>
  schema: ComputedRef<Record<string, any>>
  createNode: (item: PaletteItem) => BuilderNode
  getChildren: (parent: BuilderNode | null) => BuilderNode[]
  setChildren: (parent: BuilderNode | null, list: BuilderNode[]) => void
  append: (item: PaletteItem) => void
  rename: (node: BuilderNode, name: string) => string | null
  remove: (node: BuilderNode) => void
  clear: () => void
}

// letters, digits and underscores, with dots separating nested keys (eg: address.city)
const NAME_PATTERN = /^[A-Za-z_]\w*(\.[A-Za-z_]\w*)*$/

const treeKey: InjectionKey<DndSchemaTree> = Symbol('dndSchemaTree')

let idCounter = 0

export function isSection(node: BuilderNode): boolean {
  return node.props.type === 'section'
}

/**
 * Enforma renders the fields of a container before its sub-sections,
 * so `position` is needed only when a sub-section is placed above a field
 */
function needsPosition(list: BuilderNode[]): boolean {
  const firstSection = list.findIndex(isSection)
  return (
    firstSection !== -1 &&
    list.slice(firstSection).some((node) => !isSection(node))
  )
}

function isEmpty(value: unknown): boolean {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === false
  ) {
    return true
  }
  if (Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value as object).length === 0
  }
  return false
}

function cleanProps(props: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  Object.entries(props).forEach(([key, value]) => {
    let cleaned = value
    if (Array.isArray(value)) {
      cleaned = [...value]
    } else if (value && typeof value === 'object') {
      cleaned = cleanProps(value)
    }
    if (!isEmpty(cleaned)) {
      result[key] = cleaned
    }
  })
  return result
}

/**
 * Converts the builder tree into the flat Enforma schema.
 * Nesting is expressed through the `section` prop and the order
 * through the order of the keys, plus `position` when it is needed
 */
export function toFormSchema(
  nodes: BuilderNode[],
  parent: string | null = null,
  schema: Record<string, any> = {}
): Record<string, any> {
  const withPosition = needsPosition(nodes)
  nodes.forEach((node, index) => {
    const { type, ...rest } = cleanProps(node.props)
    schema[node.name] = {
      type,
      // root items don't belong to a section
      ...(parent ? { section: parent } : {}),
      ...(withPosition ? { position: index + 1 } : {}),
      ...rest,
    }
    if (node.children) {
      toFormSchema(node.children, node.name, schema)
    }
  })
  return schema
}

function humanize(name: string): string {
  const words = name.replace(/[_.]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function* walk(
  list: BuilderNode[],
  parent: BuilderNode | null = null
): Generator<[BuilderNode, BuilderNode | null]> {
  for (const node of list) {
    yield [node, parent]
    if (node.children) {
      yield* walk(node.children, node)
    }
  }
}

export function provideDndSchemaTree(): DndSchemaTree {
  const nodes = ref<BuilderNode[]>([])
  const selectedId = ref<string | null>(null)

  function findEntry(id: string): [BuilderNode, BuilderNode | null] | null {
    for (const entry of walk(nodes.value)) {
      if (entry[0].id === id) {
        return entry
      }
    }
    return null
  }

  function usedNames(): Set<string> {
    return new Set(Array.from(walk(nodes.value), ([node]) => node.name))
  }

  function nextName(prefix: string): string {
    const names = usedNames()
    let index = 1
    while (names.has(`${prefix}_${index}`)) {
      index++
    }
    return `${prefix}_${index}`
  }

  function createNode(
    item: PaletteItem,
    name: string = nextName(item.namePrefix),
    extraProps: Record<string, any> = {}
  ): BuilderNode {
    const { type, ...defaults } = item.defaults()
    const section = type === 'section'
    return {
      id: `node_${++idCounter}`,
      kind: item.kind,
      name,
      props: {
        type,
        [section ? 'title' : 'label']: humanize(name),
        ...defaults,
        ...extraProps,
      },
      ...(section ? { children: [] } : {}),
    }
  }

  function getChildren(parent: BuilderNode | null): BuilderNode[] {
    return parent ? parent.children || [] : nodes.value
  }

  function setChildren(parent: BuilderNode | null, list: BuilderNode[]): void {
    if (parent) {
      parent.children = list
    } else {
      nodes.value = list
    }
  }

  /**
   * Adds a new node next to the selected one,
   * or inside it when the selected node is a section
   */
  function append(item: PaletteItem): void {
    const entry = selectedId.value ? findEntry(selectedId.value) : null
    let parent: BuilderNode | null = null
    if (entry) {
      parent = isSection(entry[0]) ? entry[0] : entry[1]
    }
    const node = createNode(item)
    setChildren(parent, [...getChildren(parent), node])
    selectedId.value = node.id
  }

  function rename(node: BuilderNode, name: string): string | null {
    const trimmed = name.trim()
    if (trimmed === node.name) {
      return null
    }
    if (!NAME_PATTERN.test(trimmed)) {
      return 'Use letters, digits and underscores, with dots for nested keys (eg: address.city)'
    }
    if (trimmed === 'default') {
      return '"default" is reserved by Enforma'
    }
    if (usedNames().has(trimmed)) {
      return `"${trimmed}" is already used`
    }
    node.name = trimmed
    return null
  }

  function remove(node: BuilderNode): void {
    const entry = findEntry(node.id)
    if (!entry) {
      return
    }
    const parent = entry[1]
    setChildren(
      parent,
      getChildren(parent).filter((child) => child.id !== node.id)
    )
    if (selectedId.value && !findEntry(selectedId.value)) {
      selectedId.value = null
    }
  }

  function clear(): void {
    nodes.value = []
    selectedId.value = null
  }

  nodes.value = [
    createNode(getPaletteItem('text'), 'name', {
      required: true,
      rules: 'required',
    }),
    createNode(getPaletteItem('email'), 'email'),
  ]

  const tree: DndSchemaTree = {
    nodes,
    selectedId,
    schema: computed(() => toFormSchema(nodes.value)),
    createNode: (item: PaletteItem) => createNode(item),
    getChildren,
    setChildren,
    append,
    rename,
    remove,
    clear,
  }

  provide(treeKey, tree)
  return tree
}

export function useDndSchemaTree(): DndSchemaTree {
  const tree = inject(treeKey)
  if (!tree) {
    throw new Error('useDndSchemaTree() requires provideDndSchemaTree()')
  }
  return tree
}
