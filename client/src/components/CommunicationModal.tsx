import { useState } from 'react'
import { api } from '../services/api'
import { MessageSquare, Mail, Smartphone, ExternalLink, Check, Copy, Send, X, AlertCircle } from 'lucide-react'

export interface CommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  defaultChannel?: 'whatsapp' | 'email' | 'sms'
  defaultPhone?: string
  defaultEmail?: string
  defaultSubject?: string
  defaultMessage?: string
  recipientName?: string
  contextTitle?: string
}

export default function CommunicationModal({
  isOpen,
  onClose,
  defaultChannel = 'whatsapp',
  defaultPhone = '+91 98765 12345',
  defaultEmail = 'traveler@example.com',
  defaultSubject = 'YatraSetu Notification',
  defaultMessage = '',
  recipientName = 'Traveler',
  contextTitle = 'Multi-Channel Dispatcher',
}: CommunicationModalProps) {
  if (!isOpen) return null

  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'sms'>(defaultChannel)
  const [phone, setPhone] = useState(defaultPhone)
  const [email, setEmail] = useState(defaultEmail)
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(defaultMessage)
  const [loading, setLoading] = useState(false)
  const [statusResult, setStatusResult] = useState<{
    success: boolean
    message: string
    directUrl?: string
    smsUri?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async () => {
    setLoading(true)
    setStatusResult(null)
    try {
      if (channel === 'whatsapp') {
        const res = await api.notifications.sendWhatsApp({
          phone,
          message,
          recipientName,
          templateType: subject,
        })
        setStatusResult({
          success: true,
          message: 'WhatsApp notification dispatched and recorded in backend log.',
          directUrl: res.directWhatsAppUrl,
        })
      } else if (channel === 'email') {
        const res = await api.notifications.sendEmail({
          email,
          subject,
          body: message,
          recipientName,
        })
        setStatusResult({
          success: true,
          message: 'Email processed & dispatched. Gmail compose trigger ready.',
          directUrl: res.gmailComposeUrl,
        })
      } else if (channel === 'sms') {
        const res = await api.notifications.sendSms({
          phone,
          message,
          recipientName,
        })
        setStatusResult({
          success: true,
          message: 'Cellular SMS dispatched successfully via telecom gateway simulation.',
          smsUri: res.smsUri,
        })
      }
    } catch (err: any) {
      setStatusResult({
        success: false,
        message: err.message || 'Failed to dispatch message.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E4E7E5] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0F6E5C] to-[#0A4E42] text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📡</span>
              <h3 className="font-700 text-lg" style={{ fontFamily: 'Fraunces, serif' }}>
                {contextTitle}
              </h3>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Live multi-channel communication for YatraSetu Smart Tourism Ecosystem
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="grid grid-cols-3 border-b border-[#E4E7E5] bg-[#F7F6F2] p-1.5 gap-1 flex-shrink-0">
          <button
            onClick={() => {
              setChannel('whatsapp')
              setStatusResult(null)
            }}
            className={`py-2 px-3 rounded-xl text-xs font-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              channel === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-sm'
                : 'text-[#505D58] hover:bg-white/80'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => {
              setChannel('email')
              setStatusResult(null)
            }}
            className={`py-2 px-3 rounded-xl text-xs font-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              channel === 'email'
                ? 'bg-[#EA4335] text-white shadow-sm'
                : 'text-[#505D58] hover:bg-white/80'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Google Gmail</span>
          </button>

          <button
            onClick={() => {
              setChannel('sms')
              setStatusResult(null)
            }}
            className={`py-2 px-3 rounded-xl text-xs font-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              channel === 'sms'
                ? 'bg-[#0F6E5C] text-white shadow-sm'
                : 'text-[#505D58] hover:bg-white/80'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Phone SMS</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {channel === 'whatsapp' && (
            <div>
              <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
                Recipient WhatsApp Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#25D366]/40 bg-white"
              />
              <p className="text-[11px] text-[#7B8582] mt-1">
                Enter phone with country code (e.g. +91 for India).
              </p>
            </div>
          )}

          {channel === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
                  Recipient Email (Gmail / Work)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#EA4335]/40 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject title..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#EA4335]/40 bg-white"
                />
              </div>
            </div>
          )}

          {channel === 'sms' && (
            <div>
              <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
                Recipient Mobile Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]/40 bg-white"
              />
            </div>
          )}

          {/* Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-700 text-[#141B18] uppercase tracking-wider">
                Message Content
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-[#0F6E5C] hover:underline flex items-center gap-1 font-600 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy text'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message or voucher summary..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]/40 bg-white font-mono text-xs leading-relaxed"
            />
            <div className="flex justify-between text-[11px] text-[#7B8582] mt-1">
              <span>Characters: {message.length}</span>
              {channel === 'sms' && <span>SMS Segments: {Math.ceil(message.length / 160) || 1}</span>}
            </div>
          </div>

          {/* Status Result Display */}
          {statusResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex flex-col gap-2 animate-in fade-in duration-150 ${
                statusResult.success
                  ? 'bg-[#E4F7EC] border-[#1E9E5A]/30 text-[#0F5A31]'
                  : 'bg-[#FDE8E8] border-[#D64545]/30 text-[#9B1C1C]'
              }`}
            >
              <div className="flex items-start gap-2">
                {statusResult.success ? (
                  <Check className="w-4 h-4 text-[#1E9E5A] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#D64545] flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-600">{statusResult.message}</div>
              </div>

              {statusResult.directUrl && (
                <a
                  href={statusResult.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#1E9E5A]/40 text-[#0F6E5C] font-700 hover:bg-[#dff5e8] transition-colors w-fit mt-1 shadow-2xs"
                >
                  <span>
                    {channel === 'whatsapp'
                      ? '🚀 Open Direct in WhatsApp'
                      : '📧 Open Compose in Google Gmail'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {statusResult.smsUri && (
                <a
                  href={statusResult.smsUri}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#1E9E5A]/40 text-[#0F6E5C] font-700 hover:bg-[#dff5e8] transition-colors w-fit mt-1 shadow-2xs"
                >
                  <span>📱 Launch Native SMS App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F7F6F2] border-t border-[#E4E7E5] flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-700 text-[#505D58] hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {channel === 'whatsapp' && (
              <a
                href={`https://api.whatsapp.com/send?phone=${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-700 hover:bg-[#1EBE5D] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Direct Web Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {channel === 'email' && (
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#EA4335] text-white text-xs font-700 hover:bg-[#d93829] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Open in Gmail</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={handleSend}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#0F6E5C] text-white text-xs font-700 hover:bg-[#0A4E42] flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch via Server</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
