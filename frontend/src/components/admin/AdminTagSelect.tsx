'use client'

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

export type AdminTagOption = {
  value: string
  label: string
}

type AdminTagSelectProps = {
  id?: string
  label: string
  options: AdminTagOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  emptyText?: string
}

export function AdminTagSelect({
  id: idProp,
  label,
  options,
  value,
  onChange,
  placeholder = 'Добавить…',
  emptyText = 'Все варианты уже выбраны',
}: AdminTagSelectProps) {
  const reactId = useId()
  const fieldId = idProp ?? reactId
  const listId = `${fieldId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedSet = useMemo(() => new Set(value), [value])
  const labelByValue = useMemo(
    () => new Map(options.map((opt) => [opt.value, opt.label])),
    [options],
  )

  const available = useMemo(() => {
    const q = query.trim().toLowerCase()
    return options.filter((opt) => {
      if (selectedSet.has(opt.value)) return false
      if (!q) return true
      return opt.label.toLowerCase().includes(q)
    })
  }, [options, query, selectedSet])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, close])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  const addValue = useCallback(
    (nextValue: string) => {
      if (selectedSet.has(nextValue)) return
      onChange([...value, nextValue])
      setQuery('')
      setActiveIndex(0)
    },
    [onChange, selectedSet, value],
  )

  const removeValue = useCallback(
    (nextValue: string) => {
      onChange(value.filter((item) => item !== nextValue))
    },
    [onChange, value],
  )

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }

    if (event.key === 'Backspace' && !query && value.length) {
      event.preventDefault()
      removeValue(value[value.length - 1]!)
      return
    }

    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault()
      setOpen(true)
      return
    }

    if (!available.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((prev) => (prev + 1) % available.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((prev) => (prev - 1 + available.length) % available.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const pick = available[activeIndex]
      if (pick) addValue(pick.value)
    }
  }

  return (
    <div className="admin-field" ref={rootRef}>
      <label className="admin-field-label" htmlFor={fieldId}>
        {label}
      </label>
      <div className={`admin-tag-select${open ? ' admin-tag-select--open' : ''}`}>
        <div className="admin-tag-select__control">
          {value.length > 0 ? (
            <ul className="admin-chips admin-tag-select__chips">
              {value.map((item) => (
                <li key={item} className="admin-chip">
                  <span>{labelByValue.get(item) ?? item}</span>
                  <button
                    type="button"
                    className="admin-chip-remove"
                    aria-label={`Убрать ${labelByValue.get(item) ?? item}`}
                    onClick={() => removeValue(item)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <input
            id={fieldId}
            className="admin-tag-select__input"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && available[activeIndex]
                ? `${listId}-option-${available[activeIndex]!.value}`
                : undefined
            }
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onInputKeyDown}
          />
        </div>

        {open ? (
          <ul id={listId} className="admin-tag-select__menu" role="listbox">
            {available.length === 0 ? (
              <li className="admin-tag-select__empty" role="presentation">
                {options.length === value.length ? emptyText : 'Ничего не найдено'}
              </li>
            ) : (
              available.map((opt, index) => (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${opt.value}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`admin-tag-select__option${
                      index === activeIndex ? ' admin-tag-select__option--active' : ''
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addValue(opt.value)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
