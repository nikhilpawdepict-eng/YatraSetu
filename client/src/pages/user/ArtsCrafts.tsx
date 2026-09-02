import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChatPanel, { type ChatContact } from '../../components/ChatPanel'
import type { ProductListing } from '../../data/mockStore'

interface ArtsCraftsProps {
  onGoToBookings?: () => void
}

const categories = ['All', 'Textiles', 'Pottery', 'Paintings', 'Woodwork', 'Jewellery', 'Handicrafts']

export default function ArtsCrafts({ onGoToBookings }: ArtsCraftsProps) {
  const { products = [], showToast } = useApp()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase()) ||
      p.material.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function handleChat(p: ProductListing) {
    setSelectedContact({
      id: p.id,
      name: p.seller,
      image: p.image,
      role: `Artisan Seller · ${p.name}`,
      online: true,
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="flex-1 space-y-4">
        {/* Search */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E4E7E5] shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7B8582]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search authentic regional crafts, materials, artisan sellers..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
            />
          </div>
          <span className="text-xs font-700 text-[#0F6E5C] bg-[#E4F3EF] px-3 py-2 rounded-xl whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'Craft' : 'Crafts'}
          </span>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-700 transition-all duration-150 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0F6E5C] text-white shadow-xs'
                  : 'bg-white text-[#7B8582] border border-[#E4E7E5] hover:border-[#0F6E5C]/40 hover:text-[#0F6E5C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-[#7B8582] border border-[#E4E7E5] space-y-2">
            <div className="text-3xl">🎭</div>
            <p className="font-700 text-[#141B18] text-sm">No crafts found matching "{search}"</p>
            <p className="text-xs">Try searching by artisan cooperative or another craft category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden border border-[#E4E7E5] hover:shadow-[0_8px_28px_rgba(20,27,24,0.10)] hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-[#EDEBE5]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] bg-white/95 text-[#0F6E5C] font-700 rounded-full px-2.5 py-0.5 shadow-2xs">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-3.5 space-y-2">
                    <h3 className="font-700 text-[#141B18] text-sm leading-snug" style={{ fontFamily: 'Fraunces, serif' }}>
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-800 text-[#0F6E5C]">{p.price}</span>
                      <span className="text-xs text-[#D89A1C] font-700 bg-[#FBF1DA] px-2 py-0.5 rounded-full">
                        ★ {p.rating}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-xs text-[#7B8582]">
                      <p><span className="font-600 text-[#4B5551]">Material:</span> {p.material}</p>
                      <p><span className="font-600 text-[#4B5551]">Durability:</span> {p.durability}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E4E7E5] space-y-0.5 text-xs">
                      <p className="font-700 text-[#141B18]">{p.seller}</p>
                      <p className="text-[#7B8582]">📍 {p.location}</p>
                    </div>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="p-3.5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleChat(p)}
                    className="w-full h-9 rounded-xl border border-[#0F6E5C]/30 text-[#0F6E5C] hover:bg-[#E4F3EF] text-xs font-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Contact Artisan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional Side Chat Panel */}
      {selectedContact && (
        <div className="w-full lg:w-96 flex-shrink-0">
          <ChatPanel
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            suggestedQuestions={[
              'Can you customize this piece?',
              'Do you offer doorstep domestic shipping?',
              'Is this handmade by local artisans?',
              'Can I visit your workshop or studio?',
            ]}
          />
        </div>
      )}
    </div>
  )
}
