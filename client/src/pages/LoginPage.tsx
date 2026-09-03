import React, { useState, useEffect } from 'react'
import type { UserTab } from './user/UserDashboard'
import { useAuth } from '../context/AuthContext'
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  LanguageCode,
  getSavedLanguage,
  saveLanguage,
} from '../services/languageService'
import CommunicationModal from '../components/CommunicationModal'
import AuthModal, { ModalView } from '../components/auth/AuthModal'
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Globe,
  User,
  Shield,
  CheckCircle,
  KeyRound,
  Lock,
} from 'lucide-react'

interface Props {
  onOpenTab?: (tab: UserTab) => void
}

export default function LoginPage({ onOpenTab }: Props) {
  const { authState } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  // Language State
  const [currentLang, setCurrentLang] = useState<LanguageCode>(getSavedLanguage())
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalView, setAuthModalView] = useState<ModalView>('login')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-open auth modal if pending verification
  useEffect(() => {
    if (
      authState === 'PENDING_EMAIL_VERIFICATION' ||
      authState === 'PENDING_PHONE_VERIFICATION' ||
      authState === 'PENDING_2FA'
    ) {
      setAuthModalOpen(true)
    }
  }, [authState])

  const handleLanguageChange = (code: LanguageCode) => {
    setCurrentLang(code)
    saveLanguage(code)
    setLangMenuOpen(false)
  }

  const handleRoleCardClick = (role: 'user' | 'local' | 'authority' | 'admin') => {
    setAuthModalView('login')
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-[0_2px_16px_rgba(20,27,24,0.08)]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
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
            <span className={`text-xs transition-colors hidden sm:inline ${scrolled ? 'text-[#7B8582]' : 'text-white/70'}`}>
              · Smart Grassroots Tourism Ecosystem
            </span>
          </div>

          {/* Navigation Bar Links & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`px-3 py-1.5 rounded-full text-xs font-700 flex items-center gap-1.5 border transition-all cursor-pointer ${
                  scrolled
                    ? 'bg-[#F7F6F2] border-[#E4E7E5] text-[#141B18]'
                    : 'bg-white/15 border-white/30 text-white backdrop-blur-xs'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#E8B931]" />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.nativeName}</span>
                <span className="text-[10px]">▼</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E4E7E5] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-800 text-[#7B8582] uppercase tracking-wider">
                    Select Language / भाषा
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between hover:bg-[#E4F3EF] cursor-pointer ${
                        currentLang === lang.code ? 'font-800 text-[#0F6E5C] bg-[#E4F3EF]/50' : 'text-[#141B18]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] text-[#7B8582]">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              onClick={() => {
                setAuthModalView('login')
                setAuthModalOpen(true)
              }}
              className={`text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${
                scrolled
                  ? 'border-[#0F6E5C] text-[#0F6E5C] hover:bg-[#E4F3EF]'
                  : 'border-white/40 text-white hover:bg-white/10'
              }`}
            >
              <span>Sign In</span>
            </button>

            {/* WhatsApp Quick Trigger */}
            <button
              onClick={() => setHelpModalOpen(true)}
              className="text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-[78vh] flex flex-col items-center justify-center text-white overflow-hidden"
        style={{ backgroundColor: '#0B5849' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&h=1080&fit=crop&auto=format)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F6E5C]/75 via-[#0A4E42]/65 to-[#141B18]/85" />

        {/* Hero Text */}
        <div className="relative z-10 text-center px-4 md:px-6 pt-24 pb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B931]" />
            <span>Smart India Hackathon · PS-202 (YatraSetu)</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight max-w-4xl mx-auto"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {t.tagline}
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
            AI-powered Grassroots Tourism Ecosystem connecting travelers with authentic homestays, verified guides, artisan SHGs, and crowd-safe intelligence.
          </p>

          {/* Primary Action Buttons: Register & Login */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setAuthModalView('register')
                setAuthModalOpen(true)
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#E8B931] text-[#141B18] font-800 text-xs sm:text-sm hover:bg-[#d4a82b] transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-102"
            >
              <User className="w-4 h-4" />
              <span>Create Verified Account</span>
            </button>

            <button
              onClick={() => {
                setAuthModalView('login')
                setAuthModalOpen(true)
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#0F6E5C] text-white font-800 text-xs sm:text-sm hover:bg-[#0A4E42] transition-all flex items-center gap-2 shadow-lg cursor-pointer border border-white/20 hover:scale-102"
            >
              <Shield className="w-4 h-4 text-[#E8B931]" />
              <span>Sign In & 2FA</span>
            </button>
          </div>
        </div>
      </section>

      {/* Role Selection Cards */}
      <div className="relative z-20 -mt-16 pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(20,27,24,0.14)] p-6 md:p-10 border border-[#E4E7E5]">
            <div className="text-center mb-8">
              <h2
                className="text-2xl font-bold text-[#141B18] mb-2"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {t.chooseRole}
              </h2>
              <p className="text-[#7B8582] text-sm max-w-xl mx-auto">
                Sign in to your verified account to access role-specific travel, hosting, and administrative tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <RoleCard
                icon="👤"
                role={t.touristRole}
                description="Generate 3-tier AI itineraries, discover hidden stepwells, book homestays & report civic issues."
                color="#0F6E5C"
                tint="#E4F3EF"
                buttonText="Sign in as Tourist"
                onClick={() => handleRoleCardClick('user')}
              />
              <RoleCard
                icon="🏡"
                role={t.localRole}
                description="List verified homestay havelis, manage tour availability, accept bookings & direct chat."
                color="#0F6E5C"
                tint="#E4F3EF"
                buttonText="Sign in as Host"
                onClick={() => handleRoleCardClick('local')}
              />
              <RoleCard
                icon="🛡️"
                role={t.authorityRole}
                description="Prioritize cleanliness complaints with AI scoring (0-100), view issue maps & update status."
                color="#0F6E5C"
                tint="#E4F3EF"
                buttonText="Sign in as Authority"
                onClick={() => handleRoleCardClick('authority')}
              />
              <RoleCard
                icon="⚡"
                role={t.adminRole}
                description="Platform analytics, local revenue retention rates, role governance & multi-channel notification logs."
                color="#141B18"
                tint="#FEF3C7"
                buttonText="Sign in as Admin"
                onClick={() => handleRoleCardClick('admin')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Production Authentication & Verification Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialView={authModalView}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Quick Communication Modal on Landing */}
      <CommunicationModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        contextTitle="YatraSetu Support & Inquiry Dispatcher"
        defaultSubject="Inquiry regarding YatraSetu Tourism Ecosystem"
        defaultMessage="Namaste! I would like to inquire about itineraries, local homestay bookings, and crowd forecasts on YatraSetu."
      />
    </div>
  )
}

function RoleCard({
  icon,
  role,
  description,
  color,
  tint,
  buttonText,
  onClick,
}: {
  icon: string
  role: string
  description: string
  color: string
  tint: string
  buttonText: string
  onClick: () => void
}) {
  return (
    <div
      className="group flex flex-col justify-between p-5 rounded-2xl border border-[#E4E7E5] hover:border-[#0F6E5C]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: tint }}
        >
          {icon}
        </div>
        <div>
          <h3
            className="text-base font-bold text-[#141B18]"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {role}
          </h3>
          <p className="text-[#7B8582] text-xs leading-relaxed mt-1">{description}</p>
        </div>
      </div>

      <button
        className="w-full mt-4 py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 hover:opacity-90 shadow-2xs cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={onClick}
      >
        <span>{buttonText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
