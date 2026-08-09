import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import { api } from "./api.js";
import Landing from "./pages/Landing.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateCharacter from "./pages/CreateCharacter.jsx";
import Ranking from "./pages/Ranking.jsx";
import GuardReports from "./pages/GuardReports.jsx";

// URL do arquivo do client hospedado na VPS (definida no .env → VITE_DOWNLOAD_URL).
const DOWNLOAD_URL = import.meta.env.VITE_DOWNLOAD_URL || "";

function Protected({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}

// Envolve páginas "internas" no container centrado (a Landing é full-width, fica de fora).
function Page({ children }) {
  return <div className="container">{children}</div>;
}

export default function App() {
  const { isAuthed, account, logout } = useAuth();
  const navigate = useNavigate();

  // Descobre se a conta logada é GOD (accounts.type >= 6) p/ mostrar o link do Guard.
  const [accountType, setAccountType] = useState(0);
  useEffect(() => {
    if (isAuthed) {
      api.me().then((m) => setAccountType(m.account_type || 0)).catch(() => {});
    } else {
      setAccountType(0);
    }
  }, [isAuthed]);

  return (
    <div className="app">
      <div className="scenery" aria-hidden="true">
        <div className="scene scene-left" />
        <div className="scene scene-right" />
      </div>

      <header className="topbar">
        <Link to="/" className="brand">
          <img className="brand-mark" src="/emblem.png" alt="" />
          <span className="brand-word">PRIMITIVIA</span>
        </Link>
        <div className="topbar-center">
          {DOWNLOAD_URL && (
            <a className="btn download" href={DOWNLOAD_URL}>
              BAIXAR CLIENT
            </a>
          )}
        </div>
        <nav>
          <Link to="/ranking">Ranking</Link>
          {isAuthed ? (
            <>
              <Link to="/dashboard">Painel</Link>
              {accountType >= 6 && <Link to="/admin/guard">Guard</Link>}
              <span className="acc">Conta #{account}</span>
              <button
                className="link"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register">Criar conta</Link>
            </>
          )}
        </nav>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/ranking" element={<Page><Ranking /></Page>} />
          <Route
            path="/dashboard"
            element={
              <Page>
                <Protected>
                  <Dashboard />
                </Protected>
              </Page>
            }
          />
          <Route
            path="/characters/new"
            element={
              <Page>
                <Protected>
                  <CreateCharacter />
                </Protected>
              </Page>
            }
          />
          <Route
            path="/admin/guard"
            element={
              <Page>
                <Protected>
                  <GuardReports />
                </Protected>
              </Page>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <img src="/emblem.png" alt="" />
        <span className="footer-word">PRIMITIVIA</span>
        <span className="footer-text">· Servidor Tibia 7.72 · © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
