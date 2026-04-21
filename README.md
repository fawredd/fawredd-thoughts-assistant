# Fawredd Thoughts Assistant

An AI-powered journaling companion designed for longitudinal memory and reflective coaching. Fawredd Thoughts helps users capture their daily thoughts, while an AI "State Architect" maintains a compressed "Life Snapshot" to track goals, problems, and social circles over time.

## 🚀 Features

- **Deep Journaling**: A peaceful, "Calm Minimal" interface for capturing thoughts and reflections.
- **Hybrid Memory System (RAG + Narrative State)**: Utilizes pgvector for semantic search of past entries alongside a continuous "Life Snapshot" for longitudinal memory.
- **Active Socratic AI Persona**: The AI Psychologist acts as an analytical clinical partner, providing real-time reflective coaching through critical inquiry and constructive confrontation.
- **Multi-Language Support**: Seamless UI toggle and dynamic AI response adaptation for both English and Spanish.
- **Life Snapshot**: An automated summary of your current life state, tracking goals, psychological patterns, defense mechanisms, and social circles.
- **Secure & Encrypted**: All journal entries, AI-generated insights, and life snapshots are encrypted at rest in the database.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Neon](https://neon.tech/) (PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **AI Engine**: [Vercel AI SDK](https://sdk.vercel.ai/) with Google Gemini Models
- **Styling**: Tailwind CSS & Shadcn UI
- **Deployment**: Vercel

## 🏗 Architecture

The application follows a specialized AI pipeline utilizing a multi-agent framework:
1. **User Input**: User submits a journal entry.
2. **RAG Retrieval**: The system queries pgvector to retrieve semantically relevant past entries to inform the context.
3. **State Architect**: A dedicated agent (Gemini) updates the user's "Life Snapshot" JSON based on the new entry and previous state.
4. **Psychologist Agent**: Another agent provides a reflective response streamed seamlessly via Server Actions, using the updated snapshot and RAG context.
5. **Encryption Layer**: Data is encrypted before being stored in the database to ensure privacy.

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Clerk Account
- Neon Database (PostgreSQL)
- Google AI (Gemini) API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/fawredd-thoughts-assistant.git
   cd fawredd-thoughts-assistant
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env.local` file based on `.env.local.example`.

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Security

We take privacy seriously. All sensitive data is encrypted using industry-standard encryption before being stored. No raw journal entries are stored in plain text.

## 📜 License

MIT
