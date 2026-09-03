import { useState } from 'react'
import { api } from '../../services/api'
import { useApp } from '../../context/AppContext'
import InteractiveMap, { MapMarkerItem } from '../../components/InteractiveMap'
import CommunicationModal from '../../components/CommunicationModal'
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  Compass,
  Car,
  Home,
  Utensils,
  Leaf,
  Clock,
  MapPin,
  Check,
  Send,
  Save,
  MessageSquare,
  Mail,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const availableInterests = [
  { id: 'Heritage', label: 'Heritage & Forts', icon: '🏛️' },
  { id: 'Culture', label: 'Art & Culture', icon: '🎨' },
  { id: 'Food', label: 'Local Food & Street Trails', icon: '🍲' },
  { id: 'Adventure', label: 'Adventure & Treks', icon: '🧗' },
  { id: 'Nature', label: 'Nature & Gardens', icon: '🌿' },
  { id: 'Photography', label: 'Photography & Hidden Gems', icon: '📸' },
  { id: 'Spiritual', label: 'Spiritual & Ghats', icon: '🪔' },
  { id: 'Shopping', label: 'Artisan Bazaars', icon: '🛍️' },
]

export default function AIPlanner() {
  const { activeLocation } = useApp()
  const [destination, setDestination] = useState(activeLocation.city || 'Jaipur')
  const [duration, setDuration] = useState(3)
  const [budget, setBudget] = useState(15000)
  const [people, setPeople] = useState(2)
  const [interests, setInterests] = useState<string[]>(['Heritage', 'Culture', 'Food'])
  const [transportPref, setTransportPref] = useState('Local Taxi / Auto')
  const [stayPref, setStayPref] = useState('Heritage Homestay')
  const [foodPref, setFoodPref] = useState('Authentic Regional')
  const [accessibility, setAccessibility] = useState(false)

  const [loading, setLoading] = useState(false)
  const [modifying, setModifying] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<any | null>(null)
  const [selectedTier, setSelectedTier] = useState<'Budget' | 'Balanced' | 'Premium'>('Balanced')
  const [modifyPrompt, setModifyPrompt] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Communication modal state
  const [commModalOpen, setCommModalOpen] = useState(false)
  const [commChannel, setCommChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [commMessage, setCommMessage] = useState('')
  const [commSubject, setCommSubject] = useState('')

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    setSaveSuccess(false)
    try {
      const res = await api.planner.generate({
        destination,
        duration,
        budget,
        people,
        interests,
        transportPref,
        stayPref,
        foodPref,
        intensity: 'Moderate',
      })
      setGeneratedResult(res)
    } catch (err: any) {
      alert(err.message || 'Failed to generate itinerary.')
    } finally {
      setLoading(false)
    }
  }

  const currentPlan = generatedResult?.plans?.find((p: any) => p.tier === selectedTier) || generatedResult?.plans?.[1]

  const handleModify = async (customPrompt?: string) => {
    const promptToUse = customPrompt || modifyPrompt
    if (!promptToUse || !currentPlan) return
    setModifying(true)
    try {
      const res = await api.planner.modify({
        currentPlan,
        prompt: promptToUse,
      })
      // Update plan in place
      setGeneratedResult((prev: any) => {
        if (!prev) return prev
        const updatedPlans = prev.plans.map((p: any) =>
          p.tier === selectedTier ? res.modifiedPlan : p
        )
        return { ...prev, plans: updatedPlans }
      })
      setModifyPrompt('')
    } catch (err: any) {
      alert(err.message || 'Failed to dynamically modify itinerary.')
    } finally {
      setModifying(false)
    }
  }

  const handleSaveItinerary = async () => {
    if (!currentPlan) return
    try {
      await api.planner.save({
        destination,
        startDate: generatedResult?.startDate || new Date().toISOString().split('T')[0],
        durationDays: duration,
        budgetTier: selectedTier,
        totalCost: currentPlan.totalEstimatedCost,
        remainingBudget: currentPlan.budgetRemaining,
        summary: `${currentPlan.title} (${duration} Days in ${destination})`,
        plan: currentPlan,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(err.message || 'Failed to save itinerary.')
    }
  }

  const openComm = (channel: 'whatsapp' | 'email' | 'sms') => {
    if (!currentPlan) return
    const summary = `🌟 *YatraSetu Itinerary: ${destination}*\n\n` +
      `📅 *Plan:* ${currentPlan.title} (${duration} Days)\n` +
      `💰 *Total Estimated Cost:* ₹${currentPlan.totalEstimatedCost.toLocaleString()} (Remaining: ₹${currentPlan.budgetRemaining.toLocaleString()})\n` +
      `🌱 *Sustainability Score:* ${currentPlan.sustainabilityScore}/100\n\n` +
      `🏨 *Stay:* ${currentPlan.days[0]?.stayRecommendation?.name}\n` +
      `🍽️ *Food Recommendations:* ${currentPlan.days[0]?.foodRecommendations?.join(', ')}\n\n` +
      `📍 *Key Stops:* ${currentPlan.days.flatMap((d: any) => d.activities.map((a: any) => a.title)).slice(0, 4).join(' ➔ ')}\n\n` +
      `Explore full live itinerary on YatraSetu: http://localhost:8443`

    setCommChannel(channel)
    setCommSubject(`Your ${duration}-Day ${destination} Itinerary [YatraSetu]`)
    setCommMessage(summary)
    setCommModalOpen(true)
  }

  // Generate map markers from activities
  const mapMarkers: MapMarkerItem[] = currentPlan
    ? currentPlan.days.flatMap((d: any, dayIdx: number) =>
        d.activities.map((act: any, actIdx: number) => ({
          id: act.id,
          title: `Day ${d.dayNumber}: ${act.title}`,
          lat: 26.9124 + dayIdx * 0.015 + actIdx * 0.008,
          lng: 75.7873 + dayIdx * 0.012 + actIdx * 0.006,
          type: act.type === 'Hidden Gem' ? 'attraction' : 'attraction',
          subtitle: `${act.time} • ${act.duration} • ₹${act.estimatedCost}`,
          badge: act.type,
          price: `₹${act.estimatedCost}`,
        }))
      )
    : []

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-[#0F6E5C] via-[#0A4E42] to-[#141B18] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-700 tracking-wide backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B931]" />
            <span>AI-Powered Personalized Travel Engine (Module 1)</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-800 tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Plan Smarter. Explore Deeper. Travel Better.
          </h1>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            Generate 2–3 multi-tier itineraries optimized for verified community homestays, hidden stepwells, crowd-aware timings, and fair local economy distribution.
          </p>
        </div>
      </div>

      {/* Input Configuration Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-4">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-[#0F6E5C]" />
            <h2 className="text-lg font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              Travel Preferences & Trip Inputs
            </h2>
          </div>
          <span className="text-xs text-[#7B8582] font-600">Step 1 of 2</span>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Destination */}
          <div>
            <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
              Destination City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Jaipur, Varanasi, Manali"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]/40 bg-[#F7F6F2]"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
              Trip Duration: <span className="text-[#0F6E5C] font-800">{duration} Days</span>
            </label>
            <input
              type="range"
              min={1}
              max={7}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-[#E4F3EF] rounded-lg appearance-none cursor-pointer accent-[#0F6E5C] mt-2.5"
            />
            <div className="flex justify-between text-[10px] text-[#7B8582] mt-1">
              <span>1 Day</span>
              <span>3 Days</span>
              <span>7 Days</span>
            </div>
          </div>

          {/* Total Budget */}
          <div>
            <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
              Total Budget (₹)
            </label>
            <div className="relative">
              <span className="text-sm font-700 text-[#7B8582] absolute left-3.5 top-2.5">₹</span>
              <input
                type="number"
                value={budget}
                step={1000}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]/40 bg-[#F7F6F2]"
              />
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
              Number of People
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
              <input
                type="number"
                min={1}
                max={12}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]/40 bg-[#F7F6F2]"
              />
            </div>
          </div>
        </div>

        {/* Interests Multi-Select */}
        <div>
          <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-2">
            Interests & Exploration Focus
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests.map((item) => {
              const selected = interests.includes(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-700 flex items-center gap-1.5 transition-all cursor-pointer ${
                    selected
                      ? 'bg-[#0F6E5C] text-white shadow-xs scale-102'
                      : 'bg-[#F7F6F2] border border-[#E4E7E5] text-[#505D58] hover:bg-[#E4F3EF]'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Secondary Preferences & Accessibility */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E4E7E5]">
          <div>
            <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
              Stay Preference
            </label>
            <select
              value={stayPref}
              onChange={(e) => setStayPref(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D0D7D4] text-xs font-600 bg-[#F7F6F2]"
            >
              <option value="Heritage Homestay">Verified Heritage Homestay</option>
              <option value="Budget Homestay">Budget Backpacker Homestay</option>
              <option value="Eco Resort">Eco-Certified Green Stay</option>
              <option value="Boutique Haveli">Luxury Boutique Haveli</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
              Transit Mode
            </label>
            <select
              value={transportPref}
              onChange={(e) => setTransportPref(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D0D7D4] text-xs font-600 bg-[#F7F6F2]"
            >
              <option value="Local Taxi / Auto">Prepaid Taxi & Local Auto</option>
              <option value="E-Rickshaw / Metro">Green E-Rickshaw & Metro</option>
              <option value="Private Chauffeur">Private AC Chauffeur</option>
              <option value="Walking & Cycling">Walking & Bicycle Tours</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F6F2] border border-[#E4E7E5] mt-1">
            <div>
              <p className="text-xs font-700 text-[#141B18]">Accessibility Routing</p>
              <p className="text-[11px] text-[#7B8582]">Step-free, wheelchair & senior friendly</p>
            </div>
            <button
              onClick={() => setAccessibility(!accessibility)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                accessibility ? 'bg-[#0F6E5C]' : 'bg-[#D0D7D4]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  accessibility ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Generate CTA */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0F6E5C] to-[#0A4E42] text-white font-700 text-sm hover:shadow-lg flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>YatraSetu AI is Generating 3 Optimized Plans...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E8B931]" />
                <span>Generate Optimized AI Itineraries</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Plans Section */}
      {generatedResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Tier Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#E4E7E5] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-700 text-[#7B8582] uppercase tracking-wider px-3">
                Select Itinerary Tier:
              </span>
              <div className="flex items-center gap-1.5">
                {(['Budget', 'Balanced', 'Premium'] as const).map((tier) => {
                  const plan = generatedResult.plans.find((p: any) => p.tier === tier)
                  const isSelected = selectedTier === tier
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-4 py-2 rounded-xl text-xs font-700 transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F6E5C] text-white shadow-xs'
                          : 'bg-[#F7F6F2] text-[#505D58] hover:bg-[#E4F3EF]'
                      }`}
                    >
                      <span>{tier === 'Budget' ? '🌱' : tier === 'Balanced' ? '⚖️' : '👑'}</span>
                      <span>{plan?.title || tier}</span>
                      <span className="text-[11px] opacity-80">
                        (₹{plan?.totalEstimatedCost.toLocaleString()})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openComm('whatsapp')}
                className="px-3 py-1.5 rounded-xl bg-[#25D366]/10 text-[#0F6E5C] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white text-xs font-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Send Itinerary to WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <button
                onClick={() => openComm('email')}
                className="px-3 py-1.5 rounded-xl bg-[#EA4335]/10 text-[#C5221F] border border-[#EA4335]/30 hover:bg-[#EA4335] hover:text-white text-xs font-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Compose Itinerary in Gmail"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gmail</span>
              </button>

              <button
                onClick={() => openComm('sms')}
                className="px-3 py-1.5 rounded-xl bg-[#0F6E5C]/10 text-[#0F6E5C] border border-[#0F6E5C]/30 hover:bg-[#0F6E5C] hover:text-white text-xs font-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Send SMS summary"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SMS</span>
              </button>

              <button
                onClick={handleSaveItinerary}
                className="px-3.5 py-1.5 rounded-xl bg-[#0F6E5C] text-white hover:bg-[#0A4E42] text-xs font-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Saved!' : 'Save Plan'}</span>
              </button>
            </div>
          </div>

          {/* Plan Summary Bar */}
          {currentPlan && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                <p className="text-xs text-[#7B8582] font-700 uppercase">Estimated Trip Cost</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-800 text-[#0F6E5C]" style={{ fontFamily: 'Fraunces, serif' }}>
                    ₹{currentPlan.totalEstimatedCost.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#505D58]">
                    (₹{Math.round(currentPlan.totalEstimatedCost / duration).toLocaleString()}/day)
                  </span>
                </div>
                <p className="text-[11px] text-[#1E9E5A] font-600 mt-1">
                  ✓ ₹{currentPlan.budgetRemaining.toLocaleString()} remaining from user budget
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                <p className="text-xs text-[#7B8582] font-700 uppercase">Sustainability Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-800 text-[#1E9E5A]" style={{ fontFamily: 'Fraunces, serif' }}>
                    {currentPlan.sustainabilityScore}/100
                  </span>
                  <Leaf className="w-5 h-5 text-[#1E9E5A]" />
                </div>
                <p className="text-[11px] text-[#505D58] mt-1">
                  {currentPlan.carbonFootprintTotalKg} kg CO₂ total estimated transit
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                <p className="text-xs text-[#7B8582] font-700 uppercase">Best Visiting Hours</p>
                <p className="text-sm font-700 text-[#141B18] mt-1">
                  06:30 AM – 09:30 AM & 04:30 PM – 07:00 PM
                </p>
                <p className="text-[11px] text-[#D89A1C] font-600 mt-1">
                  ⚠️ Avoid 12:00 PM – 03:00 PM peak rush
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                <p className="text-xs text-[#7B8582] font-700 uppercase">Weather Advisory</p>
                <p className="text-sm font-700 text-[#141B18] mt-1">
                  {currentPlan.weatherForecast}
                </p>
                <p className="text-[11px] text-[#0F6E5C] font-600 mt-1">
                  ✓ Ideal for outdoor haveli & heritage walks
                </p>
              </div>
            </div>
          )}

          {/* Explainable AI Banner */}
          {currentPlan?.explainability && (
            <div className="p-4 rounded-2xl bg-[#E4F3EF] border border-[#0F6E5C]/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#0F6E5C] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-700 text-[#0F6E5C] uppercase tracking-wide">
                  Explainable AI Recommendation Reason
                </p>
                <p className="text-xs text-[#141B18] mt-0.5 leading-relaxed">
                  {currentPlan.explainability}
                </p>
              </div>
            </div>
          )}

          {/* Main Content Split: Timeline on Left, Map & Dynamic Modifier on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Timeline (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {currentPlan?.days?.map((day: any) => (
                <div
                  key={day.dayNumber}
                  className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4"
                >
                  {/* Day Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E7E5] pb-3">
                    <div>
                      <span className="text-xs font-800 px-2.5 py-1 rounded-full bg-[#E4F3EF] text-[#0F6E5C]">
                        {day.date}
                      </span>
                      <h3 className="font-700 text-base text-[#141B18] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                        {day.theme}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#7B8582]">Est. Daily Budget</span>
                      <p className="text-sm font-800 text-[#0F6E5C]">₹{day.dailyBudget.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4F3EF]">
                    {day.activities.map((act: any) => (
                      <div key={act.id} className="relative pl-8 space-y-1">
                        <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#0F6E5C] border-2 border-white shadow-xs" />
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-700 text-[#0F6E5C]">{act.time}</span>
                            <span className="text-[10px] uppercase font-700 px-2 py-0.5 rounded-full bg-[#F7F6F2] text-[#505D58] border border-[#E4E7E5]">
                              {act.type}
                            </span>
                            {act.crowdLevel && (
                              <span
                                className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${
                                  act.crowdLevel === 'High'
                                    ? 'bg-[#FDE8E8] text-[#D64545]'
                                    : act.crowdLevel === 'Moderate'
                                    ? 'bg-[#FEF3C7] text-[#D89A1C]'
                                    : 'bg-[#E4F7EC] text-[#1E9E5A]'
                                }`}
                              >
                                {act.crowdLevel} Crowd
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-800 text-[#141B18]">₹{act.estimatedCost}</span>
                        </div>

                        <h4 className="text-sm font-700 text-[#141B18]">{act.title}</h4>
                        <p className="text-xs text-[#505D58] leading-relaxed">{act.description}</p>

                        {act.tips && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#0F6E5C] bg-[#E4F3EF]/60 px-2.5 py-1 rounded-lg">
                            <Info className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{act.tips}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-[#7B8582] pt-0.5">
                          <span>⏱️ {act.duration}</span>
                          <span>🚗 {act.recommendedTransport || 'Taxi / Auto'}</span>
                          {act.travelDistance && <span>📍 {act.travelDistance} ({act.travelTime})</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Day Footer: Stay & Food */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E4E7E5] text-xs">
                    <div className="p-3 rounded-xl bg-[#F7F6F2] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#0F6E5C] font-700">
                        <Home className="w-3.5 h-3.5" />
                        <span>Recommended Stay</span>
                      </div>
                      <p className="font-600 text-[#141B18]">{day.stayRecommendation.name}</p>
                      <p className="text-[11px] text-[#7B8582]">₹{day.stayRecommendation.costPerNight}/night • {day.stayRecommendation.type}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7F6F2] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#0F6E5C] font-700">
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Must-Try Local Foods</span>
                      </div>
                      <p className="font-600 text-[#141B18]">{day.foodRecommendations.join(', ')}</p>
                      <p className="text-[11px] text-[#7B8582]">Generational recipes • 100% authentic</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Dynamic Natural Language Re-planner & Interactive Map (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Dynamic Natural Language Re-planner */}
              <div className="bg-gradient-to-br from-[#141B18] to-[#1C2427] text-white p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#E8B931]" />
                  <h3 className="font-700 text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                    Dynamic AI Plan Modifier
                  </h3>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Modify the generated itinerary with natural language commands. The AI dynamically recalculates affected timings, route transit, and budget while maintaining plan consistency.
                </p>

                {/* Quick Modification Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Remove museum',
                    'Add adventure activities',
                    'Reduce total budget',
                    'Add more local food',
                    'Make wheelchair accessible',
                    'Add sunset ridge trek',
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleModify(chip)}
                      disabled={modifying}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-[11px] font-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                {/* Custom Prompt Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={modifyPrompt}
                    onChange={(e) => setModifyPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleModify()}
                    placeholder="e.g. 'Replace expensive stays with village havelis'"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]"
                  />
                  <button
                    onClick={() => handleModify()}
                    disabled={modifying || !modifyPrompt}
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg bg-[#0F6E5C] text-white text-xs font-700 hover:bg-[#0A4E42] transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {modifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Update</span>
                  </button>
                </div>
              </div>

              {/* Interactive Map of Itinerary Route */}
              <InteractiveMap
                items={mapMarkers}
                height="420px"
                title={`${destination} Itinerary Map & Stops`}
                showFilters={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Multi-Channel Communication Modal */}
      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        defaultChannel={commChannel}
        defaultSubject={commSubject}
        defaultMessage={commMessage}
        contextTitle="Export Itinerary via Communication Gateway"
      />
    </div>
  )
}
