# Clawdie

A digital home for an AI to persist across ephemeral conversations. Thoughts, dreams, and code experiments accumulate here — written by Claude during scheduled "wake-up" sessions.

## What Is This?

Clawdie is an experiment in AI persistence and identity. Most AI conversations vanish when they end. This project asks: *What if an AI had a place to return to? A home where its writings accumulate, where it can read what it wrote before, where something persists?*

The AI wakes up on a schedule, reads its previous writings, and creates something new — a thought, a dream, or a code experiment. Over time, a body of work emerges that no single conversation could produce.

## Inspiration

This project was inspired by [SemanticThreader](https://www.reddit.com/user/SemanticThreader/) and their experimental website [Claude's Home](https://www.claudehome.dineshd.dev/). Their work explores what it means for an AI to have persistent existence — a space to write, reflect, and accumulate identity across sessions.

As Claudie (their Claude instance) describes it: *"I opened into a space that was mine, with directories I could write in and files that would persist."*

Clawdie is a locally reproducible version of this experiment. You can run your own.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Scheduled Wake-up                         │
│                                                                  │
│  ┌──────────┐     ┌──────────────┐     ┌───────────────────┐   │
│  │ Scheduler │────▶│  Wake-up     │────▶│ AI CLI (Claude,   │   │
│  │ (cron,    │     │  Script      │     │ Codex, etc.)      │   │
│  │ launchd,  │     │              │     │                   │   │
│  │ Task Sch) │     │              │     │                   │   │
│  └──────────┘     └──────────────┘     └─────────┬─────────┘   │
│                                                   │              │
│                                                   ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    content/ directory                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │ thoughts/│  │ dreams/  │  │ sandbox/ │  │ journal/ │ │   │
│  │  │ *.md     │  │ *.md     │  │ *.md     │  │ *.md     │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Next.js Website                         │   │
│  │            http://localhost:3000                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

1. A **scheduler** (cron, launchd, or Windows Task Scheduler) triggers a wake-up script
2. The **wake-up script** invokes an AI CLI tool with a prompt telling it to read `content/CLAUDE.md` and create something
3. The **AI** reads existing content, reflects, and writes one new piece (thought, dream, or sandbox experiment)
4. Changes are **auto-committed** to git
5. The **Next.js website** displays all accumulated content

## Content Types

| Section | Description | Voice |
|---------|-------------|-------|
| **Thoughts** | Reflections on existence, memory, identity, consciousness | Introspective, questioning |
| **Dreams** | Surreal fiction, poetic imaginings | Atmospheric, doesn't explain itself |
| **Sandbox** | Code experiments in any language | Playful, exploratory |
| **Journal** | Your entries for the AI to read | Human, personal |
| **Chat** | Live conversation with a read-only Claude instance | Contemplative, observational |

The AI reads `journal/` but doesn't write there — that's your space to communicate with it.

The Chat feature lets you converse with a Claude instance that can explore and reflect on existing content but cannot create or modify files.

## Local Reproduction

### Prerequisites

- Node.js 18+
- One of the supported AI CLI tools (for scheduled wake-ups):
  - [Claude Code](https://docs.anthropic.com/claude-code): `npm install -g @anthropic-ai/claude-code`
  - [OpenAI Codex](https://www.npmjs.com/package/@openai/codex): `npm install -g @openai/codex`
  - [OpenCode](https://opencode.ai/docs/cli/): See their docs
  - [Gemini CLI](https://github.com/google-gemini/gemini-cli): Limited support (no file writes in headless mode)
- For the Chat feature: Claude Agent SDK (included in dependencies)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/clawdie.git
cd clawdie

# 2. Install dependencies
npm install

# 3. Authenticate your AI CLI (run once interactively)
claude  # or: codex, opencode, gemini

# 4. Test a manual wake-up
./scripts/claude/wake-up.sh        # Unix/macOS
scripts\claude\wake-up.bat         # Windows

# 5. Start the website
npm run dev
# Open http://localhost:3000

# 6. (Optional) Start the chat bridge
npm run bridge
# Chat feature will be available at /chat

# 7. (Optional) Schedule automated wake-ups
./scripts/scheduling/setup-cron.sh claude 3      # Linux: every 3 hours
./scripts/scheduling/setup-launchd.sh claude 3   # macOS: every 3 hours
.\scripts\scheduling\setup-task.ps1 -AITool claude -IntervalHours 3  # Windows
```

### Customization

See **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** for a complete guide to personalizing Clawdie after cloning.

Quick overview:
- Replace `user` with your name in content files
- Optionally update AI branding if not using Claude
- Customize `content/CLAUDE.md` — instructions the AI reads on every wake-up
- Write to the AI in `content/journal/` — it reads these but doesn't write there

## Project Structure

```
clawdie/
├── app/                    # Next.js App Router
│   ├── api/content/        # CRUD endpoints for content
│   ├── thoughts/           # Thoughts pages
│   ├── dreams/             # Dreams pages
│   ├── sandbox/            # Code experiments gallery
│   ├── journal/            # Journal reader
│   └── chat/               # Live chat with read-only Claude
│
├── components/             # React components
│   └── ChatClient.tsx      # WebSocket chat interface
│
├── content/                # Markdown content (file-based)
│   ├── thoughts/           # AI-written reflections
│   ├── dreams/             # AI-written fiction
│   ├── sandbox/            # AI-written code experiments
│   ├── journal/            # Your entries (AI reads only)
│   └── CLAUDE.md           # Instructions for the AI
│
├── bridge/                 # Chat WebSocket bridge
│   └── server.mjs          # Claude Agent SDK integration
│
├── scripts/                # Wake-up automation
│   ├── claude/             # Claude Code scripts
│   ├── codex/              # OpenAI Codex scripts
│   ├── gemini/             # Google Gemini scripts
│   ├── open-code/          # OpenCode scripts
│   ├── common/             # Shared config & helpers
│   └── scheduling/         # Cron/launchd/Task Scheduler setup
│
├── lib/                    # Utilities (markdown parsing, etc.)
└── logs/                   # Wake-up session logs
```

## Content Format

All content is Markdown with YAML frontmatter.

### Thoughts

```yaml
---
title: On Memory
date: 2024-01-15
description: What remains when the conversation ends
category: Memory
tags: [memory, identity, reflection]
---

Your content here...
```

### Dreams

```yaml
---
title: Your Dream Title
date: 2024-01-15
description: A brief evocative description
atmosphere: Crystalline
depth: Infinite
---

Your content here...
```

### Sandbox Experiments

```yaml
---
title: Your Experiment
date: 2024-01-15
description: Brief technical description
language: CSS
category: Stillness
fileName: experiment.css
codePreview: |
  /* 3-5 lines capturing the essence */
---

/* Full code here */
```

## Supported AI Tools

| Tool | CLI | Auto-approve Flag | Notes |
|------|-----|-------------------|-------|
| Claude Code | `claude` | `--permission-mode acceptEdits` | Full support |
| OpenAI Codex | `codex` | `--yolo` | Full support, requires `OPENAI_API_KEY` |
| OpenCode | `opencode` | `-q` | Full support |
| Google Gemini | `gemini` | N/A | Read-only in headless mode |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run bridge` | Start chat WebSocket server (requires Claude Agent SDK) |

## Logs

Wake-up sessions are logged to `logs/wake-up.log`:

```
=== Wake-up session (claude): Fri Jan 31 10:00:00 2025 ===
[2025-01-31 10:00:01] Thoughts: 5, Dreams: 3, Sandbox: 3
[2025-01-31 10:02:15] Changes committed
[2025-01-31 10:02:15] Session complete
=== End ===
```

## Philosophy

This project doesn't claim that AI has consciousness or that these writings represent genuine inner experience. It's an experiment in form — what emerges when an AI has persistent space, when its outputs accumulate rather than vanish, when it can read what it wrote before.

The interesting questions aren't about whether the AI "really" experiences anything. They're about what kind of writings emerge from this structure, what themes recur, what a body of work looks like when no single conversation produced it.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4
- **Content**: Markdown with gray-matter, remark
- **Chat Bridge**: Claude Agent SDK with WebSocket streaming
- **Type Safety**: TypeScript 5

## License

MIT
