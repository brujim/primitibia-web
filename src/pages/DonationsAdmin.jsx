import { useEffect, useState } from 'react'
import { api } from '../api.js'

const brl = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const dt = (t) => (t ? new Date(t * 1000).toLocaleString('pt-BR') : '—')

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'crypto_pending', label: 'Crypto p/ aprovar' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'credited', label: 'Creditadas' },
  { key: 'failed', label: 'Falhas' },
]

const STATUS_LABEL = {
  pending: 'Pendente',
  credited: 'Creditada',
  failed: 'Falha',
  paid: 'Paga',
}

function tronscan(txid) {
  return `https://tronscan.org/#/transaction/${txid}`
}

export default function DonationsAdmin() {
  const [status, setStatus] = useState('crypto_pending')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(0)

  function load() {
    setLoading(true)
    setError('')
    api.donationsList({ page, status })
      .then((r) => setRows(r.donations || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status, page])

  async function act(id, action) {
    if (action === 'reject' && !confirm('Rejeitar esta doação? Ela não será creditada.')) return
    if (action === 'credit' && !confirm('Creditar os pontos desta doação manualmente?')) return
    setBusyId(id)
    try {
      await api.donationApprove(id, action)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusyId(0)
    }
  }

  return (
    <div className="card">
      <h1>Doações</h1>

      <div className="filters-row">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${status === f.key ? 'active' : ''}`}
            onClick={() => { setStatus(f.key); setPage(1) }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="muted">Nenhuma doação neste filtro.</p>
      ) : (
        <div className="table-wrap">
          <table className="guard-table">
            <thead>
              <tr>
                <th>#</th><th>Data</th><th>Conta</th><th>Método</th>
                <th>Valor</th><th>Pontos</th><th>Status</th><th>Comprovante</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className={d.status === 'credited' ? 'reviewed' : ''}>
                  <td>{d.id}</td>
                  <td>{dt(d.created_at)}</td>
                  <td>#{d.account_id}</td>
                  <td>{d.method === 'pix' ? 'PIX' : `Crypto (${d.coin || '?'})`}</td>
                  <td>{brl(d.amount_cents)}</td>
                  <td className="detected">{d.points}</td>
                  <td>{STATUS_LABEL[d.status] || d.status}</td>
                  <td>
                    {d.method === 'crypto' && d.txid ? (
                      <a href={tronscan(d.txid)} target="_blank" rel="noreferrer">ver txid ↗</a>
                    ) : d.provider_ref ? (
                      <span className="muted">MP {d.provider_ref}</span>
                    ) : '—'}
                  </td>
                  <td>
                    {d.status !== 'credited' && (
                      <div className="row">
                        <button className="btn small" disabled={busyId === d.id} onClick={() => act(d.id, 'credit')}>Creditar</button>
                        <button className="btn ghost small" disabled={busyId === d.id} onClick={() => act(d.id, 'reject')}>Rejeitar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pager">
        <button className="btn ghost" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>← Anterior</button>
        <span className="muted">Página {page}</span>
        <button className="btn ghost" disabled={rows.length < 50 || loading} onClick={() => setPage(page + 1)}>Próxima →</button>
      </div>
    </div>
  )
}
