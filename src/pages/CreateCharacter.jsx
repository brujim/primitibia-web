import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { CREATABLE_VOCATIONS, vocationName } from '../vocations.js'

export default function CreateCharacter() {
  const [form, setForm] = useState({ name: '', sex: 1, vocation: CREATABLE_VOCATIONS[0] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.createCharacter({
        name: form.name.trim(),
        sex: Number(form.sex),
        vocation: Number(form.vocation),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1>Criar personagem</h1>
      <form onSubmit={submit}>
        <label>Nome
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Somente letras e espaços"
            required
          />
        </label>

        <label>Sexo
          <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
            <option value={1}>Masculino</option>
            <option value={0}>Feminino</option>
          </select>
        </label>

        <label>Vocação
          <select value={form.vocation} onChange={(e) => setForm({ ...form, vocation: e.target.value })}>
            {CREATABLE_VOCATIONS.map((id) => (
              <option key={id} value={id}>{vocationName(id)}</option>
            ))}
          </select>
        </label>

        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn" disabled={loading}>{loading ? 'Criando...' : 'Criar'}</button>
          <button type="button" className="btn ghost" onClick={() => navigate('/dashboard')}>Cancelar</button>
        </div>
      </form>
    </div>
  )
}
