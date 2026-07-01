import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [account, setAccount] = useState(
    () => Number(localStorage.getItem('account_number')) || null
  )

  function login(tok, accountNumber) {
    localStorage.setItem('token', tok)
    localStorage.setItem('account_number', String(accountNumber))
    setToken(tok)
    setAccount(accountNumber)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('account_number')
    setToken('')
    setAccount(null)
  }

  return (
    <AuthContext.Provider value={{ token, account, isAuthed: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
