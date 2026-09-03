import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { useApp } from '../../context/AppContext'
import InteractiveMap, { MapMarkerItem } from '../../components/InteractiveMap'
import { getCityDataset } from '../../services/destinationData'
import {
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  Layers,
  MapPin,
  RefreshCw,
  Navigation,
} from 'lucide-react'

export default function CrowdPredictor() {
  const { activeLocation } = useApp()
  const [selectedFestival, setSelectedFestival] = useState('Regular Day')
  const [predictionData, setPredictionData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [simulatedHour, setSimulatedHour] = useState('08:00 AM')

  // Dynamic city dataset containing real coordinates and crowd markers for activeLocation
  const cityData = getCityDataset(activeLocation.city)

  const festivals = [
    'Regular Day',
    'Teej Festival / Shravan Mela',
    'Diwali & Heritage Festival Surge',
    'Weekend / National Holiday Spike',
    'Ganga Aarti / Sacred Tithi',
  ]

  const fetchPrediction = async () => {
    setLoading(true)
    try {
      const data = await api.crowd.getPrediction(activeLocation.city || 'Jaipur', selectedFestival)
      setPredictionData(data)
    } catch (err: any) {
      console.error('Failed to load crowd prediction:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrediction()
  }, [activeLocation, selectedFestival])

  // Get crowd markers for the active destination
  const crowdMarkers: MapMarkerItem[] = cityData.markers.map((m) => {
    if (m.type === 'crowd' && selectedFestival !== 'Regular Day') {
      return { ...m, crowdLevel: 'high', badge: '⚠️ Festival Surge Alert' }
    }
    return m
  })

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0F6E5C] via-[#0A4E42] to-[#141B18] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-700">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B931]" />
            <span>AI Pilgrimage & Festival Crowd Predictor — {activeLocation.displayName}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-800 tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Live Predictive Crowd Intelligence & Navigation
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Historical footfall time-series, festival calendar surges, and Google Maps-style turn-by-turn traffic corridors for {activeLocation.city}.
          </p>
        </div>

        {/* Festival & Event Selector */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 space-y-1.5">
          <label className="block text-[11px] font-700 uppercase tracking-wider text-white/80">
            Simulate Event / Calendar Day
          </label>
          <select
            value={selectedFestival}
            onChange={(e) => setSelectedFestival(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white text-[#141B18] font-700 text-xs focus:outline-hidden cursor-pointer"
          >
            {festivals.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0F6E5C] animate-spin mx-auto" />
          <p className="text-xs font-700 text-[#7B8582]">Running AI Crowd Surge Model for {activeLocation.city}...</p>
        </div>
      ) : predictionData ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Recommendation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-1.5">
              <span className="text-xs font-700 text-[#1E9E5A] uppercase tracking-wider">
                🌟 Recommended Visiting Windows
              </span>
              <p className="text-base font-800 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                {predictionData.bestVisitingWindows[0]?.window}
              </p>
              <p className="text-xs text-[#505D58]">
                {predictionData.bestVisitingWindows[0]?.reason}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-1.5">
              <span className="text-xs font-700 text-[#D64545] uppercase tracking-wider">
                ⚠️ Avoid High Surge Hours
              </span>
              <p className="text-base font-800 text-[#D64545]" style={{ fontFamily: 'Fraunces, serif' }}>
                11:30 AM – 03:00 PM
              </p>
              <p className="text-xs text-[#505D58]">
                Peak tour bus arrivals, courtyard bottlenecks, and queue times exceeding 45 minutes in {activeLocation.city}.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-1.5">
              <span className="text-xs font-700 text-[#0F6E5C] uppercase tracking-wider">
                🤖 AI Model Confidence Score
              </span>
              <p className="text-base font-800 text-[#0F6E5C]" style={{ fontFamily: 'Fraunces, serif' }}>
                {predictionData.aiConfidenceScore}
              </p>
              <p className="text-xs text-[#505D58]">
                Trained on historical footfall, train arrivals proxy, and festival calendars.
              </p>
            </div>
          </div>

          {/* Hourly Forecast Curve */}
          <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0F6E5C]" />
                <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Predicted Hourly Crowd Curve — {activeLocation.city} ({selectedFestival})
                </h3>
              </div>
              <span className="text-xs font-700 text-[#7B8582]">06:00 AM to 08:00 PM</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {predictionData.hourlyForecast.map((h: any) => {
                const pct = Math.round((h.occupancy / h.capacity) * 100)
                const isSelected = simulatedHour === h.time
                return (
                  <button
                    key={h.time}
                    onClick={() => setSimulatedHour(h.time)}
                    className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0F6E5C] bg-[#E4F3EF] shadow-xs scale-102'
                        : 'border-[#E4E7E5] bg-[#F7F6F2] hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-800 text-[#141B18] block">{h.time}</span>
                    <div className="h-16 flex items-end justify-center py-1">
                      <div
                        className={`w-5 rounded-t-md transition-all duration-300 ${
                          h.level === 'High'
                            ? 'bg-[#D64545]'
                            : h.level === 'Moderate'
                            ? 'bg-[#D89A1C]'
                            : 'bg-[#1E9E5A]'
                        }`}
                        style={{ height: `${Math.max(15, pct)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-800 px-2 py-0.5 rounded-full inline-block ${
                        h.level === 'High'
                          ? 'bg-[#FDE8E8] text-[#D64545]'
                          : h.level === 'Moderate'
                          ? 'bg-[#FEF3C7] text-[#D89A1C]'
                          : 'bg-[#E4F7EC] text-[#1E9E5A]'
                      }`}
                    >
                      {h.level}
                    </span>
                    <p className="text-[10px] text-[#7B8582]">{h.waitMin}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Explainable AI Factors & Interactive Destination Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Explainable AI Factors (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E4E7E5] pb-3">
                <Sparkles className="w-5 h-5 text-[#0F6E5C]" />
                <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Explainable AI Factor Breakdown
                </h3>
              </div>
              <p className="text-xs text-[#505D58] leading-relaxed">
                Why is the crowd predicted at this level in {activeLocation.city}?
              </p>

              <div className="space-y-3">
                {predictionData.explainableFactors.map((f: any) => (
                  <div key={f.factor} className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E4E7E5] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-700 text-[#141B18]">{f.factor}</span>
                      <span className="font-800 text-[#0F6E5C]">{f.impact} {f.trend}</span>
                    </div>
                    <p className="text-[11px] text-[#505D58]">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Destination & Route Map with Traffic Status (7 cols) */}
            <div className="lg:col-span-7">
              <InteractiveMap
                center={cityData.center}
                zoom={cityData.zoom}
                items={crowdMarkers}
                height="460px"
                title={`${activeLocation.city} Live Crowd Hotspots & Google Maps-Style Traffic Corridor`}
                showFilters={true}
                showRouteFinder={true}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
