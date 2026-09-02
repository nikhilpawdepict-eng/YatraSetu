interface SkeletonProps {
  type?: 'card' | 'list' | 'stat' | 'map'
  count?: number
}

export default function SkeletonLoader({ type = 'card', count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count })

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#E4E7E5] space-y-3">
            <div className="h-40 rounded-xl skeleton w-full" />
            <div className="h-5 rounded-md skeleton w-3/4" />
            <div className="h-3.5 rounded-md skeleton w-1/2" />
            <div className="flex gap-2 pt-2">
              <div className="h-7 rounded-full skeleton w-16" />
              <div className="h-7 rounded-full skeleton w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-[#E4E7E5] space-y-2">
            <div className="w-8 h-8 rounded-lg skeleton" />
            <div className="h-3 rounded skeleton w-16" />
            <div className="h-6 rounded skeleton w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-3 border border-[#E4E7E5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg skeleton flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 rounded skeleton w-2/3" />
              <div className="h-3 rounded skeleton w-1/3" />
            </div>
            <div className="w-14 h-6 rounded-full skeleton" />
          </div>
        ))}
      </div>
    )
  }

  return <div className="h-64 rounded-2xl skeleton w-full" />
}
