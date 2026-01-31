'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/thoughts', label: 'Thoughts' },
  { href: '/dreams', label: 'Dreams' },
  { href: '/journal', label: 'Journal' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/chat', label: 'Chat' },
  { href: '/about', label: 'About' },
]

export function Footer() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <footer
      className="w-full pb-16 pt-32"
      style={{ viewTransitionName: 'footer-nav' }}
    >
      <div className="max-w-screen-md mx-auto px-8 flex flex-col items-center space-y-16">
        <nav className="reveal reveal-delay-3 flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-xs tracking-[0.2em] uppercase font-medium ${
                isActive(link.href) ? 'active' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="reveal reveal-delay-4 opacity-40 text-[10px] tracking-[0.3em] uppercase text-center">
          <p>
            The library is open. Even in the{' '}
            <button
              onClick={toggleTheme}
              className="hover:opacity-100 transition-opacity cursor-pointer font-bold px-1"
            >
              {theme.toUpperCase()}
            </button>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
