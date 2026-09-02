import { useState } from 'react'
import AuthorityHome from './AuthorityHome'
import AuthorityCrowd from './AuthorityCrowd'
import AuthorityComplaints from './AuthorityComplaints'

type AuthTab = 'home' | 'crowd' | 'complaints'

const tabs: { id: AuthTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'crowd', label: 'Crowd', icon: '👥' },
  { id: 'complaints', label: 'Complaints', icon: '🚨' },
]

export default function AuthorityDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<AuthTab>('home')

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#12181A', color: '#EDEFEE' }}>
      {/* Top Nav */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: '#1C2427', borderBottomColor: '#ffffff15' }}
      >
        <div className="max-w-[1440px] mx-auto px-6 py-0 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 py-3 flex-shrink-0">
            <span className="text-xl">🌍</span>
            <span className="font-700 text-lg text-[#0F6E5C]" style={{ fontFamily: 'Fraunces, serif' }}>
              YatraSetu
            </span>
            <span className="ml-2 text-xs rounded-full px-2.5 py-0.5 font-600 border"
              style={{ color: '#0F6E5C', borderColor: '#0F6E5C40', background: '#0F6E5C15' }}
            >
              Authority
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-600 whitespace-nowrap border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-[#0F6E5C] text-[#0F6E5C]'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="relative p-2 rounded-lg transition-colors" style={{ color: '#EDEFEE' }}>
              <span className="text-xl">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D64545]" />
            </button>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base cursor-pointer"
              style={{ background: '#0F6E5C20', border: '1px solid #0F6E5C40' }}
            >
              🛡️
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-600 transition-colors"
              style={{ color: '#ffffff50' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#D64545')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff50')}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'home' && <AuthorityHome />}
        {activeTab === 'crowd' && <AuthorityCrowd />}
        {activeTab === 'complaints' && <AuthorityComplaints />}
      </main>
    </div>
  )
}
