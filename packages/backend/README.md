# Sao Do Assistant Backend

Unified backend for the student assistant system.

## What it does

- serves bootstrap data for the app
- stores demo conversations and student data on disk under `packages/backend/data`
- exposes chat, schedule, and document endpoints
- uses one shared KRouter configuration for both school surfaces by default, with optional override bridges if explicitly configured

## Run

```bash
cd packages/backend
npm run dev
```

Default port:

```text
9191
```

Health check:

```text
http://localhost:9191/api/health
```

Run tests:

```bash
cd packages/backend
node --test --test-isolation=none
```

## Connect to NemoClaw / OpenClaw

The backend defaults to `SAODO_AGENT_MODE=krouter`, so both school surfaces call the same KRouter configuration unless you explicitly override the mode.

If you set `SAODO_AGENT_MODE=auto`, the backend tries these assistant runtimes in order:

1. `KROUTER_API_KEY` - calls the shared KRouter chat completion endpoint. Default model: `cx/gpt-5.4`.
2. `NEMOCLAW_API_URL` - HTTP adapter for a gateway or custom bridge exposing `POST /chat`.
3. `NEMOCLAW_SANDBOX_NAME` - runs `openclaw agent` inside an OpenShell sandbox with `openshell sandbox exec`.
4. `SAODO_AGENT_MODE=openclaw-cli` - runs the local `openclaw agent` CLI.
5. `NVIDIA_API_KEY` - calls NVIDIA NIM chat completions. Default model: `deepseek-ai/deepseek-v4-pro`.
6. `XAI_API_KEY` - calls xAI chat completions. Default model: `grok-4.20`.
7. `OPENROUTER_API_KEY` - calls OpenRouter chat completions. Default model: `google/gemma-4-26b-a4b-it:free`.
8. `OPENAI_API_KEY` - calls an OpenAI-compatible chat completions endpoint.
9. Local fallback - deterministic Vietnamese replies from the app catalog.

Shared KRouter default:

```bash
$env:SAODO_AGENT_MODE="krouter"
$env:KROUTER_API_KEY="your-krouter-key"
$env:KROUTER_MODEL="cx/gpt-5.4"
$env:CORS_ALLOW_ORIGIN="http://localhost:3000"
npm run dev
```

HTTP bridge:

```bash
$env:NEMOCLAW_API_URL="http://localhost:8718"
$env:NEMOCLAW_BEARER_TOKEN="your-token-if-needed"
$env:CORS_ALLOW_ORIGIN="http://localhost:3000"
npm run dev
```

OpenShell sandbox bridge:

```bash
$env:NEMOCLAW_SANDBOX_NAME="my-assistant"
$env:OPENCLAW_AGENT="main"
$env:CORS_ALLOW_ORIGIN="http://localhost:3000"
npm run dev
```

Local OpenClaw CLI bridge:

```bash
$env:SAODO_AGENT_MODE="openclaw-cli"
$env:OPENCLAW_AGENT="main"
npm run dev
```

NVIDIA-hosted DeepSeek bridge:

```bash
$env:NVIDIA_API_KEY="your-nvidia-api-key"
$env:NVIDIA_MODEL="deepseek-ai/deepseek-v4-pro"
$env:CORS_ALLOW_ORIGIN="http://localhost:3000"
npm run dev
```

OpenRouter bridge:

```bash
$env:OPENROUTER_API_KEY="your-openrouter-key"
$env:OPENROUTER_MODEL="google/gemma-4-26b-a4b-it:free"
$env:CORS_ALLOW_ORIGIN="http://localhost:3000"
npm run dev
```

OpenAI-compatible bridge:

```bash
$env:OPENAI_API_KEY="your-openai-api-key"
$env:OPENAI_MODEL="gpt-4o-mini"
$env:CORS_ALLOW_ORIGIN="http://localhost:3000"
npm run dev
```

Docker demo with OpenRouter:

```bash
$env:OPENROUTER_API_KEY="your-openrouter-key"
$env:OPENROUTER_MODEL="google/gemma-4-26b-a4b-it:free"
docker compose -f ../../docker-compose.saodo.yml up --build
```

Docker demo with NVIDIA:

```bash
$env:NVIDIA_API_KEY="your-nvidia-api-key"
$env:NVIDIA_MODEL="deepseek-ai/deepseek-v4-pro"
docker compose -f ../../docker-compose.saodo.yml up --build
```

If no agent runtime is configured, the backend falls back to local demo responses.
If `CORS_ALLOW_ORIGIN` is not set, the backend defaults to `*`.

Check the active runtime:

```text
http://localhost:9191/api/health
```

## Express backend foundation

The production-oriented Express scaffold lives beside the legacy demo server.

Run it with:

```bash
cd packages/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev:express
```

The Express entrypoints are:

- `src/app.js` - Express app factory.
- `src/server.js` - HTTP server bootstrap.
- `src/routes/auth.routes.js` - Auth routes.
- `src/controllers/auth.controller.js` - Auth controllers.
- `src/services/auth.service.js` - Auth business logic.
- `src/repositories/prisma-auth.repository.js` - Prisma persistence adapter.

Auth endpoints currently implemented:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
PUT  /api/auth/change-password
```

The legacy demo server remains available through:

```bash
npm run dev
```
