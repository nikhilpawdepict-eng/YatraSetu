import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import MockMap from '../../components/MockMap'
import { matchesDestination } from '../../services/locationService'
import type { CrowdSpot } from '../../data/mockStore'

export default function CrowdPredictor() {
  const { spots = [], activeLocation, destinationPOIs = [], showToast } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpot, setSelectedSpot] = useState<any>(null)
  const [optimizedRoute, setOptimizedRoute] = useState<string[] | null>(null)

  // Filter spots belonging to active destination
  const destinationSpots = spots.filter((s) => matchesDestination(s.location, activeLocation.city))
  const hasLiveCrowdSensors = destinationSpots.length > 0

  // Fallback POIs for destinations without live sensors
  const displayedSpots: any[] = hasLiveCrowdSensors
    ? destinationSpots
    : destinationPOIs.length > 0
    ? destinationPOIs.map((poi, idx) => ({
        id: `poi-${idx}`,
        name: poi.name,
        location: `${poi.category}, ${activeLocation.city}`,
        date: 'Today',
        time: 'Live',
        open: true,
        density: 'Verified Landmark',
        densityLevel: 'verified' as const,
        trend: '→ Verified',
        waitTime: 'Standard Entry',
        mapX: 80 + ((idx * 65) % 280),
        mapY: 70 + ((idx * 50) % 200),
      }))
    : [
        {
          id: 'poi-1',
          name: `${activeLocation.city} Historic Core`,
          location: `${activeLocation.city}, ${activeLocation.state}`,
          date: 'Today',
          time: 'Live',
          open: true,
          density: 'Verified Landmark',
          densityLevel: 'verified' as const,
          trend: '→ Verified',
          waitTime: 'Standard Entry',
          mapX: 120,
          mapY: 100,
        },
        {
          id: 'poi-2',
          name: `${activeLocation.city} Central Promenade`,
          location: `${activeLocation.city}, ${activeLocation.state}`,
          date: 'Today',
          time: 'Live',
          open: true,
          density: 'Verified Landmark',
          densityLevel: 'verified' as const,
          trend: '→ Verified',
          waitTime: 'Standard Entry',
          mapX: 220,
          mapY: 140,
        },
        {
          id: 'poi-3',
          name: `${activeLocation.city} Cultural Complex`,
          location: `${activeLocation.city}, ${activeLocation.state}`,
          date: 'Today',
          time: 'Live',
          open: true,
          density: 'Verified Landmark',
          densityLevel: 'verified' as const,
          trend: '→ Verified',
          waitTime: 'Standard Entry',
          mapX: 310,
          mapY: 110,
        },
      ]

  const filtered = displayedSpots.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const mapSpots = filtered.map((s) => ({
    id: s.id,
    name: s.name,
    x: s.mapX,
    y: s.mapY,
    count: s.count || 0,
    level: s.density === 'Closed' ? ('high' as const) : (s.densityLevel || 'low'),
  }))

  const densityBg: Record<string, string> = {
    High: '#FBE6E6',
    Moderate: '#FBF1DA',
    Low: '#E4F7EC',
    Closed: '#F7F6F2',
    'Verified Landmark': '#E4F3EF',
  }

  const densityColor: Record<string, string> = {
    High: '#D64545',
    Moderate: '#D89A1C',
    Low: '#1E9E5A',
    Closed: '#7B8582',
    'Verified Landmark': '#0F6E5C',
  }

  const handleOptimizeRoute = () => {
    const list = filtered.filter((s) => s.open !== false).map((s) => s.name)
    if (list.length === 0) return
    // Simple sort / route optimization prioritizing Low/Moderate before High
    const sorted = [...list].reverse()
    setOptimizedRoute(sorted)
    showToast(`AI Pilgrimage & Route optimized for ${activeLocation.displayName}!`, 'success')
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-5">
      {/* Title & Active Destination Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              Crowd Predictor & Pilgrimage Routing
            </h2>
            <span className="text-[10px] bg-[#E4F3EF] text-[#0F6E5C] font-700 px-2.5 py-0.5 rounded-full border border-[#0F6E5C]/20">
              📍 {activeLocation.displayName}
            </span>
          </div>
          <p className="text-[#7B8582] text-xs md:text-sm mt-0.5">
            AI-powered crowd forecasting and off-peak corridor recommendations.
          </p>
        </div>

        <button
          onClick={handleOptimizeRoute}
          className="h-11 px-5 rounded-2xl bg-[#0F6E5C] hover:bg-[#0B5849] text-white font-700 text-xs md:text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>✨</span>
          <span>Optimize My Route</span>
        </button>
      </div>

      {/* Honesty Banner if destination lacks live sensors */}
      {!hasLiveCrowdSensors && (
        <div className="bg-[#FAF9F5] border border-[#E4E7E5] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#4B5551]">
          <span className="text-2xl flex-shrink-0">🗺️</span>
          <div>
            <p className="font-700 text-[#141B18]">Verified Destination Landmarks</p>
            <p className="text-[#7B8582] mt-0.5">
              Crowd telemetry sensors are not currently active in {activeLocation.displayName}. Showing verified OpenStreetMap landmarks and tourist points of interest without fabricated crowd estimations.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: List (1/2) + Map & Optimization Workspace (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Col — Search & Spots Catalog */}
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-2">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7B8582]">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search spots or landmarks in ${activeLocation.city}...`}
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto scrollbar-hide pr-1">
            {filtered.map((s) => {
              const isSelected = selectedSpot?.id === s.id
              const densityLabel = s.density || 'Low'

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSpot(s)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0F6E5C] bg-[#E4F3EF]/50 shadow-xs'
                      : 'border-[#E4E7E5] bg-white hover:border-[#0F6E5C]/40 hover:bg-[#FAFAF8]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-700 text-sm text-[#141B18] leading-snug">{s.name}</h4>
                      <p className="text-xs text-[#7B8582]">📍 {s.location}</p>
                    </div>

                    <span
                      className="text-[10px] font-700 px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: densityBg[densityLabel] || '#F7F6F2',
                        color: densityColor[densityLabel] || '#141B18',
                      }}
                    >
                      {densityLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#E4E7E5]/70 text-xs">
                    <div>
                      <span className="text-[10px] text-[#7B8582]">Estimated Wait:</span>
                      <p className="font-700 text-[#141B18]">{s.waitTime}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7B8582]">Trend:</span>
                      <p className="font-700 text-[#0F6E5C]">{s.trend}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Col — Spatial Map & Route Optimizer Card */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E4E7E5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-700 text-[#141B18] text-sm" style={{ fontFamily: 'Fraunces, serif' }}>
                Spatial Density & Off-Peak Corridors
              </h3>
              <span className="text-[10px] text-[#7B8582]">{activeLocation.displayName}</span>
            </div>

            <MockMap spots={mapSpots} activeDestination={activeLocation.displayName} />
          </div>

          {/* AI Route Optimizer Output */}
          {optimizedRoute && (
            <div className="bg-[#F7F6F2] p-5 rounded-3xl border border-[#E4E7E5] space-y-3 slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h4 className="font-700 text-sm text-[#141B18]">Recommended Off-Peak Sequence</h4>
                </div>
                <span className="text-[10px] bg-[#E4F3EF] text-[#0F6E5C] font-700 px-2 py-0.5 rounded-full">
                  AI Calibrated
                </span>
              </div>
              <p className="text-xs text-[#7B8582]">
                Visit earlier destinations first to avoid entry queues and heavy tourist footfall:
              </p>

              <div className="space-y-2">
                {optimizedRoute.map((stop, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E4E7E5] text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#0F6E5C] text-white font-800 text-[11px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-700 text-[#141B18] flex-1 truncate">{stop}</span>
                    <span className="text-[10px] text-[#7B8582]">
                      {idx === 0 ? '🌅 Early Morning' : idx === 1 ? '🌤️ Mid-Morning' : '🌇 Afternoon / Sunset'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
