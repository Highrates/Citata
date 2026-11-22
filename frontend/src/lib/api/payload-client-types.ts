export type PayloadListResponse<T> = {
  docs: T[]
  totalDocs: number
  hasNextPage: boolean
}
