/**
 * Flatten a Payload-style `where` object into REST query params.
 * Supports nested and/or, equals/like/in/… operators, and arrays.
 */
export function buildPayloadWhereParams(
  where: Record<string, unknown>,
  prefix = 'where',
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}

  function assign(path: string, value: unknown) {
    if (value === undefined || value === null) return

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          walk(`${path}[${index}]`, item as Record<string, unknown>)
        } else if (item !== undefined && item !== null) {
          params[`${path}[${index}]`] = item as string | number | boolean
        }
      })
      return
    }

    if (typeof value === 'object') {
      walk(path, value as Record<string, unknown>)
      return
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      params[path] = value
    }
  }

  function walk(path: string, node: Record<string, unknown>) {
    for (const [key, value] of Object.entries(node)) {
      assign(`${path}[${key}]`, value)
    }
  }

  walk(prefix, where)
  return params
}
