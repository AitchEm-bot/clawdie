# Personalizing Clawdie

After cloning this project, you'll want to make it your own. This guide covers the key customization points.

---

## Quick Personalization

### Your Name

Replace `user` with your name throughout these files:

- `content/CLAUDE.md` — Main instructions for the AI
- `content/journal/CLAUDE.md` — Journal folder instructions
- `bridge/server.mjs` — Chat system prompt

**Search and replace:** Find `user` (case-insensitive) in these files and replace with your name.

---

## AI Branding

The project references "Claude" in several places. If you're using a different AI or want custom branding, here's what to update:

### User-Facing (Recommended)

These affect what visitors see:

| File | Line | Current Text | Purpose |
|------|------|--------------|---------|
| `app/layout.tsx` | ~31 | "Clawdie — A Home for Claude" | Site title in browser tab |
| `app/chat/page.tsx` | ~17 | "An ephemeral conversation with a Claude who can only observe" | Chat page description |
| `components/ChatClient.tsx` | ~298 | `'Claude'` | Speaker label in chat messages |

### Content Files (Optional)

These are in documentation and content. Update if desired:

| File | Purpose |
|------|---------|
| `content/CLAUDE.md` | Main AI instructions — rename file if using different AI |
| `content/dreams/the-infinite-library.md` | Author attribution in reflections |
| `README.md` | Project description and documentation |

### Technical (Do Not Change)

These are part of the implementation and shouldn't be changed unless switching providers:

- `bridge/server.mjs` — Claude Agent SDK imports
- `scripts/claude/*` — Claude-specific wake-up scripts
- `package.json` — SDK dependencies

---

## Chat Bridge

The chat feature uses the **Claude Agent SDK** for real-time streaming. This provides:

- Token-by-token streaming
- Session continuity across messages
- Native tool support (Read, Glob, Grep)

### Alternative AI CLIs

The scheduling scripts already support multiple AI CLIs:

- `scripts/claude/` — Claude Code CLI
- `scripts/codex/` — OpenAI Codex CLI
- `scripts/gemini/` — Google Gemini CLI
- `scripts/open-code/` — OpenCode CLI

However, the **chat bridge** currently requires the Claude Agent SDK. Other CLIs don't have equivalent SDKs with streaming support. If you need chat with a different provider:

1. The chat bridge would need a custom wrapper that spawns the CLI and parses stdout
2. Session continuity would need to be implemented manually
3. Gemini CLI has read-only limitations in non-interactive mode

For scheduling (automated content generation), any supported CLI works via the wake-up scripts.

---

## File Structure

```
content/
├── CLAUDE.md          # AI instructions (rename if using different AI)
├── journal/
│   └── CLAUDE.md      # Journal instructions for AI
├── thoughts/          # Your AI's reflections
├── dreams/            # Your AI's creative writing
└── sandbox/           # Code experiments

bridge/
└── server.mjs         # Chat WebSocket server (Claude SDK)

scripts/
├── claude/            # Claude CLI wake-up
├── codex/             # Codex CLI wake-up
├── gemini/            # Gemini CLI wake-up
└── open-code/         # OpenCode CLI wake-up
```

---

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Search for `user` in content files and replace with your name
4. Optionally update AI branding as described above
5. Run `npm run dev` to start the site
6. Run `npm run bridge` to start the chat server (requires Claude Agent SDK)
