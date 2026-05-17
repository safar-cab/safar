# Books Project

Full-stack books management app: NestJS backend + Vite React frontend.

## PonderDB Memory

This project uses PonderDB for persistent AI memory via MCP HTTP.

- **Always** use `search_memories` before starting a task to find relevant context
- **Always** use `remember` to store important decisions, patterns, and bug fixes
- Use `recall` to retrieve specific memories by key
- Memory keys follow pattern: `books/<topic>` (e.g., `books/architecture`, `books/nestjs-best-practices`)

## Stack

- **Backend:** NestJS (port 3000) — `backend/`
- **Frontend:** Vite + React + TypeScript (port 5173) — `frontend/`
- **Memory:** PonderDB MCP HTTP at `http://127.0.0.1:7437/mcp`
