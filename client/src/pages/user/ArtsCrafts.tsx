import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChatPanel, { type ChatContact } from '../../components/ChatPanel'
import Modal from '../../components/ui/Modal'
import CommunicationModal from '../../components/CommunicationModal'
import type { ProductListing } from '../../data/mockStore'
import { MessageSquare, Mail, Smartphone, ShoppingBag, Shield, CheckCircle } from 'lucide-react'

interface ArtsCraftsProps {
  onGoToBookings?: () => void
}

const categories = ['All', 'Textiles', 'Pottery', 'Paintings', 'Woodwork', 'Jewellery', 'Handicrafts']

export default function ArtsCrafts({ onGoToBookings }: ArtsCraftsProps) {
  const { products = [], showToast, activeLocation } = useApp()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [buyingProduct, setBuyingProduct] = useState<ProductListing | null>(null)

  // Multi-Channel Communication Modal State
  const [commModalOpen, setCommModalOpen] = useState(false)
  const [commChannel, setCommChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [commSubject, setCommSubject] = useState('')
  const [commMessage, setCommMessage] = useState('')

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

  function handleDirectContact(channel: 'whatsapp' | 'email' | 'sms', p: ProductListing) {
    const text = `Namaste ${p.seller}! I would like to order "${p.name}" (${p.price}) on YatraSetu. Please share shipping or workshop pickup details.`
    setCommChannel(channel)
    setCommSubject(`Order Inquiry for ${p.name} [YatraSetu]`)
    setCommMessage(text)
    setCommModalOpen(true)
  }

  function handleChat(p: ProductListing) {
    setSelectedContact({
      id: p.id,
      name: p.seller,
      image: p.image,
      role: `Artisan Maker · ${p.name}`,
      online: true,
    })
  }

  function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault()
    showToast(`Order confirmed for ${buyingProduct?.name}! Maker ${buyingProduct?.seller} will contact you via WhatsApp.`, 'success')
    setBuyingProduct(null)
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
              placeholder="Search authentic regional crafts, materials, artisan SHG cooperatives..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
            />
          </div>
          <span className="text-xs font-700 text-[#0F6E5C] bg-[#E4F3EF] px-3 py-2 rounded-xl whitespace-nowrap">
            {filtered.length} Authentic Crafts
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
            <p className="text-xs">Try searching by another craft category or material.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-xs overflow-hidden border border-[#E4E7E5] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-[#EDEBE5]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] bg-white/95 text-[#0F6E5C] font-800 rounded-full px-2.5 py-0.5 shadow-2xs">
                        {p.category}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="text-xs text-[#141B18] font-800 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                        ★ {p.rating}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-800 text-[#141B18] text-sm leading-snug" style={{ fontFamily: 'Fraunces, serif' }}>
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-900 text-[#0F6E5C]">{p.price}</span>
                      <span className="text-[10px] text-[#0F5A31] font-800 bg-[#E4F7EC] px-2 py-0.5 rounded-full">
                        Fair-Trade Verified
                      </span>
                    </div>
                    <div className="space-y-0.5 text-xs text-[#7B8582]">
                      <p><span className="font-600 text-[#4B5551]">Material:</span> {p.material}</p>
                      <p><span className="font-600 text-[#4B5551]">Origin:</span> {p.location}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E4E7E5] text-xs">
                      <p className="font-700 text-[#141B18]">Maker: {p.seller}</p>
                    </div>
                  </div>
                </div>

                {/* Footer: Order & Multi-Channel Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChat(p)}
                      className="flex-1 h-9 rounded-xl border border-[#0F6E5C]/30 text-[#0F6E5C] hover:bg-[#E4F3EF] text-xs font-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      💬 Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuyingProduct(p)}
                      className="flex-1 h-9 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white text-xs font-800 transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      🛍️ Buy Craft
                    </button>
                  </div>

                  {/* Multi-Channel Row */}
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDirectContact('whatsapp', p)}
                      className="py-1 px-1.5 rounded-lg bg-[#E4F7EC] hover:bg-[#25D366] hover:text-white text-[#0F5A31] text-[10px] font-700 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                      title="Order on WhatsApp"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectContact('email', p)}
                      className="py-1 px-1.5 rounded-lg bg-[#FDE8E8] hover:bg-[#EA4335] hover:text-white text-[#9B1C1C] text-[10px] font-700 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                      title="Inquire via Gmail"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Gmail</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectContact('sms', p)}
                      className="py-1 px-1.5 rounded-lg bg-[#FEF3C7] hover:bg-[#D89A1C] hover:text-white text-[#92400E] text-[10px] font-700 flex items-center justify-center gap-0.5 transition-colors cursor-pointer"
                      title="SMS Inquiry"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>SMS</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Chat Panel */}
      {selectedContact && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-full shadow-2xl">
          <ChatPanel
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            suggestedQuestions={[
              'Can you customize this craft with custom engravings?',
              'What is the estimated courier delivery time?',
              'Do you offer workshop visits for tourists?',
            ]}
          />
        </div>
      )}

      {/* Order Craft Modal */}
      {buyingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setBuyingProduct(null)}
          title={`Order ${buyingProduct.name}`}
          subtitle={`Direct fair-trade purchase from maker ${buyingProduct.seller}`}
          icon="🛍️"
          maxWidth="md"
        >
          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
            <div className="bg-[#F7F6F2] p-4 rounded-xl border border-[#E4E7E5] flex items-center justify-between">
              <div>
                <p className="font-800 text-[#141B18] text-sm">{buyingProduct.name}</p>
                <p className="text-[#0F6E5C] font-800">Price: {buyingProduct.price}</p>
              </div>
              <span className="text-[10px] bg-[#E4F7EC] text-[#0F5A31] px-2.5 py-1 rounded-full font-800">
                100% Direct to Artisan
              </span>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Delivery / Pickup Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Enter hotel room number or home delivery address..."
                className="w-full p-2.5 rounded-xl border border-[#E4E7E5] bg-white text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E4F3EF] text-[11px] text-[#0F6E5C] font-600 flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Zero intermediary leakage: 100% of the craft fee is transferred directly to the maker.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4E7E5]">
              <button
                type="button"
                onClick={() => setBuyingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-700 text-[#7B8582] hover:bg-[#F7F6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#0F6E5C] text-white font-800 text-xs hover:bg-[#0A4E42] transition-colors cursor-pointer shadow-xs"
              >
                Confirm Direct Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Multi-Channel Communication Modal */}
      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        defaultChannel={commChannel}
        defaultSubject={commSubject}
        defaultMessage={commMessage}
        contextTitle="Artisan Craft Order & Inquiry Dispatcher"
      />
    </div>
  )
}
