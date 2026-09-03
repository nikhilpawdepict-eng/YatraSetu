import React, { useState } from 'react'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import UserDashboard, { UserTab } from './pages/user/UserDashboard'
import LocalDashboard from './pages/local/LocalDashboard'
import AuthorityDashboard from './pages/authority/AuthorityDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react'

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Boundary Caught Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#FDE8E8] text-[#9B1C1C] flex items-center justify-center text-2xl shadow-sm border border-[#D64545]/20">
            ⚠️
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-xl font-800 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              YatraSetu Dashboard
            </h2>
            <p className="text-xs text-[#505D58]">
              {this.state.error?.message || 'A transient rendering issue occurred while loading the dashboard.'}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0F6E5C] text-white font-800 text-xs shadow-sm hover:bg-[#0A4E42] transition-all cursor-pointer"
          >
            Reload Dashboard
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function AppContent() {
  const { authState, user, logout } = useAuth()
  const [userTab, setUserTab] = useState<UserTab>('overview')

  // 1. Loading / Authenticating Initial Session State
  if (authState === 'AUTHENTICATING') {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#0F6E5C] text-white flex items-center justify-center text-2xl shadow-lg animate-pulse">
          🌍
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-800 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
            YatraSetu
          </h2>
          <p className="text-xs text-[#505D58] font-medium flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#0F6E5C] animate-spin" />
            <span>Verifying secure authentication session...</span>
          </p>
        </div>
      </div>
    )
  }

  // 2. Authenticated Dashboard Routes (Strictly based on verified backend user role)
  if (authState === 'AUTHENTICATED' && user) {
    if (user.role === 'admin') {
      return (
        <AdminDashboard
          onLogout={logout}
          onSwitchRole={() => {}}
        />
      )
    }

    if (user.role === 'authority') {
      return <AuthorityDashboard onLogout={logout} />
    }

    if (user.role === 'local') {
      return <LocalDashboard onLogout={logout} />
    }

    // Default: Tourist / Traveler
    return (
      <UserDashboard
        initialTab={userTab}
        onLogout={logout}
      />
    )
  }

  // 3. Unauthenticated / Pending Verification State
  return (
    <LoginPage
      onOpenTab={(tab) => {
        setUserTab(tab)
      }}
    />
  )
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-full">
            <AppContent />
          </div>
        </AppProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  )
}
