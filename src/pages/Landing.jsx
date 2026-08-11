import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'

const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL || ''

const FEATURES = [
  { icon: '⚔️', title: 'Era 7.72 clássica', text: 'A nostalgia do Tibia old-school, refinada e estável.' },
  { icon: '🔨', title: 'Sistemas nativos', text: 'Forja, Craft, Mineração, Pesca e muito mais, feitos sob medida.' },
  { icon: '🛡️', title: 'Primitivia Guard', text: 'Anti-cheat próprio: jogo limpo e protegido de bots.' },
  { icon: '🏆', title: 'Economia & Loja', text: 'Ranking, loja de pontos e recompensas por progressão.' },
]

const BADGE = { Changelog: 'cat-change', Evento: 'cat-event', Novidade: 'cat-new' }

function fmtDate(d) {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

function OnlineBadge() {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    let alive = true
    const load = () =>
      api.status().then((s) => alive && setStatus(s)).catch(() => alive && setStatus({ online: false }))
    load()
    const id = setInterval(load, 30000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  const online = status?.online
  return (
    <div className={`online-badge ${online ? 'is-on' : online === false ? 'is-off' : ''}`}>
      <span className="dot" />
      {status == null
        ? 'Consultando servidor...'
        : online
        ? <span><strong>{status.players}</strong> jogadores online</span>
        : 'Servidor offline'}
    </div>
  )
}

function ServerSaveCountdown() {
  const [deadline, setDeadline] = useState(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    const load = () =>
      api.status()
        .then((s) => {
          if (alive && s.next_server_save && s.server_now) {
            // Ancora nos segundos restantes calculados pelo server (imune ao relógio do cliente).
            setDeadline(Date.now() + (s.next_server_save - s.server_now) * 1000)
          }
        })
        .catch(() => {})
    load()
    const id = setInterval(load, 60000) // re-sincroniza (e pega o próximo SS quando este passa)
    return () => { alive = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  if (!deadline) return null
  const total = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
  const pad = (n) => String(n).padStart(2, '0')
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  return (
    <div className="ss-countdown">
      <span className="ss-label">Server Save em</span>
      <span className="ss-time">{total <= 0 ? 'salvando…' : `${pad(h)}:${pad(m)}:${pad(s)}`}</span>
    </div>
  )
}

export default function Landing() {
  const { isAuthed } = useAuth()
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(true)

  useEffect(() => {
    api.news()
      .then((r) => setNews(r.items || []))
      .catch(() => setNews([]))
      .finally(() => setLoadingNews(false))
  }, [])

  return (
    <div className="landing">
      <section className="hero">
        <div className="wrap hero-inner">
          <img className="hero-emblem" src="/emblem.png" alt="Primitivia" />
          <h1 className="hero-title">PRIMITIVIA</h1>
          <p className="hero-sub">Reviva a era 7.72 num mundo primitivo, forjado por você.</p>
          <OnlineBadge />
          <ServerSaveCountdown />
          <div className="hero-cta">
            {DOWNLOAD_URL && <a className="btn hero-btn" href={DOWNLOAD_URL}>BAIXAR CLIENT</a>}
            {isAuthed ? (
              <Link className="btn ghost hero-btn" to="/dashboard">Meu painel</Link>
            ) : (
              <Link className="btn ghost hero-btn" to="/register">Criar conta</Link>
            )}
          </div>
        </div>
      </section>

      <section className="wrap features">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      <section className="wrap news">
        <div className="section-head">
          <h2>Notícias &amp; Changelog</h2>
          <Link className="link" to="/ranking">Ver ranking →</Link>
        </div>

        {loadingNews ? (
          <p className="muted">Carregando novidades...</p>
        ) : news.length === 0 ? (
          <p className="muted">Sem novidades por enquanto.</p>
        ) : (
          <div className="news-list">
            {news.map((n, i) => (
              <article className="news-item" key={i}>
                <div className="news-meta">
                  <span className={`cat ${BADGE[n.category] || 'cat-new'}`}>{n.category || 'Novidade'}</span>
                  <span className="news-date">{fmtDate(n.date)}</span>
                </div>
                <h3 className="news-title">{n.title}</h3>
                <p className="news-body">{n.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
