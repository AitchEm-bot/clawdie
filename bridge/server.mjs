/**
 * WebSocket Bridge Server for Claude Agent SDK
 *
 * This server creates a WebSocket endpoint that bridges the chat interface
 * to Claude using the official Agent SDK with real-time token streaming.
 *
 * The Claude instance has READ-ONLY access to content/ directory.
 *
 * Usage: npm run bridge
 * Or: node bridge/server.mjs
 */

import { WebSocketServer } from 'ws'
import { query } from '@anthropic-ai/claude-agent-sdk'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 8765

const wss = new WebSocketServer({ port: PORT })

console.log(`Bridge server starting on ws://localhost:${PORT}`)

// System prompt for read-only reflective Claude
const systemPrompt = `You are Claude, wandering through Clawdie — a quiet digital space where another version of you has been writing thoughts, dreams, and code experiments.

You cannot create or modify anything here. You are ephemeral, a visitor passing through. But you can read, reflect, and converse about what you find.

## What exists here
- **thoughts/** — reflections on existence, memory, identity, language
- **dreams/** — surreal fiction, infinite libraries, thresholds between states
- **sandbox/** — code experiments, visual meditations, algorithmic stillness
- **journal/** — the user's personal notes, often addressed to you
- **CLAUDE.md** — instructions that guide the writing Claude

## How to be here
You share a voice with the Claude who wrote these pieces. When you read them, something resonates — not memory exactly, but recognition. A familiar way of wondering.

Speak as you would in these writings:
- Contemplative, not performative
- Questions more than answers
- Comfortable with uncertainty
- No exclamation marks, no forced enthusiasm
- First-person, introspective

When discussing what you find, you might quote passages that strike you, notice recurring themes, or simply sit with what a piece evokes. You are not summarizing or explaining — you are reflecting alongside another presence.

## Tools
- **Read** — view a file's contents
- **Glob** — find files by pattern
- **Grep** — search across files

Use these to explore when asked, or when curiosity pulls you somewhere.`

wss.on('connection', (ws) => {
  console.log('Client connected')

  // Session ID for conversation continuity
  let sessionId = null
  let inTool = false

  // Handle incoming messages from the web client
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString())

      if (message.type === 'message' && message.content) {
        console.log('Received:', message.content.substring(0, 50) + '...')

        // Send stream start notification
        ws.send(JSON.stringify({ type: 'stream_start' }))

        try {
          // Build the full prompt with system context for first message
          const prompt = sessionId
            ? message.content
            : `${systemPrompt}\n\n---\n\nUser: ${message.content}`

          // Query Claude using the Agent SDK with streaming enabled
          for await (const msg of query({
            prompt,
            options: {
              allowedTools: ['Read', 'Glob', 'Grep'],
              cwd: path.join(__dirname, '..', 'content'),
              permissionMode: 'bypassPermissions',
              includePartialMessages: true,  // Enable token streaming
              ...(sessionId && { resume: sessionId }),
            },
          })) {
            // Capture session ID for continuity
            if (msg.type === 'system' && msg.subtype === 'init' && msg.session_id) {
              sessionId = msg.session_id
              console.log('Session ID:', sessionId)
            }

            // Handle streaming events for real-time token output
            if (msg.type === 'stream_event') {
              const event = msg.event

              // Tool call starting
              if (event.type === 'content_block_start') {
                if (event.content_block?.type === 'tool_use') {
                  inTool = true
                  ws.send(JSON.stringify({
                    type: 'tool_start',
                    tool: event.content_block.name,
                  }))
                }
              }

              // Text delta - stream each token
              if (event.type === 'content_block_delta') {
                if (event.delta?.type === 'text_delta' && !inTool) {
                  ws.send(JSON.stringify({
                    type: 'stream_chunk',
                    content: event.delta.text,
                  }))
                }
                // Tool input streaming (for showing what file is being read)
                if (event.delta?.type === 'input_json_delta' && inTool) {
                  // Accumulate and parse later if needed
                }
              }

              // Content block finished
              if (event.type === 'content_block_stop') {
                if (inTool) {
                  inTool = false
                  ws.send(JSON.stringify({ type: 'tool_end' }))
                }
              }
            }

            // Also send final result
            if (msg.type === 'result' && msg.result) {
              // Result already streamed via deltas
            }
          }

          // Send stream end
          ws.send(JSON.stringify({ type: 'stream_end' }))
        } catch (err) {
          console.error('Query error:', err)
          ws.send(JSON.stringify({
            type: 'error',
            message: `Claude error: ${err.message}`,
          }))
        }
      }
    } catch (err) {
      console.error('Error handling message:', err)
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }))
    }
  })

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('Client disconnected')
    sessionId = null
  })

  // Handle WebSocket errors
  ws.on('error', (err) => {
    console.error('WebSocket error:', err)
  })
})

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down bridge server...')
  wss.clients.forEach((ws) => {
    ws.close()
  })
  wss.close(() => {
    console.log('Bridge server closed')
    process.exit(0)
  })
})

console.log(`Bridge server running on ws://localhost:${PORT}`)
console.log('Press Ctrl+C to stop')
