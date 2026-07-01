import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { vocationName } from '../vocations.js'

// Tipos de ranking (bate com a whitelist do backend).
const TYPES = [
  { key: 'level',     label: 'Level',      valueLabel: 'Exp' },
  { key: 'magic',     label: 'Magic Level', valueLabel: 'ML' },
  { key: 'fist',      label: 'Fist',       valueLabel: 'Skill' },
  { key: 'club',      label: 'Club',       valueLabel: 'Skill' },
  { key: 'sword',     label: 'Sword',      valueLabel: 'Skill' },
  { key: 'axe',       label: 'Axe',        valueLabel: 'Skill' },
  { key: 'distance',  label: 'Distance',   valueLabel: 'Skill' },
  { key: 'shielding', label: 'Shielding',  valueLabel: 'Skill' },
  { key: 'fishing',   label: 'Fishing',    valueLabel: 'Skill' },
]

// Filtros de vocação (bases 1..4 já incluem as promoções no backend).
const VOC_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 0, label: 'No vocation' },
  { value: 1, label: 'Sorcerer' },
  { value: 2, label: 'Druid' },
  { value: 3, label: 'Paladin' },
  { value: 4, label: 'Knight' },
]

export default function Ranking() {
  const [type, setType] = useState('level')
  const [vocation, setVocation] = useState('all')
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valueLabel = TYPES.find((t) => t.key === type)?.valueLabel || 'Valor'

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    api
      .ranking({ type, vocation, page })
      .then((res) => { if (alive) setEntries(res.entries) })
      .catch((err) => { if (alive) setError(err.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [type, vocation, page])

  // Trocar filtro volta pra página 1.
  function onType(e) { setType(e.target.value); setPage(1) }
  function onVoc(e) {
    const v = e.target.value
    setVocation(v === 'all' ? 'all' : Number(v))
    setPage(1)
  }

  return (
    <div className="card">
      <h1>Ranking</h1>

      <div className="filters">
        <label>Tipo
          <select value={type} onChange={onType}>
            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>
        <label>Vocação
          <select value={vocation} onChange={onVoc}>
            {VOC_FILTERS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Carregando...</p>
      ) : entries.length === 0 ? (
        <p className="muted">Nenhum personagem encontrado para esse filtro.</p>
      ) : (
        <table className="chars">
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Nome</th>
              <th style={{ width: 70 }}>Level</th>
              <th>Vocação</th>
              <th style={{ width: 120 }}>{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.rank}>
                <td>{e.rank}</td>
                <td>{e.name}</td>
                <td>{e.level}</td>
                <td>{vocationName(e.vocation)}</td>
                <td>{e.value.toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pager">
        <button className="btn ghost" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>
          ← Anterior
        </button>
        <span className="muted">Página {page}</span>
        <button className="btn ghost" disabled={entries.length < 50 || loading} onClick={() => setPage(page + 1)}>
          Próxima →
        </button>
      </div>
    </div>
  )
}
