import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function CopyButton({ text, label = 'Copiar' }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="btn ghost small"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch { /* clipboard bloqueado */ }
      }}
    >
      {done ? 'Copiado!' : label}
    </button>
  )
}

export default function Donate() {
  const [packages, setPackages] = useState([])
  const [pixEnabled, setPixEnabled] = useState(false)
  const [coins, setCoins] = useState([])
  const [loadingCfg, setLoadingCfg] = useState(true)

  const [pkgId, setPkgId] = useState('')
  const [account, setAccount] = useState('')
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState('pix')
  const [coin, setCoin] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // resposta do donate_create
  const [paid, setPaid] = useState(false)
  const pollRef = useRef(null)

  useEffect(() => {
    api.donatePackages()
      .then((r) => {
        setPackages(r.packages || [])
        setPixEnabled(!!r.pix_enabled)
        setCoins(r.crypto_coins || [])
        setMethod(r.pix_enabled ? 'pix' : (r.crypto_coins || []).length ? 'crypto' : 'pix')
        if (r.crypto_coins?.length) setCoin(r.crypto_coins[0])
        const hi = (r.packages || []).find((p) => p.tag) || (r.packages || [])[0]
        if (hi) setPkgId(hi.id)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingCfg(false))
  }, [])

  // Polling do status do PIX até creditar.
  useEffect(() => {
    if (!result || result.method !== 'pix' || paid) return
    pollRef.current = setInterval(async () => {
      try {
        const s = await api.donateStatus(result.donation_id)
        if (s.credited) {
          setPaid(true)
          clearInterval(pollRef.current)
        }
      } catch { /* segue tentando */ }
    }, 4000)
    return () => clearInterval(pollRef.current)
  }, [result, paid])

  const pkg = packages.find((p) => p.id === pkgId)

  async function submit() {
    setError('')
    if (!pkg) return setError('Escolha um pacote.')
    if (!account.trim()) return setError('Informe o número da sua conta.')
    if (method === 'crypto' && !coin) return setError('Escolha uma moeda.')
    setSubmitting(true)
    try {
      const res = await api.donateCreate({ account, package_id: pkgId, method, coin, email })
      setResult(res)
      setPaid(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    clearInterval(pollRef.current)
    setResult(null)
    setPaid(false)
    setError('')
  }

  if (loadingCfg) return <div className="card"><p className="muted">Carregando...</p></div>

  // ---- Tela de pagamento (após criar a doação) ----
  if (result) {
    return (
      <div className="donate">
        <div className="card donate-pay">
          {paid ? (
            <div className="donate-success">
              <div className="donate-check">✓</div>
              <h1>Obrigado pela sua doação! 💛</h1>
              <p><strong>{result.points} pontos</strong> foram creditados na conta <strong>#{account}</strong>.</p>
              <p className="muted">Eles já estão disponíveis na loja do jogo. Seu apoio mantém a Primitivia viva!</p>
              <button className="btn" onClick={reset}>Fazer outra doação</button>
            </div>
          ) : result.method === 'pix' ? (
            <>
              <h1>Pague com PIX</h1>
              <p className="muted">
                Escaneie o QR ou use o copia-e-cola. Assim que o pagamento cair, seus{' '}
                <strong>{result.points} pontos</strong> são creditados automaticamente na conta #{account}.
              </p>
              {result.qr_code_base64 && (
                <img className="pix-qr" src={`data:image/png;base64,${result.qr_code_base64}`} alt="QR PIX" />
              )}
              <label>PIX copia e cola
                <textarea className="pix-code" readOnly rows={3} value={result.qr_code} />
              </label>
              <CopyButton text={result.qr_code} label="Copiar código PIX" />
              <div className="donate-waiting"><span className="dot" /> Aguardando confirmação do pagamento...</div>
              <button className="link" onClick={reset}>Cancelar</button>
            </>
          ) : (
            <>
              <h1>Doar com {result.coin}</h1>
              <p className="muted">
                Envie <strong>{brl(result.amount)}</strong> (equivalente em {result.coin}) para o endereço abaixo.
                Depois cole o comprovante (txid) para creditarmos os <strong>{result.points} pontos</strong> na conta #{account}.
              </p>
              <label>Endereço {result.coin}
                <input className="crypto-addr" readOnly value={result.address} />
              </label>
              <CopyButton text={result.address} label={`Copiar endereço ${result.coin}`} />
              <CryptoClaim donationId={result.donation_id} />
              <button className="link" onClick={reset}>Voltar</button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ---- Tela principal (escolha do pacote + método) ----
  return (
    <div className="donate">
      <div className="donate-intro">
        <h1>Apoie a Primitivia 💛</h1>
        <p>
          A Primitivia é feita com carinho e se mantém no ar graças ao apoio de quem joga.
          Doar é <strong>totalmente voluntário</strong>. Como forma de <strong>agradecimento</strong>,
          creditamos pontos na sua conta pra usar na loja do jogo.
        </p>
        <p className="muted">
          Isto não é uma compra: os pontos são uma cortesia pelo seu apoio ao projeto.
        </p>
      </div>

      {error && <div className="card"><p className="error">{error}</p></div>}

      <div className="card">
        <h2 className="donate-step">1 · Escolha um valor</h2>
        <div className="pkg-grid">
          {packages.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pkg ${pkgId === p.id ? 'selected' : ''}`}
              onClick={() => setPkgId(p.id)}
            >
              {p.tag && <span className="pkg-tag">{p.tag}</span>}
              <span className="pkg-amount">{brl(p.amount)}</span>
              <span className="pkg-points">{p.points.toLocaleString('pt-BR')} pts</span>
              {p.bonus > 0 && <span className="pkg-bonus">+{p.bonus} bônus</span>}
            </button>
          ))}
        </div>

        <h2 className="donate-step">2 · Sua conta</h2>
        <div className="donate-fields">
          <label>Número da conta (onde creditamos os pontos)
            <input
              inputMode="numeric"
              value={account}
              onChange={(e) => setAccount(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 12345"
            />
          </label>
          <label>E-mail (opcional, para o recibo)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </label>
        </div>

        <h2 className="donate-step">3 · Forma de doação</h2>
        <div className="method-tabs">
          <button
            type="button"
            className={`method ${method === 'pix' ? 'active' : ''}`}
            disabled={!pixEnabled}
            onClick={() => setMethod('pix')}
          >
            PIX {pixEnabled ? '· automático' : '· indisponível'}
          </button>
          <button
            type="button"
            className={`method ${method === 'crypto' ? 'active' : ''}`}
            disabled={!coins.length}
            onClick={() => setMethod('crypto')}
          >
            Crypto
          </button>
        </div>

        {method === 'crypto' && coins.length > 0 && (
          <label className="coin-select">Moeda
            <select value={coin} onChange={(e) => setCoin(e.target.value)}>
              {coins.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}

        <button className="btn donate-cta" disabled={submitting} onClick={submit}>
          {submitting ? 'Gerando...' : pkg ? `Doar ${brl(pkg.amount)} e receber ${pkg.points} pts` : 'Doar'}
        </button>
        <p className="donate-legal">
          Doação voluntária. Os pontos são uma cortesia de agradecimento, sem caráter de compra e não reembolsáveis.
        </p>
      </div>
    </div>
  )
}

function CryptoClaim({ donationId }) {
  const [txid, setTxid] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (sent) {
    return (
      <div className="claim-ok">
        Comprovante recebido! Assim que confirmarmos a transferência, os pontos serão creditados. Obrigado! 💛
      </div>
    )
  }
  return (
    <div className="crypto-claim">
      <label>Comprovante (txid / hash da transação)
        <input value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="Cole o hash da transferência" />
      </label>
      {err && <p className="error">{err}</p>}
      <button
        className="btn"
        disabled={busy}
        onClick={async () => {
          setErr('')
          if (!txid.trim()) return setErr('Cole o comprovante.')
          setBusy(true)
          try {
            await api.donateClaim({ donation_id: donationId, txid })
            setSent(true)
          } catch (e) {
            setErr(e.message)
          } finally {
            setBusy(false)
          }
        }}
      >
        {busy ? 'Enviando...' : 'Enviar comprovante'}
      </button>
    </div>
  )
}
