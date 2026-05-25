# Blackbox AI Agent API

A REST API for creating, managing, and streaming AI agent tasks that work directly on GitHub repositories. Supports single-agent tasks, multi-agent parallel execution, real-time log streaming via SSE, and task continuation.

Built and maintained by **Harsh** and **Krishna**.

---

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Create a Task](#create-a-task)
  - [List Tasks](#list-tasks)
  - [Get Task Details](#get-task-details)
  - [Get Task Status](#get-task-status)
  - [Cancel a Task](#cancel-a-task)
  - [Continue a Task](#continue-a-task)
  - [Stream Task Logs](#stream-task-logs)
- [Agents & Models](#agents--models)
- [Multi-Agent Mode](#multi-agent-mode)
- [Error Codes](#error-codes)
- [Examples](#examples)

---

## Overview

The Blackbox AI Agent API lets you automate coding tasks on any GitHub repository using multiple AI agents. You describe what you want done in plain English, point the API at a repo and branch, and an AI agent clones the repo, makes the changes, and opens a pull request.

Key capabilities:
- **Single-agent tasks** — run one agent (Claude, Blackbox, Codex, Gemini, or Grok) on a repo
- **Multi-agent parallel execution** — run 2–5 agents simultaneously and compare their implementations
- **Real-time log streaming** — subscribe to live task logs via Server-Sent Events (SSE)
- **Task continuation** — send follow-up prompts to extend or refine completed tasks
- **Diff analysis** — automatically compare agent outputs and identify the best implementation

---

## Base URL

```
https://cloud.blackbox.ai/api
```

---

## Authentication

All requests require a Bearer token in the `Authorization` header.

```
Authorization: Bearer bb_xxxxxxxxxxxxxxxxxxxxxx
```

Get your API key from [cloud.blackbox.ai](https://cloud.blackbox.ai) → Profile → BLACKBOX API Token.

---

## Endpoints

### Create a Task

**`POST /tasks`**

Create and execute a task using one or multiple AI agents.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `prompt` | string | Yes | Task description or instruction for the AI agent |
| `repoUrl` | string | No | GitHub repository URL (e.g. `https://github.com/org/repo.git`) |
| `selectedBranch` | string | No | Branch to work on. Defaults to `main` |
| `selectedAgent` | string | No | Agent for single-agent mode: `claude`, `blackbox`, `codex`, `gemini`, `blackbox-grok`. Defaults to `blackbox` |
| `selectedModel` | string | No | Specific model for the agent. Defaults to `blackbox-pro` |
| `selectedAgents` | array | No | Agent configs for multi-agent mode (2–5 agents). Overrides `selectedAgent`/`selectedModel` |
| `installDependencies` | boolean | No | Run dependency installation before execution. Defaults to `false` |
| `maxDuration` | integer | No | Max execution time in seconds (30–600). Defaults to `300` |
| `keepAlive` | boolean | No | Keep sandbox alive after completion. Defaults to `false` |
| `environmentVariables` | string | No | Newline-separated `KEY=VALUE` pairs |
| `globalInstructions` | string | No | System-level instructions prepended to agent context |

**Example — single agent**

```bash
curl -X POST https://cloud.blackbox.ai/api/tasks \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add Stripe Payment Integration",
    "repoUrl": "https://github.com/my-org/my-repo.git",
    "selectedBranch": "main",
    "selectedAgent": "blackbox",
    "selectedModel": "blackbox-pro"
  }'
```

**Example — multi-agent**

```bash
curl -X POST https://cloud.blackbox.ai/api/tasks \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Refactor the authentication module to use JWT",
    "repoUrl": "https://github.com/my-org/my-repo.git",
    "selectedBranch": "main",
    "selectedAgents": [
      { "agent": "claude", "model": "blackboxai/anthropic/claude-sonnet-4.5" },
      { "agent": "blackbox", "model": "blackboxai/blackbox-pro" }
    ]
  }'
```

---

### List Tasks

**`GET /tasks`**

Retrieve a paginated list of tasks with optional filtering.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `limit` | integer | Tasks per page (1–100). Defaults to `50` |
| `offset` | integer | Tasks to skip for pagination. Defaults to `0` |
| `filter` | string | Filter by type: `all`, `tasks`, `batch`. Defaults to `all` |
| `status` | string | Filter by status group: `active`, `completed`, `failed`, `stopped` |

**Example**

```bash
curl "https://cloud.blackbox.ai/api/tasks?limit=10&status=active" \
  -H "Authorization: Bearer bb_your_token"
```

---

### Get Task Details

**`GET /tasks/{taskId}`**

Retrieve full details for a specific task including status, progress, logs, diff stats, and multi-agent execution results.

**Example**

```bash
curl "https://cloud.blackbox.ai/api/tasks/9qQe2F8Z_nXx9-eJA0BD6" \
  -H "Authorization: Bearer bb_your_token"
```

---

### Get Task Status

**`GET /tasks/{taskId}/status`**

Lightweight polling endpoint. Returns only essential status information — preferred over `GET /tasks/{taskId}` for frequent polling.

**Response fields**

| Field | Type | Description |
|---|---|---|
| `taskId` | string | Task identifier |
| `status` | string | One of: `pending`, `processing`, `saving`, `completed`, `error`, `stopped`, `timeout` |
| `progress` | integer | Completion percentage (0–100) |
| `inProgress` | boolean | `true` when status is `pending`, `processing`, or `saving` |
| `isDone` | boolean | `true` when status is `completed`, `error`, `stopped`, or `timeout` |
| `error` | string | Error message if failed, otherwise `null` |
| `duration` | string | e.g. `"900s"` once the task completes |

**Example**

```bash
curl "https://cloud.blackbox.ai/api/tasks/9qQe2F8Z_nXx9-eJA0BD6/status" \
  -H "Authorization: Bearer bb_your_token"
```

---

### Cancel a Task

**`PATCH /tasks/{taskId}`**

Stop a running task. Only tasks in `processing` or `saving` status can be cancelled.

**Request body**

```json
{ "action": "stop" }
```

**Example**

```bash
curl -X PATCH "https://cloud.blackbox.ai/api/tasks/9qQe2F8Z_nXx9-eJA0BD6" \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{ "action": "stop" }'
```

---

### Continue a Task

**`POST /tasks/{taskId}/continue`**

Send a follow-up prompt to an existing task. The agent picks up where it left off, with full context of prior work.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `currentPrompt` | string | Yes | Follow-up instruction |
| `selectedAgent` | string | No | Override agent for this follow-up |
| `selectedModel` | string | No | Override model for this follow-up |
| `maxDuration` | integer | No | Max execution time in seconds (30–600) |
| `keepAlive` | boolean | No | Keep sandbox alive after follow-up. Defaults to `false` |
| `installDependencies` | boolean | No | Run dependency install before follow-up. Defaults to `false` |
| `multiLaunch` | boolean | No | Run follow-up across multiple agents in parallel. Defaults to `false` |
| `selectedAgents` | array | No | Agent configs for multi-agent follow-up (required when `multiLaunch` is `true`) |

**Example**

```bash
curl -X POST "https://cloud.blackbox.ai/api/tasks/9qQe2F8Z_nXx9-eJA0BD6/continue" \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPrompt": "Also add unit tests for the new payment module"
  }'
```

---

### Stream Task Logs

**`GET /tasks/{taskId}/stream`**

Stream task execution logs in real-time using Server-Sent Events (SSE). Connect with `Accept: text/event-stream`.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `fromIndex` | integer | Start streaming from this log index (for reconnection). Defaults to `0` |
| `includeStatus` | boolean | Include periodic status updates every ~2 seconds. Defaults to `true` |

**Event types**

| Event | Description |
|---|---|
| `connected` | Stream started; includes `taskId` and `fromIndex` |
| `log` | Individual log entry with `index`, `type`, `message`, `agent`, `step` |
| `status` | Periodic status update (`status`, `error`) |
| `complete` | Stream finished (`status`, `totalLogs`, `message`) |
| `error` | Stream error (`error`, `details`) |

**Example**

```bash
curl -N "https://cloud.blackbox.ai/api/tasks/9qQe2F8Z_nXx9-eJA0BD6/stream" \
  -H "Authorization: Bearer bb_your_token" \
  -H "Accept: text/event-stream"
```

**Sample stream output**

```
event: connected
data: {"taskId":"9qQe2F8Z_nXx9-eJA0BD6","fromIndex":0,"message":"Connected to log stream"}

event: log
data: {"index":0,"log":{"type":"system","message":"Cloning repository...","agent":"claude","step":"git_cloning"}}

event: status
data: {"status":"processing","error":null}

event: complete
data: {"status":"completed","totalLogs":5,"message":"Task completed"}
```

---

## Agents & Models

| Agent | `selectedAgent` value | Available models |
|---|---|---|
| Claude (Anthropic) | `claude` | `claude-sonnet-4.5`, `claude-sonnet-4`, `claude-opus-4.5` |
| BLACKBOX | `blackbox` | `blackbox-pro`, `claude-sonnet-4.5`, `gpt-5.2-codex`, `claude-opus-4.5`, `grok-code-fast-1:free`, `gemini-2.5-pro` |
| Codex (OpenAI) | `codex` | `gpt-5.2-codex`, `gpt-5-codex`, `gpt-5-mini`, `gpt-5-nano`, `gpt-4.1` |
| Gemini (Google) | `gemini` | `gemini-2.0-flash-exp`, `gemini-2.5-pro`, `gemini-2.5-flash` |
| Grok (xAI) | `blackbox-grok` | `grok-code-fast-1:free` |

---

## Multi-Agent Mode

When `selectedAgents` is provided with 2–5 agent configs, all agents run **in parallel** on the same prompt and repository. Each agent works on its own branch. Once all agents finish, the API performs an AI-generated diff analysis and identifies the best implementation.

**Multi-agent response extras**

- `agentExecutions` — per-agent status, branch name, commits, files changed, lines added/removed
- `diffAnalysis.analysis` — markdown comparison of all implementations
- `diffAnalysis.bestAgent` — name of the agent with the best result
- `cumulativeDiff` — full git diff across all agents

---

## Error Codes

| HTTP Status | Meaning |
|---|---|
| `400` | Bad request — invalid parameters or request body |
| `401` | Unauthorized — missing or invalid API key |
| `402` | Payment required — insufficient credits |
| `403` | Forbidden — not a member of the selected team |
| `404` | Not found — task ID does not exist |
| `500` | Internal server error |
| `502` | Bad gateway — GitHub API error or upstream failure |

---

## Examples

### Poll until a task completes (shell)

```bash
TASK_ID="9qQe2F8Z_nXx9-eJA0BD6"
TOKEN="bb_your_token"

while true; do
  RESP=$(curl -s "https://cloud.blackbox.ai/api/tasks/$TASK_ID/status" \
    -H "Authorization: Bearer $TOKEN")
  STATUS=$(echo $RESP | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  echo "Status: $STATUS"
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "error" ] || [ "$STATUS" = "stopped" ]; then
    break
  fi
  sleep 5
done
```

### Create a task with environment variables

```bash
curl -X POST https://cloud.blackbox.ai/api/tasks \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Set up Stripe webhook handler",
    "repoUrl": "https://github.com/my-org/my-repo.git",
    "selectedAgent": "claude",
    "selectedModel": "claude-sonnet-4.5",
    "environmentVariables": "STRIPE_KEY=sk_test_xxx\nNODE_ENV=production",
    "installDependencies": true
  }'
```

### Multi-agent task with continuation

```bash
# Step 1: Launch multi-agent task
TASK=$(curl -s -X POST https://cloud.blackbox.ai/api/tasks \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Add Redis caching layer to the user service",
    "repoUrl": "https://github.com/my-org/my-repo.git",
    "selectedAgents": [
      { "agent": "claude", "model": "blackboxai/anthropic/claude-sonnet-4.5" },
      { "agent": "blackbox", "model": "blackboxai/blackbox-pro" },
      { "agent": "gemini", "model": "gemini-2.5-pro" }
    ]
  }')

TASK_ID=$(echo $TASK | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Step 2: After task completes, continue with a follow-up
curl -X POST "https://cloud.blackbox.ai/api/tasks/$TASK_ID/continue" \
  -H "Authorization: Bearer bb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPrompt": "Add integration tests for the Redis caching layer"
  }'
```

---

*API reference generated from `openai.yaml` (OpenAPI 3.1.0). For the full schema, see [cloud.blackbox.ai](https://cloud.blackbox.ai).*
