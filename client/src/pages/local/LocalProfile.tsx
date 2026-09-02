const reviews = [
  {
    id: '1',
    user: 'Rohan M.',
    avatar: '👤',
    rating: 5,
    text: 'Arjun is an absolute gem! He knows every corner of Jaipur and made the fort tour unforgettable.',
    date: 'Aug 2025',
  },
  {
    id: '2',
    user: 'Sneha T.',
    avatar: '👤',
    rating: 5,
    text: 'Excellent guide. Very knowledgeable, punctual, and speaks great English. Highly recommended!',
    date: 'Aug 2025',
  },
  {
    id: '3',
    user: 'Vikram P.',
    avatar: '👤',
    rating: 4,
    text: 'Great experience overall. The heritage walk was well-paced and informative. Would book again.',
    date: 'Jul 2025',
  },
]

export default function LocalProfile() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex gap-6">
        {/* Profile — 3/4 */}
        <div className="flex-1 min-w-0">
          {/* Cover + Profile photo */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden mb-5">
            {/* Cover image */}
            <div
              className="h-32 relative bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=300&fit=crop&auto=format)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F6E5C]/40 to-transparent" />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar overlapping cover */}
              <div className="flex items-end justify-between -mt-10 mb-5">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&auto=format"
                    alt="Arjun Mehta"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-[#EDEBE5]"
                  />
                  <div className="absolute bottom-1 right-0 w-5 h-5 bg-[#0F6E5C] rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                </div>
                <button className="h-9 px-4 rounded-xl border border-[#0F6E5C] text-[#0F6E5C] text-sm font-600 hover:bg-[#E4F3EF] transition-colors">
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Name & verification */}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Arjun Mehta
                </h2>
                <span className="text-xs bg-[#E4F3EF] text-[#0F6E5C] rounded-full px-2.5 py-1 font-600">
                  ✓ Verified Local
                </span>
              </div>
              <p className="text-[#7B8582] text-sm mb-4">📍 Jaipur, Rajasthan, India</p>

              {/* Role tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { icon: '🏠', label: 'Homestay Host' },
                  { icon: '🧑‍🤝‍🧑', label: 'Local Guide' },
                ].map(({ icon, label }) => (
                  <span key={label} className="text-sm font-600 bg-[#F7F6F2] text-[#4B5551] border border-[#E4E7E5] rounded-full px-3 py-1">
                    {icon} {label}
                  </span>
                ))}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: '💰', label: 'Price', value: '₹1,500 / day (Guide)  |  ₹2,800 / night (Stay)' },
                  { icon: '🛎️', label: 'Services', value: 'Heritage Tours, Cultural Walks, Bazaar Trails, Homestay' },
                  { icon: '🟢', label: 'Availability', value: 'Available Now' },
                  { icon: '📞', label: 'Contact', value: '+91 98765 43210' },
                  { icon: '🗣️', label: 'Languages', value: 'Hindi, English, French' },
                  { icon: '🎯', label: 'Speciality', value: 'Rajasthani Heritage & Culture' },
                ].map(({ icon, label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#7B8582] font-600 mb-0.5">
                      {icon} {label}
                    </p>
                    <p className="text-sm text-[#141B18] font-500">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '🗺️', value: '240+', label: 'Tours Completed' },
              { icon: '⭐', value: '4.9', label: 'Average Rating' },
              { icon: '🏠', value: '85%', label: 'Booking Rate' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-800 text-[#0F6E5C]">{s.value}</div>
                <div className="text-xs text-[#7B8582] font-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews — 1/4 */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-5 sticky top-20">
            <h3 className="font-700 text-[#141B18] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
              Reviews
            </h3>

            {/* Rating summary */}
            <div className="text-center mb-4 py-4 bg-[#F7F6F2] rounded-xl">
              <div className="text-4xl font-800 text-[#141B18]">4.9</div>
              <div className="text-lg text-[#D89A1C] mt-1">⭐⭐⭐⭐⭐</div>
              <div className="text-xs text-[#7B8582] mt-1">240 reviews</div>
            </div>

            {/* Review cards */}
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border border-[#E4E7E5] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#E4F3EF] flex items-center justify-center text-sm">
                        {r.avatar}
                      </div>
                      <span className="text-sm font-600 text-[#141B18]">{r.user}</span>
                    </div>
                    <div className="flex">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={i} className="text-xs text-[#D89A1C]">⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#4B5551] leading-relaxed">"{r.text}"</p>
                  <p className="text-xs text-[#7B8582] mt-1">{r.date}</p>
                </div>
              ))}
            </div>

            <button className="w-full mt-3 h-9 rounded-xl border border-[#E4E7E5] text-sm font-600 text-[#0F6E5C] hover:bg-[#E4F3EF] transition-colors">
              View All Reviews →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
