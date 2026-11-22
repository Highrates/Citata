import { AdminShell } from '@/components/admin/AdminShell'

export default function CmsPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
