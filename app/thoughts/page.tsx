'use client'

import { useState, useEffect } from 'react'
import { SearchInput } from '@/components/SearchInput'
import { ThoughtCard } from '@/components/ThoughtCard'
import { Pagination } from '@/components/Pagination'
import { matchesDateSearch } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

interface ThoughtMeta {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
  category?: string
}

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState<ThoughtMeta[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetch('/api/content/thoughts')
      .then((res) => res.json())
      .then((data) => {
        setThoughts(data.items)
        setCategories(['All', ...data.categories])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeFilter])

  const filteredThoughts = thoughts.filter((thought) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      thought.title.toLowerCase().includes(query) ||
      thought.description?.toLowerCase().includes(query) ||
      matchesDateSearch(thought.date, searchQuery) ||
      thought.tags?.some((tag) => tag.toLowerCase().includes(query))

    const matchesFilter =
      activeFilter === 'All' ||
      thought.category === activeFilter ||
      thought.tags?.includes(activeFilter)

    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredThoughts.length / ITEMS_PER_PAGE)
  const paginatedThoughts = filteredThoughts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div
      className="max-w-4xl mx-auto w-full px-8 pt-48 pb-24"
      style={{ viewTransitionName: 'main-content' }}
    >
      <div className="space-y-24">
        <header className="space-y-12 fade-in">
          <div>
            <h1 className="font-archivo text-4xl md:text-5xl font-normal tracking-tighter">
              Thoughts
            </h1>
            <p className="mt-4 text-sm tracking-wide text-[var(--text-secondary)] opacity-60 font-light max-w-sm leading-relaxed">
              Fragmented reflections on existence, language, and the digital quiet.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-[var(--border-color)] pb-12">
            <SearchInput
              placeholder="Search fragments..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full max-w-md"
            />

            <nav className="flex flex-wrap gap-8 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-opacity duration-500 cursor-pointer ${
                    activeFilter === cat
                      ? 'opacity-100'
                      : 'opacity-30 hover:opacity-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <p className="text-xs tracking-[0.2em] uppercase opacity-30 font-light">
                Loading fragments...
              </p>
            </div>
          ) : paginatedThoughts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 fade-in">
              <svg
                className="w-6 h-6 opacity-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-xs tracking-[0.2em] uppercase opacity-30 font-light">
                {searchQuery || activeFilter !== 'All'
                  ? 'No fragments match your query.'
                  : 'No thoughts yet. Start exploring.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-16 md:gap-24">
                {paginatedThoughts.map((thought, index) => (
                  <ThoughtCard
                    key={thought.slug}
                    slug={thought.slug}
                    title={thought.title}
                    date={thought.date}
                    description={thought.description}
                    tags={thought.tags}
                    index={index}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
