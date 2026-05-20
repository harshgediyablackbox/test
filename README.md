# Blackbox AI Agent API

A REST API for creating, managing, and streaming AI agent tasks that work on GitHub repositories. Supports single-agent tasks, multi-agent parallel execution, real-time log streaming, and task continuation.

## Base URL

```
https://cloud.blackbox.ai/api
```

## Authentication

All requests require a Bearer token in the `Authorization` header:

```
Authorization: Bearer bb_xxxxxxxxxxxxxxxxxxxxxx
```

Obtain your API token from [cloud.blackbox.ai](https://cloud.blackbox.ai) → Profile → BLACKBOX API Token.

---

## Endpoints

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/tasks` | Create a new agent task |
| `GET` | `/tasks` | List tasks (paginated) |
| `GET` | `/tasks/{taskId}` | Get full task details |
| `PATCH` | `/tasks/{taskId}` | Cancel a running task |
| `GET` | `/tasks/{taskId}/status` | Poll task progress (lightweight) |
| `POST` | `/tasks/{taskId}/continue` | Send a follow-up prompt |

### Streaming

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks/{taskId}/stream` | Stream task logs via SSE |

---

## Quick Start

### Single-Agent Task

```bash
curl -X POST https://cloud.blackbox.ai/api/tasks \
  -H "Authorization: Bearer $BLACKBOX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add Stripe Payment Integration",
    "repoUrl": "https://github.com/my-org/my-repo.git",
    "selectedBranch": "main",
    "selectedAgent": "blackbox",
    "selectedModel": "blackbox-pro"
  }'
```

### Multi-Agent Parallel Task

```bash
curl -X POST https://cloud.blackbox.ai/api/tasks \
  -H "Authorization: Bearer $BLACKBOX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add README in Mandarin",
    "repoUrl": "https://github.com/my-org/my-repo.git",
    "selectedBranch": "main",
    "selectedAgents": [
      { "agent": "claude", "model": "blackboxai/anthropic/claude-sonnet-4.5" },
      { "agent": "blackbox", "model": "blackboxai/blackbox-pro" }
    ]
  }'
```

---

## Supported Agents & Models

| Agent | Model IDs |
|-------|-----------|
| `blackbox` | `blackbox-pro`, `claude-sonnet-4.5`, `gpt-5.2-codex`, `claude-opus-4.5`, `grok-code-fast-1:free`, `gemini-2.5-pro` |
| `claude` | `claude-sonnet-4.5`, `claude-sonnet-4`, `claude-opus-4.5` |
| `codex` | `gpt-5.2-codex`, `gpt-5-codex`, `gpt-5-mini`, `gpt-5-nano`, `gpt-4.1` |
| `gemini` | `gemini-2.0-flash-exp`, `gemini-2.5-pro`, `gemini-2.5-flash` |
| `blackbox-grok` | `grok-code-fast-1:free` |

---

## Task Lifecycle

```
pending → processing → saving → completed
                              ↘ error
                              ↘ stopped
                              ↘ timeout
```

Poll `/tasks/{taskId}/status` for lightweight progress updates, or stream logs in real-time via `/tasks/{taskId}/stream`.

---

## Real-Time Streaming (SSE)

```bash
curl -N -H "Authorization: Bearer $BLACKBOX_API_KEY" \
  "https://cloud.blackbox.ai/api/tasks/{taskId}/stream"
```

Event types:

| Event | Description |
|-------|-------------|
| `connected` | Stream started |
| `log` | Individual log entry with agent, step, and message |
| `status` | Periodic status update (every ~2 seconds) |
| `complete` | Stream finished |
| `error` | Stream error |

---

## Continue a Task

Send a follow-up prompt to an existing task. The agent picks up from where it left off.

```bash
curl -X POST https://cloud.blackbox.ai/api/tasks/{taskId}/continue \
  -H "Authorization: Bearer $BLACKBOX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPrompt": "Also add unit tests for the new payment module"
  }'
```

---

## OpenAPI Spec

The full OpenAPI 3.1.0 specification is available in [`openai.yaml`](./openai.yaml).

---

## Links

- Dashboard: [cloud.blackbox.ai](https://cloud.blackbox.ai)
- API Reference: [cloud.blackbox.ai/api](https://cloud.blackbox.ai/api)
