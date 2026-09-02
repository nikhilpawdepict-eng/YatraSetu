import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import MockMap from '../../components/MockMap'
import Modal from '../../components/ui/Modal'
import { matchesDestination } from '../../services/locationService'

export default function Emergency() {
  const { activeLocation, weather, spots = [], showToast } = useApp()
  const [sosModalOpen, setSosModalOpen] = useState(false)
  const [sosSent, setSosSent] = useState(false)

  // Qualitative alerts without exact percentages
  const getDynamicAlerts = () => {
    const city = activeLocation.city.toLowerCase()
    const weatherAlert = weather && weather.apparentTemperature > 36
      ? {
          id: 'w-1',
          type: 'Heat Advisory',
          message: `High heat index in ${activeLocation.city} (feels like ${weather.apparentTemperature}°C). Stay hydrated and carry shade.`,
          severity: 'medium' as const,
          time: 'Live',
          icon: '☀️',
        }
      : weather && weather.weatherDescription.toLowerCase().includes('rain')
      ? {
          id: 'w-2',
          type: 'Rain Advisory',
          message: `Precipitation active in ${activeLocation.city}. Pavements may be slippery around monument steps.`,
          severity: 'medium' as const,
          time: 'Live',
          icon: '🌧️',
        }
      : null

    if (city.includes('jaipur')) {
      return [
        {
          id: '1',
          type: 'Crowd Alert',
          message: 'Amber Fort — High Crowd. Peak arrival hour, expect longer queue times at courtyard entry.',
          severity: 'high' as const,
          time: '10:15 AM',
          icon: '👥',
        },
        {
          id: '2',
          type: 'Traffic Advisory',
          message: 'Moderate congestion on MI Road. Alternate heritage transit corridor open via Ajmeri Gate.',
          severity: 'medium' as const,
          time: '9:45 AM',
          icon: '🚗',
        },
        ...(weatherAlert ? [weatherAlert] : []),
      ]
    }

    if (city.includes('pune') || city.includes('pimpri') || city.includes('chinchwad')) {
      return [
        {
          id: '1',
          type: 'Civic Advisory',
          message: `Heritage promenade transit in ${activeLocation.city} operating with active civic sanitation patrols.`,
          severity: 'low' as const,
          time: '9:30 AM',
          icon: 'ℹ️',
        },
        ...(weatherAlert ? [weatherAlert] : []),
      ]
    }

    return [
      {
        id: '1',
        type: 'Regional Advisory',
        message: `Emergency response desks and tourist help desks operational across ${activeLocation.displayName}.`,
        severity: 'low' as const,
        time: '8:00 AM',
        icon: '🛡️',
      },
      ...(weatherAlert ? [weatherAlert] : []),
    ]
  }

  const destinationServices = [
    {
      type: '🚔',
      name: `${activeLocation.city} Central Police Station`,
      address: `Station Road, ${activeLocation.city}`,
      distance: '1.2 km',
      contact: '100 / 112',
    },
    {
      type: '🏥',
      name: `${activeLocation.city} Government District Hospital`,
      address: `Hospital Road, ${activeLocation.city}`,
      distance: '2.4 km',
      contact: '108 / 102',
    },
    {
      type: '🚒',
      name: `${activeLocation.city} Central Fire & Rescue`,
      address: `Civil Lines, ${activeLocation.city}`,
      distance: '1.8 km',
      contact: '101',
    },
  ]

  const emergencyContacts = [
    { label: '🚔 Police Dispatch', number: '100' },
    { label: '🚑 Medical Ambulance', number: '108' },
    { label: '🚒 Fire & Rescue', number: '101' },
    { label: '📞 National Tourist Helpline', number: '1363' },
    { label: '🆘 National Emergency Number', number: '112' },
    { label: '🛡️ Women Helpline', number: '1091' },
  ]

  // Filter spots for active location without showing fake counts
  const destinationSpots = spots.filter((s) => matchesDestination(s.location, activeLocation.city))
  const mapSpots = destinationSpots.length > 0
    ? destinationSpots.map((s) => ({
        id: s.id,
        name: s.name,
        x: s.mapX,
        y: s.mapY,
        count: s.count,
        level: s.densityLevel === 'high' ? ('high' as const) : s.densityLevel === 'medium' ? ('medium' as const) : ('low' as const),
      }))
    : [
        { id: '1', name: `${activeLocation.city} Historic Core`, x: 140, y: 100, count: 0, level: 'verified' as const },
        { id: '2', name: `${activeLocation.city} Central Promenade`, x: 230, y: 150, count: 0, level: 'verified' as const },
        { id: '3', name: `${activeLocation.city} Cultural Complex`, x: 300, y: 120, count: 0, level: 'verified' as const },
      ]

  const severityBorder = { high: '#D64545', medium: '#D89A1C', low: '#1E9E5A' }
  const severityBg = { high: '#FBE6E6', medium: '#FBF1DA', low: '#E4F7EC' }

  const alerts = getDynamicAlerts()

  const handleSendSos = () => {
    setSosSent(true)
    showToast(`🚨 SOS Broadcast transmitted with GPS coordinates (${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}) to ${activeLocation.city} Emergency Dispatch!`, 'error')
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-5">
      {/* Title & Active Destination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              Emergency & Tourist Safety
            </h2>
            <span className="text-[10px] bg-[#FBE6E6] text-[#D64545] font-700 px-2.5 py-0.5 rounded-full border border-[#D64545]/20">
              📍 {activeLocation.displayName}
            </span>
          </div>
          <p className="text-[#7B8582] text-xs md:text-sm mt-0.5">
            Real-time safety advisories, verified medical & police services, and instant GPS SOS dispatch.
          </p>
        </div>

        {/* SOS Button */}
        <button
          onClick={() => {
            setSosModalOpen(true)
            setSosSent(false)
          }}
          className="h-11 px-6 rounded-2xl bg-[#D64545] hover:bg-[#b83838] text-white font-800 text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_16px_rgba(214,69,69,0.35)] active:scale-95 transition-all cursor-pointer"
        >
          <span>🚨</span>
          <span>Emergency SOS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col (7 cols) — Safety Alerts & Nearby Services */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Advisories */}
          <div className="bg-white p-5 rounded-3xl border border-[#E4E7E5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-700 text-[#141B18] text-sm" style={{ fontFamily: 'Fraunces, serif' }}>
                ⚠️ Active Safety Advisories in {activeLocation.city}
              </h3>
              <span className="text-[10px] font-700 text-[#0F6E5C] bg-[#E4F3EF] px-2 py-0.5 rounded-full">
                Real-Time Monitored
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-2xl border flex items-start gap-3 transition-all"
                  style={{
                    backgroundColor: severityBg[a.severity],
                    borderColor: `${severityBorder[a.severity]}40`,
                  }}
                >
                  <span className="text-xl flex-shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className="text-[10px] font-700 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'white',
                          color: severityBorder[a.severity],
                        }}
                      >
                        {a.type}
                      </span>
                      <span className="text-[10px] text-[#7B8582]">{a.time}</span>
                    </div>
                    <p className="text-xs font-600 text-[#141B18] leading-relaxed">{a.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Emergency Services */}
          <div className="bg-white p-5 rounded-3xl border border-[#E4E7E5] shadow-xs space-y-3">
            <h3 className="font-700 text-[#141B18] text-sm" style={{ fontFamily: 'Fraunces, serif' }}>
              🏥 Nearby Emergency Services in {activeLocation.city}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {destinationServices.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#E4E7E5] space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{s.type}</span>
                      <span className="text-[10px] font-700 text-[#0F6E5C] bg-[#E4F3EF] px-1.5 py-0.5 rounded-md">
                        {s.distance}
                      </span>
                    </div>
                    <p className="font-700 text-[#141B18] text-xs mt-1 leading-snug">{s.name}</p>
                    <p className="text-[11px] text-[#7B8582] mt-0.5 line-clamp-1">{s.address}</p>
                  </div>
                  <a
                    href={`tel:${s.contact.replace(/[^0-9+]/g, '')}`}
                    className="block text-center py-1.5 bg-white border border-[#0F6E5C]/30 text-[#0F6E5C] font-700 text-[11px] rounded-xl hover:bg-[#E4F3EF] transition-colors"
                  >
                    📞 {s.contact}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Helplines Bar */}
          <div className="bg-white p-5 rounded-3xl border border-[#E4E7E5] shadow-xs space-y-2.5">
            <h3 className="font-700 text-[#141B18] text-sm" style={{ fontFamily: 'Fraunces, serif' }}>
              📞 National & Tourist Emergency Helplines
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {emergencyContacts.map((c, i) => (
                <a
                  key={i}
                  href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                  className="p-2.5 bg-[#F7F6F2] hover:bg-[#E4F3EF] rounded-xl border border-[#E4E7E5] hover:border-[#0F6E5C]/40 text-xs transition-all group flex items-center justify-between"
                >
                  <span className="font-600 text-[#4B5551] group-hover:text-[#0F6E5C] truncate">{c.label}</span>
                  <span className="font-800 text-[#0F6E5C] ml-1">{c.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col (5 cols) — Tourist Safety & Density Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E4E7E5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-700 text-[#141B18] text-sm" style={{ fontFamily: 'Fraunces, serif' }}>
                🗺️ Tourist Safety & Density Map
              </h3>
              <span className="text-[10px] text-[#7B8582]">{activeLocation.displayName}</span>
            </div>
            <p className="text-xs text-[#7B8582]">
              Real-time spatial distribution and safety check-in stations across {activeLocation.city}.
            </p>

            <MockMap spots={mapSpots} activeDestination={activeLocation.displayName} />
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <Modal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        title="Emergency SOS Broadcast"
        subtitle={`Instantly transmits your GPS coordinates to ${activeLocation.city} emergency services`}
        icon="🚨"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          {!sosSent ? (
            <>
              <div className="p-4 bg-[#FBE6E6] rounded-2xl border border-[#D64545]/30 space-y-2 text-[#D64545]">
                <p className="font-700 text-sm">⚠️ High Priority Emergency Action</p>
                <p className="leading-relaxed">
                  Pressing broadcast will transmit your current GPS coordinates to the Police Control Room (PCR), Disaster Management Authority, and nearby verified responders.
                </p>
              </div>

              <div className="p-3 bg-[#F7F6F2] rounded-xl border border-[#E4E7E5] space-y-1">
                <p className="text-[10px] text-[#7B8582] uppercase font-700">Broadcasting Coordinates</p>
                <p className="font-800 text-sm text-[#141B18]">
                  {activeLocation.latitude.toFixed(4)}° N, {activeLocation.longitude.toFixed(4)}° E
                </p>
                <p className="text-xs text-[#4B5551]">Location: {activeLocation.displayName}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSosModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E4E7E5] font-700 text-[#7B8582] hover:bg-[#F7F6F2]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendSos}
                  className="flex-1 h-11 rounded-xl bg-[#D64545] text-white font-800 hover:bg-[#b83838] transition-all shadow-md cursor-pointer"
                >
                  🚨 Broadcast SOS Now
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 text-center py-4">
              <span className="text-4xl block animate-bounce">📡</span>
              <p className="font-800 text-base text-[#1E9E5A]">SOS Broadcast Active</p>
              <p className="text-xs text-[#4B5551] max-w-sm mx-auto">
                Your emergency signal has been received by {activeLocation.city} Disaster Cell. Responders have been dispatched.
              </p>
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="mt-3 px-6 h-10 rounded-xl bg-[#0F6E5C] text-white font-700 text-xs"
              >
                Close & Keep Active
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
