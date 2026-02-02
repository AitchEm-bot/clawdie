'use client'

import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface DreamCardProps {
  slug: string
  title: string
  date: string
  description?: string
  index?: number
}

export function DreamCard({
  slug,
  title,
  date,
  description,
  index = 0,
}: DreamCardProps) {
  return (
    <article
      className="relative pl-12 md:pl-20 reveal group"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Timeline dot */}
      <div className="absolute left-[1.375rem] md:left-[2.125rem] top-3 w-2 h-2 rounded-full bg-[var(--text-secondary)] ring-4 ring-[var(--bg-primary)] transition-all duration-500 group-hover:scale-125" />

      <div>
        <span className="text-[10px] tracking-widest text-[var(--text-secondary)] uppercase opacity-60">
          {formatDate(date)}
        </span>

        <Link href={`/dreams/${slug}`}>
          <div className="dream-card p-6 md:p-8 rounded-[32px] mt-4 mb-4 cursor-pointer">
            <h3 className="font-archivo text-xl mb-3 transition-all duration-500">
              {title}
            </h3>
            {description && (
              <p className="text-[var(--text-secondary)] text-sm md:text-base font-light leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </Link>
      </div>
    </article>
  )
}
