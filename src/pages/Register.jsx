import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.register(form)
      login(res.token, res.account_number)
      setCreated(res.account_number)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div className="card">
        <h1>Conta criada! 🎉</h1>
        <p>Guarde o seu <strong>número de conta</strong> — é ele que você usa pra entrar no jogo:</p>
        <div className="account-number">{created}</div>
        <button className="btn" onClick={() => navigate('/dashboard')}>Ir para meus personagens</button>
      </div>
    )
  }

  return (
    <div className="card">
      <h1>Criar conta</h1>
      <form onSubmit={submit}>
        <label>E-mail
          <input type="email" value={form.email} onChange={set('email')} required />
        </label>
        <label>Senha
          <input type="password" value={form.password} onChange={set('password')} required />
        </label>
        <label>Confirmar senha
          <input type="password" value={form.confirm} onChange={set('confirm')} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
      </form>
    </div>
  )
}
