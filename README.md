# ChatSphere 🌐

A full-stack AI-powered chat application with real-time streaming responses, Google OAuth authentication, and persistent conversation history.

**[Live Demo →](https://chatsphere-alpha.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)

---

## Features

- **Real-time Streaming** — Token-by-token AI response rendering via Server-Sent Events (SSE)
- **Google OAuth** — Secure authentication powered by NextAuth.js
- **Persistent Chat History** — Conversations stored in MongoDB, available across sessions
- **Multi-conversation Management** — Create, switch, rename, and delete chat sessions
- **Markdown Rendering** — Code blocks, tables, lists, and inline formatting in AI responses
- **Dark / Light Theme** — System-aware theme toggle with smooth transitions
- **Copy to Clipboard** — One-click copy on any AI response
- **Responsive Design** — Optimized layout for desktop and mobile viewports
- **Collapsible Sidebar** — Maximize chat area when needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **AI** | Google Gemini 2.5 Flash |
| **Authentication** | NextAuth.js + Google OAuth 2.0 |
| **Database** | MongoDB Atlas + Mongoose |
| **Deployment** | Vercel |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Client (React)                     │
│  ┌─────────┐  ┌────────────┐  ┌───────────────────┐  │
│  │ Sidebar  │  │ ChatWindow │  │ ThemeProvider      │  │
│  │         │  │            │  │ SessionProvider    │  │
│  └─────────┘  └──────┬─────┘  └───────────────────┘  │
│                      │                                │
└──────────────────────┼────────────────────────────────┘
                       │ fetch (SSE stream)
┌──────────────────────┼────────────────────────────────┐
│              Next.js API Routes                       │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ /api/chat     │  │ /api/auth    │  │ /api/convs │  │
│  │ (streaming)   │  │ (NextAuth)   │  │ (CRUD)     │  │
│  └───────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
│          │                 │                │         │
└──────────┼─────────────────┼────────────────┼─────────┘
           │                 │                │
     ┌─────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐
     │ Gemini AI │   │ Google OAuth│  │  MongoDB    │
     │   API     │   │             │  │  Atlas      │
     └───────────┘   └─────────────┘  └─────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key ([Get one here](https://aistudio.google.com))
- MongoDB Atlas account ([Free tier](https://www.mongodb.com/cloud/atlas))
- Google OAuth credentials ([Cloud Console](https://console.cloud.google.com))

### Installation

```bash
git clone https://github.com/LinNEUdash/chatsphere.git
cd chatsphere
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/chatsphere

NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

The project is configured for one-click deployment on Vercel:

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth authentication endpoint
│   │   ├── chat/                # Gemini AI streaming endpoint
│   │   └── conversations/       # CRUD operations for chat sessions
│   ├── globals.css              # Global styles + Markdown theming
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main page with auth routing
├── components/
│   ├── ChatWindow.tsx           # Core chat interface with streaming
│   ├── MessageBubble.tsx        # Message display with Markdown
│   ├── Providers.tsx            # Session + Theme provider wrapper
│   └── Sidebar.tsx              # Navigation + conversation list
├── context/
│   └── ThemeContext.tsx          # Dark/light theme state management
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── gemini.ts                # Gemini AI client
│   ├── mongodb.ts               # Mongoose connection (app data)
│   └── mongodb-client.ts        # Native MongoDB client (NextAuth)
├── models/
│   └── Conversation.ts          # Mongoose schema for conversations
└── types/
    ├── index.ts                 # Application type definitions
    └── next-auth.d.ts           # NextAuth type extensions
```

---

## Key Implementation Details

### Streaming Responses

The chat API uses Server-Sent Events to deliver AI responses token by token. The Gemini SDK's `sendMessageStream()` method pipes chunks through a `ReadableStream`, which the client consumes via the Fetch API's reader interface. This provides a real-time typing effect without WebSocket overhead.

### Authentication Flow

NextAuth.js handles the OAuth 2.0 flow with Google as the identity provider. JWT-based sessions keep the architecture stateless on the server side, while the MongoDB adapter stores user accounts for persistence. Protected API routes validate sessions server-side using `getServerSession()`.

### Database Design

Conversations are stored as documents with embedded message arrays, optimized for the access pattern of loading an entire conversation at once. User-scoped queries ensure data isolation between accounts. Mongoose handles schema validation and connection pooling.

---

## License

MIT
