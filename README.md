# Genpact Visio

A **demo prototype** of a case management and AI agent orchestration portal built for Genpact. It showcases how human operators interact with AI agents to process business cases — covering deductions, collections, and orchestration workflows.

> **Note:** This is an evaluation prototype. The UI is not fit for production use.

---

## Overview

Genpact Visio is a single-page application that simulates an enterprise BPO portal where:

- Human operators manage and work assigned **cases** across multiple solutions (Cora Orchestration, Deduction, Collections).
- AI agents (Retriever, Signer, OCR, Writer, Comparer, Classifier) run autonomously and surface **human assist requests** when they get stuck.
- A built-in AI assistant (**Casey**) is available on every page to answer questions and take actions in context.

---

## Pages & Features

| Page | Description |
|---|---|
| **Work Feed** | Split-view solver for human-assist tasks — authenticate portals, compare invoices, review emails, sign documents. |
| **My Work (Cases)** | Paginated case list (Assigned + Queue tabs) with KPI metrics, filter/sort/group, column management, and a split-view mode. |
| **Agent Fleet** | Monitor all running AI agents, success rates, human assist frequency, and common failure reasons. Drill into any agent for queue details, capabilities, and activity log. |
| **Case Page** | Full case detail — accordion form sections, stage/status header, conversation composer, attachments panel, activity log, and a resizable utility sidebar. |
| **Casey AI Drawer** | Context-aware AI assistant that slides in from the right on every page. Supports multi-turn chat, suggested prompts, and work-feed–specific flows. |
| **Search** | Global case search drawer accessible from the sidebar. |
| **Notifications & Tasks** | Slide-out drawers for alerts and personal task lists. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Vanilla HTML5 |
| Styling | Vanilla CSS3 (CSS custom properties for theming, no preprocessor) |
| Logic | Vanilla JavaScript (ES6+, no framework, no bundler) |
| Icons | [Google Material Symbols](https://fonts.google.com/icons) |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Build | **None** — open `index.html` directly in a browser |

The entire app is self-contained: one HTML file, one CSS file, and five JS modules. No `npm install`, no build step, no server required.

---

## File Structure

```
.
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── work-feed.js
│   ├── case-page.js
│   ├── agent-fleet.js
│   └── deductions.js
├── assets/
│   └── wms_screenshot.png
└── COMPONENTS.md
```

| File | Description |
|---|---|
| `index.html` | App shell — sidebar, topbar, and all page containers |
| `css/styles.css` | All styles (~3,500 lines, scoped by CSS class prefixes) |
| `js/app.js` | Core logic: navigation, Casey AI drawer, shared utilities |
| `js/data.js` | All mock data (cases, agents, work feed tasks, conversations) |
| `js/work-feed.js` | Work Feed page: solver pane, task cards, Casey work-feed mode |
| `js/case-page.js` | Case detail page: sections, conversations, attachments, activity |
| `js/agent-fleet.js` | Agent Fleet table and agent detail drill-down view |
| `js/deductions.js` | Deduction solution–specific logic |
| `COMPONENTS.md` | Full component inventory (Atoms → Molecules → Organisms → Templates) |

---

## How to Use

### Running the prototype

1. Download or clone this repository.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. No server or installation needed — it runs entirely from the filesystem.

### Navigating the app

- Use the **sidebar icons** on the left to switch between Work Feed, Cases, Agent Fleet, and other sections.
- The **"CO" button** at the top of the sidebar switches between solutions (Cora Orchestration, Deduction, Collections).
- Click any **case row** to open the case detail page. Cases open as **tabs** in the topbar.
- Click **"AI"** in the top-right to open the **Casey** assistant drawer.
- In the **Work Feed**, select a case card to load the solver pane and step through human-assist tasks.
- In **Agent Fleet**, click any agent row to open its detail view with queue, capabilities, and activity timeline.

### Toolbar controls (Cases / Agent Fleet / Work Feed)

Each list page has a toolbar with:

- **Filter** — add field-level filters with operators
- **Sort** — multi-column sort with asc/desc
- **Group by** — group rows by any field
- **Columns** — show/hide and reorder columns
- **Display** — row density (Default / Compact / Spacious)
- **View picker** — save and switch named views

---

## Component Reference

See [`COMPONENTS.md`](COMPONENTS.md) for a full inventory of every UI component — organized as Atoms → Molecules → Organisms → Templates — with CSS class names, line references, usage counts, and Storybook story suggestions.

---

# MIT License

Copyright (c) 2026 KIDO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
