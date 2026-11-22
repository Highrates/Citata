import Link from 'next/link'

import { loginAdminAction } from '@/lib/admin/actions'
import { ADMIN_BASE } from '@/lib/admin/constants'

export const metadata = { title: 'Вход' }

type Props = { searchParams: Promise<{ error?: string; next?: string }> }

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams
  const next = params.next ?? ADMIN_BASE

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-brand admin-login-brand">Цитата</p>
        <h1 className="admin-title">Вход в админку</h1>
        <p className="admin-lead">Единая панель редактирования сайта.</p>

        {params.error ? (
          <p className="admin-error">Неверный email или пароль.</p>
        ) : null}

        <form className="admin-form" action={loginAdminAction}>
          <input type="hidden" name="next" value={next} />
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="email">
              Email
            </label>
            <input
              className="admin-control admin-control--input"
              id="email"
              name="email"
              type="email"
              placeholder="admin@citata-pr.ru"
              defaultValue="admin@citata-pr.ru"
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="password">
              Пароль
            </label>
            <input
              className="admin-control admin-control--input"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn--accent">
              Войти
            </button>
          </div>
        </form>

        <p className="admin-muted admin-login-back">
          <Link href="/">← На сайт</Link>
        </p>
      </div>
    </div>
  )
}
