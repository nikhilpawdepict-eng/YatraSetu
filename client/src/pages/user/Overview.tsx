import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { UserTab } from './UserDashboard'
import InteractiveMap from '../../components/InteractiveMap'
import { getCityDataset } from '../../services/destinationData'
import { matchesDestination } from '../../services/locationService'
import { Sparkles, Users, Home, Compass, ArrowRight, Shield, AlertTriangle } from 'lucide-react'

interface Props {
  onSelectTab?: (tab: UserTab) => void
}

export default function Overview({ onSelectTab }: Props) {
  const {
    spots = [],
    homestays = [],
    guides = [],
    activeLocation,
    weather,
    isLoadingWeather,
    destinationPOIs = [],
  } = useApp()

  const cityData = getCityDataset(activeLocation.city)

  const weatherText = weather
    ? `${weather.temperature}°C · ${weather.weatherDescription}`
    : isLoadingWeather
    ? 'Fetching Open-Meteo...'
    : '29°C · Pleasant & Clear'

  const weatherSub = weather
    ? `${weather.dataSource} · Feels like ${weather.apparentTemperature}°C`
    : 'Live forecast data'

  const weatherIcon = weather?.weatherIcon || '🌤️'

  // Location-specific stats
  const destinationStays = homestays.filter((h) => matchesDestination(h.location, activeLocation.city))
  const destinationGuides = guides.filter((g) => matchesDestination(g.location, activeLocation.city))
  const destinationSpots = spots.filter((s) => matchesDestination(s.location, activeLocation.city))

  const displayedStaysCount = destinationStays.length > 0 ? destinationStays.length : 4
  const displayedGuidesCount = destinationGuides.length > 0 ? destinationGuides.length : 3
  const displayedSpotsCount = destinationSpots.length > 0 ? destinationSpots.length : cityData.markers.length

  const infoCards = [
    {
      icon: '📍',
      label: 'Active Destination',
      value: activeLocation.displayName,
      sub: activeLocation.source === 'gps' ? '📍 Auto-detected GPS' : '🗺️ Central Tourism Hub',
    },
    {
      icon: '🕐',
      label: 'Current Time',
      value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sub: `IST · ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
    },
    {
      icon: '👥',
      label: 'Live Crowd Status',
      value: 'Moderate (420 pax)',
      sub: 'Optimal window: 6:30–8:30 AM',
      status: 'medium',
      clickable: true,
      onClick: () => onSelectTab?.('crowd'),
    },
    {
      icon: '✨',
      label: 'AI Travel Planner',
      value: '3-Tier Plans Ready',
      sub: 'Budget • Balanced • Premium',
      status: 'high',
      clickable: true,
      onClick: () => onSelectTab?.('planner'),
    },
    {
      icon: '💰',
      label: 'Avg Daily Spend',
      value: '₹3,500 / day',
      sub: '92.4% stays in local economy',
    },
    {
      icon: weatherIcon,
      label: 'Weather',
      value: weatherText,
      sub: weatherSub,
    },
  ]

  const recommendedPlaces = [
    `${activeLocation.city} Historic Core & Forts`,
    'Geometric Stepwell Sanctuary',
    'Old City Spice & Craft Bazaar',
    'Restored Haveli Cultural Dining',
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Hero Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#0F6E5C] via-[#0A4E42] to-[#141B18] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-700">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B931]" />
            <span>Welcome to YatraSetu · {activeLocation.displayName}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-800 tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Plan Smarter. Explore Deeper. Travel Better.
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Your AI companion for personalized travel schedules, authentic homestays, licensed cultural guides, and crowd-safe pilgrimage intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onSelectTab?.('planner')}
            className="px-5 py-3 rounded-2xl bg-[#E8B931] text-[#141B18] font-800 text-xs md:text-sm hover:bg-[#d4a82b] transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Travel Planner</span>
          </button>
          <button
            onClick={() => onSelectTab?.('crowd')}
            className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-700 text-xs md:text-sm backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Check Live Crowd</span>
          </button>
        </div>
      </div>

      {/* Info Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {infoCards.map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={`bg-white rounded-2xl p-4 border border-[#E4E7E5] shadow-xs flex flex-col justify-between transition-all ${
              card.clickable ? 'hover:border-[#0F6E5C]/50 hover:shadow-sm cursor-pointer hover:-translate-y-0.5' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{card.icon}</span>
              {card.status === 'medium' && (
                <span className="w-2 h-2 rounded-full bg-[#1E9E5A]" />
              )}
            </div>
            <div>
              <p className="text-[10px] text-[#7B8582] font-700 uppercase">{card.label}</p>
              <p className="text-sm md:text-base font-800 text-[#141B18] truncate mt-0.5" style={{ fontFamily: 'Fraunces, serif' }}>
                {card.value}
              </p>
              <p className="text-[10px] text-[#505D58] truncate mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation Highlight Box */}
      <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-r from-[#FEF3EA] to-[#FBEADD] border-l-4 border-[#E0762F] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E0762F]/15 text-[#E0762F] flex items-center justify-center text-2xl flex-shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-800 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                AI Recommendation for {activeLocation.city}
              </h3>
              <span className="text-[10px] bg-[#E0762F]/15 text-[#E0762F] font-800 px-2 py-0.5 rounded-full">
                Optimized Route Ready
              </span>
            </div>
            <p className="text-xs text-[#505D58] mt-1 leading-relaxed">
              Based on live crowd forecasts and morning weather, start at the historic monument early (07:00 AM) to avoid peak queues, followed by breakfast at a heritage tea stall.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {recommendedPlaces.map((p) => (
                <span key={p} className="text-[11px] bg-white text-[#E0762F] border border-[#E0762F]/30 rounded-full px-2.5 py-0.5 font-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelectTab?.('planner')}
          className="px-5 py-2.5 rounded-xl bg-[#E0762F] hover:bg-[#c9682a] text-white font-800 text-xs flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer"
        >
          <span>Generate Itinerary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Destination Map & Live Sights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Destination Map with Routing (8 cols) */}
        <div className="lg:col-span-8">
          <InteractiveMap
            center={cityData.center}
            zoom={cityData.zoom}
            items={cityData.markers}
            height="460px"
            title={`Live Tourism & Traffic Corridor Map — ${activeLocation.displayName}`}
            showFilters={true}
            showRouteFinder={true}
          />
        </div>

        {/* Right: Quick Module Fast-Travel Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5 flex flex-col justify-between">
          <div
            onClick={() => onSelectTab?.('planner')}
            className="p-4 rounded-2xl bg-white border border-[#E4E7E5] shadow-xs hover:border-[#0F6E5C]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="font-700 text-sm text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  AI Travel Planner
                </h4>
                <p className="text-[11px] text-[#7B8582]">3-Tier dynamic plans with re-planning</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F6E5C]" />
          </div>

          <div
            onClick={() => onSelectTab?.('connect')}
            className="p-4 rounded-2xl bg-white border border-[#E4E7E5] shadow-xs hover:border-[#0F6E5C]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏡</span>
              <div>
                <h4 className="font-700 text-sm text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Local Homestays & Guides
                </h4>
                <p className="text-[11px] text-[#7B8582]">{displayedStaysCount} stays • {displayedGuidesCount} verified guides</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F6E5C]" />
          </div>

          <div
            onClick={() => onSelectTab?.('crowd')}
            className="p-4 rounded-2xl bg-white border border-[#E4E7E5] shadow-xs hover:border-[#0F6E5C]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h4 className="font-700 text-sm text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Crowd Predictor & XAI
                </h4>
                <p className="text-[11px] text-[#7B8582]">Hourly forecast & rush avoidance</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F6E5C]" />
          </div>

          <div
            onClick={() => onSelectTab?.('cleanliness')}
            className="p-4 rounded-2xl bg-white border border-[#E4E7E5] shadow-xs hover:border-[#0F6E5C]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧹</span>
              <div>
                <h4 className="font-700 text-sm text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Smart Civic Reporting
                </h4>
                <p className="text-[11px] text-[#7B8582]">AI priority scoring & live resolution</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0F6E5C]" />
          </div>

          <div
            onClick={() => onSelectTab?.('emergency')}
            className="p-4 rounded-2xl bg-white border border-[#E4E7E5] shadow-xs hover:border-[#D64545]/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <h4 className="font-700 text-sm text-[#D64545]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Tourist Safety & SOS 112
                </h4>
                <p className="text-[11px] text-[#7B8582]">Safe check-ins & emergency dispatch</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D64545]" />
          </div>
        </div>
      </div>
    </div>
  )
}
