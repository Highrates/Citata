'use client'

import Link from 'next/link'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminPendingSubmit } from '@/components/admin/AdminPendingSubmit'
import { useAdminFormDirty } from '@/components/admin/useAdminFormDirty'
import type { PressMention } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { savePressMentionsAction } from '@/lib/admin/content-actions'

type PressPageClientProps = {
  items: PressMention[]
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type PressRow = PressMention & { clientKey: string }

let pressKeySeq = 0
function nextClientKey(prefix = 'new') {
  pressKeySeq += 1
  return `${prefix}-${Date.now()}-${pressKeySeq}`
}

function toRows(items: PressMention[]): PressRow[] {
  return items.map((item) => ({
    ...item,
    clientKey: item.id != null ? `id-${item.id}` : nextClientKey('row'),
  }))
}

function rowsToPayload(rows: PressRow[]): PressMention[] {
  return rows.map(({ clientKey: _key, ...item }) => item)
}

function payloadKey(items: PressMention[]) {
  return JSON.stringify(items)
}

function PressFields({
  item,
  onChange,
}: {
  item: PressRow
  onChange: (patch: Partial<PressMention>) => void
}) {
  return (
    <>
      <td>
        <input
          className="admin-control admin-control--input"
          value={item.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </td>
      <td>
        <input
          className="admin-control admin-control--input"
          value={item.source}
          onChange={(e) => onChange({ source: e.target.value })}
        />
      </td>
      <td>
        <input
          className="admin-control admin-control--input"
          value={item.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </td>
    </>
  )
}

function SortablePressRow({
  item,
  onChange,
  onRemove,
}: {
  item: PressRow
  onChange: (patch: Partial<PressMention>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.clientKey,
  })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="admin-table-col-drag">
        <button
          type="button"
          className="admin-drag-handle"
          aria-label={`Переместить «${item.title}»`}
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
      </td>
      <PressFields item={item} onChange={onChange} />
      <td className="admin-table-actions">
        <button type="button" className="admin-table-remove" aria-label="Удалить" onClick={onRemove}>
          ×
        </button>
      </td>
    </tr>
  )
}

export function PressPageClient({ items: initialItems, source, saved, error }: PressPageClientProps) {
  const baselineRef = useRef(payloadKey(initialItems))
  const [items, setItems] = useState<PressRow[]>(() => toRows(initialItems))
  const [activeId, setActiveId] = useState<string | null>(null)
  const itemsJsonRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setItems(toRows(initialItems))
    baselineRef.current = payloadKey(initialItems)
  }, [initialItems, saved])

  const payload = useMemo(() => rowsToPayload(items), [items])
  const dirty = payloadKey(payload) !== baselineRef.current
  const { allowLeave } = useAdminFormDirty(dirty)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => items.map((i) => i.clientKey), [items])
  const activeItem = activeId ? items.find((i) => i.clientKey === activeId) : null

  function syncJson(_e: FormEvent<HTMLFormElement>) {
    if (itemsJsonRef.current) {
      itemsJsonRef.current.value = JSON.stringify(payload)
    }
    allowLeave()
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.clientKey === active.id)
      const newIndex = prev.findIndex((i) => i.clientKey === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function patchRow(clientKey: string, patch: Partial<PressMention>) {
    setItems((prev) => prev.map((row) => (row.clientKey === clientKey ? { ...row, ...patch } : row)))
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Пресса</h1>
          {dirty ? <p className="admin-muted admin-edit-dirty">Не сохранено</p> : null}
        </div>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <form action={savePressMentionsAction} onSubmit={syncJson}>
        <input
          ref={itemsJsonRef}
          type="hidden"
          name="itemsJson"
          defaultValue={JSON.stringify(payload)}
        />

        <div className="admin-toolbar">
          <AdminPendingSubmit className="admin-btn admin-btn--neutral" />
          <button
            type="button"
            className="admin-btn admin-btn--accent admin-toolbar__end"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                {
                  clientKey: nextClientKey(),
                  title: 'Новая публикация',
                  source: 'Издание',
                  url: 'https://',
                  sortOrder: prev.length + 1,
                },
              ])
            }
          >
            Добавить
          </button>
        </div>
        {dirty ? <p className="admin-edit-dirty-hint">Есть несохранённые изменения</p> : null}

        <div className="admin-table-wrap">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-table-col-drag" aria-label="Порядок" />
                    <th>Заголовок</th>
                    <th>Издание</th>
                    <th>URL</th>
                    <th className="admin-table-actions" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <SortablePressRow
                      key={item.clientKey}
                      item={item}
                      onChange={(patch) => patchRow(item.clientKey, patch)}
                      onRemove={() =>
                        setItems((prev) => prev.filter((row) => row.clientKey !== item.clientKey))
                      }
                    />
                  ))}
                </tbody>
              </table>
            </SortableContext>
            <DragOverlay>
              {activeItem ? (
                <table className="admin-table admin-table--drag-overlay">
                  <tbody>
                    <tr>
                      <td className="admin-table-col-drag">⋮⋮</td>
                      <PressFields item={activeItem} onChange={() => undefined} />
                      <td className="admin-table-actions" />
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </form>

      <p className="admin-muted admin-toolbar-note">
        <Link href="/articles">Посмотреть на сайте →</Link>
      </p>
    </>
  )
}
