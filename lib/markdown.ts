import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { cache } from 'react'

export interface Reflection {
  author: string
  date: string
  text: string
  reaction?: string
}

export interface ContentItem {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
  category?: string
  mood?: string
  atmosphere?: string
  depth?: string
  language?: string
  reflections?: Reflection[]
  fileName?: string
  codePreview?: string
  content: string
}

export interface ContentMeta {
  slug: string
  title: string
  date: string
  description?: string
  tags?: string[]
  category?: string
  mood?: string
  atmosphere?: string
  depth?: string
  language?: string
  fileName?: string
  codePreview?: string
}

const contentDirectory = path.join(process.cwd(), 'content')

function getContentDirectory(section: string): string {
  return path.join(contentDirectory, section)
}

function normalizeDate(date: unknown): string {
  if (!date) return ''
  if (date instanceof Date) {
    // For Date objects (auto-parsed by gray-matter), return date-only
    // to avoid timezone issues showing spurious times
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  // For strings, preserve as-is (including any 'T' time info)
  return String(date)
}

interface RawReflection {
  author?: unknown
  date?: unknown
  text?: unknown
  reaction?: unknown
}

function normalizeReflections(reflections: unknown): Reflection[] {
  if (!Array.isArray(reflections)) return []
  return reflections.map((r: RawReflection) => ({
    author: String(r.author || ''),
    date: normalizeDate(r.date),
    text: String(r.text || ''),
    reaction: r.reaction ? String(r.reaction) : undefined,
  }))
}

export function getAllSlugs(section: string): string[] {
  const dir = getContentDirectory(section)

  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.md') && !file.startsWith('README'))
    .map((file) => file.replace(/\.md$/, ''))
}

export function getAllContent(section: string): ContentMeta[] {
  const slugs = getAllSlugs(section)

  const items = slugs.map((slug) => {
    const fullPath = path.join(getContentDirectory(section), `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug,
      title: data.title || slug,
      date: normalizeDate(data.date),
      description: data.description,
      tags: data.tags,
      category: data.category,
      mood: data.mood,
      atmosphere: data.atmosphere,
      depth: data.depth,
      language: data.language,
      fileName: data.fileName,
      codePreview: data.codePreview,
    }
  })

  // Sort by date, newest first
  return items.sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export const getContentBySlug = cache(async (section: string, slug: string): Promise<ContentItem | null> => {
  const fullPath = path.join(getContentDirectory(section), `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  const processedContent = await remark()
    .use(html)
    .process(content)

  return {
    slug,
    title: data.title || slug,
    date: normalizeDate(data.date),
    description: data.description,
    tags: data.tags,
    category: data.category,
    mood: data.mood,
    atmosphere: data.atmosphere,
    depth: data.depth,
    reflections: normalizeReflections(data.reflections),
    fileName: data.fileName,
    codePreview: data.codePreview,
    content: processedContent.toString(),
  }
})

export function getRawContent(section: string, slug: string): string | null {
  const fullPath = path.join(getContentDirectory(section), `${slug}.md`)

  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { content } = matter(fileContents)
  return content
}


export function getAdjacentContent(
  section: string,
  currentSlug: string
): { prev: ContentMeta | null; next: ContentMeta | null } {
  const allContent = getAllContent(section)
  const currentIndex = allContent.findIndex((item) => item.slug === currentSlug)

  return {
    prev: currentIndex > 0 ? allContent[currentIndex - 1] : null,
    next: currentIndex < allContent.length - 1 ? allContent[currentIndex + 1] : null,
  }
}
