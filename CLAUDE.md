# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test

```bash
npm run dev:local        # Run MCP server in development mode (tsx, no build needed)
npm run build            # Compile local + cloudflare + vite apps
npm run build:local      # Local mode only (use when Cloudflare types fail)
npm test                 # Jest test suite
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Jest with coverage report
npm run format           # Biome auto-format
npm run lint:fix         # Biome lint + auto-fix
npx tsc --noEmit         # Type-check (pre-existing errors in src/apps/*/ui/mcp-app.ts are expected)
```

## Release Process

Before any release, read `.notes/RELEASING.md` and follow all five phases. Run `scripts/release.sh` for automated version/count updates before manual content edits.

## Known Issues

- **Cloudflare build type error**: `src/index.ts` line ~54 Env type mismatch is pre-existing on main. Does not affect runtime.
- **npm publish**: Use `npm publish --ignore-scripts` if prepublishOnly triggers a build failure.
- **Pre-existing tsc errors**: `src/apps/*/ui/mcp-app.ts` DOM type errors are expected (separate tsconfig files).

## Architecture

Two codebases live in this repo:

### 1. MCP Server (`src/`)

- Entry points: `src/local.ts` (local/NPX mode, stdio transport), `src/index.ts` (Cloudflare Workers, SSE transport)
- Tool registration: `registerXxxTools(server, getFigmaAPI, ...)` pattern in `src/tools/`
- Desktop Bridge: WebSocket on ports 9223–9232 (`src/core/websocket-server.ts`) — the Figma plugin (`figma-desktop-bridge/`) connects here and executes Plugin API commands
- Schema compatibility: No `z.any()` — Gemini requires strictly typed Zod schemas
- All 57+ tools route through WebSocket in local mode; remote mode uses REST API only (~22 tools)

### 2. Portal UI (`artifact/index.html`)

A **single-file** vanilla HTML/CSS/JS work-management portal (no build step, no dependencies). Open directly in a browser. All styles, markup, and JS are inline.

**Layout structure:**
```
body (grid: sidebar 48px | main)
  sidebar          — icon nav, dark bg
  main
    topbar          — browser-like case tabs (36px)
    portal-body     — zero padding wrapper
      portal-content  — My Work view (padding: 16px 20px)
        .header       — solution name + segmented filters + actions
        .metrics-row  — KPI cards (collapsible)
        .portal-content-area
          .toolbar    — filter bar, view button, column controls
          .table-wrapper → <table>
      #case-page      — full-height case view (hidden when not active)
        .case-header  — sticky 52px bar; hover reveals nav tabs overlay
        .case-body
          .case-form-area  — accordion sections with field grids
          .utility-sidebar — 44px icon strip + 300px slide-in panel
```

**Key JS patterns:**
- `assignedData` / `queueData` — row data arrays; IDs use `'# 100002'` format
- `sectionTabs`, `sectionActiveTab`, `activeSection` — tab state per section
- `selectTab(id)` / `openCaseTab(id)` — switch between home and case pages; toggles `hidden` on `#portal-content` vs `#case-page`
- `renderCasePage(caseId)` — populates all case header fields and resets utility panel
- `toggleUtility(util)` / `closeUtility()` — opens/closes the 300px utility panel by toggling `.open` on `#utility-panel`
- `filterFields`, `sortRules`, `activeViewId`, `isViewModified()` — view/filter state
- `colWidths`, `applyColWidths()`, `startColResize()` — column resize

**CSS variable tokens (defined in `:root`):**
`--bg-dark` (#1a1a1a), `--bg-sidebar` (#474747), `--bg-white`, `--bg-light` (#f6f6f6), `--text-primary` (#1a1a1a), `--text-secondary` (#474747), `--text-muted` (#7a7a7a), `--border` (#e0e0e0), `--border-light` (#eeeeee), `--hover-row` (#fafafa)
