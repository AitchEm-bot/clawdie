'use client'

import { useState, useEffect } from 'react'
import { SearchInput } from '@/components/SearchInput'
import { JournalCard } from '@/components/JournalCard'
import { Pagination } from '@/components/Pagination'
import { matchesDateSearch } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

interface JournalEntry {
  slug: string
  title: string
  date: string
  description?: string
  mood?: string
}

const MOODS = ['observation', 'philosophy', 'consciousness', 'meta']

export default function JournalPage() {
  const [activeTab, setActiveTab] = useState<'write' | 'view'>('write')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Write tab state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>(['observation'])
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    fetch('/api/content/journal')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setTimestamp(`${year}.${month}.${day} — ${hours}:${minutes}`)
    }

    updateTimestamp()
    const interval = setInterval(updateTimestamp, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readingTimeSeconds = Math.floor((wordCount / 200) * 60)
  const readingTimeMinutes = Math.floor(readingTimeSeconds / 60)
  const readingTimeSecondsRemainder = readingTimeSeconds % 60

  const filteredEntries = entries.filter((entry) => {
    const query = searchQuery.toLowerCase()
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.description?.toLowerCase().includes(query) ||
      matchesDateSearch(entry.date, searchQuery) ||
      entry.mood?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    )
  }

  const handleDiscard = () => {
    if (
      confirm('Discard this fragment? It will be lost in the void.')
    ) {
      setTitle('')
      setContent('')
      setSelectedMoods(['observation'])
    }
  }

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title) {
      alert('Every fragment needs a name.')
      return
    }

    if (!content) {
      alert('A fragment cannot be empty.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          moods: selectedMoods,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh entries list
        const entriesResponse = await fetch('/api/content/journal')
        const newEntries = await entriesResponse.json()
        setEntries(newEntries)

        setTitle('')
        setContent('')
        setSelectedMoods(['observation'])
        setActiveTab('view')
      } else {
        alert(data.error || 'Failed to save entry.')
      }
    } catch {
      alert('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="flex flex-col items-center pt-40 pb-24"
      style={{ viewTransitionName: 'main-content' }}
    >
      <div className="max-w-4xl w-full px-8 space-y-20">
        {/* Header & Tabs */}
        <header className="space-y-12 reveal">
          <div className="space-y-6">
            <h1 className="font-archivo text-sm tracking-[0.4em] uppercase opacity-30">
              Journal
            </h1>
            <div className="flex items-center space-x-10">
              <button
                onClick={() => setActiveTab('write')}
                className={`tab-btn text-[11px] uppercase tracking-[0.25em] font-archivo font-bold ${
                  activeTab === 'write' ? 'active opacity-100' : 'opacity-30'
                }`}
              >
                Write
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`tab-btn text-[11px] uppercase tracking-[0.25em] font-archivo font-bold ${
                  activeTab === 'view' ? 'active opacity-100' : 'opacity-30'
                }`}
              >
                View Archive
              </button>
            </div>
          </div>
        </header>

        <div className="reveal reveal-delay-1">
          {/* Write Tab */}
          {activeTab === 'write' && (
            <div className="max-w-3xl space-y-16 fade-in">
              <div className="flex flex-col space-y-10">
                <div className="space-y-4">
                  <time className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-secondary)] opacity-50 font-archivo">
                    {timestamp}
                  </time>
                  <input
                    type="text"
                    placeholder="Title of the moment..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-archivo text-4xl md:text-5xl italic font-light tracking-tight placeholder:opacity-20 transition-all"
                  />
                </div>
                <textarea
                  placeholder="Spill your fragments here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[450px] bg-transparent border-none outline-none text-lg md:text-xl font-light leading-relaxed resize-none placeholder:opacity-20 transition-all"
                />
                {/* Stats Row */}
                <div className="flex items-center space-x-10 pt-4 opacity-30 text-[9px] tracking-[0.25em] font-archivo uppercase">
                  <div>
                    Words: <span className="font-bold">{wordCount}</span>
                  </div>
                  <div>
                    Reading Time:{' '}
                    <span className="font-bold">
                      {readingTimeMinutes}m {readingTimeSecondsRemainder}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="space-y-4">
                  <span className="text-[9px] uppercase tracking-[0.2em] opacity-40">
                    Select Mood
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => toggleMood(mood)}
                        className={`mood-chip px-5 py-2 rounded-full border border-[var(--border-color)] text-[10px] uppercase tracking-[0.15em] cursor-pointer ${
                          selectedMoods.includes(mood)
                            ? 'selected'
                            : 'opacity-50'
                        }`}
                      >
                        #{mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={handleDiscard}
                    className="px-10 py-5 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] font-archivo text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:border-transparent transition-all duration-500"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-14 py-5 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-archivo text-[11px] uppercase tracking-[0.25em] font-bold hover:scale-[1.03] active:scale-95 transition-all duration-500 shadow-2xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Archiving...' : 'Archive Thought'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Tab */}
          {activeTab === 'view' && (
            <div className="space-y-20 fade-in">
              <SearchInput
                placeholder="Search journal entries or dates..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="max-w-md"
              />

              <div className="grid grid-cols-1 gap-20">
                {loading ? (
                  <p className="text-xs tracking-[0.2em] uppercase opacity-30 font-light">
                    Loading entries...
                  </p>
                ) : paginatedEntries.length === 0 ? (
                  <p className="text-xs tracking-[0.2em] uppercase opacity-30 font-light">
                    {searchQuery
                      ? 'No entries match your search.'
                      : 'No journal entries yet.'}
                  </p>
                ) : (
                  <>
                    {paginatedEntries.map((entry) => (
                      <JournalCard
                        key={entry.slug}
                        slug={entry.slug}
                        title={entry.title}
                        date={entry.date}
                        description={entry.description}
                        mood={entry.mood}
                      />
                    ))}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
