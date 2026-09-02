import { useState } from 'react'
import MockMap from '../../components/MockMap'

const spots = [
  {
    id: '1', name: 'Amber Fort', location: 'Amber, Jaipur',
    count: 420, density: 'High', densityLevel: 'high' as const,
    trend: '↑ Rising', capacity: 500, status: 'Critical',
  },
  {
    id: '2', name: 'City Palace Museum', location: 'Old City, Jaipur',
    count: 280, density: 'Moderate', densityLevel: 'medium' as const,
    trend: '→ Stable', capacity: 400, status: 'Normal',
  },
  {
    id: '3', name: 'Jantar Mantar', location: 'Tripolia Bazar, Jaipur',
    count: 130, density: 'Low', densityLevel: 'low' as const,
    trend: '↓ Declining', capacity: 300, status: 'Normal',
  },
  {
    id: '4', name: 'Nahargarh Fort', location: 'Nahargarh Hills, Jaipur',
    count: 310, density: 'Moderate', densityLevel: 'medium' as const,
    trend: '↑ Rising', capacity: 350, status: 'Watch',
  },
]

const mapSpots = [
  { id: '1', name: 'Amber Fort', x: 110, y: 80, count: 420, level: 'high' as const },
  { id: '2', name: 'City Palace', x: 200, y: 140, count: 280, level: 'medium' as const },
  { id: '3', name: 'Main Gate', x: 300, y: 100, count: 130, level: 'low' as const },
  { id: '4', name: 'Nahargarh', x: 165, y: 200, count: 310, level: 'medium' as const },
]

const warnings = [
  {
    id: '1', source: 'Police Authority', icon: '🚔', severity: 'high' as const,
    message: 'VIP convoy at Amber Fort road. Restrict vehicular access from 11 AM–1 PM.',
    time: '10:05 AM',
  },
  {
    id: '2', source: 'Tourism Department', icon: '🏛️', severity: 'medium' as const,
    message: 'International tour group of 200 expected at City Palace between 2–4 PM. Coordinate entry protocol.',
    time: '9:30 AM',
  },
  {
    id: '3', source: 'Disaster Management', icon: '⛈️', severity: 'medium' as const,
    message: 'Thunderstorm advisory for Jaipur district from 3:00–6:00 PM. Alert outdoor tour operators.',
    time: '8:00 AM',
  },
  {
    id: '4', source: 'Traffic Authority', icon: '🚦', severity: 'low' as const,
    message: 'Road widening work on Amber Road continues. Single lane traffic from Gate 3 to Jalmahal.',
    time: '7:45 AM',
  },
]

const card = 'bg-[#1C2427] border border-white/10'
const densityColor = { High: '#D64545', Moderate: '#D89A1C', Low: '#1E9E5A' }
const densityBg = { High: '#D6454518', Moderate: '#D89A1C18', Low: '#1E9E5A18' }
const warnBorder = { high: '#D64545', medium: '#D89A1C', low: '#1E9E5A' }
const warnBg = { high: '#D6454510', medium: '#D89A1C10', low: '#1E9E5A10' }

export default function AuthorityCrowd() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<(typeof spots)[0] | null>(null)

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <h2 className="text-2xl font-700" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
            Crowd Monitor
          </h2>
        </div>
        <p style={{ color: '#ffffff40', fontSize: '14px', marginTop: '2px' }}>
          Live crowd intelligence across Jaipur tourist zones.
        </p>
      </div>

      <div className="flex gap-5 h-[calc(100vh-200px)]">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
          {/* Search */}
          <div className="flex-shrink-0">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#ffffff30' }}>🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter tourist spot / location..."
                className="w-full h-11 pl-10 pr-4 rounded-full text-sm focus:outline-none"
                style={{
                  background: '#1C2427',
                  border: '1px solid #ffffff20',
                  color: '#EDEFEE',
                }}
              />
            </div>

            {/* Spot selector pills */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {spots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="text-xs rounded-full px-3 py-1.5 font-500 transition-all"
                  style={{
                    background: selected?.id === s.id ? '#0F6E5C' : '#1C2427',
                    color: selected?.id === s.id ? '#fff' : '#ffffff60',
                    border: `1px solid ${selected?.id === s.id ? '#0F6E5C' : '#ffffff15'}`,
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Spot Detail */}
          {selected ? (
            <div className={`${card} rounded-2xl p-5 flex-shrink-0 slide-up`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-700 mb-0.5" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
                    {selected.name}
                  </h3>
                  <p style={{ color: '#ffffff40', fontSize: '13px' }}>📍 {selected.location}</p>
                </div>
                <span
                  className="text-xs font-600 px-3 py-1 rounded-full"
                  style={{
                    background: densityBg[selected.density as keyof typeof densityBg],
                    color: densityColor[selected.density as keyof typeof densityColor],
                    border: `1px solid ${densityColor[selected.density as keyof typeof densityColor]}30`,
                  }}
                >
                  {selected.status}
                </span>
              </div>

              {/* Big count */}
              <div
                className="text-center py-5 mb-4 rounded-xl"
                style={{ background: '#12181A' }}
              >
                <div className="text-5xl font-800" style={{ color: '#EDEFEE' }}>
                  {selected.count.toLocaleString()}
                </div>
                <div className="text-sm mt-1" style={{ color: '#ffffff40' }}>people currently</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '📊', label: 'Crowd Density', value: selected.density, colored: true },
                  { icon: '📈', label: 'Trend', value: selected.trend, colored: false },
                  { icon: '🏟️', label: 'Capacity', value: `${selected.capacity} people`, colored: false },
                  { icon: '⚠️', label: 'Status', value: selected.status, colored: true },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs font-500 mb-0.5" style={{ color: '#ffffff40' }}>
                      {item.icon} {item.label}
                    </p>
                    <p
                      className="text-sm font-700"
                      style={{
                        color: item.colored
                          ? densityColor[selected.density as keyof typeof densityColor]
                          : '#EDEFEE',
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`${card} rounded-2xl p-6 flex items-center justify-center flex-shrink-0`} style={{ minHeight: '160px' }}>
              <p style={{ color: '#ffffff30', fontSize: '14px' }}>Select a spot to view crowd details</p>
            </div>
          )}

          {/* Official Warnings */}
          <div className="flex-shrink-0">
            <p className="text-xs font-700 uppercase tracking-wide mb-3" style={{ color: '#ffffff40' }}>
              Official Warnings Feed
            </p>
            <div className="space-y-2.5">
              {warnings.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl p-3.5 border-l-4"
                  style={{
                    borderLeftColor: warnBorder[w.severity],
                    background: warnBg[w.severity],
                    border: `1px solid #ffffff08`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg flex-shrink-0">{w.icon}</span>
                      <div>
                        <p className="text-xs font-700 mb-0.5" style={{ color: warnBorder[w.severity] }}>
                          {w.source}
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#EDEFEE' }}>
                          {w.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs whitespace-nowrap flex-shrink-0" style={{ color: '#ffffff30' }}>
                      {w.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Map */}
        <div className="w-96 flex-shrink-0">
          <MockMap spots={mapSpots} title="Crowd Distribution Map" showTotal dark />
        </div>
      </div>
    </div>
  )
}
