'use client'

import { AdminCompactBtn } from '@/components/AdminCompactBtn/AdminCompactBtn'
import { AdminModal } from '@/components/admin/AdminModal'
import type { RichBlockStrings } from '@/lib/richBlockI18n'
import type { RichBlockVariant } from './richBlockTypes'
import styles from './RichBlock.module.css'

type Props = {
  open: boolean
  fieldId: string
  variant: RichBlockVariant
  linkDraft: string
  linkError: string | null
  linkHadExisting: boolean
  strings: RichBlockStrings
  onDraftChange: (value: string) => void
  onClearError: () => void
  onClose: () => void
  onSubmit: () => void
  onRemove: () => void
}

function LinkFormFields({
  fieldId,
  linkDraft,
  linkError,
  strings: s,
  onDraftChange,
  onClearError,
  onSubmit,
}: {
  fieldId: string
  linkDraft: string
  linkError: string | null
  strings: RichBlockStrings
  onDraftChange: (value: string) => void
  onClearError: () => void
  onSubmit: () => void
}) {
  return (
    <>
      <label className={styles.linkField} htmlFor={`${fieldId}-link-url`}>
        {s.linkUrlLabel}
        <input
          id={`${fieldId}-link-url`}
          className={styles.linkInput}
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder={s.linkUrlPh}
          value={linkDraft}
          aria-invalid={linkError ? true : undefined}
          aria-describedby={linkError ? `${fieldId}-link-err` : `${fieldId}-link-hint`}
          onChange={(e) => {
            onDraftChange(e.target.value)
            if (linkError) onClearError()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSubmit()
            }
          }}
        />
      </label>
      <p id={`${fieldId}-link-hint`} className={styles.linkHint}>
        {s.linkHint}
      </p>
      {linkError ? (
        <p id={`${fieldId}-link-err`} className={styles.linkError} role="alert">
          {linkError}
        </p>
      ) : null}
    </>
  )
}

export function RichBlockLinkDialog({
  open,
  fieldId,
  linkDraft,
  linkError,
  linkHadExisting,
  strings: s,
  onDraftChange,
  onClearError,
  onClose,
  onSubmit,
  onRemove,
}: Props) {
  return (
    <AdminModal
      open={open}
      title={s.linkDialogTitle}
      onClose={onClose}
      footer={
        <div className={styles.linkFooter}>
          {linkHadExisting ? (
            <AdminCompactBtn
              type="button"
              variant="danger"
              className={styles.linkFooterStart}
              onClick={onRemove}
            >
              {s.linkRemove}
            </AdminCompactBtn>
          ) : null}
          <AdminCompactBtn type="button" variant="outline" onClick={onClose}>
            {s.linkCancel}
          </AdminCompactBtn>
          <AdminCompactBtn type="button" variant="accent" onClick={onSubmit}>
            {s.linkApply}
          </AdminCompactBtn>
        </div>
      }
    >
      <LinkFormFields
        fieldId={fieldId}
        linkDraft={linkDraft}
        linkError={linkError}
        strings={s}
        onDraftChange={onDraftChange}
        onClearError={onClearError}
        onSubmit={onSubmit}
      />
    </AdminModal>
  )
}
