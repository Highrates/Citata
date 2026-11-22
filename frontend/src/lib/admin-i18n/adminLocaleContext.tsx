'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type AdminLocale = 'ru' | 'zh'

type AdminLocaleContextValue = {
  locale: AdminLocale
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null)

type AdminLocaleProviderProps = {
  locale?: AdminLocale
  children: ReactNode
}

/** Admin UI locale. Citata defaults to RU; zh is available for RichBlock strings. */
export function AdminLocaleProvider({ locale = 'ru', children }: AdminLocaleProviderProps) {
  const value = useMemo(() => ({ locale }), [locale])
  return <AdminLocaleContext.Provider value={value}>{children}</AdminLocaleContext.Provider>
}

export function useAdminLocale(): AdminLocaleContextValue {
  return useContext(AdminLocaleContext) ?? { locale: 'ru' }
}

/** RichBlock: locale from AdminLocaleProvider when inside admin, else null → detect. */
export function useOptionalAdminLocale(): AdminLocaleContextValue | null {
  return useContext(AdminLocaleContext)
}
