# AI Chatbot with Memory

A simple chatbot application that remembers conversation history. Built with NestJS backend and React frontend.

## Features

- Chat with AI (OpenAI GPT)
- Conversation history persistence
- Auto-generated conversation names
- Conversation summarization for long chats

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- OpenAI API key

## Running Locally

### 1. Start the database

```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Start the backend

```bash
cd backend
npm install
npm run start:dev
```

Create a `.env` file in the backend folder:

```
OPEN_AI_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=chatbot
DB_PASSWORD=chatbot123
DB_NAME=chatbot_db
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in the frontend folder:

```
VITE_API_URL=http://localhost:3000
```

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS
- **AI**: OpenAI API

