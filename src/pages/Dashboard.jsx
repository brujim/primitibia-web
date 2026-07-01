import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import { vocationName } from '../vocations.js'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const { logout } = useAuth()

  async function load() {
    setError('')
    try {
      setData(await api.me())
    } catch (err) {
      setError(err.message)
      if (/expirada|autenticado/i.test(err.message)) logout()
    }
  }

  useEffect(() => { load() }, [])

  async function remove(id, name) {
    if (!confirm(`Excluir o personagem "${name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.deleteCharacter(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <div className="card"><p className="error">{error}</p></div>
  if (!data) return <div className="card"><p>Carregando...</p></div>

  return (
    <div className="card">
      <div className="row-between">
        <h1>Meus personagens</h1>
        <Link className="btn" to="/characters/new">+ Novo personagem</Link>
      </div>

      <p className="muted">Conta #{data.account_number} · {data.email}</p>

      {data.characters.length === 0 ? (
        <p className="muted">Você ainda não tem personagens. Crie o primeiro!</p>
      ) : (
        <table className="chars">
          <thead>
            <tr><th>Nome</th><th>Level</th><th>Vocação</th><th>Sexo</th><th></th></tr>
          </thead>
          <tbody>
            {data.characters.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.level}</td>
                <td>{vocationName(c.vocation)}</td>
                <td>{c.sex === 1 ? 'Masculino' : 'Feminino'}</td>
                <td><button className="link danger" onClick={() => remove(c.id, c.name)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
