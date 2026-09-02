import { useState, useEffect } from 'react'
import type { AppPage } from '../App'

interface Props {
  onLogin: (page: AppPage) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-[0_2px_16px_rgba(20,27,24,0.08)]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <span
              className={`font-bold text-xl tracking-tight transition-colors ${
                scrolled ? 'text-[#0F6E5C]' : 'text-white'
              }`}
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              YatraSetu
            </span>
          </div>
          <div className="flex items-center gap-6">
            {['Language', 'Help', 'Settings'].map((item) => (
              <button
                key={item}
                className={`text-sm font-medium transition-colors hover:opacity-80 ${
                  scrolled ? 'text-[#4B5551]' : 'text-white/90'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-[75vh] flex flex-col items-center justify-center text-white overflow-hidden"
        style={{ backgroundColor: '#0B5849' }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&h=1080&fit=crop&auto=format)',
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F6E5C]/70 via-[#0F6E5C]/55 to-[#141B18]/75" />

        {/* Hero Text */}
        <div className="relative z-10 text-center px-6 pt-24 pb-12">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E0762F] inline-block" />
            Smart India Hackathon · Problem Statement 204
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Welcome to YatraSetu
          </h1>
          <p className="text-xl md:text-2xl text-white/85 font-light max-w-2xl mx-auto leading-relaxed">
            Explore Better. Travel Smarter. Experience Locally.
          </p>
        </div>
      </section>

      {/* Login Card — overlaps hero bottom */}
      <div className="relative z-20 -mt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Card wrapper */}
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(20,27,24,0.14)] p-8 md:p-10">
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-semibold text-[#141B18] mb-2"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                Choose Your Role to Continue
              </h2>
              <p className="text-[#7B8582] text-sm">
                Select the role that best describes you to access your personalised dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <RoleCard
                icon="👤"
                role="User Login"
                description="Discover destinations, connect with locals, and get AI-powered travel recommendations."
                color="#0F6E5C"
                tint="#E4F3EF"
                onClick={() => onLogin('user')}
              />
              <RoleCard
                icon="🏡"
                role="Local Login"
                description="Showcase your homestay, guide services, or crafts to travellers from across India."
                color="#0F6E5C"
                tint="#E4F3EF"
                onClick={() => onLogin('local')}
              />
              <RoleCard
                icon="🛡️"
                role="Authority Login"
                description="Monitor crowd levels, manage complaints, and coordinate emergency response."
                color="#0F6E5C"
                tint="#E4F3EF"
                onClick={() => onLogin('authority')}
              />
            </div>

            {/* Feature highlights */}
            <div className="mt-10 pt-8 border-t border-[#E4E7E5] grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '🤖', label: 'AI-Powered', sub: 'Smart recommendations' },
                { icon: '📊', label: 'Live Crowd Data', sub: 'Real-time updates' },
                { icon: '🧹', label: 'Cleanliness Reports', sub: 'Community-driven' },
                { icon: '🚨', label: 'Emergency Services', sub: 'Always accessible' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[#141B18] text-sm font-600">{label}</span>
                  <span className="text-[#7B8582] text-xs">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#141B18] text-white/60 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <span className="font-semibold text-white" style={{ fontFamily: 'Fraunces, serif' }}>
              YatraSetu
            </span>
            <span className="text-white/40 text-sm">· Travel Boost Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {['About', 'Contact', 'Privacy', 'Help'].map((item) => (
              <button key={item} className="hover:text-white transition-colors">
                {item}
              </button>
            ))}
          </div>
          <p className="text-xs text-white/40">© 2025 YatraSetu · Smart India Hackathon</p>
        </div>
      </footer>
    </div>
  )
}

function RoleCard({
  icon,
  role,
  description,
  color,
  tint,
  onClick,
}: {
  icon: string
  role: string
  description: string
  color: string
  tint: string
  onClick: () => void
}) {
  return (
    <div
      className="group flex flex-col gap-4 p-6 rounded-2xl border border-[#E4E7E5] hover:border-[#0F6E5C]/40 hover:shadow-[0_8px_28px_rgba(20,27,24,0.10)] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: tint }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3
          className="text-lg font-semibold text-[#141B18] mb-1.5"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {role}
        </h3>
        <p className="text-[#7B8582] text-sm leading-relaxed">{description}</p>
      </div>
      <button
        className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: color }}
        onClick={onClick}
      >
        Enter as {role.replace(' Login', '')} →
      </button>
    </div>
  )
}
