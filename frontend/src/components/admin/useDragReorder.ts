'use client'

import { useCallback, useState } from 'react'

import { moveItem } from '@/lib/admin/sortable'

type UseDragReorderOptions<T> = {
  items: T[]
  onReorder: (items: T[]) => void
  disabled?: boolean
}

export function useDragReorder<T>({ items, onReorder, disabled = false }: UseDragReorderOptions<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const finishDrag = useCallback(() => {
    setDragIndex(null)
    setOverIndex(null)
  }, [])

  const handleDragStart = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (disabled) return
      setDragIndex(index)
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(index))
    },
    [disabled],
  )

  const handleDragOver = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (disabled || dragIndex === null) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setOverIndex(index)
    },
    [disabled, dragIndex],
  )

  const handleDrop = useCallback(
    (index: number) => (event: React.DragEvent) => {
      if (disabled || dragIndex === null) return
      event.preventDefault()
      onReorder(moveItem(items, dragIndex, index))
      finishDrag()
    },
    [disabled, dragIndex, finishDrag, items, onReorder],
  )

  const rowClassName = useCallback(
    (index: number) => {
      const classes = []
      if (dragIndex === index) classes.push('admin-table-row--dragging')
      if (overIndex === index && dragIndex !== index) classes.push('admin-table-row--drop-target')
      return classes.join(' ')
    },
    [dragIndex, overIndex],
  )

  return {
    canDrag: !disabled,
    finishDrag,
    handleDragStart,
    handleDragOver,
    handleDrop,
    rowClassName,
  }
}
