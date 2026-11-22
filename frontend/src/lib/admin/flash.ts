export function flashFromSearchParams(searchParams: {
  saved?: string | string[]
  error?: string | string[]
}) {
  const saved = searchParams.saved === '1'
  const rawError = searchParams.error
  const error =
    typeof rawError === 'string'
      ? decodeURIComponent(rawError)
      : Array.isArray(rawError) && rawError[0]
        ? decodeURIComponent(rawError[0])
        : undefined

  return { saved, error }
}
