import { useState } from 'react'

const problems = [
  {
    id: '1',
    rank: 1,
    medal: '🥇',
    name: 'Overflowing Garbage near Sadar Bazar',
    location: 'Sadar Bazar, Jaipur',
    votes: 248,
    impact: 'High',
    evidence: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&h=150&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop&auto=format',
    ],
    comments: ['It has been overflowing for 3 days now', 'Health hazard for nearby shopkeepers'],
    userSolutions: ['Increase garbage collection frequency', 'Install compactor units'],
    authorityResponse: 'Acknowledged. Municipal team scheduled for Thursday.',
  },
  {
    id: '2',
    rank: 2,
    medal: '🥈',
    name: 'Dirty Public Toilets at Chowk Market',
    location: 'Chowk Market, Jaipur',
    votes: 186,
    impact: 'High',
    evidence: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=200&h=150&fit=crop&auto=format'],
    comments: ['Unusable condition since last week', 'Tourists are facing major issues'],
    userSolutions: ['Contract professional cleaning agency', 'Install sensor-activated flush systems'],
    authorityResponse: null,
  },
  {
    id: '3',
    rank: 3,
    medal: '🥉',
    name: 'Plastic Waste at Lake Shore',
    location: 'Man Sagar Lake, Jaipur',
    votes: 121,
    impact: 'Medium',
    evidence: [],
    comments: ['Affecting water quality and local birds'],
    userSolutions: ['Organise community clean-up drives', 'Ban single-use plastics in 500m radius'],
    authorityResponse: 'Clean-up drive scheduled for next Sunday.',
  },
  {
    id: '4',
    rank: 4,
    medal: '4',
    name: 'Water Pollution in Canal Area',
    location: 'Amanishah Nala, Jaipur',
    votes: 96,
    impact: 'High',
    evidence: [],
    comments: ['Industrial waste being dumped illegally'],
    userSolutions: ['CCTV monitoring', 'Sewage treatment plant upgrade'],
    authorityResponse: null,
  },
  {
    id: '5',
    rank: 5,
    medal: '5',
    name: 'Open Defecation at Tourist Spot',
    location: 'Nahargarh Road, Jaipur',
    votes: 78,
    impact: 'Medium',
    evidence: [],
    comments: ['Especially problematic in early morning hours'],
    userSolutions: ['Install portable toilets', 'Awareness campaign for locals'],
    authorityResponse: null,
  },
]

const impactColor = { High: '#D64545', Medium: '#D89A1C', Low: '#1E9E5A' }
const impactBg = { High: '#FBE6E6', Medium: '#FBF1DA', Low: '#E4F7EC' }

export default function Cleanliness() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<(typeof problems)[0] | null>(problems[0])
  const [solutionText, setSolutionText] = useState('')
  const [reportForm, setReportForm] = useState({
    name: '',
    location: '',
    description: '',
    severity: 'Medium',
    solution: '',
  })

  const filtered = problems.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  )

  function handleReport(e: React.FormEvent) {
    e.preventDefault()
    alert('Report submitted successfully! Thank you for keeping your community clean. 🌿')
    setReportForm({ name: '', location: '', description: '', severity: 'Medium', solution: '' })
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 h-[calc(100vh-130px)]">
      <div className="mb-4">
        <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
          Cleanliness
        </h2>
        <p className="text-[#7B8582] text-sm mt-0.5">Community-driven tracking of cleanliness issues across tourist areas.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 h-[calc(100%-80px)]">
        {/* Col 1 — Problem List (2/4) */}
        <div className="col-span-2 flex flex-col gap-3 min-h-0">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🧹</span>
              <h3 className="font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                Top Community Problems
              </h3>
            </div>
            <p className="text-xs text-[#7B8582] mb-2">
              ℹ️ Ranking is global and static — location filter only shows matching problems.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8582] text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problem or location..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] bg-white text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 ${
                  selected?.id === p.id
                    ? 'border-[#0F6E5C] bg-[#E4F3EF]'
                    : 'border-[#E4E7E5] bg-white hover:border-[#0F6E5C]/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {p.medal.length <= 2 ? p.medal : (
                      <span className="w-7 h-7 rounded-full bg-[#F7F6F2] text-[#7B8582] text-xs font-700 flex items-center justify-center inline-flex">
                        {p.rank}
                      </span>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-[#141B18] text-sm truncate">{p.name}</p>
                    <p className="text-xs text-[#7B8582] mt-0.5">📍 {p.location}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-600 text-[#0F6E5C]">👍 {p.votes} votes</span>
                      <span
                        className="text-xs font-600 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: impactBg[p.impact as keyof typeof impactBg],
                          color: impactColor[p.impact as keyof typeof impactColor],
                        }}
                      >
                        {p.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Col 2 — Selected Problem (1/4) */}
        <div className="flex flex-col gap-3 min-h-0 overflow-y-auto scrollbar-hide">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-4 flex flex-col gap-3">
              <h3 className="font-700 text-[#141B18] text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                {selected.name}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-[#7B8582] text-xs">🏆 Rank</span><p className="font-700 text-[#141B18]">#{selected.rank}</p></div>
                <div><span className="text-[#7B8582] text-xs">📍 Location</span><p className="font-600 text-[#141B18] text-xs">{selected.location}</p></div>
                <div><span className="text-[#7B8582] text-xs">👍 Votes</span><p className="font-700 text-[#0F6E5C]">{selected.votes}</p></div>
                <div>
                  <span className="text-[#7B8582] text-xs">🔥 Impact</span>
                  <p
                    className="text-xs font-700"
                    style={{ color: impactColor[selected.impact as keyof typeof impactColor] }}
                  >
                    {selected.impact}
                  </p>
                </div>
              </div>

              {selected.evidence.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-[#7B8582] mb-1.5">📷 Evidence</p>
                  <div className="flex gap-1.5">
                    {selected.evidence.map((src, i) => (
                      <img key={i} src={src} alt="Evidence" className="w-16 h-12 rounded-lg object-cover bg-[#EDEBE5]" />
                    ))}
                  </div>
                </div>
              )}

              {selected.comments.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-[#7B8582] mb-1">💬 Community Comments</p>
                  {selected.comments.map((c, i) => (
                    <p key={i} className="text-xs text-[#4B5551] bg-[#F7F6F2] rounded-lg px-2.5 py-1.5 mb-1">
                      "{c}"
                    </p>
                  ))}
                </div>
              )}

              {selected.userSolutions.length > 0 && (
                <div>
                  <p className="text-xs font-700 text-[#7B8582] mb-1">💡 User Solutions</p>
                  {selected.userSolutions.map((s, i) => (
                    <p key={i} className="text-xs text-[#4B5551] flex gap-1.5 mb-1">
                      <span className="text-[#0F6E5C] flex-shrink-0">→</span>
                      {s}
                    </p>
                  ))}
                </div>
              )}

              {selected.authorityResponse && (
                <div className="bg-[#E4F3EF] rounded-xl p-3">
                  <p className="text-xs font-700 text-[#0F6E5C] mb-1">🏛️ Authority Response</p>
                  <p className="text-xs text-[#141B18]">{selected.authorityResponse}</p>
                </div>
              )}

              {/* Add solution */}
              <div>
                <p className="text-xs font-700 text-[#7B8582] mb-1.5">💡 Add Your Solution</p>
                <textarea
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Share your suggested solution..."
                  className="w-full h-16 px-3 py-2 text-xs border border-[#E4E7E5] rounded-xl resize-none focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15 text-[#141B18] placeholder-[#7B8582]"
                />
                <button className="w-full mt-1.5 h-9 rounded-xl bg-[#0F6E5C] text-white text-xs font-600 hover:bg-[#0B5849] transition-colors">
                  Submit Solution
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-4 flex items-center justify-center h-40 text-[#7B8582] text-sm text-center">
              Click on a problem to see details
            </div>
          )}
        </div>

        {/* Col 3 — Report Form (1/4) */}
        <div className="min-h-0 overflow-y-auto scrollbar-hide">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">➕</span>
              <h3 className="font-700 text-[#141B18] text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                Report a Problem
              </h3>
            </div>

            <form onSubmit={handleReport} className="space-y-3">
              <div>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">Problem Name</label>
                <input
                  required
                  type="text"
                  value={reportForm.name}
                  onChange={(e) => setReportForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Overflowing Garbage"
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E7E5] text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">📍 Location / Geotag</label>
                <input
                  required
                  type="text"
                  value={reportForm.location}
                  onChange={(e) => setReportForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Area, City"
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E7E5] text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">📷 Upload Photo / Video</label>
                <div className="h-16 border-2 border-dashed border-[#E4E7E5] rounded-xl flex items-center justify-center text-[#7B8582] text-xs cursor-pointer hover:border-[#0F6E5C]/40 transition-colors">
                  Drop or click to upload
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">💬 Description</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the problem..."
                  className="w-full h-16 px-3 py-2 text-sm border border-[#E4E7E5] rounded-lg resize-none focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15 text-[#141B18] placeholder-[#7B8582]"
                />
              </div>

              <div>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">⚠️ Impact / Severity</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setReportForm((f) => ({ ...f, severity: lvl }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-600 transition-all border ${
                        reportForm.severity === lvl
                          ? lvl === 'High'
                            ? 'bg-[#D64545] text-white border-[#D64545]'
                            : lvl === 'Medium'
                            ? 'bg-[#D89A1C] text-white border-[#D89A1C]'
                            : 'bg-[#1E9E5A] text-white border-[#1E9E5A]'
                          : 'bg-white text-[#7B8582] border-[#E4E7E5]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">💡 Suggested Solution</label>
                <input
                  type="text"
                  value={reportForm.solution}
                  onChange={(e) => setReportForm((f) => ({ ...f, solution: e.target.value }))}
                  placeholder="Your suggestion..."
                  className="w-full h-10 px-3 rounded-lg border border-[#E4E7E5] text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#E0762F] text-white font-600 text-sm hover:bg-[#c9682a] transition-colors shadow-[0_4px_14px_rgba(224,118,47,0.3)] active:scale-[0.98]"
              >
                🚨 Submit Report
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
