// Cliente HTTP fino pra API PHP.
// Caminho relativo: o proxy (Vite em dev, Vercel em prod) encaminha /api pro VPS.
const BASE = import.meta.env.VITE_API_URL || '/api'

function token() {
  return localStorage.getItem('token') || ''
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const t = token()
  if (t) headers['Authorization'] = `Bearer ${t}`

  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = {}
  try { data = await res.json() } catch { /* corpo vazio */ }

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`)
  }
  return data
}

export const api = {
  register: (payload) => request('register.php', { method: 'POST', body: payload }),
  login:    (payload) => request('login.php',    { method: 'POST', body: payload }),
  me:       ()        => request('me.php'),
  status:   ()        => request('status.php'),
  news:     ()        => request('news.php'),
  // Doações
  donatePackages: ()        => request('donate_packages.php'),
  donateCreate:   (payload) => request('donate_create.php', { method: 'POST', body: payload }),
  donateStatus:   (id)      => request(`donate_status.php?id=${id}`),
  donateClaim:    (payload) => request('donate_claim.php', { method: 'POST', body: payload }),
  // Doações — admin (GOD)
  donationsList:   ({ page = 1, status = 'all' } = {}) =>
    request(`donations_list.php?page=${page}&status=${encodeURIComponent(status)}`),
  donationApprove: (id, action) =>
    request('donation_approve.php', { method: 'POST', body: { id, action } }),
  ranking:  ({ type, vocation, page }) =>
    request(`ranking.php?type=${encodeURIComponent(type)}&vocation=${encodeURIComponent(vocation)}&page=${page}`),
  createCharacter: (payload) => request('character_create.php', { method: 'POST', body: payload }),
  deleteCharacter: (id)      => request('character_delete.php', { method: 'DELETE', body: { id } }),
  // Core Guard (anti-cheat) — só GOD.
  guardReports:    ({ page = 1, status = 'all' } = {}) =>
    request(`guard_reports.php?page=${page}&status=${encodeURIComponent(status)}`),
  guardReportMark: (id, reviewed, notes) =>
    request('guard_report_mark.php', { method: 'POST', body: { id, reviewed, notes } }),
}
