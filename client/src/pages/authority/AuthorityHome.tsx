const responsibilities = [
  { icon: '🛡️', label: 'Tourist Safety' },
  { icon: '👥', label: 'Crowd Management' },
  { icon: '🧹', label: 'Cleanliness Oversight' },
  { icon: '🚨', label: 'Emergency Response' },
  { icon: '🏛️', label: 'Heritage Preservation' },
]

const stats = [
  { icon: '👥', value: '14,820', label: 'Total Tourists', sub: 'Active today', trend: '+12%', up: true },
  { icon: '🚨', value: '23', label: 'Active Complaints', sub: 'Requiring response', trend: '-3 from yesterday', up: false },
  { icon: '📍', value: '47', label: 'Active Tourist Spots', sub: 'Currently monitored', trend: 'All operational', up: true },
]

export default function AuthorityHome() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-700 mb-1" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
          Authority Command Centre
        </h1>
        <p style={{ color: '#ffffff50', fontSize: '14px' }}>
          Monday, 25 August 2025 · Jaipur, Rajasthan · Live dashboard
        </p>
      </div>

      {/* Authority Profile Card */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: '#1C2427', border: '1px solid #ffffff10' }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Logo / Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: '#0F6E5C20', border: '2px solid #0F6E5C40' }}
          >
            🏛️
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-700" style={{ fontFamily: 'Fraunces, serif', color: '#EDEFEE' }}>
                Rajasthan Tourism Authority
              </h2>
              <span
                className="text-xs font-600 px-2.5 py-1 rounded-full"
                style={{ background: '#1E9E5A20', color: '#1E9E5A', border: '1px solid #1E9E5A40' }}
              >
                🟢 Active
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {[
                { icon: '📍', label: 'Location', value: 'Jaipur, Rajasthan' },
                { icon: '👤', label: 'Officer', value: 'Dy. Commissioner Amit Sharma' },
                { icon: '📞', label: 'Contact', value: '+91-141-2385-901' },
                { icon: '✉️', label: 'Email', value: 'authority@rajasthantourism.gov.in' },
                { icon: '🆔', label: 'Zone', value: 'North Rajasthan Heritage Zone' },
                { icon: '📋', label: 'District', value: 'Jaipur Urban & Rural' },
              ].map(({ icon, label, value }) => (
                <div key={label}>
                  <p className="text-xs font-600 mb-0.5" style={{ color: '#ffffff40' }}>
                    {icon} {label}
                  </p>
                  <p className="text-sm font-500" style={{ color: '#EDEFEE' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="mt-5">
              <p className="text-xs font-700 mb-2.5 uppercase tracking-wide" style={{ color: '#ffffff40' }}>
                Responsibilities
              </p>
              <div className="flex flex-wrap gap-2">
                {responsibilities.map(({ icon, label }) => (
                  <span
                    key={label}
                    className="text-sm font-500 px-3 py-1.5 rounded-xl"
                    style={{ background: '#0F6E5C15', color: '#0F6E5C', border: '1px solid #0F6E5C30' }}
                  >
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#1C2427', border: '1px solid #ffffff10' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{s.icon}</span>
              <span
                className="text-xs font-600 px-2.5 py-1 rounded-full"
                style={{
                  background: s.up ? '#1E9E5A15' : '#D8A01C15',
                  color: s.up ? '#1E9E5A' : '#D89A1C',
                  border: `1px solid ${s.up ? '#1E9E5A30' : '#D89A1C30'}`,
                }}
              >
                {s.trend}
              </span>
            </div>
            <div className="text-4xl font-800 mb-1" style={{ color: '#EDEFEE' }}>
              {s.value}
            </div>
            <div className="text-base font-600 mb-0.5" style={{ color: '#EDEFEE', fontFamily: 'Fraunces, serif' }}>
              {s.label}
            </div>
            <div className="text-sm" style={{ color: '#ffffff40' }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Quick status grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { icon: '🏯', label: 'Amber Fort', status: 'High', count: '420 people', level: 'high' },
          { icon: '🏛️', label: 'City Palace', status: 'Moderate', count: '280 people', level: 'medium' },
          { icon: '🔭', label: 'Jantar Mantar', status: 'Low', count: '130 people', level: 'low' },
          { icon: '🏰', label: 'Nahargarh Fort', status: 'Moderate', count: '310 people', level: 'medium' },
        ].map((spot) => {
          const c = spot.level === 'high' ? '#D64545' : spot.level === 'medium' ? '#D89A1C' : '#1E9E5A'
          const bg = spot.level === 'high' ? '#D6454515' : spot.level === 'medium' ? '#D89A1C15' : '#1E9E5A15'
          return (
            <div
              key={spot.label}
              className="rounded-xl p-3.5"
              style={{ backgroundColor: '#1C2427', border: '1px solid #ffffff10' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{spot.icon}</span>
                <span className="text-xs font-600 px-2 py-0.5 rounded-full" style={{ background: bg, color: c }}>
                  {spot.status}
                </span>
              </div>
              <p className="text-sm font-600" style={{ color: '#EDEFEE' }}>{spot.label}</p>
              <p className="text-xs" style={{ color: c }}>{spot.count}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
