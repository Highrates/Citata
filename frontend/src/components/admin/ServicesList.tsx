'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useFormStatus } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AdminEditLink } from '@/components/admin/AdminEditLink'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminSearch } from '@/components/admin/AdminSearch'
import type { Service } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { reorderServicesAction } from '@/lib/admin/content-actions'

type ServicesListProps = {
  items: Service[]
  source: AdminDataSource
  saved?: boolean
  error?: string
}

function SaveOrderButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="admin-btn admin-btn--neutral" disabled={pending}>
      {pending ? 'Сохранение…' : 'Сохранить порядок'}
    </button>
  )
}

function descriptionPreview(html?: string) {
  if (!html?.trim()) return '—'
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return '—'
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}

function ServiceRow({ item }: { item: Service }) {
  return (
    <>
      <td className="admin-table-col-thumb">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            width={56}
            height={40}
            className="admin-table-thumb"
          />
        ) : (
          <span className="admin-muted">—</span>
        )}
      </td>
      <td>
        <Link href={`/admin/services/${item.slug}`} className="admin-table-title">
          {item.title}
        </Link>
      </td>
      <td className="admin-muted">{descriptionPreview(item.description)}</td>
      <td className="admin-table-actions">
        <AdminEditLink href={`/admin/services/${item.slug}`} label={`Изменить «${item.title}»`} />
      </td>
    </>
  )
}

function SortableServiceRow({ item }: { item: Service }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.slug,
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
      <ServiceRow item={item} />
    </tr>
  )
}

export function ServicesList({ items: initialItems, source, saved, error }: ServicesListProps) {
  const [items, setItems] = useState(initialItems)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const orderJsonRef = useRef<HTMLInputElement>(null)
  const baselineOrder = useMemo(() => initialItems.map((i) => i.slug).join(','), [initialItems])
  const currentOrder = items.map((i) => i.slug).join(',')
  const orderDirty = currentOrder !== baselineOrder
  const canReorder = source === 'payload' && !query.trim()

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const displayItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const desc = descriptionPreview(item.description).toLowerCase()
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (desc !== '—' && desc.includes(q))
      )
    })
  }, [items, query])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => displayItems.map((i) => i.slug), [displayItems])
  const activeItem = activeId ? items.find((i) => i.slug === activeId) : null

  function syncOrderJson() {
    if (orderJsonRef.current) {
      orderJsonRef.current.value = JSON.stringify(items.map((i) => i.slug))
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.slug === active.id)
      const newIndex = prev.findIndex((i) => i.slug === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <>
      <div className="admin-page-head">
        <h1 className="admin-title">Услуги</h1>
        <Link href="/admin/services/new" className="admin-btn admin-btn--accent">
          Добавить услугу
        </Link>
      </div>

      <p className="admin-lead">Список услуг на странице /services. Обложка показывается при наведении.</p>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <div className="admin-toolbar">
        <AdminSearch
          className="admin-search--toolbar"
          value={query}
          onChange={setQuery}
          placeholder="Поиск по названию…"
        />
        {orderDirty && canReorder ? (
          <form action={reorderServicesAction} onSubmit={syncOrderJson}>
            <input ref={orderJsonRef} type="hidden" name="orderJson" defaultValue="[]" />
            <SaveOrderButton />
          </form>
        ) : null}
      </div>

      <div className="admin-table-wrap">
        {canReorder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <table className="admin-table admin-table--cases">
                <thead>
                  <tr>
                    <th className="admin-table-col-drag" aria-label="Порядок" />
                    <th className="admin-table-col-thumb" aria-label="Обложка" />
                    <th>Услуга</th>
                    <th>Описание</th>
                    <th className="admin-table-actions" />
                  </tr>
                </thead>
                <tbody>
                  {displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="admin-table-empty">
                        Ничего не найдено
                      </td>
                    </tr>
                  ) : (
                    displayItems.map((item) => <SortableServiceRow key={item.slug} item={item} />)
                  )}
                </tbody>
              </table>
            </SortableContext>
            <DragOverlay>
              {activeItem ? (
                <table className="admin-table admin-table--cases admin-table--drag-overlay">
                  <tbody>
                    <tr>
                      <td className="admin-table-col-drag">⋮⋮</td>
                      <ServiceRow item={activeItem} />
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <table className="admin-table admin-table--cases">
            <thead>
              <tr>
                <th className="admin-table-col-thumb" aria-label="Обложка" />
                <th>Услуга</th>
                <th>Описание</th>
                <th className="admin-table-actions" />
              </tr>
            </thead>
            <tbody>
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-table-empty">
                    Ничего не найдено
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => (
                  <tr key={item.slug}>
                    <ServiceRow item={item} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
