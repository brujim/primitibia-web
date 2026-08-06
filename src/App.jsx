import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import { api } from "./api.js";
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
      <header className="topbar">
        <Link to="/" className="brand">
          PrimiTibia
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

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <Navigate to={isAuthed ? "/dashboard" : "/login"} replace />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/characters/new"
            element={
              <Protected>
                <CreateCharacter />
              </Protected>
            }
          />
          <Route
            path="/admin/guard"
            element={
              <Protected>
                <GuardReports />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
