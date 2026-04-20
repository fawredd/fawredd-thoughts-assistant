# Fawredd Thoughts Assistant

An AI-powered journaling companion designed for longitudinal memory and reflective coaching. Fawredd Thoughts helps users capture their daily thoughts, while an AI "State Architect" maintains a compressed "Life Snapshot" to track goals, problems, and social circles over time.

## 🚀 Features

- **Deep Journaling**: A peaceful interface for capturing thoughts and reflections.
- **AI Psychologist Insight**: Real-time reflective coaching and deep insights based on your entries.
- **Life Snapshot**: An automated summary of your current life state, including objectives, psychological profile, and social circle.
- **Secure & Encrypted**: All journal entries and AI-generated insights are encrypted at rest in the database.
- **Longitudinal Memory**: The AI maintains context across multiple entries to provide more relevant coaching.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Neon](https://neon.tech/) (PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **AI Engine**: [Vercel AI SDK](https://sdk.vercel.ai/) with Google Gemini Models
- **Styling**: Tailwind CSS & Shadcn UI
- **Deployment**: Vercel

## 🏗 Architecture

The application follows a specialized AI pipeline:
1. **User Input**: User submits a journal entry.
2. **State Architect**: A dedicated agent (Gemini) updates the user's "Life Snapshot" JSON based on the new entry and previous state.
3. **Psychologist Agent**: Another agent provides a reflective response using the updated snapshot for deep context.
4. **Encryption Layer**: Data is encrypted before being stored in the database to ensure privacy.

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
