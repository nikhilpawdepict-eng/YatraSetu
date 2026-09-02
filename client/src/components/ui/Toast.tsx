import { useApp } from '../../context/AppContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  const typeStyles = {
    success: 'bg-[#1E9E5A] text-white shadow-[0_8px_24px_rgba(30,158,90,0.35)]',
    error: 'bg-[#D64545] text-white shadow-[0_8px_24px_rgba(214,69,69,0.35)]',
    warning: 'bg-[#D89A1C] text-white shadow-[0_8px_24px_rgba(216,154,28,0.35)]',
    info: 'bg-[#0F6E5C] text-white shadow-[0_8px_24px_rgba(15,110,92,0.35)]',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-sm font-500 transition-all slide-up ${
            typeStyles[toast.type]
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {icons[toast.type]}
            </span>
            <span className="leading-snug">{toast.text}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-xs flex-shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
