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
        <Link href="/" className="admin-login-brand" aria-label="ЦИТАТА — на главную">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/Citata.svg"
            alt="ЦИТАТА"
            width={1663}
            height={171}
            className="admin-login-logo"
            decoding="async"
          />
        </Link>

        <p className="admin-login-tagline">
          Агентство информационных технологий
          <br />
          &amp; коммуникаций
        </p>

        <h1 className="admin-login-title">Вход в админку</h1>

        {params.error ? <p className="admin-error">Неверный email или пароль.</p> : null}

        <form className="admin-form admin-login-form" action={loginAdminAction}>
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
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </div>
          <div className="admin-form-actions admin-login-actions">
            <button type="submit" className="admin-btn admin-btn--accent admin-login-submit">
              Войти
            </button>
          </div>
        </form>

        <p className="admin-login-back">
          <Link href="/">← На сайт</Link>
        </p>
      </div>
    </div>
  )
}
