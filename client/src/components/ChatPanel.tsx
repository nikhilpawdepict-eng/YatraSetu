import { useState, useRef, useEffect } from 'react'

export interface ChatContact {
  id: string
  name: string
  image: string
  role: string
  online: boolean
}

interface Message {
  id: number
  sender: 'user' | 'local'
  text: string
  time: string
}

const defaultMessages: Message[] = [
  { id: 1, sender: 'local', text: 'Namaste! How can I help you today?', time: '10:02 AM' },
  { id: 2, sender: 'user', text: 'Hi! I wanted to enquire about availability for this weekend.', time: '10:04 AM' },
  { id: 3, sender: 'local', text: 'Yes, we are available this weekend. Would you like more details about the facilities?', time: '10:05 AM' },
]

const guideMessages: Message[] = [
  { id: 1, sender: 'local', text: 'Hello! I am your local guide. What would you like to explore?', time: '9:30 AM' },
  { id: 2, sender: 'user', text: 'Are you available today for a heritage walk?', time: '9:35 AM' },
  { id: 3, sender: 'local', text: 'Absolutely! I can take you through the old city, forts, and local bazaars. My timing is flexible.', time: '9:36 AM' },
]

interface Props {
  contact: ChatContact | null
  suggestedQuestions?: string[]
  isGuide?: boolean
}

export default function ChatPanel({ contact, suggestedQuestions, isGuide }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(isGuide ? guideMessages : defaultMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages(isGuide ? guideMessages : defaultMessages)
  }, [contact?.id, isGuide])

  function sendMessage() {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        sender: 'local',
        text: 'Thank you for your message! I will get back to you shortly.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, reply])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E4E7E5] flex-shrink-0">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-lg">💬</span>
          <span className="text-sm font-700 text-[#141B18] uppercase tracking-wide">Chat</span>
        </div>
        {contact ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={contact.image}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover bg-[#EDEBE5]"
              />
              {contact.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1E9E5A] border-2 border-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-600 text-[#141B18]">{contact.name}</p>
              <p className="text-xs text-[#7B8582]">{contact.role}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#7B8582] italic">Select a contact to start chatting</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {contact ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} slide-up`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#E4F3EF] text-[#141B18] rounded-br-sm'
                    : 'bg-[#F7F6F2] text-[#141B18] rounded-bl-sm'
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-[10px] text-[#7B8582] mt-1 text-right">{msg.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-[#7B8582] text-sm text-center">
            <div>
              <div className="text-4xl mb-3">💬</div>
              <p>Click &quot;Chat / Request&quot; on any listing to start a conversation</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      {contact && suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="px-3 py-2 border-t border-[#E4E7E5] flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs bg-[#E4F3EF] text-[#0F6E5C] rounded-full px-3 py-1.5 whitespace-nowrap font-medium hover:bg-[#0F6E5C] hover:text-white transition-colors flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      {contact && (
        <div className="px-3 py-3 border-t border-[#E4E7E5] flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 h-10 px-3 rounded-full border border-[#E4E7E5] text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-full bg-[#0F6E5C] text-white flex items-center justify-center text-lg hover:bg-[#0B5849] transition-colors flex-shrink-0"
          >
            ➤
          </button>
        </div>
      )}
    </div>
  )
}
