import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/ui/Modal'
import { matchesDestination } from '../../services/locationService'

export default function Overview() {
  const {
    spots = [],
    homestays = [],
    guides = [],
    navigate,
    showToast,
    activeLocation,
    weather,
    isLoadingWeather,
    destinationPOIs = [],
  } = useApp()

  const [plannerOpen, setPlannerOpen] = useState(false)
  const [plannerDays, setPlannerDays] = useState('3')
  const [plannerBudget, setPlannerBudget] = useState('8000')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Heritage', 'Forts'])
  const [generatedPlan, setGeneratedPlan] = useState<boolean>(false)

  const interestOptions = ['Heritage', 'Forts', 'Local Food', 'Photography', 'Handicrafts', 'Pilgrimage', 'Nature']

  const weatherText = weather
    ? `${weather.temperature}°C · ${weather.weatherDescription}`
    : isLoadingWeather
    ? 'Fetching Open-Meteo...'
    : '31°C · Partly Cloudy'

  const weatherSub = weather
    ? `${weather.dataSource} · Feels like ${weather.apparentTemperature}°C`
    : 'Live forecast data'

  const weatherIcon = weather?.weatherIcon || '🌤️'

  // Location-specific stats
  const destinationStaysCount = homestays.filter((h) => matchesDestination(h.location, activeLocation.city) && h.available).length
  const destinationGuidesCount = guides.filter((g) => matchesDestination(g.location, activeLocation.city) && g.available).length
  const destinationSpotsCount = spots.filter((s) => matchesDestination(s.location, activeLocation.city)).length
  const displayedSpotsCount = destinationSpotsCount > 0 ? destinationSpotsCount : destinationPOIs.length
  const hasCrowdTelemetry = destinationSpotsCount > 0

  const infoCards = [
    {
      icon: '📍',
      label: 'Active Destination',
      value: activeLocation.displayName,
      sub: activeLocation.source === 'gps' ? '📍 Auto-detected GPS' : '🗺️ Global Active Hub',
    },
    {
      icon: '🕐',
      label: 'Current Time',
      value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sub: `IST · ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
    },
    {
      icon: '👥',
      label: 'Crowd Forecast',
      value: hasCrowdTelemetry ? 'Moderate' : 'No Live Sensors',
      sub: hasCrowdTelemetry ? 'Derived crowd estimate' : 'Crowd data unavailable',
      status: hasCrowdTelemetry ? 'medium' : undefined,
    },
    {
      icon: '❤️',
      label: 'Your Interests',
      value: 'Heritage & Culture',
      sub: 'Forts, Palaces, Bazaars',
    },
    {
      icon: '💰',
      label: 'Travel Budget',
      value: '₹8,000 / day',
      sub: 'Mid-range traveller',
    },
    {
      icon: weatherIcon,
      label: 'Weather',
      value: weatherText,
      sub: weatherSub,
    },
    {
      icon: '📅',
      label: 'Travel Season',
      value: 'Current Season',
      sub: 'Optimal for sightseeing',
    },
    {
      icon: '🤖',
      label: 'AI Status',
      value: 'Active',
      sub: 'Recommendations ready',
    },
  ]

  const statusColor = { low: '#1E9E5A', medium: '#D89A1C', high: '#D64545' }
  const statusBg = { low: '#E4F7EC', medium: '#FBF1DA', high: '#FBE6E6' }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleGeneratePlan = () => {
    setGeneratedPlan(true)
    showToast(`AI Itinerary generated for ${activeLocation.displayName}!`, 'success')
  }

  // Recommended places dynamically adapted to active destination
  const recommendedPlaces = destinationPOIs.length > 0
    ? destinationPOIs.slice(0, 4).map((p) => p.name)
    : activeLocation.city.toLowerCase().includes('pune')
    ? ['Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort', 'Dagdusheth Temple']
    : activeLocation.city.toLowerCase().includes('delhi')
    ? ['Red Fort', 'Qutub Minar', 'Humayun’s Tomb', 'National Museum']
    : activeLocation.city.toLowerCase().includes('pimpri') || activeLocation.city.toLowerCase().includes('chinchwad')
    ? ['Appu Ghar Eco Park', 'Moraya Gosavi Mandir', 'Durga Devi Hilltop', 'Science Park']
    : ['Amber Fort', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort']

  // Dynamic recommendation copy based on active destination
  const getRecommendationMessage = () => {
    const city = activeLocation.city.toLowerCase()
    if (city.includes('pimpri') || city.includes('chinchwad')) {
      return `Based on your interest in nature, culture & heritage, we recommend visiting Durga Devi Hilltop Viewpoint during early morning hours and exploring Pimpri Chinchwad Science Park after lunch.`
    }
    if (city.includes('pune')) {
      return `Based on your interest in Maratha heritage & culture, we recommend visiting Shaniwar Wada Palace Fort early morning and exploring Aga Khan Palace & Memorial in the afternoon.`
    }
    if (city.includes('delhi')) {
      return `Based on your interest in monuments & history, we recommend visiting Red Fort early morning and exploring Qutub Minar & Humayun's Tomb during off-peak hours.`
    }
    if (city.includes('varanasi')) {
      return `Based on your interest in spirituality & sacred heritage, we recommend attending morning Ganga Aarti at Assi Ghat and exploring Kashi Vishwanath corridor.`
    }
    if (city.includes('udaipur')) {
      return `Based on your interest in palaces & lakes, we recommend visiting City Palace of Udaipur early morning and enjoying sunset at Lake Pichola.`
    }
    if (city.includes('jaipur')) {
      return `Based on your interest in heritage & culture, we recommend visiting Amber Fort early morning (golden light, fewer crowds) and exploring City Palace Museum after lunch. Note: Hawa Mahal is currently closed for maintenance.`
    }
    return `Based on your interest in local culture and current weather in ${activeLocation.displayName}, we recommend exploring ${recommendedPlaces.slice(0, 2).join(' and ')} during early morning off-peak hours.`
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Greeting & Location Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1
            className="text-2xl md:text-3xl font-700 text-[#141B18] mb-1"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            Good morning, Traveller 👋
          </h1>
          <p className="text-[#7B8582] text-xs md:text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {activeLocation.displayName}
          </p>
        </div>

        {weather?.isLive && (
          <div className="flex items-center gap-2 bg-[#E4F3EF] border border-[#0F6E5C]/20 px-3 py-1.5 rounded-full text-xs font-700 text-[#0F6E5C] w-fit shadow-2xs">
            <span>{weather.weatherIcon}</span>
            <span>{weather.temperature}°C</span>
            <span className="text-[10px] text-[#0F6E5C]/80 font-normal">({weather.dataSource})</span>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {infoCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-3.5 md:p-4 border border-[#E4E7E5] hover:shadow-[0_8px_28px_rgba(20,27,24,0.10)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <span className="text-xl md:text-2xl">{card.icon}</span>
              {card.status && (
                <span
                  className="text-[10px] md:text-xs font-600 px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: statusBg[card.status as keyof typeof statusBg],
                    color: statusColor[card.status as keyof typeof statusColor],
                  }}
                >
                  {card.status === 'medium' ? 'Moderate' : card.status}
                </span>
              )}
            </div>
            <p className="text-[10px] md:text-xs text-[#7B8582] font-600 mb-0.5 uppercase tracking-wide">{card.label}</p>
            <p className="text-[#141B18] font-700 text-sm md:text-base leading-snug truncate">{card.value}</p>
            <p className="text-[#7B8582] text-[11px] mt-0.5 truncate">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* AI Recommendation Card with Working "Plan My Trip" CTA */}
      <div
        className="rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FBEADD 0%, #FEF3EA 100%)',
          borderLeft: '4px solid #E0762F',
        }}
      >
        {/* Background decoration */}
        <div className="absolute right-0 top-0 w-48 h-48 opacity-5 text-[12rem] leading-none select-none pointer-events-none">
          🤖
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-[#E0762F]/15 flex items-center justify-center text-2xl flex-shrink-0">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3
                  className="text-base md:text-lg font-700 text-[#141B18]"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  AI Travel Recommendation
                </h3>
                <span className="text-[10px] md:text-xs bg-[#E0762F]/15 text-[#E0762F] rounded-full px-2 py-0.5 font-700">
                  Personalised for {activeLocation.city}
                </span>
              </div>
              <p className="text-[#4B5551] text-xs md:text-sm leading-relaxed max-w-2xl">
                {getRecommendationMessage()}
              </p>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3">
                {recommendedPlaces.map((place) => (
                  <span
                    key={place}
                    className="text-[11px] md:text-xs bg-white text-[#E0762F] border border-[#E0762F]/30 rounded-full px-2.5 py-1 font-600"
                  >
                    {place}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setPlannerOpen(true)}
            className="flex-shrink-0 h-11 px-6 rounded-xl bg-[#E0762F] text-white font-700 text-sm hover:bg-[#c9682a] transition-all active:scale-[0.98] whitespace-nowrap shadow-[0_4px_14px_rgba(224,118,47,0.35)] cursor-pointer"
          >
            ✨ Plan My Trip
          </button>
        </div>
      </div>

      {/* Quick stats row connected dynamically to activeLocation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: '🗺️',
            label: hasCrowdTelemetry ? 'Monitored Spots & POIs' : 'Verified Locations',
            value: `${displayedSpotsCount}`,
            sub: hasCrowdTelemetry ? `${activeLocation.city} real-time sensors` : `${activeLocation.city} verified landmarks`,
            onClick: () => navigate('/user/crowd'),
          },
          {
            icon: '🏠',
            label: 'Homestays Available',
            value: `${destinationStaysCount}`,
            sub: destinationStaysCount > 0 ? 'direct host chat ready' : 'onboarding new hosts soon',
            onClick: () => navigate('/user/connect'),
          },
          {
            icon: '🧑‍🤝‍🧑',
            label: 'Verified Local Guides',
            value: `${destinationGuidesCount}`,
            sub: destinationGuidesCount > 0 ? 'available for tours today' : 'verifying regional guides',
            onClick: () => navigate('/user/connect'),
          },
        ].map((item) => (
          <div
            key={item.label}
            onClick={item.onClick}
            className="bg-white rounded-2xl p-4 md:p-5 text-center shadow-[0_4px_20px_rgba(20,27,24,0.06)] border border-[#E4E7E5] hover:border-[#0F6E5C]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-3xl font-800 text-[#0F6E5C]">{item.value}</div>
            <div className="text-sm font-700 text-[#141B18] mt-0.5">{item.label}</div>
            <div className="text-xs text-[#7B8582]">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* AI Plan My Trip Interactive Modal */}
      <Modal
        isOpen={plannerOpen}
        onClose={() => {
          setPlannerOpen(false)
          setGeneratedPlan(false)
        }}
        title="AI Smart Travel Planner"
        subtitle={`Optimized around ${activeLocation.displayName} forecasts, budget, and local culture`}
        icon="✨"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F6F2] p-4 rounded-2xl border border-[#E4E7E5]">
            <div>
              <label className="block text-xs font-700 text-[#141B18] mb-1">Trip Duration</label>
              <select
                value={plannerDays}
                onChange={(e) => setPlannerDays(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs font-600 focus:outline-none"
              >
                <option value="1">1 Day (Quick Highlights)</option>
                <option value="3">3 Days (Recommended)</option>
                <option value="5">5 Days (Full Heritage Immersion)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-700 text-[#141B18] mb-1">
                Daily Budget: ₹{Number(plannerBudget).toLocaleString()}
              </label>
              <input
                type="range"
                min="2000"
                max="25000"
                step="1000"
                value={plannerBudget}
                onChange={(e) => setPlannerBudget(e.target.value)}
                className="w-full accent-[#E0762F] mt-2"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-700 text-[#141B18] mb-2">Select Primary Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleInterest(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-600 transition-all ${
                    selectedInterests.includes(opt)
                      ? 'bg-[#E0762F] text-white shadow-xs'
                      : 'bg-white border border-[#E4E7E5] text-[#4B5551] hover:border-[#E0762F]/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {!generatedPlan ? (
            <button
              onClick={handleGeneratePlan}
              className="w-full h-11 rounded-xl bg-[#E0762F] text-white font-700 text-sm hover:bg-[#c9682a] transition-all shadow-md active:scale-98 cursor-pointer"
            >
              ✨ Generate Tailored Itinerary for {activeLocation.city}
            </button>
          ) : (
            <div className="space-y-3 pt-2 slide-up">
              <div className="p-4 rounded-xl bg-[#E4F3EF] border border-[#0F6E5C]/20 text-xs text-[#0F6E5C]">
                <p className="font-700 text-sm mb-1">✨ {plannerDays}-Day Custom Itinerary for {activeLocation.displayName}</p>
                <p>Plan calibrated for budget ₹{Number(plannerBudget).toLocaleString()}/day with focus on {selectedInterests.join(', ')}.</p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {Array.from({ length: Number(plannerDays) }).map((_, d) => (
                  <div key={d} className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E4E7E5]">
                    <span className="font-700 text-[#0F6E5C]">Day {d + 1}: </span>
                    <span className="text-[#141B18] font-600">
                      {d === 0
                        ? `Morning exploration at ${recommendedPlaces[0] || 'Local Landmark'}, followed by authentic regional cuisine walk.`
                        : d === 1
                        ? `Visit ${recommendedPlaces[1] || 'Museum / Cultural Center'} at off-peak hours; evening sunset trail.`
                        : `Authentic village crafts tour and local artisanal shopping in ${activeLocation.city}.`}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setPlannerOpen(false)
                  navigate('/user/connect')
                }}
                className="w-full h-10 rounded-xl bg-[#0F6E5C] text-white font-700 text-xs hover:bg-[#0B5849] transition-all cursor-pointer"
              >
                Browse Recommended Stays & Guides →
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
