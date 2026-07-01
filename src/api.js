// Cliente HTTP fino pra API PHP.
const BASE = import.meta.env.VITE_API_URL || '/backend/api'

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
  ranking:  ({ type, vocation, page }) =>
    request(`ranking.php?type=${encodeURIComponent(type)}&vocation=${encodeURIComponent(vocation)}&page=${page}`),
  createCharacter: (payload) => request('character_create.php', { method: 'POST', body: payload }),
  deleteCharacter: (id)      => request('character_delete.php', { method: 'DELETE', body: { id } }),
}
