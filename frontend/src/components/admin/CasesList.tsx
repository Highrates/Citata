'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useFormStatus } from 'react-dom'
import { AdminBadge } from '@/components/admin/AdminBadge'
import { AdminEditLink } from '@/components/admin/AdminEditLink'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminSearch } from '@/components/admin/AdminSearch'
import type { Case, CaseStatus } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { reorderCasesAction } from '@/lib/admin/content-actions'

type CasesListProps = {
  items: Case[]
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type CaseFilter = 'all' | 'published' | 'featured' | 'draft' | 'hidden'

function sortCases(items: Case[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

function statusLabel(status: CaseStatus | undefined) {
  if (status === 'published') return 'Опубликовано'
  if (status === 'hidden') return 'Скрыто'
  return 'Черновик'
}

function statusVariant(status: CaseStatus | undefined): 'on' | 'off' | 'draft' {
  if (status === 'published') return 'on'
  if (status === 'hidden') return 'off'
  return 'draft'
}

function isVideoCover(item: Case) {
  if (item.gallery?.[0]?.kind === 'video') return true
  return /\.(mp4|webm|mov)(\?|$)/i.test(item.cover)
}

function CaseCoverThumb({ item }: { item: Case }) {
  if (!item.cover) {
    return <span className="admin-table-thumb admin-table-thumb--empty" />
  }

  if (isVideoCover(item)) {
    return (
      <video
        src={item.cover}
        muted
        playsInline
        preload="metadata"
        className="admin-table-thumb admin-table-thumb--video"
        aria-hidden
      />
    )
  }

  return (
    <Image src={item.cover} alt="" width={52} height={52} className="admin-table-thumb" />
  )
}

function SaveOrderButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="admin-btn admin-btn--neutral" disabled={pending}>
      {pending ? 'Сохранение…' : 'Сохранить порядок'}
    </button>
  )
}

function CaseRowCells({ item }: { item: Case }) {
  const status = item.status ?? 'draft'
  return (
    <>
      <td>
        <CaseCoverThumb item={item} />
      </td>
      <td>
        <Link href={`/admin/cases/${item.slug}`} className="admin-table-title">
          {item.title}
        </Link>
        <div className="admin-table-meta">
          {item.year ? `${item.year}` : null}
          {item.year && item.summary ? ' · ' : null}
          {item.summary
            ? item.summary.length > 72
              ? `${item.summary.slice(0, 72)}…`
              : item.summary
            : null}
        </div>
      </td>
      <td>
        <AdminBadge variant={statusVariant(status)}>{statusLabel(status)}</AdminBadge>
      </td>
      <td className="admin-table-col-home">
        {item.featured && status === 'published' ? (
          <span
            className="admin-home-dot"
            title={
              item.homeOrder != null
                ? `На главной · позиция ${item.homeOrder}`
                : 'На главной'
            }
            aria-label={
              item.homeOrder != null
                ? `На главной, позиция ${item.homeOrder}`
                : 'На главной'
            }
          >
            {item.homeOrder != null ? item.homeOrder : '●'}
          </span>
        ) : (
          <span className="admin-home-dot admin-home-dot--off" aria-hidden>
            ○
          </span>
        )}
      </td>
      <td className="admin-table-actions">
        <AdminEditLink href={`/admin/cases/${item.slug}`} label={`Изменить «${item.title}»`} />
      </td>
    </>
  )
}

function SortableCaseRow({ item }: { item: Case }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.slug,
  })
  const inactive = (item.status ?? 'draft') !== 'published'
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'admin-table-row--dragging' : ''}${inactive ? ' admin-table-row--inactive' : ''}`}
    >
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
      <CaseRowCells item={item} />
    </tr>
  )
}

function StaticCaseRow({ item }: { item: Case }) {
  const inactive = (item.status ?? 'draft') !== 'published'
  return (
    <tr className={inactive ? 'admin-table-row--inactive' : undefined}>
      <CaseRowCells item={item} />
    </tr>
  )
}

function CaseRowOverlay({ item }: { item: Case }) {
  return (
    <table className="admin-table admin-table--cases admin-table--drag-overlay">
      <tbody>
        <tr>
          <td className="admin-table-col-drag">
            <span className="admin-drag-handle" aria-hidden>
              ⋮⋮
            </span>
          </td>
          <CaseRowCells item={item} />
        </tr>
      </tbody>
    </table>
  )
}

export function CasesList({ items, source, saved, error }: CasesListProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CaseFilter>('all')
  const [orderedItems, setOrderedItems] = useState(() => sortCases(items))
  const [activeId, setActiveId] = useState<string | null>(null)
  const initialOrderRef = useRef(items.map((item) => item.slug).join(','))
  const orderJsonRef = useRef<HTMLInputElement>(null)
  const allowLeaveRef = useRef(false)

  useEffect(() => {
    const sorted = sortCases(items)
    setOrderedItems(sorted)
    initialOrderRef.current = sorted.map((item) => item.slug).join(',')
    allowLeaveRef.current = false
  }, [items])

  const canReorder = filter === 'all' && !query

  const filtered = useMemo(() => {
    return orderedItems.filter((item) => {
      const status = item.status ?? 'draft'
      if (filter === 'published' && status !== 'published') return false
      if (filter === 'featured' && !(item.featured && status === 'published')) return false
      if (filter === 'draft' && status !== 'draft') return false
      if (filter === 'hidden' && status !== 'hidden') return false
      if (!query) return true
      const q = query.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
    })
  }, [orderedItems, query, filter])

  const displayItems = canReorder ? orderedItems : filtered
  const ids = useMemo(() => orderedItems.map((item) => item.slug), [orderedItems])

  const orderDirty = useMemo(() => {
    const current = orderedItems.map((item) => item.slug).join(',')
    return current !== initialOrderRef.current
  }, [orderedItems])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!orderDirty || allowLeaveRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [orderDirty])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeItem = activeId ? orderedItems.find((item) => item.slug === activeId) : null

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = orderedItems.findIndex((item) => item.slug === active.id)
    const newIndex = orderedItems.findIndex((item) => item.slug === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    setOrderedItems(arrayMove(orderedItems, oldIndex, newIndex))
  }

  function onDragCancel() {
    setActiveId(null)
  }

  function syncOrderJson() {
    if (orderJsonRef.current) {
      orderJsonRef.current.value = JSON.stringify(orderedItems.map((item) => item.slug))
    }
    allowLeaveRef.current = true
  }

  const tableHead = (
    <thead>
      <tr>
        {canReorder ? <th className="admin-table-col-drag" aria-label="Порядок" /> : null}
        <th className="admin-table-col-thumb" aria-label="Обложка" />
        <th>Кейс</th>
        <th>Статус</th>
        <th className="admin-table-col-home">Главная</th>
        <th className="admin-table-actions" />
      </tr>
    </thead>
  )

  return (
    <>
      <div className="admin-page-head">
        <h1 className="admin-title">Кейсы</h1>
        <Link href="/admin/cases/new" className="admin-btn admin-btn--accent">
          Добавить кейс
        </Link>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />
      <p className="admin-muted">
        Drag меняет порядок на /works. Порядок на главной — поле «Порядок на главной» в карточке
        кейса или статьи.
      </p>

      <div className="admin-toolbar">
        <AdminSearch
          className="admin-search--toolbar"
          value={query}
          onChange={setQuery}
          placeholder="Поиск по названию…"
        />
        {orderDirty ? (
          <form action={reorderCasesAction} onSubmit={syncOrderJson}>
            <input ref={orderJsonRef} type="hidden" name="orderJson" defaultValue="[]" />
            <SaveOrderButton />
          </form>
        ) : null}
      </div>

      <div className="admin-tabs-pill" role="tablist" aria-label="Фильтр">
        {(
          [
            ['all', 'Все'],
            ['published', 'Опубликованные'],
            ['featured', 'На главной'],
            ['draft', 'Черновики'],
            ['hidden', 'Скрытые'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`admin-tab-pill${filter === key ? ' admin-tab-pill--active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        {canReorder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <table className="admin-table admin-table--cases">
                {tableHead}
                <tbody>
                  {displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-table-empty">
                        Ничего не найдено
                      </td>
                    </tr>
                  ) : (
                    displayItems.map((item) => <SortableCaseRow key={item.slug} item={item} />)
                  )}
                </tbody>
              </table>
            </SortableContext>
            <DragOverlay>
              {activeItem ? <CaseRowOverlay item={activeItem} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <table className="admin-table admin-table--cases">
            {tableHead}
            <tbody>
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-table-empty">
                    Ничего не найдено
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => <StaticCaseRow key={item.slug} item={item} />)
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
