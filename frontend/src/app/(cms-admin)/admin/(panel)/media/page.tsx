export const metadata = { title: 'Медиа' }

export default function CmsMediaPage() {
  return (
    <>
      <h1 className="admin-title">Медиа</h1>
      <p className="admin-lead">
        Библиотека файлов появится на фазе 3 с S3 Рег.облако. Сейчас изображения подтягиваются с CDN Webflow.
      </p>
      <p className="admin-muted">
        Загрузка, превью, alt-тексты и привязка к кейсам/статьям — после подключения Payload + S3.
      </p>
      <div
        style={{
          marginTop: 24,
          padding: '48px',
          textAlign: 'center',
          border: '0.7px dashed rgba(0,0,0,0.2)',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <p className="admin-muted">Перетащите файлы сюда (скоро)</p>
        <button type="button" className="admin-btn admin-btn--outline" style={{ marginTop: 12 }} disabled>
          Загрузить
        </button>
      </div>
    </>
  )
}
