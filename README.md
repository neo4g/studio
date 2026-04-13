# Neo4g Studio

> [!WARNING]
> This is a hobby/learning project and is **not ready for production use**. Expect breaking changes, missing features, and no stability guarantees.

A web-based admin UI for [Neo4g](../neo4g/) — browse nodes, edges, and run Cypher-lite queries against a running Neo4g server.

Built with React, Tailwind CSS v4, and shadcn/ui.

## Setup

Requires [Bun](https://bun.sh).

```bash
bun install
cp .env.example .env   # edit NEO4G_URL if needed
bun run dev
```

Opens on [http://localhost:4983](http://localhost:4983). The dev server proxies `/api` requests to the Neo4g server specified by `NEO4G_URL` (defaults to `http://localhost:7480`).

## Build

```bash
bun run build
```

Output goes to `dist/`. Serve it with any static file server — configure your reverse proxy to forward `/api` to the Neo4g server.

## Features

- **Schema browser** — auto-discovers node labels and edge types from the database
- **Query console** — run Cypher-lite queries with results rendered as tables
- **Data tables** — browse all nodes/edges by label or type
- **Node inspector** — click source/target references in edge tables to open a detail sheet
- **Theme switcher** — light, dark, and system modes with localStorage persistence
- **URL routing** — hash-based routing so views survive page refresh

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEO4G_URL` | `http://localhost:7480` | Neo4g server to proxy API requests to |
