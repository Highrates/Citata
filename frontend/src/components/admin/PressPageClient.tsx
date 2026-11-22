'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { useDragReorder } from '@/components/admin/useDragReorder'
import type { PressMention } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { savePressMentionsAction } from '@/lib/admin/content-actions'

type PressPageClientProps = {
  items: PressMention[]
  source: AdminDataSource
  saved?: boolean
  error?: string
}

export function PressPageClient({ items: initialItems, source, saved, error }: PressPageClientProps) {
  const [items, setItems] = useState(initialItems)
  const itemsJsonRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const drag = useDragReorder({
    items,
    onReorder: setItems,
  })

  function syncJson() {
    if (itemsJsonRef.current) {
      itemsJsonRef.current.value = JSON.stringify(items)
    }
  }

  return (
    <>
      <h1 className="admin-title">Пресса</h1>
      <p className="admin-lead">Блок «Здесь пишут о нас». Перетащите строки для изменения порядка.</p>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <form action={savePressMentionsAction} onSubmit={syncJson}>
        <input ref={itemsJsonRef} type="hidden" name="itemsJson" defaultValue={JSON.stringify(items)} />

        <div className="admin-toolbar">
          <button type="submit" className="admin-btn admin-btn--neutral">
            Сохранить
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--accent admin-toolbar__end"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { title: 'Новая публикация', source: 'Издание', url: 'https://', sortOrder: prev.length + 1 },
              ])
            }
          >
            Добавить
          </button>
        </div>

        <div className="admin-table-wrap">
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
              {items.map((item, index) => (
                <tr
                  key={`${item.url}-${index}`}
                  className={drag.rowClassName(index)}
                  onDragOver={drag.handleDragOver(index)}
                  onDrop={drag.handleDrop(index)}
                  onDragEnd={drag.finishDrag}
                >
                  <td className="admin-table-col-drag">
                    <button
                      type="button"
                      className="admin-drag-handle"
                      aria-label={`Переместить «${item.title}»`}
                      draggable
                      onDragStart={drag.handleDragStart(index)}
                    >
                      ⋮⋮
                    </button>
                  </td>
                  <td>
                    <input
                      className="admin-control admin-control--input"
                      value={item.title}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-control admin-control--input"
                      value={item.source}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, source: e.target.value } : row)),
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="admin-control admin-control--input"
                      value={item.url}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, url: e.target.value } : row)),
                        )
                      }
                    />
                  </td>
                  <td className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-table-remove"
                      aria-label="Удалить"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>

      <p className="admin-muted admin-toolbar-note">
        <Link href="/articles">Посмотреть на сайте →</Link>
      </p>
    </>
  )
}
