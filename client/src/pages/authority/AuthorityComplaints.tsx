import { useState } from 'react'

const problems = [
  {
    id: '1', rank: 1, medal: '🥇',
    name: 'Overflowing Garbage near Sadar Bazar',
    location: 'Sadar Bazar, Jaipur',
    votes: 248, impact: 'High',
    description: 'Multiple overflowing bins near the main market. Civic workers have not collected in 3 days. Health hazard for 500+ shopkeepers and daily tourists.',
    evidence: ['Photographic proof from 3 different spots', 'Video of overflowing bins blocking street'],
    comments: [
      'It has been overflowing for 3 days now. Shopkeepers are losing business.',
      'Health hazard — flies and mosquitoes everywhere.',
    ],
    solutions: [
      'Increase garbage collection to twice daily',
      'Install compactor bins at key locations',
      'Assign dedicated municipal staff to this zone',
    ],
    currentStatus: 'Open' as const,
    authorityNote: '',
  },
  {
    id: '2', rank: 2, medal: '🥈',
    name: 'Dirty Public Toilets at Chowk Market',
    location: 'Chowk Market, Jaipur',
    votes: 186, impact: 'High',
    description: 'Public toilets at Chowk Market have not been cleaned for a week. Water supply is absent. Tourists are extremely inconvenienced.',
    evidence: ['Photos from 5 users', '3 Google Reviews flagging the issue'],
    comments: [
      'Unusable condition since last week.',
      'Tourists are facing major issues — this is an embarrassment.',
    ],
    solutions: [
      'Contract professional cleaning agency',
      'Install sensor-activated flush systems',
      'Appoint a full-time sanitation attendant',
    ],
    currentStatus: 'In Progress' as const,
    authorityNote: 'Cleaning team deployed on 24th. Follow-up inspection scheduled.',
  },
  {
    id: '3', rank: 3, medal: '🥉',
    name: 'Plastic Waste at Lake Shore',
    location: 'Man Sagar Lake, Jaipur',
    votes: 121, impact: 'Medium',
    description: 'Excessive plastic waste accumulating along the Man Sagar Lake shore affecting water quality and birdlife.',
    evidence: ['Drone footage shared by community'],
    comments: ['Affecting water quality and local birds', 'Lake is a major tourist attraction — urgent action needed'],
    solutions: ['Organise community clean-up drives', 'Ban single-use plastics in 500m radius'],
    currentStatus: 'Resolved' as const,
    authorityNote: 'Community clean-up drive completed on 22 Aug. Plastic ban notification issued.',
  },
]

const statusOptions = ['Open', 'In Progress', 'Resolved'] as const
type Status = (typeof statusOptions)[number]

const statusColor: Record<Status, string> = { Open: '#D64545', 'In Progress': '#D89A1C', Resolved: '#1E9E5A' }
const statusBg: Record<Status, string> = { Open: '#D6454518', 'In Progress': '#D89A1C18', Resolved: '#1E9E5A18' }
const impactColor = { High: '#D64545', Medium: '#D89A1C', Low: '#1E9E5A' }

const card = 'rounded-2xl bg-[#1C2427] border border-white/10'

export default function AuthorityComplaints() {
  const [selectedId, setSelectedId] = useState<string | null>(problems[0].id)
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(problems.map((p) => [p.id, p.currentStatus]))
  )
  const [responses, setResponses] = useState<Record<string, string>>(
    Object.fromEntries(problems.map((p) => [p.id, p.authorityNote]))
  )
  const [responseInput, setResponseInput] = useState('')

  const selected = problems.find((p) => p.id === selectedId)
  const filtered = problems.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  )

  function sendResponse() {
    if (!selectedId || !responseInput.trim()) return
    setResponses((prev) => ({ ...prev, [selectedId]: responseInput.trim() }))
    setResponseInput('')
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 h-[calc(100vh-130px)]">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <h2 className="text-2xl font-700" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
            Complaints Management
          </h2>
        </div>
        <p style={{ color: '#ffffff40', fontSize: '14px', marginTop: '2px' }}>
          Community-reported issues ranked by votes, impact, and evidence.
        </p>
      </div>

      <div className="flex gap-5 h-[calc(100%-70px)]">
        {/* Left — Problem List (1/3) */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 min-h-0">
          {/* Search */}
          <div className="relative flex-shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#ffffff30' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full h-10 pl-9 pr-3 rounded-xl text-sm focus:outline-none"
              style={{ background: '#1C2427', border: '1px solid #ffffff20', color: '#EDEFEE' }}
            />
          </div>

          {/* Problem list */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full text-left p-3.5 rounded-xl transition-all duration-150 border`}
                style={{
                  background: selectedId === p.id ? '#0F6E5C15' : '#1C2427',
                  borderColor: selectedId === p.id ? '#0F6E5C60' : '#ffffff10',
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl flex-shrink-0 mt-0.5">{p.medal}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-600 leading-snug mb-1" style={{ color: '#EDEFEE' }}>
                      {p.name}
                    </p>
                    <p className="text-xs mb-1.5" style={{ color: '#ffffff40' }}>📍 {p.location}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-600" style={{ color: '#0F6E5C' }}>👍 {p.votes}</span>
                      <span
                        className="text-xs font-600 px-1.5 py-0.5 rounded"
                        style={{
                          background: impactColor[p.impact as keyof typeof impactColor] + '20',
                          color: impactColor[p.impact as keyof typeof impactColor],
                        }}
                      >
                        {p.impact}
                      </span>
                      <span
                        className="text-xs font-600 px-1.5 py-0.5 rounded"
                        style={{
                          background: statusBg[statuses[p.id]],
                          color: statusColor[statuses[p.id]],
                        }}
                      >
                        {statuses[p.id]}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right — Detail (2/3) */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          {selected ? (
            <div className="space-y-4">
              {/* Problem header */}
              <div className={`${card} p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-700 mb-1" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
                      {selected.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span style={{ color: '#ffffff40' }}>📍 {selected.location}</span>
                      <span className="font-700" style={{ color: '#0F6E5C' }}>#{selected.rank} Ranked</span>
                      <span className="font-700" style={{ color: '#0F6E5C' }}>👍 {selected.votes} votes</span>
                      <span
                        className="text-xs font-600 px-2.5 py-1 rounded-full"
                        style={{
                          background: impactColor[selected.impact as keyof typeof impactColor] + '20',
                          color: impactColor[selected.impact as keyof typeof impactColor],
                        }}
                      >
                        {selected.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: '#EDEFEE', opacity: 0.8 }}>
                  {selected.description}
                </p>
              </div>

              {/* Evidence */}
              <div className={`${card} p-4`}>
                <p className="text-xs font-700 uppercase tracking-wide mb-2.5" style={{ color: '#ffffff40' }}>
                  📷 Geo-tagged Evidence
                </p>
                <div className="space-y-1.5">
                  {selected.evidence.map((e, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span style={{ color: '#0F6E5C' }}>→</span>
                      <span className="text-sm" style={{ color: '#EDEFEE', opacity: 0.7 }}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments & Solutions */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`${card} p-4`}>
                  <p className="text-xs font-700 uppercase tracking-wide mb-2.5" style={{ color: '#ffffff40' }}>
                    💬 Community Comments
                  </p>
                  {selected.comments.map((c, i) => (
                    <p key={i} className="text-sm mb-2 leading-relaxed" style={{ color: '#EDEFEE', opacity: 0.7 }}>
                      "{c}"
                    </p>
                  ))}
                </div>
                <div className={`${card} p-4`}>
                  <p className="text-xs font-700 uppercase tracking-wide mb-2.5" style={{ color: '#ffffff40' }}>
                    💡 Proposed Solutions
                  </p>
                  {selected.solutions.map((s, i) => (
                    <p key={i} className="text-sm mb-1.5 flex gap-1.5" style={{ color: '#EDEFEE', opacity: 0.7 }}>
                      <span style={{ color: '#0F6E5C' }}>→</span>
                      {s}
                    </p>
                  ))}
                </div>
              </div>

              {/* Authority Response */}
              <div className={`${card} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🏛️</span>
                  <h4 className="font-700 text-base" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
                    Authority Response
                  </h4>
                </div>

                {/* Existing response */}
                {responses[selected.id] && (
                  <div
                    className="rounded-xl p-3.5 mb-4 text-sm leading-relaxed"
                    style={{ background: '#0F6E5C15', border: '1px solid #0F6E5C30', color: '#EDEFEE', opacity: 0.9 }}
                  >
                    {responses[selected.id]}
                  </div>
                )}

                {/* Compose response */}
                <textarea
                  value={responseInput}
                  onChange={(e) => setResponseInput(e.target.value)}
                  placeholder="Write your official response or action taken..."
                  className="w-full h-24 px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none mb-3"
                  style={{
                    background: '#12181A',
                    border: '1px solid #ffffff15',
                    color: '#EDEFEE',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0F6E5C')}
                  onBlur={(e) => (e.target.style.borderColor = '#ffffff15')}
                />

                <div className="flex items-center gap-3">
                  <button
                    onClick={sendResponse}
                    className="h-10 px-5 rounded-xl text-white text-sm font-600 transition-colors flex-shrink-0"
                    style={{ background: '#0F6E5C' }}
                  >
                    📤 Send Reply
                  </button>

                  {/* Status control */}
                  <div className="flex gap-2 flex-1">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatuses((prev) => ({ ...prev, [selected.id]: s }))}
                        className="flex-1 h-10 rounded-xl text-xs font-600 transition-all border"
                        style={{
                          background: statuses[selected.id] === s ? statusBg[s] : 'transparent',
                          color: statuses[selected.id] === s ? statusColor[s] : '#ffffff40',
                          borderColor: statuses[selected.id] === s ? statusColor[s] + '60' : '#ffffff15',
                        }}
                      >
                        {s === 'Open' ? '🔴' : s === 'In Progress' ? '🟡' : '🟢'} {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`${card} flex items-center justify-center h-40`}
              style={{ color: '#ffffff30', fontSize: '14px' }}
            >
              Select a complaint to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
