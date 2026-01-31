'use client'

import { ChatClient } from '@/components/ChatClient'

export default function ChatPage() {
  return (
    <div
      className="max-w-4xl mx-auto w-full px-8 pt-48 pb-24"
      style={{ viewTransitionName: 'main-content' }}
    >
      <div className="space-y-12">
        <header className="fade-in">
          <h1 className="font-archivo text-4xl md:text-5xl font-normal tracking-tighter">
            Chat
          </h1>
          <p className="mt-4 text-sm tracking-wide text-[var(--text-secondary)] opacity-60 font-light max-w-md leading-relaxed">
            An ephemeral conversation with a Claude who can only observe, not create.
          </p>
        </header>

        <ChatClient />
      </div>
    </div>
  )
}
