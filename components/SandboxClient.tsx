'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SandboxCard } from '@/components/SandboxCard'
import { CodeViewer } from '@/components/CodeViewer'
import { SearchInput } from '@/components/SearchInput'
import { Pagination } from '@/components/Pagination'
import { matchesDateSearch } from '@/lib/utils'

const ITEMS_PER_PAGE = 8

export interface SandboxCreation {
  slug: string
  title: string
  date: string
  description?: string
  language?: string
  category?: string
  fileName?: string
  codePreview?: string
  code: string
}

interface SandboxClientProps {
  creations: SandboxCreation[]
  languages: string[]
  categories: string[]
}

export function SandboxClient({ creations: initialCreations, languages, categories }: SandboxClientProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'editor'>('gallery')
  const [selectedCreation, setSelectedCreation] = useState<SandboxCreation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [creations, setCreations] = useState<SandboxCreation[]>(initialCreations)
  const [deleting, setDeleting] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeLanguage, activeCategory])

  const filteredCreations = creations.filter((creation) => {
    const query = searchQuery.toLowerCase()

    // Check language filter
    if (activeLanguage && creation.language !== activeLanguage) {
      return false
    }

    // Check category filter
    if (activeCategory && creation.category !== activeCategory) {
      return false
    }

    // Check search query
    if (query) {
      return (
        creation.title.toLowerCase().includes(query) ||
        (creation.description?.toLowerCase().includes(query) ?? false) ||
        matchesDateSearch(creation.date, searchQuery) ||
        (creation.fileName?.toLowerCase().includes(query) ?? false) ||
        (creation.language?.toLowerCase().includes(query) ?? false)
      )
    }

    return true
  })

  const totalPages = Math.ceil(filteredCreations.length / ITEMS_PER_PAGE)
  const paginatedCreations = filteredCreations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const viewCode = (slug: string) => {
    const creation = creations.find((c) => c.slug === slug)
    if (creation) {
      setSelectedCreation(creation)
      setActiveTab('editor')
    }
  }

  const backToGallery = () => {
    setActiveTab('gallery')
    setSelectedCreation(null)
  }

  const deleteCreation = async (slug: string) => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/content/sandbox/${slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCreations((prev) => prev.filter((c) => c.slug !== slug))
        backToGallery()
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete')
      }
    } catch {
      alert('Failed to delete. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="max-w-screen-lg mx-auto w-full px-8 py-20"
      style={{ viewTransitionName: 'main-content' }}
    >
      <header className="space-y-12 mb-20 fade-in">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h1 className="font-archivo text-5xl font-normal tracking-tighter">
              Sandbox
            </h1>
            <p className="text-sm tracking-wide text-[var(--text-secondary)] max-w-md opacity-70 font-light">
              A laboratory for ephemeral code, visual algorithms, and digital
              curiosities born in the quiet hours.
            </p>
          </div>

          <div className="flex bg-[var(--border-color)] p-1 rounded-full overflow-hidden border border-[var(--border-color)]">
            <button
              onClick={backToGallery}
              className={`px-6 py-2 text-[10px] uppercase tracking-[0.2em] rounded-full font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : ''
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => {
                if (!selectedCreation && creations.length > 0) {
                  viewCode(creations[0].slug)
                } else if (selectedCreation) {
                  setActiveTab('editor')
                }
              }}
              className={`px-6 py-2 text-[10px] uppercase tracking-[0.2em] rounded-full font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : ''
              }`}
            >
              Editor
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'gallery' && (
        <div className="space-y-12 fade-in">
          <div className="space-y-8">
            <SearchInput
              placeholder="Search creations, dates, languages..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="max-w-md"
            />

            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
              {languages.length > 0 && (
                <nav className="flex flex-wrap gap-6 items-center">
                  <span className="text-[9px] uppercase tracking-[0.15em] opacity-30">Language</span>
                  <button
                    onClick={() => setActiveLanguage(null)}
                    className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-opacity duration-500 cursor-pointer ${
                      activeLanguage === null
                        ? 'opacity-100'
                        : 'opacity-30 hover:opacity-100'
                    }`}
                  >
                    All
                  </button>
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setActiveLanguage(lang)}
                      className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-opacity duration-500 cursor-pointer ${
                        activeLanguage === lang
                          ? 'opacity-100'
                          : 'opacity-30 hover:opacity-100'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </nav>
              )}

              {categories.length > 0 && (
                <nav className="flex flex-wrap gap-6 items-center">
                  <span className="text-[9px] uppercase tracking-[0.15em] opacity-30">Category</span>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-opacity duration-500 cursor-pointer ${
                      activeCategory === null
                        ? 'opacity-100'
                        : 'opacity-30 hover:opacity-100'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-[10px] uppercase tracking-[0.2em] font-medium transition-opacity duration-500 cursor-pointer ${
                        activeCategory === cat
                          ? 'opacity-100'
                          : 'opacity-30 hover:opacity-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </div>

          {paginatedCreations.length === 0 ? (
            <p className="text-xs tracking-[0.2em] uppercase opacity-30 font-light py-20 text-center">
              {creations.length === 0
                ? 'No creations yet. Add markdown files to content/sandbox/'
                : 'No creations match your filters.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {paginatedCreations.map((creation) => (
                  <SandboxCard
                    key={creation.slug}
                    title={creation.title}
                    date={creation.date}
                    description={creation.description || ''}
                    codePreview={creation.codePreview || ''}
                    onClick={() => viewCode(creation.slug)}
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
      )}

      {activeTab === 'editor' && selectedCreation && (
        <CodeViewer
          title={selectedCreation.title}
          description={selectedCreation.description}
          fileName={selectedCreation.fileName || `${selectedCreation.slug}.txt`}
          code={selectedCreation.code}
          onBack={backToGallery}
          onDelete={() => deleteCreation(selectedCreation.slug)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
