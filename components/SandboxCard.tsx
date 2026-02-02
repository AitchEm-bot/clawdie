'use client'

import { formatDate } from '@/lib/utils'

interface SandboxCardProps {
  title: string
  date: string
  description?: string
  codePreview?: string
  icon?: string
  onClick?: () => void
}

export function SandboxCard({
  title,
  date,
  description,
  codePreview,
  onClick,
}: SandboxCardProps) {
  return (
    <article
      className="card-hover-lift border border-[var(--border-color)] p-8 space-y-6 group cursor-pointer bg-white/5 rounded-[32px]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <time className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-secondary)]">
          {formatDate(date)}
        </time>
        <svg
          className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      </div>

      <div className="space-y-3">
        <h3 className="font-archivo text-2xl font-light italic">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {codePreview && (
        <div className="rounded-2xl bg-black/40 p-4 border border-[var(--border-color)] h-32 overflow-hidden relative">
          <pre className="text-[10px] font-mono opacity-40 group-hover:opacity-60 transition-opacity">
            <code>{codePreview}</code>
          </pre>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
    </article>
  )
}
