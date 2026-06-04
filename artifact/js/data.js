// ── Agent Fleet data ──────────────────────────────────────────────────────────
const agentData = [
  { type:'Retriever',  running:12, awaiting:3, successRate:'89%', minMax:'1m / 18m', commonReason:'Missing portal credentials'         },
  { type:'Signer',     running:8,  awaiting:1, successRate:'94%', minMax:'3m / 12m', commonReason:'Signature verification failed'      },
  { type:'OCR',        running:15, awaiting:0, successRate:'97%', minMax:'30s / 5m', commonReason:null                                 },
  { type:'Writer',     running:6,  awaiting:2, successRate:'82%', minMax:'5m / 22m', commonReason:'Insufficient data to generate draft' },
  { type:'Comparer',   running:9,  awaiting:4, successRate:'76%', minMax:'2m / 31m', commonReason:'Multiple contradictions found'      },
  { type:'Classifier', running:11, awaiting:0, successRate:'95%', minMax:'45s / 8m', commonReason:null                                 },
];

const AF_COLS = [
  { key: 'type',         label: 'Agent Type'              },
  { key: 'running',      label: 'Agents Running'          },
  { key: 'awaiting',     label: 'Awaiting Human'          },
  { key: 'successRate',  label: 'Success Rate (Avg)'      },
  { key: 'minMax',       label: 'Min / Max Success Time'  },
  { key: 'reason', label: 'Most Common Reason' },
];
let afColOrder   = [...AF_COLS];
let afHiddenCols = new Set();
let afColWidths  = {};
let afColDragIdx = null;
let afPinnedCols = new Set();
let afFrozenCol  = null;

let afFilterFields = [];
let afActiveFilterPopover = null;
let _activeAgentType = null;   // type string when an agent view is open, null on fleet home
let _casePageMode = 'case';   // 'case' | 'agent' — tracks what is rendered in #case-page
let _casepageTemplate = '';  // Original #case-page innerHTML snapshot; restored before renderCasePage()
const _currentUser = 'Ben Septer';  // Simulated logged-in user
const _WF_USERS = ['Ben Septer', 'Sarah Johnson', 'Ahmed Arah', 'Michael Nguyen', 'Priya Nair', 'David Kim', 'Emily Foster', 'Marcus Webb'];
let _fetchedCases = {               // { caseId: userName } — runtime claim registry
  // Fetched by me (Ben Septer)
  '2947-5839':  'Ben Septer',       // case — fetched by me
  '1233-9845':  'Ben Septer',       // case — fetched by me
  '4821-1093':  'Ben Septer',       // case (awaiting) — fetched by me
  'TASK-001':   'Ben Septer',       // agent task — fetched by me
  'TASK-004':   'Ben Septer',       // agent task — fetched by me
  // Fetched by others (Cora)
  '5675-5443':  'Emily Foster',     // case — fetched by team member
  '6612-8845':  'Priya Nair',       // case — fetched by team member
  // '3212-2345' (Ahmed), 'TASK-002' (Michael): assigned but not fetched → Queue
  // Deduction cases — fetched (actively being worked)
  'DED-00124':  'Ben Septer',       // eyeball case — fetched by me
  'DED-00109':  'Ben Septer',       // eyeball case — fetched by me
  'DED-00113':  'Priya Nair',
  'DED-00082':  'Ahmed Arah',
  'DED-00118':  'Ben Septer',       // fetched by me
  'DED-00088':  'Ben Septer',       // fetched by me
  'DED-TASK-001': 'Ben Septer',     // agent task — fetched by me
  // DED-00105, DED-00094, DED-00076: assigned but not fetched → show in Queue
  // DED-00099: assigned to me but not fetched → shows in Queue + On Me when fetched
  // DED-TASK-002, DED-TASK-003, DED-TASK-004, DED-TASK-005: assigned but not fetched → Queue
};
let _wfAvailableOnly = false;       // feed toolbar "Available only" toggle
let _wfSegFilter = 'all';           // header segment: 'all' | 'on-me' | 'queue'
let _wfCurrentPage   = 1;          // pagination: current page
let _wfItemsPerPage  = 20;         // pagination: rows per page
let _wfLastTotalPages = 1;         // pagination: cached total pages
let _wfColFilters = {};             // { colKey: Set<string> } — active column header filters
let _wfColFilterOpen = null;        // currently open column filter key
let _wfCfpAllVals = [];             // full value list for the open filter (for search)
let _wfFeedSortBy           = 'priority';  // feed card sort: 'priority' | 'type' | 'status'
const _wfTaskItemsExpanded  = {};          // { taskId: bool } — show-all state for items list
const _wfTaskItemOpen       = {};          // { 'taskId-idx': bool } — per-item open state

const _WF_TASK_ITEM_ACTIONS = {
  'OCR Agent':             [{ label: 'Review & Correct', icon: 'edit',           primary: true  },
                            { label: 'Auto-correct',     icon: 'auto_fix_high',  primary: false },
                            { label: 'Skip',             icon: 'skip_next',      primary: false }],
  'Deduction Classifier':  [{ label: 'Define rule',      icon: 'rule',           primary: true  },
                            { label: 'Map to existing',  icon: 'merge',          primary: false },
                            { label: 'Reject claim',     icon: 'block',          primary: false }],
  'Dispute Agent':         [{ label: 'Approve',          icon: 'check_circle',   primary: true  },
                            { label: 'Reject',           icon: 'cancel',         primary: false },
                            { label: 'Request info',     icon: 'info',           primary: false }],
  'POD Retriever':         [{ label: 'Update credentials', icon: 'key',          primary: true  },
                            { label: 'Try alternative',  icon: 'refresh',        primary: false },
                            { label: 'Mark manual',      icon: 'edit_note',      primary: false }],
  'Settlement Agent':      [{ label: 'Map code',         icon: 'link',           primary: true  },
                            { label: 'Create new type',  icon: 'add_circle',     primary: false },
                            { label: 'Flag for review',  icon: 'flag',           primary: false }],
};

function _avatarColor(name) {
  const palette = ['#0369a1','#7c3aed','#b45309','#166534','#be185d','#d97706','#0f766e','#dc2626'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
function _initials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}
function _activeUserAvatarHtml(userName, size) {
  const cls = size === 'sm' ? 'wf-card-active-user' : 'active-user-avatar';
  const label = userName === _currentUser ? 'You · ' + userName : userName;
  return `<span class="${cls}" style="background:${_avatarColor(userName)}" title="${label}">${_initials(userName)}</span>`;
}

// ── Agent detail data ─────────────────────────────────────────────────────────
const agentDetailData = {
  Retriever: {
    icon: 'find_in_page',
    agentId: '2947-5839',
    inHandling: 48,
    lastAction: 'Resolved case #52317',
    objective: `The Retriever autonomously locates and fetches invoice documents and financial records from vendor portals, email inboxes, and third-party data sources. It handles authentication flows, navigates web UIs, resolves CAPTCHA challenges where policy permits, and delivers raw documents to downstream pipeline agents with full provenance metadata.`,
    capabilities: ['Multi-portal credential authentication', 'CAPTCHA challenge handling', 'Email attachment extraction', 'Structured document handoff', 'Retry logic with exponential backoff'],
    capabilities_v2: {
      triggers: {
        automated: ['Portal Session Expiry', 'Credential Failure'],
        manual: ['Mentioned', 'Assigned Task'],
      },
      access: {
        workspaces: ['Queue In Line'],
        external: ['Web Search', 'Gmail', 'Vendor Portals'],
      },
      skills: ['Document Retrieval', 'Portal Navigation', 'Credential Auth', 'CAPTCHA Handling'],
      escalation: ['When portal requires 2FA not solvable by agent', 'When CAPTCHA type unsupported'],
    },
    insights: [
      'Credential failures spike Monday mornings — 72% of weekly auth errors occur within the first 2 hours of the business day.',
      'DataMatch AI portal has a 34% CAPTCHA hit rate, 3× higher than any other integration in the fleet.',
      'Average retrieval time improved 18% over the past 30 days following portal response caching.',
    ],
    openAssists: { credentials: 4, captcha: 1, authorize: 1 },
    humanAssistFreq: '1 Per 1K', freqTrend: 'down',
    successRate: '89%', successTrend: 'up',
    pendingAssists: [
      { caseId: '356212', assistType: ['Credentials'],              priority: 'High', minMax: '16s / 1m',  blockReason: 'Session expired on vendor portal',         elapsed: '4m 32s'  },
      { caseId: '452421', assistType: ['Captcha'],                  priority: 'High', minMax: '42s / 3m',  blockReason: 'CAPTCHA challenge on initial portal access', elapsed: '2m 11s'  },
      { caseId: '322511', assistType: ['Credentials','Comparison'], priority: 'High', minMax: '24s / 2m',  blockReason: '2FA code required after login',              elapsed: '7m 04s'  },
      { caseId: '523217', assistType: ['Authorize','Credentials'],  priority: 'Med',  minMax: '45s / 7m',  blockReason: 'Payment amount exceeds auto-approve limit',  elapsed: '18m 50s' },
      { caseId: '694323', assistType: ['Captcha'],                  priority: 'Low',  minMax: '29s / 4m',  blockReason: 'CAPTCHA on secondary portal',                elapsed: '9m 12s'  },
      { caseId: '362343', assistType: ['Compare','Credentials'],    priority: 'Low',  minMax: '43s / 6m',  blockReason: 'Document version mismatch',                  elapsed: '22m 05s' },
    ],
  },
  Signer: {
    icon: 'draw',
    agentId: '4411-8823',
    inHandling: 22,
    lastAction: 'Signed contract #44821',
    objective: `The Signer manages digital signature workflows — coordinating with signatories and verification systems to collect legally-binding approvals on contracts and invoices. It integrates with DocuSign, Adobe Sign, and proprietary platforms, handling reminders, certificate validation, and audit-trail generation autonomously.`,
    capabilities: ['DocuSign / Adobe Sign integration', 'Signatory routing and reminders', 'Certificate chain validation', 'Legally-compliant audit trail'],
    capabilities_v2: {
      triggers: {
        automated: ['Document Ready for Signature', 'Reminder Timer'],
        manual: ['Mentioned', 'Manual Assignment'],
      },
      access: {
        workspaces: ['Signature Queue'],
        external: ['DocuSign', 'Adobe Sign'],
      },
      skills: ['Signature Routing', 'Certificate Validation', 'Audit Trail Generation', 'Reminder Sequences'],
      escalation: ['When signatory is unresponsive after 3 reminders', 'When certificate validation fails'],
    },
    insights: [
      'Signature verification failures are concentrated in 3 vendors: TechLogic, NovaCorp, and DataStream.',
      'Automated reminder sequences reduce average time-to-sign from 4.2 days to 1.8 days.',
      'Mobile signing sessions fail 23% more often than desktop — likely touch-target sizing issues.',
    ],
    openAssists: { credentials: 1, captcha: 0, authorize: 0 },
    humanAssistFreq: '1 Per 2K', freqTrend: 'up',
    successRate: '94%', successTrend: 'up',
    pendingAssists: [
      { caseId: '411033', assistType: ['Credentials'], priority: 'Med', minMax: '30s / 5m', blockReason: 'Signing platform requires re-authentication', elapsed: '9m 17s' },
    ],
  },
  OCR: {
    icon: 'document_scanner',
    agentId: '3301-7729',
    inHandling: 67,
    lastAction: 'Processed batch #B-2901',
    objective: `The OCR agent applies optical character recognition and intelligent document parsing to convert scanned invoices, PDFs, and image attachments into structured, machine-readable data. It scores confidence per field and routes low-confidence extractions to the human review queue before handing off to downstream agents.`,
    capabilities: ['Multi-format document ingestion', 'Handwritten text recognition', 'Table structure extraction', 'Per-field confidence scoring'],
    capabilities_v2: {
      triggers: {
        automated: ['New Document Uploaded', 'Batch Queue Ready'],
        manual: ['Manual Reprocess Request'],
      },
      access: {
        workspaces: ['Document Queue', 'Review Queue'],
        external: ['OmniScan Pro'],
      },
      skills: ['Multi-format Ingestion', 'Table Extraction', 'Handwriting Recognition', 'Confidence Scoring'],
      escalation: ['When confidence score below threshold for all retries', 'When document format unrecognized'],
    },
    insights: [
      'Handwritten invoices are 8% of volume but responsible for 61% of extraction errors.',
      'Page-rotation auto-correction fixed 1,240 documents last month, avoiding manual re-scans.',
      'Confidence threshold tuning in Q1 reduced the manual review queue by 31%.',
    ],
    openAssists: { credentials: 0, captcha: 0, authorize: 0 },
    humanAssistFreq: '1 Per 5K', freqTrend: 'up',
    successRate: '97%', successTrend: 'up',
    pendingAssists: [],
  },
  Writer: {
    icon: 'edit_note',
    agentId: '5521-4490',
    inHandling: 18,
    lastAction: 'Sent dispute letter #DL-8821',
    objective: `The Writer composes outbound communications — dispute letters, approval requests, missing-data notifications — using case context and approved templates. It calibrates tone based on counterparty relationship tier and escalation history, then routes drafts through a human approval gate before sending.`,
    capabilities: ['Template-based draft generation', 'Tone calibration engine', 'Multi-language support (14 locales)', 'Approval routing before send'],
    capabilities_v2: {
      triggers: {
        automated: ['Case Requires Outbound Communication'],
        manual: ['Mentioned', 'Draft Review Requested'],
      },
      access: {
        workspaces: ['Communication Queue'],
        external: ['Email', 'Template Library'],
      },
      skills: ['Draft Generation', 'Tone Calibration', 'Multi-language Support', 'Approval Routing'],
      escalation: ['When recipient details cannot be verified', 'When draft confidence low'],
    },
    insights: [
      '"Insufficient data" errors spike when upstream OCR confidence falls below 72%.',
      'Custom tone profiles reduce customer escalation callbacks by 19% vs. default templates.',
      'Average draft generation time: 4.3 seconds per document.',
    ],
    openAssists: { credentials: 0, captcha: 0, authorize: 2 },
    humanAssistFreq: '1 Per 800', freqTrend: 'down',
    successRate: '82%', successTrend: 'down',
    pendingAssists: [
      { caseId: '788012', assistType: ['Authorize'], priority: 'High', minMax: '5m / 22m', blockReason: 'Draft requires human sign-off before send',  elapsed: '11m 22s' },
      { caseId: '334521', assistType: ['Authorize'], priority: 'Med',  minMax: '8m / 30m', blockReason: 'Recipient details could not be auto-verified', elapsed: '26m 45s' },
    ],
  },
  Comparer: {
    icon: 'compare',
    agentId: '9102-4456',
    inHandling: 31,
    lastAction: 'Flagged discrepancy on #39021',
    objective: `The Comparer performs multi-source invoice reconciliation — matching extracted data against PO records, GRN entries, and historical payment data. It computes match scores, surfaces contradictions ranked by severity, and flags transactions that require human sign-off before payment can proceed.`,
    capabilities: ['3-way PO / GRN / invoice matching', 'Fuzzy field matching with tolerances', 'Discrepancy severity scoring', 'Historical anomaly detection'],
    capabilities_v2: {
      triggers: {
        automated: ['Invoice Received for Matching'],
        manual: ['Manual Match Request'],
      },
      access: {
        workspaces: ['Reconciliation Queue'],
        external: ['AP Ledger', 'PO System'],
      },
      skills: ['3-way Matching', 'Fuzzy Field Matching', 'Discrepancy Scoring', 'Anomaly Detection'],
      escalation: ['When match confidence below 85%', 'When duplicate invoice detected'],
    },
    insights: [
      'Contradiction errors are most common when vendors submit amended invoices without version tags.',
      'Match confidence below 85% triggers human review — affecting 24% of monthly volume.',
      'Top contradiction source: unit-price vs PO-price mismatch beyond ±3% threshold.',
    ],
    openAssists: { credentials: 0, captcha: 0, authorize: 4 },
    humanAssistFreq: '1 Per 400', freqTrend: 'down',
    successRate: '76%', successTrend: 'down',
    pendingAssists: [
      { caseId: '902341', assistType: ['Comparison'], priority: 'High', minMax: '2m / 15m', blockReason: 'Unit-price vs PO-price mismatch >3%',          elapsed: '3m 58s'  },
      { caseId: '781234', assistType: ['Comparison'], priority: 'High', minMax: '3m / 18m', blockReason: 'Duplicate invoice number detected',             elapsed: '8m 13s'  },
      { caseId: '655432', assistType: ['Authorize'],  priority: 'Med',  minMax: '4m / 31m', blockReason: 'Match confidence below 85% threshold',          elapsed: '14m 29s' },
      { caseId: '512901', assistType: ['Authorize'],  priority: 'Low',  minMax: '6m / 25m', blockReason: 'Amended invoice missing version tag',            elapsed: '31m 07s' },
    ],
  },
  Classifier: {
    icon: 'category',
    agentId: '6612-8845',
    inHandling: 54,
    lastAction: 'Classified batch #C-5512',
    objective: `The Classifier categorizes incoming cases, documents, and transactions using ML-based classification models. It assigns case types, priority tiers, and routing destinations — enabling the pipeline to self-organize without human intervention for the vast majority of volume.`,
    capabilities: ['Multi-class document categorization', 'Priority scoring model', 'Custom routing rules engine', 'Continuous 14-day retraining cycle'],
    capabilities_v2: {
      triggers: {
        automated: ['New Case Received', 'Document Uploaded'],
        manual: ['Manual Classification Request'],
      },
      access: {
        workspaces: ['Intake Queue'],
        external: ['Classification Model API'],
      },
      skills: ['Multi-class Categorization', 'Priority Scoring', 'Custom Routing Rules', 'Continuous Retraining'],
      escalation: ['When classification confidence below threshold', 'When new document type unrecognized'],
    },
    insights: [
      'Model accuracy has remained above 95% for 60 consecutive days — best streak on record.',
      'Cross-border invoice edge cases are the primary source of misclassification events.',
      'Bi-weekly retraining cycles keep the model current with new document formats as they emerge.',
    ],
    openAssists: { credentials: 0, captcha: 0, authorize: 0 },
    humanAssistFreq: '1 Per 8K', freqTrend: 'up',
    successRate: '95%', successTrend: 'up',
    pendingAssists: [],
  },
};

function afTogglePanel(panelId) {
  ['af-filter-panel','af-sort-panel','af-group-panel','af-display-panel','af-columns-panel'].forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== panelId) el.classList.add('hidden');
  });
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const opening = panel.classList.contains('hidden');
  panel.classList.toggle('hidden');
  if (opening) {
    if (panelId === 'af-filter-panel')  { afRenderFilterPanel(); setTimeout(() => document.getElementById('af-filter-dp-search')?.focus(), 50); }
    if (panelId === 'af-sort-panel')    { afRenderSortPanel();   setTimeout(() => document.getElementById('af-sort-dp-search')?.focus(), 50); }
    if (panelId === 'af-group-panel')   { afRenderGroupPanel(); }
    if (panelId === 'af-columns-panel') { renderAfColumnsPanel(); setTimeout(() => document.getElementById('af-cols-dp-search')?.focus(), 50); }
  }
}

