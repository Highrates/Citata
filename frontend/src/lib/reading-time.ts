export function formatReadingTimeRu(minutes: number) {
  const n = Math.max(1, Math.round(minutes))
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} минута`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} минуты`
  return `${n} минут`
}

export function formatArticleDateRu(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  const date = new Date(year, (month || 1) - 1, day || 1)
  const raw = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return raw
    .replace(/\s?г\.?$/u, '')
    .replace(/(\d+\s)([а-яё])/u, (_, prefix: string, letter: string) => prefix + letter.toUpperCase())
}
