import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { useApp } from '../../context/AppContext'
import InteractiveMap, { MapMarkerItem } from '../../components/InteractiveMap'
import CommunicationModal from '../../components/CommunicationModal'
import {
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  CheckCircle,
  Users,
  Send,
  Radio,
  Flame,
  Hospital,
  Compass,
  MessageSquare,
  Mail,
  Smartphone,
  Info,
} from 'lucide-react'

export default function Emergency() {
  const { activeLocation, currentUser, showToast } = useApp()

  // State
  const [alerts, setAlerts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Safe Check-In State
  const [checkInName, setCheckInName] = useState(currentUser?.name || 'Aarav Sharma')
  const [checkInContact, setCheckInContact] = useState(currentUser?.phone || '+91 98765 12345')
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 00000')
  const [checkInStatus, setCheckInStatus] = useState<'SAFE' | 'NEEDS_ASSISTANCE'>('SAFE')
  const [checkInNote, setCheckInNote] = useState('All safe at hotel haveli.')
  const [checkInSuccess, setCheckInSuccess] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)

  // SOS Modal State
  const [sosModalOpen, setSosModalOpen] = useState(false)
  const [sosSent, setSosSent] = useState(false)
  const [sosLoading, setSosLoading] = useState(false)

  // Multi-Channel Dispatch Modal
  const [commModalOpen, setCommModalOpen] = useState(false)
  const [commChannel, setCommChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [commSubject, setCommSubject] = useState('')
  const [commMessage, setCommMessage] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [alertsData, servicesData, checkInsData] = await Promise.all([
        api.emergency.getAlerts(activeLocation.city),
        api.emergency.getServices(activeLocation.city),
        api.emergency.getCheckIns(activeLocation.city),
      ])
      setAlerts(alertsData)
      setServices(servicesData)
      setCheckIns(checkInsData)
    } catch (err: any) {
      console.error('Failed to load emergency data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeLocation])

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckInLoading(true)
    try {
      await api.emergency.checkIn({
        userId: currentUser?.id,
        userName: checkInName,
        userPhone: checkInContact,
        location: activeLocation.displayName,
        status: checkInStatus,
        emergencyContact,
        note: checkInNote,
        dispatchAlerts: true,
      })
      setCheckInSuccess(true)
      showToast('Safety check-in recorded & notifications dispatched to emergency contacts.', 'success')
      fetchData()
      setTimeout(() => setCheckInSuccess(false), 4000)
    } catch (err: any) {
      alert(err.message || 'Failed to record check-in.')
    } finally {
      setCheckInLoading(false)
    }
  }

  const handleTriggerSos = async () => {
    setSosLoading(true)
    try {
      await api.emergency.triggerSos({
        userName: checkInName,
        userPhone: checkInContact,
        location: activeLocation.displayName,
        gpsCoordinates: '26.9124° N, 75.7873° E',
        emergencyContact,
      })
      setSosSent(true)
      showToast('🚨 SOS Broadcast dispatched to Tourist Police Command!', 'success')
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast SOS alert.')
    } finally {
      setSosLoading(false)
    }
  }

  const openQuickContact = (channel: 'whatsapp' | 'email' | 'sms', targetPhone: string) => {
    const text = `🚨 *URGENT TRAVELER INQUIRY / ASSISTANCE REQUIRED*\n\nTourist: ${checkInName}\nLocation: ${activeLocation.displayName}\nGPS: 26.9124, 75.7873\nContact: ${checkInContact}\n\nPlease provide assistance or guidance.`
    setCommChannel(channel)
    setCommSubject('URGENT: Tourist Assistance Request [YatraSetu]')
    setCommMessage(text)
    setCommModalOpen(true)
  }

  // Safety Map Markers
  const safetyMarkers: MapMarkerItem[] = [
    {
      id: 'em-1',
      title: 'Jaipur North Tourist Police Station',
      lat: 26.9265,
      lng: 75.8211,
      type: 'emergency',
      subtitle: '24/7 Tourist Assistance Kiosk • 112',
      badge: 'Police Safe Zone',
    },
    {
      id: 'em-2',
      title: 'SMS Government Hospital (Emergency Trauma Center)',
      lat: 26.9015,
      lng: 75.8155,
      type: 'emergency',
      subtitle: 'Ambulance 108 • 24/7 ICU & Trauma',
      badge: 'Hospital',
    },
    {
      id: 'em-3',
      title: 'Chandpole Fire Station Command',
      lat: 26.9241,
      lng: 75.8085,
      type: 'emergency',
      subtitle: 'Emergency Fire & Rescue • 101',
      badge: 'Fire Department',
    },
    {
      id: 'em-4',
      title: 'Amber Fort Tourist Help Desk',
      lat: 26.9855,
      lng: 75.8513,
      type: 'emergency',
      subtitle: 'Multilingual assistance & lost item recovery',
      badge: 'Help Desk',
    },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#D64545] via-[#B91C1C] to-[#141B18] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-700 backdrop-blur-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#FEF08A]" />
            <span>24/7 Tourist Safety & Disaster Response Network (Module 6)</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-800 tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Emergency Assistance & Safe Corridor Network
          </h1>
          <p className="text-sm text-white/90 leading-relaxed">
            Instant SOS broadcasting, one-tap safe check-ins for family and authorities, verified tourist police stations, and real-time civic disaster advisories in {activeLocation.displayName}.
          </p>
        </div>

        {/* SOS Button */}
        <button
          onClick={() => {
            setSosSent(false)
            setSosModalOpen(true)
          }}
          className="px-6 py-4 rounded-2xl bg-white text-[#D64545] hover:bg-[#FEE2E2] font-900 text-sm md:text-base tracking-wider uppercase flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-white/50"
        >
          <span className="text-xl">🚨</span>
          <span>Trigger Emergency SOS</span>
        </button>
      </div>

      {/* National Emergency Helplines Fast Access Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'National Helpline', num: '112', icon: '🚨', desc: 'Police / Fire / Medical' },
          { label: 'Tourist Helpline', num: '1363', icon: '🏛️', desc: 'Ministry of Tourism (Toll-Free)' },
          { label: 'Medical Ambulance', num: '108', icon: '🏥', desc: '24/7 Emergency Ambulance' },
          { label: 'Women Safety', num: '1090', icon: '🛡️', desc: '24/7 Pink Corridor Helpline' },
          { label: 'Disaster Relief (NDMA)', num: '1070', icon: '🌊', desc: 'Flood / Landslide Support' },
        ].map((item) => (
          <a
            key={item.label}
            href={`tel:${item.num}`}
            className="p-3.5 rounded-2xl bg-white border border-[#E4E7E5] shadow-xs hover:border-[#D64545]/40 hover:shadow-sm transition-all flex items-center justify-between gap-2 group cursor-pointer"
          >
            <div>
              <p className="text-[10px] text-[#7B8582] font-700 uppercase">{item.label}</p>
              <p className="text-lg font-900 text-[#D64545] group-hover:underline">{item.num}</p>
              <p className="text-[10px] text-[#505D58]">{item.desc}</p>
            </div>
            <span className="text-xl">{item.icon}</span>
          </a>
        ))}
      </div>

      {/* Main Grid: Safe Check-In + Alerts & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tourist Safe Check-In Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E4E7E5] pb-3">
              <CheckCircle className="w-5 h-5 text-[#0F6E5C]" />
              <h2 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                One-Tap Tourist Safe Check-In
              </h2>
            </div>
            <p className="text-xs text-[#505D58] leading-relaxed">
              Check in to confirm your safety. Your status is logged to the local authority disaster dashboard and automated SMS/WhatsApp alerts are dispatched to your emergency contacts.
            </p>

            <form onSubmit={handleCheckIn} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={checkInName}
                  onChange={(e) => setCheckInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Your Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={checkInContact}
                    onChange={(e) => setCheckInContact(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2]"
                  />
                </div>

                <div>
                  <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Safety Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckInStatus('SAFE')}
                    className={`py-2 px-3 rounded-xl font-700 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      checkInStatus === 'SAFE'
                        ? 'bg-[#1E9E5A] text-white shadow-xs'
                        : 'bg-[#F7F6F2] text-[#505D58] border border-[#E4E7E5]'
                    }`}
                  >
                    <span>🟢 I Am Safe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckInStatus('NEEDS_ASSISTANCE')}
                    className={`py-2 px-3 rounded-xl font-700 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      checkInStatus === 'NEEDS_ASSISTANCE'
                        ? 'bg-[#D89A1C] text-white shadow-xs'
                        : 'bg-[#F7F6F2] text-[#505D58] border border-[#E4E7E5]'
                    }`}
                  >
                    <span>🟡 Need Assistance</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Status Note / Exact Location Details
                </label>
                <textarea
                  rows={2}
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  placeholder="e.g. Staying at Rajwada Haveli Old City. Safe with family."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2]"
                />
              </div>

              {checkInSuccess && (
                <div className="p-3 rounded-xl bg-[#E4F7EC] text-[#0F5A31] font-700 flex items-center gap-2 text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>Check-In successfully published to Disaster Dashboard & SMS dispatched.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={checkInLoading}
                className="w-full py-3 rounded-xl bg-[#0F6E5C] text-white font-700 text-xs hover:bg-[#0A4E42] transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{checkInLoading ? 'Broadcasting...' : 'Record Safe Check-In & Alert Family'}</span>
              </button>
            </form>
          </div>

          {/* Recent Tourist Safe Check-Ins Community Feed */}
          <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-3">
            <h3 className="font-700 text-sm text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              Recent Check-Ins in {activeLocation.city} ({checkIns.length})
            </h3>
            {checkIns.length === 0 ? (
              <p className="text-xs text-[#7B8582]">No active emergency check-ins currently.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {checkIns.map((ci) => (
                  <div key={ci.id} className="p-2.5 rounded-xl bg-[#F7F6F2] text-xs flex items-center justify-between">
                    <div>
                      <p className="font-700 text-[#141B18]">{ci.userName}</p>
                      <p className="text-[11px] text-[#7B8582]">{ci.note || 'Safe check-in'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E4F7EC] text-[#0F5A31] font-800 text-[10px]">
                      {ci.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Advisories & Interactive Safe Zone Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Alerts */}
          <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D64545]" />
                <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Active Disaster & Traffic Advisories — {activeLocation.city}
                </h3>
              </div>
              <span className="text-[10px] font-700 px-2 py-0.5 rounded-full bg-[#FDE8E8] text-[#9B1C1C]">
                Live Satellite Stream
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#E4F7EC] text-[#0F5A31] text-xs font-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No severe weather, landslide, or civil disruption alerts in {activeLocation.displayName}. Safe travel conditions.</span>
                </div>
              ) : (
                alerts.map((al) => (
                  <div
                    key={al.id}
                    className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      al.severity === 'high'
                        ? 'bg-[#FDE8E8] border-[#D64545]/30 text-[#9B1C1C]'
                        : 'bg-[#FEF3C7] border-[#D89A1C]/30 text-[#92400E]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl flex-shrink-0">{al.icon || '⚠️'}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-700 text-sm uppercase">{al.type}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 font-800">
                            {al.time}
                          </span>
                        </div>
                        <p className="leading-relaxed">{al.message}</p>
                        <p className="text-[11px] opacity-80">📍 {al.location}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interactive Safe Zones & Emergency Stations Map */}
          <InteractiveMap
            items={safetyMarkers}
            height="380px"
            title="Safe Zones, Police Stations & Medical Centers Map"
            showFilters={true}
          />
        </div>
      </div>

      {/* SOS Emergency Broadcast Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#D64545]/30 overflow-hidden text-center p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#FDE8E8] text-[#D64545] flex items-center justify-center text-3xl mx-auto border-4 border-[#FEE2E2] animate-bounce">
              🚨
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-800 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                Emergency SOS Broadcast
              </h3>
              <p className="text-xs text-[#505D58]">
                Broadcasting will transmit your precise GPS coordinates (26.9124° N, 75.7873° E) to Jaipur Municipal Tourist Police & emergency contacts via SMS, WhatsApp & Email.
              </p>
            </div>

            {sosSent ? (
              <div className="p-4 rounded-2xl bg-[#E4F7EC] border border-[#1E9E5A]/30 text-left space-y-2 text-xs text-[#0F5A31]">
                <div className="flex items-center gap-2 font-800 text-sm">
                  <CheckCircle className="w-5 h-5 text-[#1E9E5A]" />
                  <span>SOS Broadcast Dispatched Successfully!</span>
                </div>
                <p>✓ Tourist Police Booth #4 alerted</p>
                <p>✓ Emergency SMS sent to {emergencyContact}</p>
                <p>✓ High-priority incident created on Authority Command Center</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#F7F6F2] text-xs text-left space-y-1 text-[#505D58]">
                <p><strong>Tourist:</strong> {checkInName} ({checkInContact})</p>
                <p><strong>Current Sector:</strong> {activeLocation.displayName}</p>
                <p><strong>Nearest Police Booth:</strong> Jaipur North Station (0.8 km)</p>
              </div>
            )}

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setSosModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-700 text-[#505D58] hover:bg-[#F7F6F2] cursor-pointer"
              >
                {sosSent ? 'Close' : 'Cancel'}
              </button>

              {!sosSent && (
                <button
                  onClick={handleTriggerSos}
                  disabled={sosLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#D64545] text-white font-800 text-xs hover:bg-[#B91C1C] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Radio className="w-4 h-4 animate-spin" />
                  <span>{sosLoading ? 'Broadcasting...' : 'Confirm & Broadcast SOS Now'}</span>
                </button>
              )}
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
        contextTitle="Emergency Communication Dispatch"
      />
    </div>
  )
}
