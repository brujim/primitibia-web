import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'

function fmtTime(unix) {
  return new Date(unix * 1000).toLocaleString()
}

// Página de revisão do Core Guard (anti-cheat). SÓ contas GOD (accounts.type >= 6).
// Lista os reports pra revisão manual — NADA é banido automaticamente.
export default function GuardReports() {
  const { logout } = useAuth()
  const [allowed, setAllowed] = useState(null) // null=carregando, false=negado, true=ok
  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState('')

  async function checkAccess() {
    try {
      const me = await api.me()
      setAllowed((me.account_type || 0) >= 6)
    } catch (err) {
      setError(err.message)
      if (/expirada|autenticado/i.test(err.message)) logout()
      setAllowed(false)
    }
  }

  async function load() {
    setError('')
    try {
      const data = await api.guardReports({ page, status })
      setReports(data.reports || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { checkAccess() }, [])
  useEffect(() => { if (allowed) load() }, [allowed, page, status])

  async function mark(id, reviewed) {
    try {
      await api.guardReportMark(id, reviewed, null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (allowed === null) return <div className="card"><p>Carregando...</p></div>
  if (allowed === false) {
    return (
      <div className="card">
        <p className="error">Acesso restrito a administradores (GOD).</p>
      </div>
    )
  }

  const pages = Math.max(1, Math.ceil(total / 50))

  return (
    <div className="card">
      <div className="row-between">
        <h1>Core Guard — Reports</h1>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value) }}
        >
          <option value="pending">Pendentes</option>
          <option value="reviewed">Revisados</option>
          <option value="all">Todos</option>
        </select>
      </div>
      <p className="muted">
        {total} report(s). Revise e banha manualmente — nada é banido automaticamente.
      </p>
      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table className="guard-table">
          <thead>
            <tr>
              <th>Quando</th>
              <th>Origem</th>
              <th>Tipo</th>
              <th>Detectado</th>
              <th>IP</th>
              <th>Host / Usuário</th>
              <th>Personagem</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className={r.reviewed ? 'reviewed' : ''}>
                <td>{fmtTime(r.created_at)}</td>
                <td>{r.source}</td>
                <td>{r.kind}</td>
                <td className="detected">{r.detected}</td>
                <td>{r.ip}</td>
                <td>{r.hostname}{r.os_user ? ` / ${r.os_user}` : ''}</td>
                <td>{r.character_name || '—'}</td>
                <td>
                  {r.reviewed ? (
                    <button className="link" onClick={() => mark(r.id, false)}>reabrir</button>
                  ) : (
                    <button className="btn small" onClick={() => mark(r.id, true)}>revisado</button>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={8} className="muted">Nenhum report.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pager">
          <button className="link" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ anterior</button>
          <span>página {page} / {pages}</span>
          <button className="link" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>próxima ›</button>
        </div>
      )}
    </div>
  )
}
