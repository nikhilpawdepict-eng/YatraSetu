import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/user/UserDashboard'
import LocalDashboard from './pages/local/LocalDashboard'
import AuthorityDashboard from './pages/authority/AuthorityDashboard'

export type AppPage = 'login' | 'user' | 'local' | 'authority'

export default function App() {
  const [page, setPage] = useState<AppPage>('login')

  return (
    <AppProvider>
      <div className="min-h-full">
        {page === 'login' && <LoginPage onLogin={setPage} />}
        {page === 'user' && <UserDashboard onLogout={() => setPage('login')} />}
        {page === 'local' && <LocalDashboard onLogout={() => setPage('login')} />}
        {page === 'authority' && <AuthorityDashboard onLogout={() => setPage('login')} />}
      </div>
    </AppProvider>
  )
}
