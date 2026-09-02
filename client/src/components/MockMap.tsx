interface Spot {
  id: string
  name: string
  x: number
  y: number
  count: number
  level: 'low' | 'medium' | 'high'
}

interface Props {
  spots: Spot[]
  title?: string
  showTotal?: boolean
  dark?: boolean
}

const levelColor = {
  low: '#1E9E5A',
  medium: '#D89A1C',
  high: '#D64545',
}

const levelBg = {
  low: '#E4F7EC',
  medium: '#FBF1DA',
  high: '#FBE6E6',
}

const levelLabel = { low: 'Low', medium: 'Medium', high: 'High' }

export default function MockMap({ spots, title = 'Crowd Distribution Map', showTotal, dark }: Props) {
  const total = spots.reduce((s, sp) => s + sp.count, 0)

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(20,27,24,0.08)] flex flex-col h-full ${
        dark ? 'bg-[#1C2427]' : 'bg-white'
      }`}
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-[#E4E7E5]'} flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🗺️</span>
            <span
              className={`text-sm font-700 uppercase tracking-wide ${dark ? 'text-[#EDEFEE]' : 'text-[#141B18]'}`}
            >
              {title}
            </span>
          </div>
          {showTotal && (
            <div className="text-right">
              <p className="text-xs text-[#7B8582] uppercase tracking-wide">Total</p>
              <p className="text-lg font-800 text-[#D64545]">{total.toLocaleString()} people</p>
            </div>
          )}
        </div>
      </div>

      {/* Map SVG Area */}
      <div className="relative flex-1 min-h-[200px]">
        <svg
          viewBox="0 0 400 280"
          className="w-full h-full"
          style={{ background: dark ? '#12181A' : '#EDF2EF' }}
        >
          {/* Grid lines - subtle */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 57}
              y1={0}
              x2={i * 57}
              y2={280}
              stroke={dark ? '#ffffff08' : '#0F6E5C08'}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * 47}
              x2={400}
              y2={i * 47}
              stroke={dark ? '#ffffff08' : '#0F6E5C08'}
              strokeWidth={1}
            />
          ))}

          {/* Road lines */}
          <path d="M0,140 Q100,120 200,140 Q300,160 400,140" stroke={dark ? '#ffffff12' : '#0F6E5C15'} strokeWidth={8} fill="none" />
          <path d="M200,0 Q220,100 200,280" stroke={dark ? '#ffffff12' : '#0F6E5C15'} strokeWidth={6} fill="none" />
          <path d="M50,80 Q150,100 250,80" stroke={dark ? '#ffffff08' : '#0F6E5C10'} strokeWidth={4} fill="none" />
          <path d="M150,200 Q250,190 350,210" stroke={dark ? '#ffffff08' : '#0F6E5C10'} strokeWidth={4} fill="none" />

          {/* Area zones (subtle fill) */}
          <ellipse cx={120} cy={100} rx={55} ry={35} fill={dark ? '#ffffff04' : '#0F6E5C06'} />
          <ellipse cx={280} cy={170} rx={65} ry={40} fill={dark ? '#ffffff04' : '#0F6E5C06'} />

          {/* Spots */}
          {spots.map((spot) => (
            <g key={spot.id}>
              {/* Pulse ring for high */}
              {spot.level === 'high' && (
                <circle cx={spot.x} cy={spot.y} r={22} fill="none" stroke={levelColor.high} strokeWidth={1.5} opacity={0.3} />
              )}
              {/* Outer ring */}
              <circle
                cx={spot.x}
                cy={spot.y}
                r={18}
                fill={levelBg[spot.level]}
                stroke={levelColor[spot.level]}
                strokeWidth={2}
              />
              {/* Inner dot */}
              <circle cx={spot.x} cy={spot.y} r={7} fill={levelColor[spot.level]} />

              {/* Tooltip bubble */}
              <g>
                <rect
                  x={spot.x - 38}
                  y={spot.y - 48}
                  width={76}
                  height={26}
                  rx={6}
                  fill={dark ? '#1C2427' : 'white'}
                  stroke={dark ? '#ffffff20' : '#E4E7E5'}
                  strokeWidth={1}
                />
                <text
                  x={spot.x}
                  y={spot.y - 40}
                  textAnchor="middle"
                  fontSize={7}
                  fill={dark ? '#EDEFEE' : '#141B18'}
                  fontFamily="Manrope, sans-serif"
                  fontWeight="600"
                >
                  {spot.name}
                </text>
                <text
                  x={spot.x}
                  y={spot.y - 30}
                  textAnchor="middle"
                  fontSize={8}
                  fill={levelColor[spot.level]}
                  fontFamily="Manrope, sans-serif"
                  fontWeight="700"
                >
                  {spot.count.toLocaleString()} people
                </text>
              </g>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
          {(['high', 'medium', 'low'] as const).map((lvl) => (
            <div key={lvl} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: levelColor[lvl] }} />
              <span className="text-xs font-500 text-[#4B5551]">{levelLabel[lvl]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Spot list */}
      <div className={`px-4 py-3 border-t ${dark ? 'border-white/10' : 'border-[#E4E7E5]'} space-y-1.5 flex-shrink-0`}>
        {spots.map((spot) => (
          <div key={spot.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: levelColor[spot.level] }} />
              <span className={`text-sm font-500 ${dark ? 'text-[#EDEFEE]' : 'text-[#141B18]'}`}>{spot.name}</span>
            </div>
            <span className="text-sm font-600" style={{ color: levelColor[spot.level] }}>
              {spot.count.toLocaleString()} people
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
