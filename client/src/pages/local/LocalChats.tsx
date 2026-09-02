import { useState, useRef, useEffect } from 'react'

interface Request {
  id: string
  user: string
  userLocation: string
  avatar: string
  date: string
  guests: number
  type: 'Homestay' | 'Guide Tour'
  message: string
  status: 'pending' | 'accepted' | 'declined'
}

interface Message {
  id: number
  sender: 'local' | 'user'
  text: string
  time: string
}

const initialRequests: Request[] = [
  {
    id: '1',
    user: 'Pooja Sharma',
    userLocation: 'Mumbai, Maharashtra',
    avatar: '👩',
    date: 'Aug 28–30, 2025',
    guests: 2,
    type: 'Homestay',
    message: "Hi! We are a couple planning to visit Jaipur. Would love to stay at your heritage home if available.",
    status: 'pending',
  },
  {
    id: '2',
    user: 'Ravi Kulkarni',
    userLocation: 'Bengaluru, Karnataka',
    avatar: '👨',
    date: 'Aug 25, 2025',
    guests: 1,
    type: 'Guide Tour',
    message: "I'm a solo traveller visiting for a day. Looking for a comprehensive heritage tour of Jaipur's forts.",
    status: 'pending',
  },
  {
    id: '3',
    user: 'Ananya Patel',
    userLocation: 'Ahmedabad, Gujarat',
    avatar: '👩',
    date: 'Aug 27, 2025',
    guests: 4,
    type: 'Guide Tour',
    message: "Family of 4 looking for a half-day food and culture tour. Are you free on Wednesday?",
    status: 'pending',
  },
]

const initMessages: Record<string, Message[]> = {
  '1': [
    { id: 1, sender: 'user', text: "Hi! We are a couple planning to visit Jaipur. Would love to stay at your heritage home if available.", time: '9:10 AM' },
    { id: 2, sender: 'local', text: "Namaste Pooja! Thank you for reaching out. Yes, we have availability for Aug 28–30. How many nights?", time: '9:15 AM' },
    { id: 3, sender: 'user', text: "2 nights! Do you provide breakfast?", time: '9:17 AM' },
    { id: 4, sender: 'local', text: "Yes, complimentary Rajasthani breakfast is included. ₹2,800/night per couple. Shall I confirm the booking?", time: '9:20 AM' },
  ],
  '2': [
    { id: 1, sender: 'user', text: "I'm a solo traveller visiting for a day. Looking for a comprehensive heritage tour.", time: '8:30 AM' },
    { id: 2, sender: 'local', text: "Hello Ravi! I can take you to Amber Fort, City Palace, and Nahargarh in a full-day tour. Starting at ₹1,500.", time: '8:35 AM' },
  ],
  '3': [
    { id: 1, sender: 'user', text: "Family of 4 looking for a half-day food and culture tour. Are you free Wednesday?", time: '11:00 AM' },
  ],
}

export default function LocalChats() {
  const [requests, setRequests] = useState<Request[]>(initialRequests)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>(initMessages)
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const selected = requests.find((r) => r.id === selectedId)
  const acceptedRequests = requests.filter((r) => r.status === 'accepted')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedId])

  function accept(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'accepted' } : r))
    setSelectedId(id)
  }

  function decline(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'declined' } : r))
    if (selectedId === id) setSelectedId(null)
  }

  function sendMessage() {
    if (!inputText.trim() || !selectedId) return
    const msg: Message = {
      id: Date.now(),
      sender: 'local',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), msg],
    }))
    setInputText('')
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 h-[calc(100vh-130px)]">
      <div className="mb-4">
        <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
          Chats & Requests
        </h2>
        <p className="text-[#7B8582] text-sm mt-0.5">Manage incoming traveller requests and active conversations.</p>
      </div>

      <div className="flex gap-5 h-[calc(100%-70px)]">
        {/* Left — Requests */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto scrollbar-hide">
          {/* Pending */}
          {pendingRequests.length > 0 && (
            <div>
              <p className="text-xs font-700 text-[#7B8582] uppercase tracking-wide mb-2">
                Pending Requests ({pendingRequests.length})
              </p>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#E4F3EF] flex items-center justify-center text-xl flex-shrink-0">
                        {req.avatar}
                      </div>
                      <div>
                        <p className="font-700 text-[#141B18] text-sm">{req.user}</p>
                        <p className="text-xs text-[#7B8582]">📍 {req.userLocation}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs text-[#7B8582] mb-2.5">
                      <span>📅 {req.date}</span>
                      <span>👥 {req.guests} {req.guests > 1 ? 'guests' : 'guest'}</span>
                      <span className="col-span-2">
                        <span
                          className="font-600 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: '#E4F3EF',
                            color: '#0F6E5C',
                          }}
                        >
                          {req.type}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-[#4B5551] italic mb-3 line-clamp-2">"{req.message}"</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => accept(req.id)}
                        className="flex-1 h-9 rounded-xl bg-[#0F6E5C] text-white text-xs font-600 hover:bg-[#0B5849] transition-colors"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => decline(req.id)}
                        className="flex-1 h-9 rounded-xl border border-[#D64545] text-[#D64545] text-xs font-600 hover:bg-[#D64545] hover:text-white transition-all"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Chats */}
          {acceptedRequests.length > 0 && (
            <div>
              <p className="text-xs font-700 text-[#7B8582] uppercase tracking-wide mb-2">
                Active Chats ({acceptedRequests.length})
              </p>
              <div className="space-y-2">
                {acceptedRequests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => setSelectedId(req.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 ${
                      selectedId === req.id
                        ? 'border-[#0F6E5C] bg-[#E4F3EF]'
                        : 'border-[#E4E7E5] bg-white hover:border-[#0F6E5C]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-[#E4F3EF] flex items-center justify-center text-lg">
                          {req.avatar}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#1E9E5A] border-2 border-white" />
                      </div>
                      <div>
                        <p className="font-600 text-[#141B18] text-sm">{req.user}</p>
                        <p className="text-xs text-[#7B8582]">{req.type} · {req.date}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {requests.every((r) => r.status !== 'pending') && acceptedRequests.length === 0 && (
            <div className="text-center py-8 text-[#7B8582]">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">No requests at the moment.</p>
            </div>
          )}
        </div>

        {/* Right — Active Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden">
          {selected && selected.status === 'accepted' ? (
            <>
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#E4E7E5] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E4F3EF] flex items-center justify-center text-xl">
                      {selected.avatar}
                    </div>
                    <div>
                      <p className="font-700 text-[#141B18]">{selected.user}</p>
                      <p className="text-xs text-[#7B8582]">📍 {selected.userLocation} · {selected.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#1E9E5A]" />
                    <span className="text-xs text-[#1E9E5A] font-600">Active</span>
                  </div>
                </div>

                {/* Request context banner */}
                <div className="mt-3 bg-[#F7F6F2] rounded-xl px-3 py-2 text-xs text-[#4B5551]">
                  <strong>Request:</strong> {selected.guests} {selected.guests > 1 ? 'guests' : 'guest'} · {selected.date} · {selected.type}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {(messages[selected.id] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'local' ? 'justify-end' : 'justify-start'} slide-up`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'local'
                          ? 'bg-[#E4F3EF] text-[#141B18] rounded-br-sm'
                          : 'bg-[#F7F6F2] text-[#141B18] rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-[10px] text-[#7B8582] mt-1 text-right">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-[#E4E7E5] flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 h-10 px-4 rounded-full border border-[#E4E7E5] text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-full bg-[#0F6E5C] text-white flex items-center justify-center hover:bg-[#0B5849] transition-colors"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-[#7B8582] text-center">
              <div>
                <div className="text-5xl mb-3">💬</div>
                <p className="font-600 text-[#141B18] mb-1">Active Chat</p>
                <p className="text-sm">Accept a request to start chatting with the traveller.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
