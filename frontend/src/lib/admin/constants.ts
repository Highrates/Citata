export const ADMIN_BASE = '/admin'

export const adminPath = (segment = '') =>
  segment ? `${ADMIN_BASE}/${segment.replace(/^\//, '')}` : ADMIN_BASE
