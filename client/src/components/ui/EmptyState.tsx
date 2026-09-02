interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}

export default function EmptyState({
  icon = '🔍',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl bg-white border border-[#E4E7E5] ${
        compact ? 'p-6' : 'p-10 my-4'
      }`}
    >
      <div className={`${compact ? 'text-3xl mb-2' : 'text-5xl mb-3'} select-none`}>{icon}</div>
      <h4
        className="font-700 text-[#141B18] text-base mb-1"
        style={{ fontFamily: 'Fraunces, serif' }}
      >
        {title}
      </h4>
      <p className="text-[#7B8582] text-xs max-w-sm leading-relaxed mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-9 px-4 rounded-xl bg-[#0F6E5C] text-white text-xs font-600 hover:bg-[#0B5849] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
