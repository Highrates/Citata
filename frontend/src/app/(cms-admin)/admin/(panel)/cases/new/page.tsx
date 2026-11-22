import { CaseEditForm } from '@/components/admin/CaseEditForm'
import { flashFromSearchParams } from '@/lib/admin/flash'
import { hasPayloadDatabase } from '@/lib/admin/payload-helpers'
import { casePreviewQueryValue } from '@/lib/preview'

export const metadata = { title: 'Новый кейс' }

export default async function CmsCaseNewPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const sp = await searchParams
  const source = hasPayloadDatabase() ? 'payload' : 'fixtures'

  return (
    <CaseEditForm
      isNew
      source={source}
      previewToken={casePreviewQueryValue()}
      {...flashFromSearchParams(sp)}
    />
  )
}
