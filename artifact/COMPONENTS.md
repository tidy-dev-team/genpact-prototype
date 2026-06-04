# Components Inventory

This file catalogs the UI components in `artifact/index.html` (single-file portal prototype, ~12,000 lines, vanilla HTML/CSS/JS, no build step). It is organized atomically (Atoms → Molecules → Organisms → Templates) so each entry maps cleanly to one **future Storybook story**.

---

## How to read this file

- **Class(es):** the CSS classes that define the component. Sub-classes (modifiers / state classes) are listed with `.`.
- **Lines:** approximate line numbers in `artifact/index.html` (CSS in the `<style>` block, JS render functions scattered below).
- **Where:** which page(s) / area(s) of the app the component appears in. Use this to know which mocks to build first.
- **Usages:** total references to the primary class string in `index.html` (CSS def + every HTML/JS render). A higher number means the component is reused often → prioritize it for Storybook.
- **Variants:** state classes / modifier classes / different shapes the same component takes.
- **Story:** suggested Storybook story breakdown (one bullet per visual variant).

> Line numbers and counts will drift as the file evolves. Re-grep when promoting a component to Storybook.

## Class-prefix legend

| Prefix | Domain |
|---|---|
| `.ai-*` | Casey AI drawer |
| `.av-*` | Agent detail view (drill-down from Agent Fleet) |
| `.af-*` | Agent fleet table |
| `.case-*` | Case detail page (header, sections, form fields) |
| `.cps-*` | Case progress stepper |
| `.chf-*` | Case header footer (tab bar) |
| `.csm-*` | Case section menu (3-dot context) |
| `.wf-*` | Work feed (3-pane solver) |
| `.kpi-*` | KPI metrics card |
| `.conv-*` | Conversations panel |
| `.att-*` | Attachments panel |
| `.hist-*` | History / activity log |
| `.dp-*` | Dropdown panel (filter / sort / group / columns) |
| `.modal-*` | Generic modal dialog shell |
| `.notif-*` | Notifications drawer |
| `.fb-*` | Feedback CTA / modal |

## Page reference (where things live)

| Page / area | Shell | Container |
|---|---|---|
| **My Work** | List shell | `#portal-content` (`class="portal-content"`) |
| **Agent Fleet** (list) | List shell | `#agentfleet-page` (`class="portal-content"`) |
| **Work Feed** | List shell | `#workfeed-page` (`class="portal-content"`) — split view default |
| **Case Page** (regular) | Detail shell | `#case-page` |
| **Case Page** (read-only) | Detail shell | `#case-page.wf-readonly` |
| **Document Case** | Detail shell | `#case-page` (simplified `_renderDocumentCase`) |
| **Agent Detail** | Detail shell | `#case-page` — rendered by `renderAgentView()`, `_casePageMode='agent'` |
| **Casey Drawer** | — | `#ai-drawer` (right side, every page) |
| **Search Drawer** | — | `#search-view` |
| **Tasks Drawer** | — | `#tasks-drawer` |
| **Notifications Drawer** | — | `#notif-drawer` |
| **Chrome** | — | sidebar + topbar (all pages) |

---

# Atoms

Primitives — no internal composition. Each becomes a single Storybook story with state variants.

### Icon button
- **Class:** `.icon-btn`, `.header-icon`, `.recent-btn`
- **Lines:** CSS 646–658, 567–584
- **Where:** Topbar · Page headers (My Work / Agent Fleet / Case / Work Feed) · drawer headers
- **Usages:** `.icon-btn` 28 · `.header-icon` 12
- **Purpose:** Square 32–36px button with a Material icon.
- **Variants:** `default`, `.active` (filled state), `[disabled]`
- **Story:** IconButton / Default · Active · WithBadge · Disabled

### AI button
- **Class:** `.ai-btn`, `.ai-btn-badge`, `.ai-tab-badge`
- **Lines:** CSS 213–245
- **Where:** Topbar (all pages)
- **Usages:** 10
- **Purpose:** Pill-shaped trigger for the Casey drawer in the topbar; can show a badge.
- **Variants:** `default`, `.active`, `with-badge`
- **Story:** AIButton / Default · Active · WithBadge

### Toolbar button
- **Class:** `.toolbar-btn`
- **Lines:** CSS 935–945
- **Where:** Toolbar on My Work · Agent Fleet · Work Feed (filter / sort / group / columns / display)
- **Usages:** 24
- **Variants:** `default`, `.active`
- **Story:** ToolbarButton / Default · Active

### AI pill
- **Class:** `.ai-pill`
- **Lines:** CSS 496–540
- **Where:** Casey drawer (suggested-prompt area)
- **Usages:** 17
- **Purpose:** Suggested-prompt pill inside Casey ("Summarize case", "Quick wins for today", …).
- **Variants:** `default`, `flow-pill` (gradient), hover state
- **Story:** AIPill / Default · Flow · Hover

### Pill / chip (generic)
- **Classes:** `.av-fb-chip`, `.av-queue-pill`, `.filter-pill`, `.sort-pill`
- **Lines:** CSS 3360 (fb-chip), 3263 (queue-pill), 2920 (filter), 3019 (sort)
- **Where:** Agent feedback modal (fb-chip) · Agent Detail queue (queue-pill) · Toolbar/filter bar (filter-pill, sort-pill) on every list page
- **Usages:** `.av-fb-chip` 19 · `.av-queue-pill` 6 · `.filter-pill` 10 · `.sort-pill` 7
- **Purpose:** Selectable rounded pill — used widely for chips, filters, segmented choices.
- **Variants:** `default`, `.selected`/`.active`, `disabled`
- **Story:** Chip / Default · Selected · Disabled

### Tag (assist type)
- **Class:** `.av-assist-tag` + `.credentials` / `.captcha` / `.authorize` / `.comparison` / `.compare`
- **Lines:** CSS 3232–3237
- **Where:** Agent Fleet (agent type column) · Agent Detail (queue table assist column)
- **Usages:** 8
- **Variants:** `credentials` (purple), `captcha` (amber), `authorize` (green), `comparison` (blue)
- **Story:** AssistTag / Credentials · Captcha · Authorize · Comparison

### Status badge
- **Class:** `.status-badge` + variant per status
- **Lines:** CSS 1351–1362
- **Where:** My Work table · Agent Fleet · Case header · Work Feed
- **Usages:** 12
- **Variants:** `pending`, `onprogress`, `stuck`, `exception`, `resolved`, `closed`
- **Story:** StatusBadge / Pending · OnProgress · Stuck · Exception · Resolved

### Tier badge
- **Class:** `.tier-badge`
- **Lines:** CSS 1328–1347
- **Where:** Case list table (My Work / Queue) tier column
- **Usages:** 3
- **Variants:** `t1`, `t2`, `t3`
- **Story:** TierBadge / T1 · T2 · T3

### Stage badge
- **Class:** `.stage-badge`, `.stage-pop-badge`
- **Lines:** CSS 1584
- **Where:** Case header · Agent Detail header · Stage popover items
- **Usages:** 7
- **Variants:** numeric 1–5
- **Story:** StageBadge / 1 · 2 · 3 · 4 · 5

### KPI dot
- **Class:** `.kpi-dot.dark` / `.kpi-dot.light`
- **Lines:** CSS 1019–1023
- **Where:** Metrics rows on My Work and Agent Fleet
- **Usages:** 17
- **Story:** KPIDot / Dark · Light

### Avatar
- **Class:** `.user-avatar-circle`, `.user-avatar-btn`
- **Lines:** CSS 93–104
- **Where:** Sidebar (bottom-left, all pages) · Conversation list items
- **Usages:** 3
- **Story:** Avatar / Default · WithColor

### Form input (text)
- **Classes:** `.case-field input`, `.dp-search`, `.search-input-field`, `.ai-login-input`
- **Lines:** CSS 2008 (case-field), 2833 (dp-search), 2730 (search-input-field), 380 (ai-login-input)
- **Where:** Case page form fields · Filter / Columns / Sort dropdown search inputs · Search drawer · Casey login card
- **Usages:** `.dp-search` 18 · `.case-field` 27 · `.search-input-field` few
- **Variants:** `default`, `:focus`, `[readonly]`, `[disabled]`
- **Story:** TextInput / Default · Focus · Readonly · Disabled

### Textarea
- **Classes:** `.ai-input-textarea`, `.av-fb-textarea`
- **Lines:** CSS 333 (ai), 3380 (fb)
- **Where:** Casey drawer composer (ai) · Agent feedback modal (fb)
- **Usages:** `.ai-input-textarea` 4 · `.av-fb-textarea` 5
- **Variants:** `dark` (Casey), `light` (feedback modal), `:focus`
- **Story:** Textarea / Dark · Light · Focus

### Select
- **Classes:** `.case-field select`, `.modal-radio-group`
- **Lines:** CSS 2008, 911
- **Where:** Case page form sections · Save-view modal
- **Usages:** see `.case-field` (27)
- **Story:** Select / Default · Readonly

### Checkbox / radio row
- **Classes:** `.view-item-check`, `.dp-item`, `.modal-radio`
- **Lines:** CSS 722, 2846, 911
- **Where:** Filter / Columns / Group dropdown panels (toolbar, all list pages) · Save-view modal · View picker
- **Usages:** `.dp-item` 9 · `.view-item-check` 2 · `.modal-radio` 6
- **Story:** ListCheckRow / Default · Checked · Hover

### Toast
- **Class:** `.toast`
- **Lines:** CSS 1464
- **Where:** Bottom of viewport, global (triggered from any page)
- **Usages:** 14
- **Story:** Toast / Default · Success · Error

### Empty state
- **Classes:** `.empty-state`, `.av-empty`, `.ai-empty`
- **Lines:** CSS 1518, 3248, 435
- **Where:** Empty top-bar tab (page-level) · Agent Detail queue (panel) · Casey drawer (initial state)
- **Usages:** `.empty-state` 11 · `.av-empty` 3 · `.ai-empty` 18
- **Story:** EmptyState / Page · Panel · Casey

### Typing indicator
- **Class:** `.ai-typing-indicator`
- **Lines:** CSS 418
- **Where:** Casey drawer body
- **Usages:** 7
- **Story:** TypingIndicator / Default

### Progress bar (segmented)
- **Class:** `.progress-bar`, `.seg-dark`, `.seg-medium`, `.seg-light`
- **Lines:** CSS 986–1018
- **Where:** Inside main KPI cards (My Work + Agent Fleet metrics)
- **Usages:** 12
- **Story:** ProgressBar / TwoSegment · ThreeSegment

### Section divider
- **Class:** `.case-section-divider`, `.av-fb-divider`
- **Lines:** CSS 1874, ~3340
- **Where:** Inside `.case-section` (Case page · Agent Detail) · Feedback modal
- **Usages:** `.case-section-divider` 8
- **Story:** Divider / Default

### Material icon wrapper
- **Class:** `.material-symbols-outlined` (utility, not a component but ubiquitous)
- **Where:** Everywhere
- **Usages:** ~hundreds
- **Story:** Icon / sm · md · lg · color variants

---

# Molecules

Composed atoms. Each becomes a Storybook story with 2–5 variants.

### KPI card
- **Class:** `.kpi-card.main-kpi` / `.kpi-card.sub-kpi`, `.kpi-label`, `.kpi-value`, `.kpi-label-inline`, `.kpi-dot`
- **Lines:** CSS 974–984
- **Where:** Metrics rows on My Work · Agent Fleet · Agent Detail (Overview metrics use a custom `.av-metric-card` variant)
- **Usages:** `.kpi-card` 20
- **Variants:** `main-kpi` (with progress bar), `sub-kpi` (compact, with dot or inline label)
- **Markup:**
  ```html
  <div class="kpi-card sub-kpi">
    <div class="kpi-label">Completed Cases</div>
    <div class="kpi-value"><span class="kpi-dot dark"></span> 12</div>
  </div>
  ```
- **Story:** KPICard / Main(progress) · Sub(dot) · Sub(inline-label)

### Reason card
- **Class:** `.af-reason-card`, `.af-reason-icon`, `.af-reason-title`, `.af-reason-desc`
- **Lines:** CSS 3144–3147
- **Where:** Agent Fleet table — "Most Common Reason" column
- **Usages:** 2
- **Variants:** `default` (warning icon + truncated title)
- **Story:** ReasonCard / Default · Truncated

### Agent type cell
- **Class:** `.af-agent-badge`, `.af-type-tag`
- **Lines:** CSS 3134–3148
- **Where:** Agent Fleet table — first column
- **Usages:** 2
- **Variants:** per agent type (icon + color: Retriever / Signer / OCR / Writer / Comparer / Classifier)
- **Story:** AgentTypeCell / Retriever · Signer · OCR · Writer · Comparer · Classifier

### Priority cell
- **Class:** `.av-priority-cell.high` / `.med` / `.low`
- **Lines:** CSS 3238–3242
- **Where:** Agent Detail queue table · Work Feed table
- **Usages:** 7
- **Variants:** `high` (red), `med` (orange), `low` (muted)
- **Story:** PriorityCell / High · Med · Low

### Case ID link
- **Class:** `.av-case-link`, `.case-num`
- **Lines:** CSS 3230, 1576
- **Where:** Agent Detail queue table · Case page header · Topbar tabs
- **Usages:** `.av-case-link` 4
- **Story:** CaseIDLink / Default

### Stage popover item
- **Class:** `.stage-pop-item.current` / `.done`, `.stage-pop-badge`, `.stage-pop-name`, `.stage-pop-sub`
- **Lines:** CSS 1695–1734
- **Where:** Stage popover on Case page · Work Feed
- **Usages:** 9
- **Variants:** `pending`, `current`, `done`
- **Story:** StagePopoverItem / Pending · Current · Done

### Filter chip + popover
- **Class:** `.filter-pill`, `.filter-popover`, `.filter-chip-bar`
- **Lines:** CSS 2913–2999
- **Where:** Toolbar of every list page (My Work · Agent Fleet · Work Feed)
- **Usages:** `.filter-pill` 10
- **Variants:** `default`, `.active`, `expanded`
- **Story:** FilterChip / Default · Active · Expanded

### Sort rule row
- **Class:** `.sort-rule-row`, `.sort-pill`, `.sort-editor`
- **Lines:** CSS 2851–3030
- **Where:** Sort editor in toolbar of list pages
- **Usages:** `.sort-rule-row` 2 · `.sort-pill` 7
- **Variants:** `asc`, `desc`
- **Story:** SortRuleRow / Asc · Desc

### View picker item
- **Class:** `.view-item`, `.view-item-check`, `.view-item-active`
- **Lines:** CSS 714–730
- **Where:** View picker dropdown (toolbar of list pages)
- **Usages:** 7
- **Story:** ViewPickerItem / Default · Active

### Casey input card
- **Class:** `.ai-input-card`, `.ai-input-card-ctx`, `.ai-input-ctx-pill`, `.ai-input-textarea`, `.ai-input-actions`, `.ai-input-attach-btn`, `.ai-input-send-btn`
- **Lines:** CSS 312–373
- **Where:** Casey drawer footer (every page) — context pill changes per page (My Work / Agent Fleet / case ID / work-feed case ref)
- **Usages:** `.ai-input-card` 8
- **Variants:** `default`, `.processing` (send→stop), `with-context-pill`, `work-feed-mode`
- **Markup:**
  ```html
  <div class="ai-input-card">
    <div class="ai-input-card-ctx"><span class="ai-input-ctx-pill">…</span></div>
    <textarea class="ai-input-textarea" rows="2" placeholder="Ask anything…"></textarea>
    <div class="ai-input-actions">
      <button class="ai-input-attach-btn">…</button>
      <span class="ai-input-spacer"></span>
      <button class="ai-input-send-btn">…</button>
    </div>
  </div>
  ```
- **Story:** CaseyInputCard / Default · WithContextPill · Processing · WorkFeed

### Recent menu dropdown
- **Class:** `.recent-dropdown`, `.recent-dropdown-item`, `.recent-btn`
- **Lines:** CSS 567–602
- **Where:** Topbar (right side) — all pages
- **Usages:** 15
- **Story:** RecentMenu / Default · Empty

### Pagination bar
- **Class:** `.pagination-bar`, `.pg-info`, `.pg-buttons`, `.pg-nav-btn`, `.pg-num`
- **Lines:** CSS 1061–1112
- **Where:** Bottom of every list page (My Work · Agent Fleet)
- **Usages:** 5
- **Variants:** `first-page`, `middle`, `last-page`, `single-page`
- **Story:** Pagination / FirstPage · Middle · LastPage · SinglePage

### Bulk action bar
- **Class:** `.bulk-action-bar`, `.bulk-actions`, `.bulk-action-btn`
- **Lines:** CSS 1024–1058
- **Where:** Floating bar on My Work · Agent Fleet when rows are selected
- **Usages:** 6
- **Story:** BulkActionBar / 1Selected · 5Selected · AllSelected

### Stage trigger + popover
- **Class:** `.case-stage-trigger`, `.case-stage`, `.stage-chevron`, `.stage-popover`
- **Lines:** CSS 1583–1734
- **Where:** Case header (Case page · Agent Detail header) · Work Feed (variant `.wf-stage-popover`)
- **Usages:** `.case-stage-trigger` 3 · `.stage-popover` 12 · `.wf-stage-popover` 6
- **Variants:** `closed`, `open`
- **Story:** StageTrigger / Closed · Open

### Conversation list item
- **Class:** `.conv-item`, `.conv-item.unread`, `.conv-item.selected`
- **Lines:** CSS 2153–2185
- **Where:** Conversations panel (Case page utility sidebar)
- **Usages:** 3
- **Variants:** `default`, `unread`, `selected`, `with-attachment-icon`
- **Story:** ConversationItem / Default · Unread · Selected · WithAttachment

### Attachment row
- **Class:** `.att-row`, `.att-cell-name`, `.att-cell-type`, `.att-cell-size`, `.att-cell-date`
- **Lines:** CSS 2415–2570
- **Where:** Attachments panel (Case page utility sidebar)
- **Usages:** 7
- **Variants:** `default`, `selected`, `uploading`
- **Story:** AttachmentRow / PDF · Image · Doc · Selected

### Activity log row (case)
- **Class:** `.hist-row`, `.hist-actor`, `.hist-action`, `.hist-desc`, `.hist-meta`
- **Lines:** CSS 2634–2641
- **Where:** Activity panel (Case page utility sidebar)
- **Usages:** small
- **Story:** ActivityLogRow / Default · WithTag · WithMeta

### Casey message bubble
- **Class:** `.ai-msg`, `.ai-msg.ai-bubble`, `.ai-msg-time`
- **Lines:** CSS 444–460
- **Where:** Casey drawer body
- **Usages:** `.ai-msg` 15
- **Variants:** `user`, `assistant` (`.ai-bubble`), `with-timestamp`
- **Story:** ChatMessage / User · Assistant · WithTimestamp

### Casey context chip
- **Class:** `.ai-context-chip`
- **Lines:** CSS 477–491
- **Where:** Top of Casey drawer body
- **Usages:** 3
- **Variants:** `default`, `dismissed`
- **Story:** CaseyContextChip / Default · Dismissed

### Work-feed case card
- **Class:** `.wf-card`, `.wf-card-top`, `.wf-card-bottom`, `.wf-card-id`, `.wf-card-stage`, `.wf-card-badge`, `.wf-card.active`
- **Lines:** CSS 3413–3422
- **Where:** Work Feed left rail (case list)
- **Usages:** `.wf-card` 15
- **Variants:** `default`, `.active`, `intervention`, `running`
- **Story:** WorkFeedCard / Default · Active · Intervention

### Agent activity log entry
- **Class:** custom inline structure (no dedicated class) inside `_agentUtilContent('activity', …)`
- **Lines:** JS ~10270–10410
- **Where:** Agent Detail utility panel — Activity tab
- **Usages:** 6 timelines × 16–20 entries each
- **Variants:** `task_alt` (success), `warning`, `error`, `person` (assist), `sync` (batch), `search`, `draw`, `category` …
- **Story:** AgentActivityEntry / Resolved · Assist · Batch · Error · Warning · Retry

### Case progress step
- **Class:** `.cps-step`, `.cps-step-num`, `.cps-step-label`, `.cps-kpi`
- **Lines:** CSS 1755–1825
- **Where:** Case progress stepper (Case page utility sidebar / inline)
- **Usages:** `.cps-step` 21 · `.cps-kpi` 16
- **Variants:** `pending`, `current`, `done`
- **Story:** CaseProgressStep / Pending · Current · Done

### Back button (case)
- **Class:** `.case-back-btn`
- **Lines:** CSS 1842
- **Where:** Case header — only when case opened read-only from Work Feed
- **Usages:** 5
- **Variants:** `default`, `:hover`
- **Story:** CaseBackButton / Default · Hover

---

# Organisms

Full composite features. Each is a self-contained area of the UI.

### Sidebar nav
- **Class:** `.sidebar`, `.sidebar .icon-btn`, `.solution-btn`, `.user-avatar-btn`, `.solution-dropdown`, `.solution-option`
- **Lines:** CSS 42–135
- **Where:** Left edge — all pages
- **Usages:** `.sidebar` 23
- **Variants:** `default`, with-active-section per nav item
- **Story:** Sidebar / Default · MyWork · AgentFleet · WorkFeed

### Topbar
- **Class:** `.topbar`, `.tabs-scroll`, `.case-tab`, `.tabs-overflow-btn`, `.recent-btn`, `.ai-btn`, `.icon-btn` (new tab)
- **Lines:** CSS 147–245, 529–602
- **Where:** Top of main area — all pages
- **Render:** `renderTopbarTabs()` (~9158)
- **Usages:** `.topbar` 35
- **Variants:** `empty`, `with-tabs`, `with-overflow`, `tab-selected`
- **Story:** Topbar / Empty · OneTab · ManyTabs(overflow)

### Toolbar
- **Class:** `.toolbar`, `.toolbar-left`, `.toolbar-right`, `.tb-wrap`
- **Lines:** CSS 658
- **Where:** Above tables on My Work · Agent Fleet · Work Feed
- **Usages:** `.toolbar` 58
- **Variants:** `default`, `with-active-filters`
- **Story:** Toolbar / Default · WithActiveFilters

### Page header
- **Class:** `.header`, `.portal-header-title`, `.header-actions`, `.segmented-btn`
- **Lines:** CSS 619–658
- **Where:** Top of My Work · Agent Fleet · Work Feed
- **Usages:** `.header-actions` 4 · `.segmented-btn` 5
- **Variants:** with-segmented (My Work has Cases-Assigned/Queue), without (Agent Fleet)
- **Story:** PageHeader / MyWork · AgentFleet · WithoutSegmented

### Metrics row
- **Class:** `.metrics-row`, contains `.kpi-card` items
- **Lines:** CSS 968–984
- **Where:** Below page header on My Work · Agent Fleet
- **Usages:** 9
- **Variants:** `expanded`, `collapsed`
- **Story:** MetricsRow / 5cards · 3cards · Collapsed

### Case list table
- **Class:** `<table>` + `.col-*`, `.cell-*`, `.row-*`, `.tier-badge`, `.status-badge`, `.assignee-badge`
- **Lines:** CSS 1116–1326
- **Where:** My Work (Assigned + Queue tabs)
- **Render:** `renderTable()` (~8318), `renderFlat()` (~8198), `renderGrouped()` (~8204), `renderRow()` (~8258), `renderTableHeader()` (~8271)
- **Variants:** `flat`, `grouped`, `with-bulk-selected`, `empty`
- **Story:** CaseListTable / Flat · Grouped · WithSelected · Empty

### Agent fleet table
- **Class:** `.af-table`, `.af-agent-badge`, `.af-status-dot`, `.af-running-count`, `.af-rate`, `.af-reason-card`, `.af-actions`, `.af-action-btn`
- **Lines:** CSS 3117–3169
- **Where:** Agent Fleet (list view)
- **Render:** `renderAgentFleetTable()` (~5409)
- **Usages:** `.af-table` 25
- **Variants:** `default`, `filtered`, `sorted`
- **Story:** AgentFleetTable / Default · Filtered · Sorted

### Agent queue table (boxed)
- **Class:** `.av-queue-box`, `.av-queue-table`, `.av-queue-pill`, `.av-queue-filters`, `.av-tags-cell`, `.av-priority-cell`, `.av-case-link`
- **Lines:** CSS 3253–3275
- **Where:** Agent Detail — "In Queue" section
- **Usages:** `.av-queue-table` 7
- **Variants:** `all`, `escalated`, `in-progress`, `empty`
- **Story:** AgentQueueTable / All · Escalated · InProgress · Empty

### Work feed table
- **Class:** `.wf-tbl`, `.wf-tbl-case`, `.wf-tbl-priority`, `.wf-tbl-status--*`
- **Lines:** CSS 3520–3548
- **Where:** Work Feed (alternative to card grid)
- **Render:** `renderWorkFeedTable()` (~6383)
- **Usages:** `.wf-tbl` 51
- **Variants:** `awaiting`, `agent-taking-care`, `complete`
- **Story:** WorkFeedTable / Awaiting · AgentTakingCare · Complete

### Casey AI drawer
- **Class:** `.ai-drawer`, `.ai-drawer-inner`, `.ai-drawer-header`, `.ai-drawer-body`, `.ai-drawer-footer`, `.ai-drawer-close`
- **Lines:** CSS 247–305
- **Where:** Right edge — every page (toggleable)
- **Render:** `_renderAiFooter()` (~11570), `_renderAiDrawerContext()` (~11878), `_renderAiFlow()` (~11995), `_renderAiMessages()` (~12318), `renderWorkFeedCasey()` (~7097)
- **Usages:** `.ai-drawer` 49
- **Variants (flow states):** `idle`, `analyzing`, `response`, `planning`, `login-required`, `success`, `completed`, `closing`, `case-done`, `work-feed-mode`
- **Story:** CaseyDrawer / Idle · WithMessages · Analyzing · Response · Planning · LoginRequired · Completed · WorkFeedMode

### Utility sidebar (case + agent variants)
- **Class:** `.utility-sidebar`, `.utility-panel`, `.utility-strip`, `.util-strip-btn`, `.panel-resize-handle`, `.conv-toolbar`
- **Lines:** CSS 2023–2068
- **Where:** Case Page (Conversations / Attachments / Activity) · Agent Detail (Activity / Prompt / Config — duplicated as `#av-util-*`)
- **Usages:** `.utility-panel` 19 · `.util-strip-btn` 15
- **Variants:** `closed`, `open`, `resizing`
- **Story:** UtilitySidebar / Closed · ActivityOpen · CommsOpen · Resizing

### Case section accordion
- **Class:** `.case-section`, `.case-section-header`, `.case-section-toggle`, `.case-section-divider`, `.case-section-actions`, `.case-section-menu`, `.case-fields`, `.case-field`
- **Lines:** CSS 1852–2020
- **Where:** Case Page (History / Details / Research / Host / Tracking) · Agent Detail (Overview / In Queue / Capabilities — via `_avSection()`)
- **Render:** `renderCaseSections()` (~10199), `_renderField()` (~10144), `_avSection()` (~5733)
- **Usages:** `.case-section` 67
- **Variants:** `expanded`, `minimized`, `with-menu-open`
- **Story:** CaseSection / Expanded · Minimized · WithMenuOpen

### Case progress stepper
- **Class:** `.case-progress-section`, `.cps-stepper`, `.cps-step`, `.cps-kpi`
- **Lines:** CSS 1735–1825
- **Where:** Case Page header area (vertical pipeline)
- **Usages:** `.case-progress-section` 3 · `.cps-stepper` 6
- **Variants:** `pending`, `current`, `done`
- **Story:** CaseProgressStepper / Default · MidPipeline · Resolved

### Case header (sticky)
- **Class:** `.case-header`, `.case-header-main`, `.case-header-left`, `.case-header-id`, `.case-header-meta`, `.case-meta-item`, `.case-meta-sep`, `.case-status-text`, `.case-header-right`, `.case-header-footer`, `.chf-tabs`, `.chf-tab`, `.case-back-btn`, `.case-readonly-banner`
- **Lines:** CSS 1557–1676, 1842
- **Where:** Case Page · Agent Detail (re-uses same classes via render)
- **Render:** `renderCasePage()` (~10253) populates IDs · `renderAgentView()` (~5516) writes the agent variant
- **Usages:** `.case-header` 33 · `.chf-tab` 24
- **Variants:** `default`, `read-only` (with back button + banner), `progress-open` (footer tabs always visible — Agent Detail), `wf-readonly` (right actions hidden)
- **Story:** CaseHeader / Default · ReadOnly · ProgressOpen · AgentDetail

### Agent detail header (variant of case header)
- **Class:** uses `.case-header.progress-open` + Agent Detail meta items (In Handling, Escalated, Last action)
- **Lines:** CSS reuse · JS at `renderAgentView()` (~5516)
- **Where:** Agent Detail (top of `#case-page` when `_casePageMode='agent'`)
- **Usages:** N/A (variant of Case header)
- **Story:** AgentDetailHeader / Default — already covered in CaseHeader story

### Agent feedback CTA + modal
- **Class:** `.av-fb-cta`, `.av-fb-overlay`, `.av-feedback-card`, `.av-fb-header`, `.av-fb-icon`, `.av-fb-close`, `.av-fb-body`, `.av-fb-label`, `.av-fb-chips`, `.av-fb-chip`, `.av-fb-textarea`, `.av-fb-footer`, `.av-fb-submit`, `.av-fb-anon`, `.av-fb-success`
- **Lines:** CSS 3312–3391
- **Where:** Agent Detail Overview section (CTA inline) → centered modal (overlay above all pages when open)
- **JS:** `openAvFeedback()`, `closeAvFeedback()`, `submitAvFeedback()`, `toggleAvFbChip()`
- **Usages:** `.av-fb-cta` 6 · `.av-fb-overlay` 5 · `.av-fb-chip` 19 · `.av-fb-anon` 4 · `.av-fb-success` 3
- **Variants:** `cta-only`, `modal-open`, `submitted`
- **Story:** AgentFeedback / CTA · ModalOpen · Submitted

### Agent activity timeline
- **JS only** — inline styles inside `_agentUtilContent('activity', type)` (~line 10270)
- **Where:** Agent Detail utility panel (right side, Activity tab)
- **Usages:** rendered for each of 6 agents
- **Variants:** Retriever · Signer · OCR · Writer · Comparer · Classifier
- **Story:** AgentActivityLog / Retriever · Signer · OCR · Writer · Comparer · Classifier

### Conversations panel
- **Class:** `.conv-list`, `.conv-item`, `.conv-read-*`, `.conv-msg`, `.conv-msg-meta`, `.conv-msg-actions`, `.conv-msg-attach-*`, `.conv-footer-*`
- **Lines:** CSS 2152–2276
- **Where:** Case Page utility sidebar (Comms tab)
- **Render:** `renderConversationsPanel()` (~10749)
- **Usages:** `.conv-msg` 49 · `.conv-list` 3
- **Variants:** `list-only`, `with-thread-open`, `composer-active`
- **Story:** ConversationsPanel / Default · ThreadOpen · ComposerActive

### Attachments panel
- **Class:** `.att-toolbar`, `.att-table-wrap`, `.att-row`, `.att-cell-*`, `.att-preview-*`
- **Lines:** CSS 2412–2629
- **Where:** Case Page utility sidebar (Attachments tab)
- **Render:** `renderAttachmentsPanel()` (~11135), `_renderAttachPreviewDrawer()` (~11207)
- **Usages:** `.att-toolbar` 9 · `.att-row` 7
- **Variants:** `list-only`, `preview-open`, `empty`
- **Story:** AttachmentsPanel / Default · PreviewOpen · Empty

### Activity / history panel
- **Class:** `.hist-row`, `.hist-actor`, `.hist-action`, `.hist-desc`, `.hist-meta`
- **Lines:** CSS 2634–2641
- **Where:** Case Page utility sidebar (Activity tab)
- **Render:** `renderActivityPanel()` (~11341)
- **Variants:** `default`, `filtered`, `empty`
- **Story:** ActivityPanel / Default · Filtered · Empty

### Search drawer
- **Class:** `.search-drawer`, `.search-input-field`, `.search-results`
- **Lines:** CSS 2711–2808
- **Where:** Slide-out from sidebar — overlays any page
- **Usages:** `.search-drawer` 11
- **Variants:** `closed`, `open`, `with-results`, `empty`
- **Story:** SearchDrawer / Closed · Open · WithResults · Empty

### Tasks drawer
- **Class:** `.tasks-drawer`, `.task-item`, `.tasks-filter-btn`
- **Lines:** CSS 2741–2806
- **Where:** Slide-out from topbar — overlays any page
- **Usages:** `.tasks-drawer` 17
- **Variants:** `closed`, `open`
- **Story:** TasksDrawer / Closed · Open

### Notifications drawer
- **Class:** `.notif-drawer`, `.notif-overlay`, `.notif-item`
- **Lines:** CSS 2644–2708
- **Where:** Slide-out from topbar — overlays any page
- **Usages:** `.notif-drawer` 9
- **Variants:** `closed`, `open`, `empty`
- **Story:** NotificationsDrawer / Closed · Open · Empty

### Work-feed: auth form card
- **Helper:** `_wfFormCard()` (~6631)
- **Class:** `.wf-form-card`, `.wf-form-card-header`, `.wf-otp-*`, `.wf-captcha-*`, `.wf-form-card-done`, `.wf-handback-*`
- **Lines:** CSS 3457–3507
- **Where:** Work Feed solver center pane
- **Usages:** `.wf-form-card` 52
- **Variants:** `username/pass`, `otp`, `captcha`, `completed`, `handed-back`
- **Story:** WFAuthFormCard / UserPass · OTP · Captcha · Completed

### Work-feed: comparison viewer
- **Helper:** `_wfComparisonCard()` (~7001)
- **Class:** `.wf-compare-split`, `.wf-compare-tbl`
- **Lines:** CSS 3541, 3549
- **Where:** Work Feed solver center pane (comparison task)
- **Variants:** `match`, `delta`, `mismatch`
- **Story:** WFComparison / Match · Delta · Mismatch

### Work-feed: email card
- **Helper:** `_wfEmailCard()` (~6901)
- **Class:** `.wf-email-*`
- **Lines:** CSS 3710–3729
- **Where:** Work Feed solver center pane (email task)
- **Variants:** `draft`, `sent`
- **Story:** WFEmailCard / Draft · Sent

### Work-feed: invoice doc
- **Helper:** `_wfInvoiceDoc()` (~6954)
- **Class:** `.wf-invoice-*`, `.wf-invoice-lines`
- **Lines:** CSS 3636–3653
- **Where:** Work Feed solver and PDF overlay
- **Usages:** `.wf-invoice` 51
- **Variants:** `default`, `with-highlights`
- **Story:** WFInvoiceDoc / Default · WithHighlights

### Work-feed: investigation steps
- **Helper:** `_wfActivitySteps()` (~6797)
- **Class:** `.wf-al-row`, etc.
- **Lines:** CSS 3589–3608
- **Where:** Work Feed activity log card
- **Variants:** `search`, `extract`, `verify`, `failed`
- **Story:** WFInvestigationSteps / Search · Extract · Verify · Failed

### Modal overlay shell
- **Class:** `.modal-overlay`, `.modal-box`, `.modal-header`, `.modal-field`, `.modal-radio-group`, `.modal-radio`, `.modal-footer`
- **Lines:** CSS 880–928
- **Where:** Save-view dialog · confirmation prompts (overlays any page)
- **Usages:** `.modal-overlay` 6
- **Variants:** `closed`, `open`, `with-radio-group`
- **Story:** Modal / SaveView · Confirmation · CustomBody

### Image lightbox
- **Class:** `.img-lightbox-overlay`, `.img-lightbox-box`, `.img-lightbox-close`, `.img-lightbox-caption`
- **Lines:** CSS 1992–2000
- **Where:** Evidence images in Case Page · Work Feed
- **Usages:** 5
- **Variants:** `default`, `with-caption`
- **Story:** ImageLightbox / Default · WithCaption

### View picker + chips bar
- **Class:** `.view-picker`, `.view-picker-search`, `.view-item`, `.view-chips-bar`, `.chips-add-filter`, `.chips-reset`, `.chips-save-btn`, `.view-btn-wrap`, `.view-btn-main`, `.view-settings-btn`, `.view-context-menu`, `.vcm-item`
- **Lines:** CSS 692–880
- **Where:** Toolbar of every list page
- **Usages:** `.view-picker` 13 · `.view-chips-bar` 4
- **Variants:** `default`, `expanded`, `with-modifications`
- **Story:** ViewPicker / Closed · Open · Modified

### Work Feed solver pane (composite)
- **Class:** `.wf-feed`, `.wf-solver-*`, plus all the inner cards above
- **Lines:** CSS 3400+
- **Where:** Work Feed page center column
- **Usages:** `.wf-feed` 22
- **Variants:** by active task (auth · comparison · email · investigation · invoice)
- **Story:** WFSolverPane / Auth · Comparison · Email · Investigation · Invoice

---

# Templates

Page-level layouts. Each is a **shell** that gets reused across multiple pages — only the data, header copy, KPIs, and table columns differ. In Storybook, a template is one component with `props: { title, kpis, columns, data, … }` and one story per instance.

> **2 templates total.** After the template-unification refactor, all 6 pages share exactly 2 container shells. Work Feed moved into `portal-content`. Agent Detail moved into `#case-page`. The old `.wf-page` and `#agent-view` containers are gone from the DOM.

### List page shell
- **Container:** `<div class="portal-content">`
- **Used by:** **My Work** (`#portal-content`) · **Agent Fleet** (`#agentfleet-page`) · **Work Feed** (`#workfeed-page`) — Work Feed defaults to split view
- **Lines:** HTML 4130 (My Work), 4562 (Agent Fleet), 4707 (Work Feed); CSS 1550
- **Composes:** Sidebar · Topbar · Page header (title + segmented + actions) · Metrics row · `portal-content-area` hosting either: Toolbar + Table (My Work / Fleet) or split panels: `wf-feed` + `wf-solver` (Work Feed)
- **Props that vary per instance:**
  - `title` — "My Work" / "Agent Fleet" / "Work Feed"
  - `defaultView` — table (My Work / Fleet) · split (Work Feed)
  - `segmentedFilter` — Assign-to-me/Cases-in-queue (My Work) · All-cases/Mine (Work Feed) · none (Fleet)
  - `kpis` — different metrics per page
  - `columns` — `caseListCols` / `agentFleetCols` / `wfCols`
  - `data` — `assignedData`/`queueData` / `agentData` / `workFeedData`
  - `tableRender` — `renderTable()` / `renderAgentFleetTable()` / `renderWorkFeedList()` + `renderWorkFeedTable()`
- **Variants:** table-view · split-view · empty · with-active-filters · with-bulk-selected · split-mode (My Work)
- **Story:** ListPage / MyWork · AgentFleet · WorkFeed-Split · WorkFeed-Table

### Detail page shell
- **Container:** `<div id="case-page">`
- **Used by:** **Case page** · **Document case page** (variant of Case) · **Agent Detail** — all render into the same `#case-page` element
- **How it works:** `renderCasePage()` uses the static HTML structure inside `#case-page`. `renderAgentView()` replaces `#case-page` innerHTML with agent content; original HTML is snapshotted on load (`_casepageTemplate`) and restored when switching back to case mode. `_casePageMode` (`'case'` | `'agent'`) tracks which content is active.
- **Lines:** HTML 4372 (case-page static structure), `renderCasePage()` ~10290, `renderAgentView()` ~5524, `_renderDocumentCase()` ~11506
- **Composes:** Sidebar · Topbar · Case header (sticky 52px + meta + footer tab bar) · Content area (sections / form fields) · Utility sidebar (44px strip + 300px panel)
- **Props that vary per instance:**
  - `headerMeta` — case meta (stage / status / assignee) vs agent meta (in-handling / escalated / last action)
  - `sections` — `CASE_SECTIONS` (case) · `_DOC_CASE_TABS` (document) · `[Overview, In Queue, Capabilities]` (agent)
  - `utilityTabs` — Conversations/Attach/Activity (case) · Activity/Prompt/Config (agent)
  - `headerVariant` — default · `progress-open` · `wf-readonly`
  - `backButton` — Work Feed (read-only) → returns to WF · Agent Detail → returns to fleet
- **Variants:** Case-Default · Case-ReadOnly · Document-Case · Agent-Detail (×6 agents)
- **Story:** DetailPage / Case-Default · Case-ReadOnly · Document-Case · Agent-Retriever · Agent-Signer · Agent-OCR · Agent-Writer · Agent-Comparer · Agent-Classifier

### Utility shells (overlays, not full templates)
- **Search drawer** — `#search-view + .search-drawer.open` overlays any page
- **Empty state** — `#empty-state` shown when no section/tab is active
- These are organisms (already documented above), not templates.

---

## Why this matters for Storybook

**2 templates → 2 story files**, each with multiple instances as stories:

```
ListPage.stories.tsx
  ├─ MyWork-Assigned   (title='My Work', defaultView='table', data=assignedData)
  ├─ MyWork-Queue
  ├─ AgentFleet        (same shell, agentData, agentFleetCols)
  ├─ WorkFeed-Split    (defaultView='split', data=workFeedData)
  └─ WorkFeed-Table

DetailPage.stories.tsx
  ├─ CaseRegular
  ├─ CaseReadOnly
  ├─ DocumentCase
  └─ AgentDetail-{Retriever, Signer, OCR, Writer, Comparer, Classifier}
```

2 templates instead of 6 separate shells means fixing the header in `ListPage` updates My Work, Agent Fleet, and Work Feed simultaneously.

---

# Data fixtures

Each render function consumes a global data array. These become Storybook **fixture files** (`fixtures/agentData.json`, etc.).

| Array | Line | Used by | Schema (key fields) |
|---|---|---|---|
| `agentData` | 4892 | Agent Fleet table | `{ type, running, awaiting, successRate, minMax, commonReason }` |
| `agentDetailData` | 4915 | Agent Detail page | keyed by agent type → `{ icon, agentId, inHandling, lastAction, objective, capabilities, capabilities_v2, openAssists, humanAssistFreq, successRate, pendingAssists:[…], portals }` |
| `workFeedData` | 5855 | Work Feed list/table | `{ id, stage, tasks, status, priority, stageSteps, stageDesc, assists }` |
| `workFeedTasks` | 6001 | Work Feed solver | keyed by caseId → array of task descriptors |
| `workFeedCaseyContent` | 5874 | Work Feed Casey | keyed by caseId → `{ thoughts, output, contextCards }` |
| `assignedData`, `queueData` | 7417, 7453 | My Work table | `{ id, name, created, due, tier, assignees, status, stage, client, documents }` |
| `CASE_SECTIONS` | 9878 | Case page sections | `[{ key, title, subtitle, fields:[…] }]` |
| `_CASE_STAGES`, `WF_STAGES` | 10639 / WF | Stage popovers | `[{ name, sub }]` |
| `CONV_ITEMS` | 10694 | Conversations panel | `{ initials, name, subject, preview, time, tag, unread, messages }` |
| `ATTACH_ITEMS` | 11119 | Attachments panel | `{ name, ext, type, size, date, by }` |
| `HISTORY_ITEMS` | 11322 | Activity panel | `{ actor, action, desc, tag, date, time }` |
| `_DOC_CASE_TABS`, `_ORIGINAL_TABS` | 11485, 11489 | Case page tabs | tab definitions |
| `sectionTabs` | 9143 | Topbar | per-section tab arrays |

---

# Storybook plan (next-step roadmap)

1. **Scaffold Storybook** in a new sibling directory (`storybook/`). Framework: vanilla HTML stories or Lit.
2. **Extract design tokens.** The `:root` CSS variables in `index.html` (`--bg-dark`, `--bg-sidebar`, `--text-primary`, …) become Storybook design-token docs.
3. **Build atoms first** — sorted by usage count (highest first):
   - `.icon-btn` (28) → IconButton
   - `.toolbar-btn` (24) → ToolbarButton
   - `.av-fb-chip` (19) → Chip
   - `.kpi-dot` (17) → KPIDot
   - `.ai-pill` (17) → AIPill
   - `.toast` (14) → Toast
   - `.status-badge` (12) → StatusBadge
   - `.progress-bar` (12) → ProgressBar
   - `.empty-state` (11) → EmptyState
   - `.filter-pill` (10) → FilterChip
4. **Move to molecules** (KPI Card, Reason Card, Casey Input Card, Stage Popover Item, Conversation Item, Attachment Row).
5. **Build organisms** using fixtures from the table above (Casey drawer, Utility sidebar, Case header, Agent fleet table, Case section accordion).
6. **Templates last** — these are story compositions, not new components.

### Suggested first 10 stories (ordered by combined utility = usage × visibility)

1. IconButton (28 usages, every page)
2. ToolbarButton (24, every list page)
3. KPICard (20, on My Work + Agent Fleet)
4. StatusBadge (12, every case list)
5. CaseyInputCard (8, every page Casey is visible)
6. CaseSection (67 usages — heavy reuse on Case + Agent Detail)
7. CaseHeader (33, Case + Agent Detail)
8. CaseyDrawer (49, all pages — flagship organism)
9. AgentFleetTable (25, Agent Fleet)
10. AgentFeedback CTA + Modal (6 + 5, Agent Detail Overview)

---

# Verification checklist

- [x] File exists at `artifact/COMPONENTS.md`
- [ ] Spot-check 3 atoms — open `index.html`, jump to listed line, verify class is at that line
- [ ] Spot-check 2 organisms with `_render*` references — verify functions exist at documented lines
- [x] All four hierarchical sections present (Atoms / Molecules / Organisms / Templates)
- [x] Every component has `Where` and `Usages` fields
- [x] Every component has at least one Story note
- [x] Total length under ~2500 lines (current: ~860)
