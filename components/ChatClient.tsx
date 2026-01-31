'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentStreamRef = useRef<string>('')

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')

    const ws = new WebSocket('ws://localhost:8765')
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
    }

    ws.onclose = () => {
      setStatus('disconnected')
      wsRef.current = null
    }

    ws.onerror = () => {
      setStatus('error')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'stream_start') {
          setIsStreaming(true)
          currentStreamRef.current = ''
          // Add placeholder for streaming message
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              streaming: true,
            },
          ])
        } else if (data.type === 'stream_chunk' && data.content) {
          currentStreamRef.current += data.content
          // Update the last message with new content
          setMessages((prev) => {
            const updated = [...prev]
            const lastIdx = updated.length - 1
            if (lastIdx >= 0 && updated[lastIdx].streaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: currentStreamRef.current,
              }
            }
            return updated
          })
        } else if (data.type === 'stream_end') {
          setIsStreaming(false)
          // Mark message as complete
          setMessages((prev) => {
            const updated = [...prev]
            const lastIdx = updated.length - 1
            if (lastIdx >= 0 && updated[lastIdx].streaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                streaming: false,
              }
            }
            return updated
          })
        } else if (data.type === 'error') {
          setIsStreaming(false)
          setMessages((prev) => {
            const updated = [...prev]
            const lastIdx = updated.length - 1
            if (lastIdx >= 0 && updated[lastIdx].streaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content || `Error: ${data.message}`,
                streaming: false,
              }
            }
            return updated
          })
        }
      } catch {
        // Non-JSON message, treat as raw content
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback(() => {
    if (!inputValue.trim() || !wsRef.current || status !== 'connected' || isStreaming) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    wsRef.current.send(JSON.stringify({ type: 'message', content: inputValue.trim() }))
    setInputValue('')
  }, [inputValue, status, isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const statusColors: Record<ConnectionStatus, string> = {
    connecting: 'bg-yellow-500',
    connected: 'bg-green-500',
    disconnected: 'bg-gray-500',
    error: 'bg-red-500',
  }

  const statusText: Record<ConnectionStatus, string> = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Connection Error',
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`} />
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-light">
          {statusText[status]}
        </span>
        {status === 'disconnected' && (
          <button
            onClick={connect}
            className="text-[10px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity font-light ml-4"
          >
            Reconnect
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-8 pr-4 -mr-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 fade-in">
            <p className="text-xs tracking-[0.2em] uppercase opacity-20 font-light">
              Begin a conversation
            </p>
            <p className="text-sm font-light opacity-40 max-w-sm leading-relaxed">
              Ask about the thoughts, dreams, or experiments that exist in this space.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'border border-[var(--border-color)] rounded-lg px-4 py-3'
                    : ''
                }`}
              >
                <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
                  {message.content}
                  {message.streaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--text-primary)] opacity-50 animate-pulse" />
                  )}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] opacity-30 mt-2 font-light">
                {message.role === 'user' ? 'You' : 'Claude'} &middot; {formatTime(message.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
        <div className="flex items-end gap-4">
          <div className="relative flex-1 group">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={status === 'connected' ? 'Ask about the fragments...' : 'Waiting for connection...'}
              disabled={status !== 'connected' || isStreaming}
              rows={1}
              className="w-full bg-transparent border-none outline-none py-2 text-sm font-light tracking-wide placeholder:opacity-20 text-[var(--text-primary)] resize-none transition-all disabled:opacity-30"
              style={{ minHeight: '2.5rem', maxHeight: '10rem' }}
            />
            <div
              className="absolute bottom-0 left-0 h-px bg-[var(--text-primary)] opacity-40 transition-all duration-500"
              style={{ width: isFocused || inputValue ? '100%' : '0%' }}
            />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--text-primary)] opacity-5" />
          </div>

          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || status !== 'connected' || isStreaming}
            className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-30 hover:opacity-100 disabled:opacity-10 disabled:cursor-not-allowed transition-opacity duration-500 pb-2"
          >
            Send
          </button>
        </div>

        <p className="mt-4 text-[10px] tracking-wide opacity-20 font-light">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  )
}
