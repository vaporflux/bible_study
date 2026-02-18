# Bible Study Agent

An AI-powered Bible study assistant built with Next.js and the OpenAI Agents SDK. Grounded in Reformed theology with insights from John MacArthur, R.C. Sproul, and archaeological expertise from Wes Huff.

## Features

- **Reformed Theological Perspective** — Aligned with 5-point Calvinism and the teachings of MacArthur and Sproul
- **Hermeneutic Analysis** — Every verse is analyzed with historical context, literary genre, symbolic elements, and interpretive assumptions
- **Eschatological Insight** — Evaluates themes of ultimate destiny, final judgment, and end-time expectations
- **Archaeological Context** — Incorporates archaeological evidence and expertise
- **Web Search** — Real-time web search for additional scholarly sources
- **Conversational** — Multi-turn chat with full conversation history

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bible-study-agent.git
   cd bible-study-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your OpenAI API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your OPENAI_API_KEY
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the `OPENAI_API_KEY` environment variable in Vercel's project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bible-study-agent&env=OPENAI_API_KEY&envDescription=Your%20OpenAI%20API%20key&project-name=bible-study-agent)

## Tech Stack

- **Next.js 14** — React framework with App Router
- **OpenAI Agents SDK** — AI agent with web search tool
- **Tailwind CSS** — Utility-first styling
- **React Markdown** — Rendered markdown responses
- **Vercel** — Deployment platform
