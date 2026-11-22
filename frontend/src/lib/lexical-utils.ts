type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNode[]
  listType?: string
}

type LexicalContent = {
  root?: {
    children?: LexicalNode[]
  }
}

function extractText(node: LexicalNode): string {
  if (node.text) return node.text
  if (!node.children?.length) return ''
  return node.children.map(extractText).join('')
}

function extractListItems(node: LexicalNode): string[] {
  if (!node.children?.length) return []
  return node.children
    .map((child) => {
      if (child.type === 'listitem') return extractText(child)
      return extractText(child)
    })
    .filter(Boolean)
}

/** Legacy: единое поле `content` (Lexical) → sections[] */
export function lexicalToSections(content: LexicalContent | null | undefined) {
  const children = content?.root?.children
  if (!children?.length) return []

  const sections: Array<
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'quote'; text: string }
    | { type: 'list'; items: string[] }
  > = []

  for (const node of children) {
    const type = node.type

    if (type === 'paragraph') {
      const text = extractText(node)
      if (text) sections.push({ type: 'paragraph', text })
      continue
    }

    if (type === 'heading') {
      const text = extractText(node)
      if (text) sections.push({ type: 'heading', text })
      continue
    }

    if (type === 'quote') {
      const text = extractText(node)
      if (text) sections.push({ type: 'quote', text })
      continue
    }

    if (type === 'list') {
      const items = extractListItems(node)
      if (items.length) sections.push({ type: 'list', items })
    }
  }

  return sections
}

/** Legacy: блок `text` в кейсах */
export function lexicalToPlainText(content: LexicalContent | null | undefined): string {
  return lexicalToSections(content)
    .filter((s) => s.type === 'paragraph')
    .map((s) => s.text)
    .join('\n\n')
}
