// ── Stream output helpers ──────────────────────────────────────────────────────
function _setCaseyOutput(html, thought) {
  const finalEl = document.getElementById('wf-stream-final');
  if (!finalEl) return;
  if (thought) {
    const thoughtsEl = document.getElementById('wf-stream-thoughts');
    if (thoughtsEl) {
      const p = document.createElement('p');
      p.textContent = thought;
      thoughtsEl.appendChild(p);
      // Ensure separator exists
      const sep = thoughtsEl.nextElementSibling;
      if (sep && sep.classList.contains('wf-stream-sep')) sep.style.display = '';
    }
  }
  finalEl.classList.remove('wf-stream-fresh');
  void finalEl.offsetWidth;
  finalEl.innerHTML = html + '<span class="wf-stream-caret"></span>';
  finalEl.classList.add('wf-stream-fresh');
  const body = document.getElementById('ai-drawer-body');
  if (body) body.scrollTop = body.scrollHeight;
}

function _appendWfTypingDots() {
  const finalEl = document.getElementById('wf-stream-final');
  if (finalEl) {
    finalEl.classList.remove('wf-stream-fresh');
    void finalEl.offsetWidth;
    finalEl.innerHTML = `<span class="wf-sdot"></span><span class="wf-sdot wf-sdot-2"></span><span class="wf-sdot wf-sdot-3"></span>`;
    finalEl.classList.add('wf-stream-fresh');
  }
  const body = document.getElementById('ai-drawer-body');
  if (body) body.scrollTop = body.scrollHeight;
}
function _removeWfTypingDots() { /* dots live in stream area — replaced by next _setCaseyOutput call */ }

// ── Case handback flow ─────────────────────────────────────────────────────────
function _triggerCaseHandback(caseId) {
  // 1 — Replace solver body with completion screen
  const solverBody = document.querySelector('.wf-solver-body');
  if (solverBody) {
    solverBody.style.transition = 'opacity .35s';
    solverBody.style.opacity    = '0';
    setTimeout(() => {
      solverBody.innerHTML = `
        <div class="wf-handback-screen">
          <span class="material-symbols-outlined wf-handback-check">check_circle</span>
          <div class="wf-handback-title">Case ${caseId} — Complete</div>
          <div class="wf-handback-sub">All tasks cleared. Returning to the agent pipeline…</div>
          <div class="wf-handback-bar"><div class="wf-handback-bar-fill"></div></div>
          <div class="wf-handback-dots"><span></span><span></span><span></span></div>
        </div>`;
      solverBody.style.opacity = '1';
    }, 350);
  }

  // 2 — Casey: first typing burst (1.2 s)
  setTimeout(() => _appendWfTypingDots(), 1200);

  // 3 — Casey: message 1 — all tasks done (3.0 s)
  setTimeout(() => {
    _setCaseyOutput(
      `✅ All human-in-the-loop tasks for case <strong>${caseId}</strong> are cleared — payment authorized and all invoices retrieved. I'm resuming the automated workflow now.`,
      'All tasks cleared — resuming automated pipeline...'
    );
  }, 3000);

  // 4 — Casey: second typing burst (4.2 s)
  setTimeout(() => _appendWfTypingDots(), 4200);

  // 5 — Casey: message 2 — routing to next case (5.8 s)
  const _activeCases = _activeWfCases();
  const idx      = _activeCases.findIndex(c => c.id === caseId);
  const nextCase = _activeCases[(idx + 1) % _activeCases.length];
  setTimeout(() => {
    _setCaseyOutput(
      `Routing to the next intervention — case <strong>${nextCase.id}</strong> (${nextCase.stage}) is queued. Switching now.`,
      `Preparing handoff to case ${nextCase.id}...`
    );
  }, 5800);

  // 6 — Pulse the next feed card (6.4 s)
  setTimeout(() => {
    document.querySelectorAll('.wf-feed-card').forEach(card => {
      if (nextCase && card.textContent.includes(nextCase.id)) {
        card.classList.add('wf-next-pulse');
      }
    });
  }, 6400);

  // 7 — Slide out the completed case card (6.9 s)
  setTimeout(() => {
    document.querySelectorAll('.wf-feed-card').forEach(card => {
      if (card.textContent.includes(caseId)) card.classList.add('wf-removing');
    });
  }, 6900);

  // 8 — Remove from data + navigate to next case (7.4 s)
  setTimeout(() => {
    const _activeArr = _activeWfCases();
    const removeIdx = _activeArr.findIndex(c => c.id === caseId);
    if (removeIdx !== -1) _activeArr.splice(removeIdx, 1);
    if (nextCase) selectWorkFeedCase(nextCase.id);
    else renderWorkFeedList(); // fallback: just re-render with case gone
  }, 7400);

  // Table mode: mark "Agent taking care" immediately, then "Complete" at 5 s
  _updateWfTableStatus(caseId, 'agent-taking-care');
  setTimeout(() => {
    _updateWfTableStatus(caseId, 'complete');
    // Close Quick Actions modal if it was open for this case
    const qm = document.getElementById('wf-quick-modal');
    if (qm && qm.style.display !== 'none') closeWfQuickModal();
  }, 5000);
}

function _showEyeTooltip(btn) {
  const tip = btn.nextElementSibling;
  if (!tip) return;

  // Position first so the tooltip is in the DOM with correct layout
  const tw = 280, th = 160;
  const r  = btn.getBoundingClientRect();
  let left = r.left + r.width / 2 - tw / 2;
  let top  = r.top - th - 8;
  if (top < 8) top = r.bottom + 8;
  left = Math.max(8, Math.min(left, window.innerWidth  - tw - 8));
  top  = Math.max(8, Math.min(top,  window.innerHeight - th - 8));
  tip.style.left = left + 'px';
  tip.style.top  = top  + 'px';
  tip.style.display = 'block';

  // Dynamically scroll the invoice so the highlighted mark is centred in the viewport
  const scale   = 1.5;
  const viewH   = th / scale;          // natural pixels visible in viewport
  const scaled  = tip.querySelector('.wf-eye-scaled');
  const hlMark  = scaled?.querySelector('.wf-hl');
  if (scaled && hlMark) {
    scaled.style.marginTop = '0';      // reset first so measurements are clean
    const sTop = scaled.getBoundingClientRect().top;
    const hTop = hlMark.getBoundingClientRect().top;
    const hH   = hlMark.getBoundingClientRect().height;
    const hlNatY  = (hTop - sTop) / scale;
    const hlNatH  = hH / scale;
    // Centre the mark in the viewport: (mark_centre_natural × scale) − (th/2) = scrollY
    const scrollY = Math.max(0, (hlNatY + hlNatH / 2) * scale - th / 2);
    scaled.style.marginTop = `-${scrollY}px`;
  }
}
function _hideEyeTooltip(btn) {
  const tip = btn.nextElementSibling;
  if (tip) tip.style.display = 'none';
}

function _openInvoicePdf() {
  _pdfZoom = 100;
  const overlay = document.getElementById('wf-pdf-overlay');
  if (overlay) overlay.style.display = 'flex';
  const wrapper = document.getElementById('wf-pdf-doc-wrapper');
  if (wrapper) wrapper.style.transform = 'scale(1)';
  const lbl = document.getElementById('wf-pdf-zoom-lbl');
  if (lbl) lbl.textContent = '100%';
}
function _closeInvoicePdf() {
  const overlay = document.getElementById('wf-pdf-overlay');
  if (overlay) overlay.style.display = 'none';
}
function _pdfZoomIn() {
  _pdfZoom = Math.min(_pdfZoom + 25, 200);
  _applyPdfZoom();
}
function _pdfZoomOut() {
  _pdfZoom = Math.max(_pdfZoom - 25, 50);
  _applyPdfZoom();
}
function _applyPdfZoom() {
  const wrapper = document.getElementById('wf-pdf-doc-wrapper');
  if (wrapper) wrapper.style.transform = `scale(${_pdfZoom / 100})`;
  const lbl = document.getElementById('wf-pdf-zoom-lbl');
  if (lbl) lbl.textContent = _pdfZoom + '%';
}

function _exitWorkFeedMode() {
  _workFeedMode = false;
  _workFeedCaseId = null;
  _wfInitialized = false;            // reset so next entry shows fresh seeded content
  _wfComparisonHandoffSent = false;  // reset supervisor-check message
  const body = document.getElementById('ai-drawer-body');
  if (body) body.querySelectorAll('.wf-ai-content').forEach(e => e.remove());
  const empty = document.getElementById('ai-empty');
  if (empty) empty.style.display = '';
  _clearAiContext();
}

// ── Case data ─────────────────────────────────────────────────────────────────
const assignedData = [
  { id: '# 2001448', name: 'AMAZONFRESH', created: 'Mar 19, 2026', due: 'Apr 19, 2026',
    tier: 'Tier 1', assignees: ['Ben Septer'], overflow: '', status: 'Exception',
    stage: 'Review', fetchedBy: 'API', client: 'AMAZONFRESH',
    category: 'Document Processing', vendorNum: 'V-01448',
    documents: [
      { type: 'Invoice', name: '251206811 Invoice.pdf', status: 'Valid',  eyeball: 'Not Required' },
      { type: 'Backup',  name: '251206811.xlsx',        status: 'Valid',  eyeball: 'Not Required' },
      { type: 'POD',     name: '251206811 pod.pdf',     status: 'Failed', eyeball: 'Not Required' },
    ]
  },
  { id: '# 100002', name: '_doronELgraph',    created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Assignee #1', 'Assignee #2'], overflow: '+4', status: 'pending',     stage: 'Intake',         fetchedBy: 'API',     client: 'Acme Corp' },
  { id: '# 100003', name: 'Missing Invoice',    created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Ben Septer'],    overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'TechFlow Inc' },
  { id: '# 100004', name: '_WFmaster',         created: 'Mar 19, 2026', due: 'Mar 19, 2026', tier: 'Tier 2', assignees: ['Ben Septer', 'David Ellis'],   overflow: '+1', status: 'On progress', stage: 'Escalated',      fetchedBy: 'Webhook', client: 'DataSync Ltd' },
  { id: '# 100005', name: 'SN_message',        created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Emily Foster'],                overflow: '',   status: 'Stuck',       stage: 'Pending Review', fetchedBy: 'Import',  client: 'GlobalBank' },
  { id: '# 100006', name: 'Approval Pending',   created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                  overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'API',     client: 'NovaTech' },
  { id: '# 100007', name: '# _WFmaster',       created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 2', assignees: ["Cara D'Angelo", 'Emily Foster'],overflow: '+2', status: 'pending',     stage: 'Review',         fetchedBy: 'Webhook', client: 'Acme Corp' },
  { id: '# 100008', name: '_WFmaster',         created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 3', assignees: ['Ben Septer', 'Ahmed Arah'],    overflow: '+4', status: 'pending',     stage: 'Resolved',       fetchedBy: 'Manual',  client: 'Meridian SA' },
  { id: '# 100009', name: '_doronELgraph',     created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 3', assignees: ['Assignee #1', 'Badge'],        overflow: '+4', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'TechFlow Inc' },
  { id: '# 100010', name: '_WFmaster',         created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Assignee #2', 'Ahmed Arah'],   overflow: '+4', status: 'On progress', stage: 'Escalated',      fetchedBy: 'Import',  client: 'ClearView Co' },
  { id: '# 100011', name: '_doronELgraph',     created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Assignee #2'], overflow: '+4', status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'GlobalBank' },
  { id: '# 100012', name: 'SN_escalation',     created: 'Mar 20, 2026', due: 'Apr 20, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                  overflow: '',   status: 'pending',     stage: 'Review',         fetchedBy: 'API',     client: 'DataSync Ltd' },
  { id: '# 100013', name: 'WF_review_cycle',   created: 'Mar 20, 2026', due: 'Apr 21, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Nora Vidal'],    overflow: '+1', status: 'On progress', stage: 'Pending Review', fetchedBy: 'Manual',  client: 'NovaTech' },
  { id: '# 100014', name: 'data_sync_job',     created: 'Mar 21, 2026', due: 'Apr 22, 2026', tier: 'Tier 3', assignees: ['Liam Chen'],                   overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Import',  client: 'Acme Corp' },
  { id: '# 100015', name: 'audit_log_export',  created: 'Mar 21, 2026', due: 'Apr 23, 2026', tier: 'Tier 2', assignees: ['Emily Foster', 'Tom Reeves'],  overflow: '+2', status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'Meridian SA' },
  { id: '# 100016', name: 'bulk_reassign_v2',  created: 'Mar 22, 2026', due: 'Apr 24, 2026', tier: 'Tier 1', assignees: ['Assignee #1'],                 overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'ClearView Co' },
  { id: '# 100017', name: 'SN_message_v2',     created: 'Mar 22, 2026', due: 'Apr 25, 2026', tier: 'Tier 2', assignees: ["Cara D'Angelo", 'Ben Septer'], overflow: '+3', status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'TechFlow Inc' },
  { id: '# 100018', name: '_doronELgraph_v2',  created: 'Mar 23, 2026', due: 'Apr 26, 2026', tier: 'Tier 3', assignees: ['Priya Patel'],                 overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Import',  client: 'GlobalBank' },
  { id: '# 100019', name: 'case_merge_tool',   created: 'Mar 23, 2026', due: 'Apr 27, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Jake Moreno'],   overflow: '+1', status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Webhook', client: 'NovaTech' },
  { id: '# 100020', name: 'intake_form_fix',   created: 'Mar 24, 2026', due: 'Apr 28, 2026', tier: 'Tier 2', assignees: ['Sara Klein'],                  overflow: '',   status: 'pending',     stage: 'Pending Review', fetchedBy: 'API',     client: 'Acme Corp' },
  { id: '# 100021', name: 'priority_escalation',created: 'Mar 24, 2026', due: 'Apr 29, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Nora Vidal'],  overflow: '+2', status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'DataSync Ltd' },
  { id: '# 100022', name: 'WF_template_update',created: 'Mar 25, 2026', due: 'Apr 30, 2026', tier: 'Tier 3', assignees: ['Liam Chen', 'Ben Septer'],     overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Meridian SA' },
  { id: '# 100023', name: 'SN_routing_fix',    created: 'Mar 25, 2026', due: 'May 01, 2026', tier: 'Tier 2', assignees: ['Assignee #2'],                 overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'ClearView Co' },
  { id: '# 100024', name: 'case_dedup_scan',   created: 'Mar 26, 2026', due: 'May 02, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Ahmed Arah'],    overflow: '+4', status: 'On progress', stage: 'Escalated',      fetchedBy: 'API',     client: 'GlobalBank' },
];

const queueData = [
  { id: '# 200451', name: 'DB_migration_v3',   created: 'Mar 22, 2026', due: 'Apr 05, 2026', tier: 'Tier 1', assignees: ['Liam Chen'],                  overflow: '',   status: 'On progress', stage: 'Intake',         fetchedBy: 'API',     client: 'Acme Corp' },
  { id: '# 200452', name: 'API_gateway_fix',    created: 'Mar 24, 2026', due: 'Apr 10, 2026', tier: 'Tier 2', assignees: ['Sara Klein', 'Tom Reeves'],   overflow: '+1', status: 'pending',     stage: 'Review',         fetchedBy: 'Webhook', client: 'TechFlow Inc' },
  { id: '# 200460', name: 'auth_token_rotate',  created: 'Mar 25, 2026', due: 'Apr 02, 2026', tier: 'Tier 1', assignees: ['Nora Vidal'],                 overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'GlobalBank' },
  { id: '# 200471', name: 'cache_invalidation', created: 'Mar 20, 2026', due: 'Apr 15, 2026', tier: 'Tier 3', assignees: ['Jake Moreno', 'Priya Patel'], overflow: '+3', status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'DataSync Ltd' },
  { id: '# 200489', name: 'SN_webhook_retry',   created: 'Mar 26, 2026', due: 'Apr 12, 2026', tier: 'Tier 2', assignees: ['Ahmed Arah'],                 overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'NovaTech' },
  { id: '# 200503', name: 'log_aggregator',     created: 'Mar 21, 2026', due: 'Apr 08, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Ben Septer'], overflow: '+2', status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'Meridian SA' },
  { id: '# 200517', name: 'UI_dashboard_v2',    created: 'Mar 27, 2026', due: 'May 01, 2026', tier: 'Tier 2', assignees: ["Cara D'Angelo"],              overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'ClearView Co' },
  { id: '# 200528', name: 'batch_export_csv',   created: 'Mar 23, 2026', due: 'Apr 20, 2026', tier: 'Tier 3', assignees: ['David Ellis', 'Liam Chen'],   overflow: '',   status: 'pending',     stage: 'Escalated',      fetchedBy: 'Import',  client: 'Acme Corp' },
  { id: '# 200534', name: 'SSO_integration',    created: 'Mar 28, 2026', due: 'Apr 25, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Nora Vidal'],   overflow: '+1', status: 'Stuck',       stage: 'Pending Review', fetchedBy: 'API',     client: 'TechFlow Inc' },
  { id: '# 200541', name: 'perf_monitoring',    created: 'Mar 18, 2026', due: 'Apr 03, 2026', tier: 'Tier 2', assignees: ['Priya Patel', 'Jake Moreno'], overflow: '+2', status: 'completed',   stage: 'Closed',         fetchedBy: 'Webhook', client: 'GlobalBank' },
];

// ── Operation Cases — all cases in the solution (large dataset) ──
const _operationData = [
  { id: '# 300001', name: 'AMAZON',        created: 'Jan 02, 2026', due: 'Feb 02, 2026', tier: 'Tier 1', assignees: ['Ben Septer'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Amazon Inc' },
  { id: '# 300002', name: 'WALMART',       created: 'Jan 03, 2026', due: 'Feb 03, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah'],                  overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'Walmart Corp' },
  { id: '# 300003', name: 'TARGET',        created: 'Jan 04, 2026', due: 'Feb 04, 2026', tier: 'Tier 2', assignees: ['Emily Foster'],                overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'Target Corp' },
  { id: '# 300004', name: 'COSTCO',        created: 'Jan 05, 2026', due: 'Feb 05, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Costco' },
  { id: '# 300005', name: 'KROGER',        created: 'Jan 06, 2026', due: 'Feb 06, 2026', tier: 'Tier 3', assignees: ['Sara Klein'],                  overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Kroger' },
  { id: '# 300006', name: 'WHOLE FOODS',   created: 'Jan 07, 2026', due: 'Feb 07, 2026', tier: 'Tier 2', assignees: ['Tom Reeves'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Import',  client: 'Whole Foods' },
  { id: '# 300007', name: 'SAFEWAY',       created: 'Jan 08, 2026', due: 'Feb 08, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Safeway' },
  { id: '# 300008', name: 'CVS HEALTH',    created: 'Jan 09, 2026', due: 'Feb 09, 2026', tier: 'Tier 2', assignees: ['Liam Chen'],                   overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'CVS Health' },
  { id: '# 300009', name: 'WALGREENS',     created: 'Jan 10, 2026', due: 'Feb 10, 2026', tier: 'Tier 3', assignees: ['Nora Vidal'],                  overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'Walgreens' },
  { id: '# 300010', name: 'HOME DEPOT',    created: 'Jan 11, 2026', due: 'Feb 11, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Home Depot' },
  { id: '# 300011', name: "MACY'S",        created: 'Jan 12, 2026', due: 'Feb 12, 2026', tier: 'Tier 2', assignees: ['Jake Moreno'],                 overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: "Macy's" },
  { id: '# 300012', name: 'BEST BUY',      created: 'Jan 13, 2026', due: 'Feb 13, 2026', tier: 'Tier 1', assignees: ['Priya Patel', 'Ben Septer'],   overflow: '+1', status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Best Buy' },
  { id: '# 300013', name: 'LOWES',         created: 'Jan 14, 2026', due: 'Feb 14, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: "Lowe's" },
  { id: '# 300014', name: 'PUBLIX',        created: 'Jan 15, 2026', due: 'Feb 15, 2026', tier: 'Tier 2', assignees: ['David Ellis'],                 overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Publix' },
  { id: '# 300015', name: 'DOLLAR GENERAL',created: 'Jan 16, 2026', due: 'Feb 16, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Emily Foster'],  overflow: '+1', status: 'On progress', stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Dollar General' },
  { id: '# 300016', name: 'DOLLAR TREE',   created: 'Jan 17, 2026', due: 'Feb 17, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Dollar Tree' },
  { id: '# 300017', name: 'ALDI',          created: 'Jan 18, 2026', due: 'Feb 18, 2026', tier: 'Tier 3', assignees: ['Sara Klein'],                  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'ALDI' },
  { id: '# 300018', name: 'TRADER JOES',   created: 'Jan 19, 2026', due: 'Feb 19, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Jake Moreno'],   overflow: '',   status: 'pending',     stage: 'Review',         fetchedBy: 'Manual',  client: "Trader Joe's" },
  { id: '# 300019', name: 'NORDSTROM',     created: 'Jan 20, 2026', due: 'Feb 20, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Nordstrom' },
  { id: '# 300020', name: 'GAP',           created: 'Jan 21, 2026', due: 'Feb 21, 2026', tier: 'Tier 1', assignees: ['Liam Chen', 'Nora Vidal'],     overflow: '+1', status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Gap Inc' },
  { id: '# 300021', name: 'H&M',           created: 'Jan 22, 2026', due: 'Feb 22, 2026', tier: 'Tier 3', assignees: ['Priya Patel'],                 overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'H&M Group' },
  { id: '# 300022', name: 'ZARA',          created: 'Jan 23, 2026', due: 'Feb 23, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Zara' },
  { id: '# 300023', name: 'NIKE',          created: 'Jan 24, 2026', due: 'Feb 24, 2026', tier: 'Tier 1', assignees: ['Ben Septer', 'David Ellis'],   overflow: '',   status: 'On progress', stage: 'Escalated',      fetchedBy: 'Webhook', client: 'Nike Inc' },
  { id: '# 300024', name: 'ADIDAS',        created: 'Jan 25, 2026', due: 'Feb 25, 2026', tier: 'Tier 2', assignees: ['Ahmed Arah'],                  overflow: '',   status: 'Stuck',       stage: 'Pending Review', fetchedBy: 'API',     client: 'Adidas AG' },
  { id: '# 300025', name: 'UNDER ARMOUR',  created: 'Jan 26, 2026', due: 'Feb 26, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Under Armour' },
  { id: '# 300026', name: 'APPLE',         created: 'Jan 27, 2026', due: 'Feb 27, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Sara Klein'],  overflow: '+2', status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Apple Inc' },
  { id: '# 300027', name: 'SAMSUNG',       created: 'Jan 28, 2026', due: 'Feb 28, 2026', tier: 'Tier 2', assignees: ['Tom Reeves'],                  overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Manual',  client: 'Samsung' },
  { id: '# 300028', name: 'LG ELECTRONICS',created: 'Jan 29, 2026', due: 'Mar 01, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'LG Electronics' },
  { id: '# 300029', name: 'SONY',          created: 'Jan 30, 2026', due: 'Mar 02, 2026', tier: 'Tier 3', assignees: ['Jake Moreno', 'Liam Chen'],    overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Sony Corp' },
  { id: '# 300030', name: 'MICROSOFT',     created: 'Jan 31, 2026', due: 'Mar 03, 2026', tier: 'Tier 1', assignees: ['Nora Vidal', 'Ben Septer'],    overflow: '+1', status: 'On progress', stage: 'Escalated',      fetchedBy: 'API',     client: 'Microsoft Corp' },
  { id: '# 300031', name: 'GOOGLE',        created: 'Feb 01, 2026', due: 'Mar 04, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Google LLC' },
  { id: '# 300032', name: 'ORACLE',        created: 'Feb 02, 2026', due: 'Mar 05, 2026', tier: 'Tier 1', assignees: ['Priya Patel', 'Ahmed Arah'],   overflow: '',   status: 'Stuck',       stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Oracle Corp' },
  { id: '# 300033', name: 'SAP',           created: 'Feb 03, 2026', due: 'Mar 06, 2026', tier: 'Tier 3', assignees: ['David Ellis'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'SAP SE' },
  { id: '# 300034', name: 'SALESFORCE',    created: 'Feb 04, 2026', due: 'Mar 07, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Salesforce Inc' },
  { id: '# 300035', name: 'IBM',           created: 'Feb 05, 2026', due: 'Mar 08, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Tom Reeves'],  overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Manual',  client: 'IBM Corp' },
  { id: '# 300036', name: 'INTEL',         created: 'Feb 06, 2026', due: 'Mar 09, 2026', tier: 'Tier 2', assignees: ['Sara Klein'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Import',  client: 'Intel Corp' },
  { id: '# 300037', name: 'AMD',           created: 'Feb 07, 2026', due: 'Mar 10, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'AMD' },
  { id: '# 300038', name: 'NVIDIA',        created: 'Feb 08, 2026', due: 'Mar 11, 2026', tier: 'Tier 1', assignees: ['Jake Moreno', 'Liam Chen'],    overflow: '+2', status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'NVIDIA Corp' },
  { id: '# 300039', name: 'CISCO',         created: 'Feb 09, 2026', due: 'Mar 12, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Cisco Systems' },
  { id: '# 300040', name: 'DELL',          created: 'Feb 10, 2026', due: 'Mar 13, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Dell Technologies' },
  { id: '# 300041', name: 'HP INC',        created: 'Feb 11, 2026', due: 'Mar 14, 2026', tier: 'Tier 3', assignees: ['Nora Vidal', 'Ahmed Arah'],    overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'HP Inc' },
  { id: '# 300042', name: 'LENOVO',        created: 'Feb 12, 2026', due: 'Mar 15, 2026', tier: 'Tier 2', assignees: ['Priya Patel'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'Lenovo Group' },
  { id: '# 300043', name: 'CANON',         created: 'Feb 13, 2026', due: 'Mar 16, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Canon Inc' },
  { id: '# 300044', name: 'PHILIPS',       created: 'Feb 14, 2026', due: 'Mar 17, 2026', tier: 'Tier 2', assignees: ['David Ellis', 'Emily Foster'], overflow: '+1', status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Import',  client: 'Philips NV' },
  { id: '# 300045', name: 'SIEMENS',       created: 'Feb 15, 2026', due: 'Mar 18, 2026', tier: 'Tier 3', assignees: ['Tom Reeves'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'Siemens AG' },
  { id: '# 300046', name: 'BOSCH',         created: 'Feb 16, 2026', due: 'Mar 19, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Bosch GmbH' },
  { id: '# 300047', name: 'GENERAL ELECTRIC', created: 'Feb 17, 2026', due: 'Mar 20, 2026', tier: 'Tier 2', assignees: ['Sara Klein', 'Ben Septer'],  overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Webhook', client: 'GE Corp' },
  { id: '# 300048', name: '3M COMPANY',    created: 'Feb 18, 2026', due: 'Mar 21, 2026', tier: 'Tier 1', assignees: ['Jake Moreno'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: '3M Company' },
  { id: '# 300049', name: 'HONEYWELL',     created: 'Feb 19, 2026', due: 'Mar 22, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Honeywell Inc' },
  { id: '# 300050', name: 'CATERPILLAR',   created: 'Feb 20, 2026', due: 'Mar 23, 2026', tier: 'Tier 2', assignees: ['Liam Chen', 'Nora Vidal'],     overflow: '+1', status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'Caterpillar Inc' },
  { id: '# 300051', name: 'DEERE & CO',    created: 'Feb 21, 2026', due: 'Mar 24, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Import',  client: 'Deere & Co' },
  { id: '# 300052', name: 'FORD MOTOR',    created: 'Feb 22, 2026', due: 'Mar 25, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Ford Motor Co' },
  { id: '# 300053', name: 'GENERAL MOTORS',created: 'Feb 23, 2026', due: 'Mar 26, 2026', tier: 'Tier 3', assignees: ['Priya Patel', 'David Ellis'],  overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'GM Corp' },
  { id: '# 300054', name: 'TOYOTA',        created: 'Feb 24, 2026', due: 'Mar 27, 2026', tier: 'Tier 1', assignees: ['Emily Foster'],                overflow: '',   status: 'pending',     stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Toyota Motor' },
  { id: '# 300055', name: 'BMW',           created: 'Feb 25, 2026', due: 'Mar 28, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'BMW AG' },
  { id: '# 300056', name: 'MERCEDES',      created: 'Feb 26, 2026', due: 'Mar 29, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Sara Klein'],    overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Mercedes-Benz' },
  { id: '# 300057', name: 'VOLKSWAGEN',    created: 'Feb 27, 2026', due: 'Mar 30, 2026', tier: 'Tier 3', assignees: ['Jake Moreno'],                 overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'Volkswagen AG' },
  { id: '# 300058', name: 'HONDA',         created: 'Feb 28, 2026', due: 'Mar 31, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Honda Motor' },
  { id: '# 300059', name: 'HYUNDAI',       created: 'Mar 01, 2026', due: 'Apr 01, 2026', tier: 'Tier 1', assignees: ['Liam Chen', 'Ben Septer'],     overflow: '+1', status: 'On progress', stage: 'Pending Review', fetchedBy: 'Import',  client: 'Hyundai Motor' },
  { id: '# 300060', name: 'KIA',           created: 'Mar 02, 2026', due: 'Apr 02, 2026', tier: 'Tier 2', assignees: ['Nora Vidal'],                  overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Kia Corp' },
  { id: '# 300061', name: 'JOHNSON & JOHNSON', created: 'Mar 03, 2026', due: 'Apr 03, 2026', tier: 'Tier 1', assignees: [],                           overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'J&J Corp' },
  { id: '# 300062', name: 'PFIZER',        created: 'Mar 04, 2026', due: 'Apr 04, 2026', tier: 'Tier 3', assignees: ['Ahmed Arah', 'Priya Patel'],   overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Webhook', client: 'Pfizer Inc' },
  { id: '# 300063', name: 'MERCK',         created: 'Mar 05, 2026', due: 'Apr 05, 2026', tier: 'Tier 2', assignees: ['David Ellis'],                 overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'Merck & Co' },
  { id: '# 300064', name: 'ABBVIE',        created: 'Mar 06, 2026', due: 'Apr 06, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'AbbVie Inc' },
  { id: '# 300065', name: 'BRISTOL-MYERS', created: 'Mar 07, 2026', due: 'Apr 07, 2026', tier: 'Tier 2', assignees: ['Emily Foster', 'Tom Reeves'],  overflow: '+2', status: 'On progress', stage: 'Pending Review', fetchedBy: 'Manual',  client: 'BMS Corp' },
  { id: '# 300066', name: 'ELI LILLY',     created: 'Mar 08, 2026', due: 'Apr 08, 2026', tier: 'Tier 3', assignees: ['Sara Klein'],                  overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Eli Lilly & Co' },
  { id: '# 300067', name: 'AMGEN',         created: 'Mar 09, 2026', due: 'Apr 09, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Amgen Inc' },
  { id: '# 300068', name: 'GILEAD',        created: 'Mar 10, 2026', due: 'Apr 10, 2026', tier: 'Tier 2', assignees: ['Jake Moreno', 'Liam Chen'],    overflow: '+1', status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Gilead Sciences' },
  { id: '# 300069', name: 'BIOGEN',        created: 'Mar 11, 2026', due: 'Apr 11, 2026', tier: 'Tier 1', assignees: ['Nora Vidal'],                  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Webhook', client: 'Biogen Inc' },
  { id: '# 300070', name: 'REGENERON',     created: 'Mar 12, 2026', due: 'Apr 12, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Regeneron' },
  { id: '# 300071', name: 'PROCTER & GAMBLE', created: 'Mar 13, 2026', due: 'Apr 13, 2026', tier: 'Tier 1', assignees: ['Ben Septer', 'Ahmed Arah'],  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'P&G Corp' },
  { id: '# 300072', name: 'UNILEVER',      created: 'Mar 14, 2026', due: 'Apr 14, 2026', tier: 'Tier 2', assignees: ['Priya Patel'],                 overflow: '',   status: 'pending',     stage: 'Review',         fetchedBy: 'Manual',  client: 'Unilever PLC' },
  { id: '# 300073', name: 'COLGATE',       created: 'Mar 15, 2026', due: 'Apr 15, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Colgate-Palmolive' },
  { id: '# 300074', name: 'KIMBERLY-CLARK',created: 'Mar 16, 2026', due: 'Apr 16, 2026', tier: 'Tier 1', assignees: ['David Ellis', 'Emily Foster'], overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Kimberly-Clark' },
  { id: '# 300075', name: 'HENKEL',        created: 'Mar 17, 2026', due: 'Apr 17, 2026', tier: 'Tier 2', assignees: ['Tom Reeves'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Henkel AG' },
  { id: '# 300076', name: 'CLOROX',        created: 'Mar 18, 2026', due: 'Apr 18, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Clorox Co' },
  { id: '# 300077', name: "KRAFT HEINZ",   created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 3', assignees: ['Sara Klein', 'Jake Moreno'],   overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Webhook', client: 'Kraft Heinz' },
  { id: '# 300078', name: 'GENERAL MILLS', created: 'Mar 20, 2026', due: 'Apr 20, 2026', tier: 'Tier 2', assignees: ['Liam Chen'],                   overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'General Mills' },
  { id: '# 300079', name: "KELLOGG'S",     created: 'Mar 21, 2026', due: 'Apr 21, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: "Kellogg's" },
  { id: '# 300080', name: "CAMPBELL'S",    created: 'Mar 22, 2026', due: 'Apr 22, 2026', tier: 'Tier 2', assignees: ['Nora Vidal', 'Ben Septer'],    overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Manual',  client: "Campbell's" },
  { id: '# 300081', name: 'CONAGRA',       created: 'Mar 23, 2026', due: 'Apr 23, 2026', tier: 'Tier 3', assignees: ['Ahmed Arah'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Import',  client: 'Conagra Brands' },
  { id: '# 300082', name: 'HORMEL FOODS',  created: 'Mar 24, 2026', due: 'Apr 24, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Hormel Foods' },
  { id: '# 300083', name: 'TYSON FOODS',   created: 'Mar 25, 2026', due: 'Apr 25, 2026', tier: 'Tier 2', assignees: ['Priya Patel', 'David Ellis'],  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'Tyson Foods' },
  { id: '# 300084', name: 'SYSCO',         created: 'Mar 26, 2026', due: 'Apr 26, 2026', tier: 'Tier 1', assignees: ['Emily Foster'],                overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Sysco Corp' },
  { id: '# 300085', name: 'US FOODS',      created: 'Mar 27, 2026', due: 'Apr 27, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'US Foods' },
  { id: '# 300086', name: 'SODEXO',        created: 'Mar 28, 2026', due: 'Apr 28, 2026', tier: 'Tier 2', assignees: ['Tom Reeves', 'Sara Klein'],    overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Sodexo' },
  { id: '# 300087', name: 'ARAMARK',       created: 'Mar 29, 2026', due: 'Apr 29, 2026', tier: 'Tier 1', assignees: ['Jake Moreno'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'Aramark Corp' },
  { id: '# 300088', name: 'COMPASS GROUP', created: 'Mar 30, 2026', due: 'Apr 30, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Compass Group' },
  { id: '# 300089', name: 'FEDEX',         created: 'Mar 31, 2026', due: 'May 01, 2026', tier: 'Tier 1', assignees: ['Liam Chen', 'Nora Vidal'],     overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Import',  client: 'FedEx Corp' },
  { id: '# 300090', name: 'UPS',           created: 'Apr 01, 2026', due: 'May 02, 2026', tier: 'Tier 3', assignees: ['Ben Septer'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'UPS Inc' },
  { id: '# 300091', name: 'DHL',           created: 'Apr 02, 2026', due: 'May 03, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'DHL Group' },
  { id: '# 300092', name: 'MAERSK',        created: 'Apr 03, 2026', due: 'May 04, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Priya Patel'],   overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Webhook', client: 'Maersk Group' },
  { id: '# 300093', name: 'CARGILL',       created: 'Apr 04, 2026', due: 'May 05, 2026', tier: 'Tier 3', assignees: ['David Ellis'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Cargill Inc' },
  { id: '# 300094', name: 'ADM',           created: 'Apr 05, 2026', due: 'May 06, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'ADM Corp' },
  { id: '# 300095', name: 'BUNGE',         created: 'Apr 06, 2026', due: 'May 07, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Tom Reeves'],  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'Bunge Ltd' },
  { id: '# 300096', name: 'LOUIS DREYFUS', created: 'Apr 07, 2026', due: 'May 08, 2026', tier: 'Tier 2', assignees: ['Sara Klein'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Import',  client: 'Louis Dreyfus' },
  { id: '# 300097', name: 'VITERRA',       created: 'Apr 08, 2026', due: 'May 09, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Viterra Inc' },
  { id: '# 300098', name: 'GLENCORE',      created: 'Apr 09, 2026', due: 'May 10, 2026', tier: 'Tier 1', assignees: ['Jake Moreno', 'Liam Chen'],    overflow: '+2', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Glencore PLC' },
  { id: '# 300099', name: 'TRAFIGURA',     created: 'Apr 10, 2026', due: 'May 11, 2026', tier: 'Tier 2', assignees: ['Nora Vidal'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Webhook', client: 'Trafigura Group' },
  { id: '# 300100', name: 'VITOL',         created: 'Apr 11, 2026', due: 'May 12, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Vitol Group' },
  { id: '# 300101', name: 'SHELL',         created: 'Apr 12, 2026', due: 'May 13, 2026', tier: 'Tier 3', assignees: ['Ben Septer', 'Ahmed Arah'],    overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'Shell PLC' },
  { id: '# 300102', name: 'BP',            created: 'Apr 13, 2026', due: 'May 14, 2026', tier: 'Tier 2', assignees: ['Priya Patel'],                 overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Manual',  client: 'BP PLC' },
  { id: '# 300103', name: 'CHEVRON',       created: 'Apr 14, 2026', due: 'May 15, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Chevron Corp' },
  { id: '# 300104', name: 'EXXONMOBIL',    created: 'Apr 15, 2026', due: 'May 16, 2026', tier: 'Tier 2', assignees: ['David Ellis', 'Emily Foster'], overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'ExxonMobil Corp' },
  { id: '# 300105', name: 'TOTALENERGIES', created: 'Apr 16, 2026', due: 'May 17, 2026', tier: 'Tier 3', assignees: ['Tom Reeves'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'TotalEnergies SE' },
  { id: '# 300106', name: 'EQUINOR',       created: 'Apr 17, 2026', due: 'May 18, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Equinor ASA' },
  { id: '# 300107', name: 'PETROBRAS',     created: 'Apr 18, 2026', due: 'May 19, 2026', tier: 'Tier 2', assignees: ['Sara Klein', 'Jake Moreno'],   overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Webhook', client: 'Petrobras' },
  { id: '# 300108', name: 'ARAMCO',        created: 'Apr 19, 2026', due: 'May 20, 2026', tier: 'Tier 1', assignees: ['Liam Chen'],                   overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'Saudi Aramco' },
  { id: '# 300109', name: 'ENBRIDGE',      created: 'Apr 20, 2026', due: 'May 21, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Enbridge Inc' },
  { id: '# 300110', name: 'WILLIAMS COS',  created: 'Apr 21, 2026', due: 'May 22, 2026', tier: 'Tier 2', assignees: ['Nora Vidal', 'Ben Septer'],    overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Manual',  client: 'Williams Cos' },
  { id: '# 300111', name: 'JPMORGAN',      created: 'Apr 22, 2026', due: 'May 23, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Import',  client: 'JPMorgan Chase' },
  { id: '# 300112', name: 'BANK OF AMERICA',created: 'Apr 23, 2026', due: 'May 24, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Bank of America' },
  { id: '# 300113', name: 'WELLS FARGO',   created: 'Apr 24, 2026', due: 'May 25, 2026', tier: 'Tier 3', assignees: ['Priya Patel', 'David Ellis'],  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'Wells Fargo' },
  { id: '# 300114', name: 'CITIGROUP',     created: 'Apr 25, 2026', due: 'May 26, 2026', tier: 'Tier 1', assignees: ['Emily Foster'],                overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Citigroup Inc' },
  { id: '# 300115', name: 'GOLDMAN SACHS', created: 'Apr 26, 2026', due: 'May 27, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Goldman Sachs' },
  { id: '# 300116', name: 'MORGAN STANLEY',created: 'Apr 27, 2026', due: 'May 28, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Sara Klein'],    overflow: '+2', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Morgan Stanley' },
  { id: '# 300117', name: 'BLACKROCK',     created: 'Apr 28, 2026', due: 'May 29, 2026', tier: 'Tier 3', assignees: ['Jake Moreno'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'BlackRock Inc' },
  { id: '# 300118', name: 'VANGUARD',      created: 'Apr 29, 2026', due: 'May 30, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Vanguard Group' },
  { id: '# 300119', name: 'FIDELITY',      created: 'Apr 30, 2026', due: 'May 31, 2026', tier: 'Tier 1', assignees: ['Liam Chen', 'Nora Vidal'],     overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Import',  client: 'Fidelity Investments' },
  { id: '# 300120', name: 'AMERICAN EXPRESS', created: 'May 01, 2026', due: 'Jun 01, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'AmEx Corp' },
  { id: '# 300121', name: 'VISA',          created: 'May 02, 2026', due: 'Jun 02, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Visa Inc' },
  { id: '# 300122', name: 'MASTERCARD',    created: 'May 03, 2026', due: 'Jun 03, 2026', tier: 'Tier 3', assignees: ['Ahmed Arah', 'Priya Patel'],   overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Webhook', client: 'Mastercard Inc' },
  { id: '# 300123', name: 'PAYPAL',        created: 'May 04, 2026', due: 'Jun 04, 2026', tier: 'Tier 2', assignees: ['David Ellis'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'PayPal Holdings' },
  { id: '# 300124', name: 'STRIPE',        created: 'May 05, 2026', due: 'Jun 05, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Stripe Inc' },
  { id: '# 300125', name: 'SQUARE',        created: 'May 06, 2026', due: 'Jun 06, 2026', tier: 'Tier 2', assignees: ['Emily Foster', 'Tom Reeves'],  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'Block Inc' },
  { id: '# 300126', name: 'INTUIT',        created: 'May 07, 2026', due: 'Jun 07, 2026', tier: 'Tier 3', assignees: ['Sara Klein'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Import',  client: 'Intuit Inc' },
  { id: '# 300127', name: 'SERVICENOW',    created: 'May 08, 2026', due: 'Jun 08, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'ServiceNow Inc' },
  { id: '# 300128', name: 'WORKDAY',       created: 'May 09, 2026', due: 'Jun 09, 2026', tier: 'Tier 2', assignees: ['Jake Moreno', 'Liam Chen'],    overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Workday Inc' },
  { id: '# 300129', name: 'ZENDESK',       created: 'May 10, 2026', due: 'Jun 10, 2026', tier: 'Tier 1', assignees: ['Nora Vidal'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Webhook', client: 'Zendesk Inc' },
  { id: '# 300130', name: 'HUBSPOT',       created: 'May 11, 2026', due: 'Jun 11, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'HubSpot Inc' },
  { id: '# 300131', name: 'SHOPIFY',       created: 'May 12, 2026', due: 'Jun 12, 2026', tier: 'Tier 2', assignees: ['Ben Septer', 'Ahmed Arah'],    overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'Shopify Inc' },
  { id: '# 300132', name: 'TWILIO',        created: 'May 13, 2026', due: 'Jun 13, 2026', tier: 'Tier 1', assignees: ['Priya Patel'],                 overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Manual',  client: 'Twilio Inc' },
  { id: '# 300133', name: 'DATADOG',       created: 'May 14, 2026', due: 'Jun 14, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Datadog Inc' },
  { id: '# 300134', name: 'SNOWFLAKE',     created: 'May 15, 2026', due: 'Jun 15, 2026', tier: 'Tier 3', assignees: ['David Ellis', 'Emily Foster'], overflow: '+2', status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Snowflake Inc' },
  { id: '# 300135', name: 'DATABRICKS',    created: 'May 16, 2026', due: 'Jun 16, 2026', tier: 'Tier 1', assignees: ['Tom Reeves'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'API',     client: 'Databricks Inc' },
  { id: '# 300136', name: 'PALANTIR',      created: 'May 17, 2026', due: 'Jun 17, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Palantir Technologies' },
  { id: '# 300137', name: 'C3.AI',         created: 'May 18, 2026', due: 'Jun 18, 2026', tier: 'Tier 3', assignees: ['Sara Klein', 'Jake Moreno'],   overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Webhook', client: 'C3.ai Inc' },
  { id: '# 300138', name: 'VEEVA SYSTEMS', created: 'May 19, 2026', due: 'Jun 19, 2026', tier: 'Tier 1', assignees: ['Liam Chen'],                   overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'Veeva Systems' },
  { id: '# 300139', name: 'EPIC SYSTEMS',  created: 'May 20, 2026', due: 'Jun 20, 2026', tier: 'Tier 2', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Epic Systems' },
  { id: '# 300140', name: 'CERNER',        created: 'May 21, 2026', due: 'Jun 21, 2026', tier: 'Tier 1', assignees: ['Nora Vidal', 'Ben Septer'],    overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'Manual',  client: 'Cerner Corp' },
  { id: '# 300141', name: 'MEDITECH',      created: 'May 22, 2026', due: 'Jun 22, 2026', tier: 'Tier 3', assignees: ['Ahmed Arah'],                  overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Import',  client: 'MEDITECH' },
  { id: '# 300142', name: 'CHANGE HEALTHCARE', created: 'May 23, 2026', due: 'Jun 23, 2026', tier: 'Tier 2', assignees: [],                          overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Change Healthcare' },
  { id: '# 300143', name: 'OPTUM',         created: 'May 24, 2026', due: 'Jun 24, 2026', tier: 'Tier 1', assignees: ['Priya Patel', 'David Ellis'],  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'API',     client: 'Optum Inc' },
  { id: '# 300144', name: 'AETNA',         created: 'May 25, 2026', due: 'Jun 25, 2026', tier: 'Tier 2', assignees: ['Emily Foster'],                overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'Webhook', client: 'Aetna Inc' },
  { id: '# 300145', name: 'CIGNA',         created: 'May 26, 2026', due: 'Jun 26, 2026', tier: 'Tier 3', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Cigna Corp' },
  { id: '# 300146', name: 'HUMANA',        created: 'May 27, 2026', due: 'Jun 27, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Sara Klein'],    overflow: '+1', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'Humana Inc' },
  { id: '# 300147', name: 'ANTHEM',        created: 'May 28, 2026', due: 'Jun 28, 2026', tier: 'Tier 2', assignees: ['Jake Moreno'],                 overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'Anthem Inc' },
  { id: '# 300148', name: 'CENTENE',       created: 'May 29, 2026', due: 'Jun 29, 2026', tier: 'Tier 1', assignees: [],                              overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: '',        client: 'Centene Corp' },
  { id: '# 300149', name: 'MOLINA HEALTHCARE', created: 'May 30, 2026', due: 'Jun 30, 2026', tier: 'Tier 3', assignees: ['Liam Chen', 'Nora Vidal'],  overflow: '',  status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Import',  client: 'Molina Healthcare' },
  { id: '# 300150', name: 'UNITEDHEALTH',  created: 'May 31, 2026', due: 'Jul 01, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                  overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'UnitedHealth Group' },
];

let currentTab = 'operation';

// ── Column definitions ──
const COLS = [
  {key:'id',        label:'ID'},
  {key:'name',      label:'Case Name'},
  {key:'created',   label:'Create Date'},
  {key:'due',       label:'Due Date'},
  {key:'tier',      label:'Tier'},
  {key:'assignee',  label:'Assignee'},
  {key:'status',    label:'Status'},
  {key:'stage',     label:'Stage Name'},
  {key:'fetchedBy', label:'Fetched By'},
  {key:'client',    label:'Client Name'},
];

// Deductions solution — My Work table columns
const _DEDUCTION_COLS = [
  {key:'id',         label:'Case ID'},
  {key:'name',       label:'Customer'},
  {key:'created',    label:'Created'},
  {key:'reasonType', label:'Reason Type'},
  {key:'stage',      label:'Stage'},
  {key:'status',     label:'Status'},
];

function getRowValue(row, key) {
  if (key === 'id')        return row.id;
  if (key === 'name')      return row.name;
  if (key === 'created')   return row.created;
  if (key === 'due')       return row.due;
  if (key === 'tier')      return row.tier;
  if (key === 'assignee')  return row.assignees.join(', ');
  if (key === 'status')    return row.status;
  if (key === 'stage')     return row.stage     || '';
  if (key === 'fetchedBy')   return row.fetchedBy   || '';
  if (key === 'client')      return row.client      || '';
  if (key === 'reasonType')  return row.reasonType  || '';
  if (key === 'allocated')   return (row.assignees && row.assignees.length > 0 && row.assignees[0]) ? 'yes' : 'no';
  return '';
}

function statusClass(status) {
  const s = status.toLowerCase();
  if (s === 'pending')       return 'pending';
  if (s === 'on progress')   return 'on-progress';
  if (s === 'stuck')         return 'stuck';
  if (s === 'completed')     return 'completed';
  if (s === 'intervention')  return 'intervention';
  if (s === 'running')       return 'running';
  if (s === 'awaiting')      return 'awaiting';
  return 'pending';
}

// Display label for a status value
function statusLabel(status) {
  const s = (status || '').toLowerCase();
  if (s === 'intervention') return 'Intervention';
  if (s === 'running')      return 'Running';
  if (s === 'awaiting')     return 'Awaiting';
  if (s === 'on progress')  return 'On Progress';
  return status || '—';
}

// ── Feature state ──
let rowDensity     = 'default'; // 'default' | 'compact' | 'spacious'
let _aiQuickWinActive = false;
const _QUICK_WIN_IDS  = new Set(['# 2001448', '# 100003', '# 100006']);
let filterFields   = []; // [{field, value}]
let sortRules      = []; // [{field, dir}]
let groupField     = null;
let hiddenCols     = new Set();
let collapsedGroups = new Set(); // groups collapsed in table (∨ click)
let hiddenGroups   = new Set(); // groups hidden from table entirely (eye icon)
let groupOrder     = []; // custom group order (drag to reorder)
let groupDragIdx   = null;
let colOrder       = [..._DEDUCTION_COLS]; // mutable column order (drag to reorder)
let colDragIdx     = null;
let frozenCol      = null; // key of the rightmost frozen column (all cols left of it are also frozen)
let pinnedCols     = new Set(); // keys of pinned columns (always appear first in colOrder)
let colWidths      = {}; // {key: pixelWidth} — inline style overrides for resized columns

// ── Workflows portal data ─────────────────────────────────────────────────
const _workflowsCoraData = [
  { wfId: 'WF-001', wfName: 'Invoice End-to-End Processing',   createdDate: '2024-01-15', updatedDate: '2024-03-20', ownedBy: 'Ben Septer'      },
  { wfId: 'WF-002', wfName: 'Exception Handling Pipeline',     createdDate: '2024-01-22', updatedDate: '2024-03-18', ownedBy: 'Sarah Johnson'   },
  { wfId: 'WF-003', wfName: 'Matching & Reconciliation',       createdDate: '2024-02-01', updatedDate: '2024-04-05', ownedBy: 'Ahmed Arah'      },
  { wfId: 'WF-004', wfName: 'Customer Onboarding Automation',  createdDate: '2024-02-14', updatedDate: '2024-03-30', ownedBy: 'Priya Nair'      },
  { wfId: 'WF-005', wfName: 'Credit Hold Processing',          createdDate: '2024-02-28', updatedDate: '2024-04-10', ownedBy: 'Michael Nguyen'  },
  { wfId: 'WF-006', wfName: 'Remittance Capture & Posting',    createdDate: '2024-03-05', updatedDate: '2024-04-12', ownedBy: 'Ben Septer'      },
  { wfId: 'WF-007', wfName: 'Dispute Resolution Workflow',     createdDate: '2024-03-10', updatedDate: '2024-04-15', ownedBy: 'David Kim'       },
  { wfId: 'WF-008', wfName: 'Short-pay Recovery',              createdDate: '2024-03-18', updatedDate: '2024-04-18', ownedBy: 'Sarah Johnson'   },
];
const _workflowsDedData = [
  { wfId: 'WF-DED-001', wfName: 'Deduction Validation Pipeline',  createdDate: '2024-01-10', updatedDate: '2024-03-25', ownedBy: 'Emily Foster'    },
  { wfId: 'WF-DED-002', wfName: 'OCR Document Processing',        createdDate: '2024-01-20', updatedDate: '2024-03-28', ownedBy: 'Ben Septer'      },
  { wfId: 'WF-DED-003', wfName: 'Credit Memo Generation',         createdDate: '2024-02-05', updatedDate: '2024-04-02', ownedBy: 'Priya Nair'      },
  { wfId: 'WF-DED-004', wfName: 'Dispute Resolution',             createdDate: '2024-02-12', updatedDate: '2024-04-08', ownedBy: 'Marcus Webb'     },
  { wfId: 'WF-DED-005', wfName: 'Settlement Automation',          createdDate: '2024-02-20', updatedDate: '2024-04-11', ownedBy: 'Ahmed Arah'      },
  { wfId: 'WF-DED-006', wfName: 'POD Retrieval Workflow',         createdDate: '2024-03-01', updatedDate: '2024-04-14', ownedBy: 'Ben Septer'      },
  { wfId: 'WF-DED-007', wfName: 'Short-pay Analysis',             createdDate: '2024-03-08', updatedDate: '2024-04-17', ownedBy: 'David Kim'       },
  { wfId: 'WF-DED-008', wfName: 'Remittance Reconciliation',      createdDate: '2024-03-15', updatedDate: '2024-04-20', ownedBy: 'Sarah Johnson'   },
];
function _activeWorkflows() {
  return (typeof activeSolution !== 'undefined' && activeSolution === 'deduction')
    ? _workflowsDedData : _workflowsCoraData;
}

// ── Work Feed column definitions ──
const WF_CASE_COLS = [
  {key:'type',      label:'Type'},
  {key:'id',        label:'Task ID'},
  {key:'status',    label:'Status'},
  {key:'assists',   label:'Assists Needed'},
  {key:'priority',  label:'Priority'},
  {key:'stage',     label:'Stage'},
  {key:'team',      label:'Team'},
  {key:'assignTo',  label:'Assign to'},
  {key:'fetchedBy', label:'Fetched by'},
];
const WF_TASK_COLS = [
  {key:'agent',    label:'Agent'},
  {key:'status',   label:'Status'},
  {key:'need',     label:"What's needed"},
  {key:'priority', label:'Priority'},
  {key:'summary',  label:'Summary'},
];
let wfColOrder       = [...WF_CASE_COLS];
let wfHiddenCols     = new Set();
let wfColWidths      = { type: 110 };
let wfColDragIdx     = null;
let wfTaskColOrder   = [...WF_TASK_COLS];
let wfTaskHiddenCols = new Set();
let wfTaskColWidths  = {};

// WF rich-header per-mode state
let wfCaseSortRules  = [];              let wfTaskSortRules  = [];
let wfCasePinnedCols = new Set();       let wfTaskPinnedCols = new Set();
let wfCaseFrozenCol  = null;            let wfTaskFrozenCol  = null;
let wfGroupField     = null;            // active group-by field for WF table

// WF toolbar state
let wfFilterFields        = [];         // [{field, value}]
let wfActiveFilterPopover = null;
let wfSortEditorOpen      = false;

// Close WF filter popover / sort editor on outside click
document.addEventListener('click', e => {
  let changed = false;
  if (wfActiveFilterPopover && !e.target.closest('#wf-active-bar .filter-pill')) {
    wfActiveFilterPopover = null; changed = true;
  }
  if (wfSortEditorOpen && !e.target.closest('.sort-pill') && !e.target.closest('.sort-editor')) {
    wfSortEditorOpen = false; changed = true;
  }
  if (changed) wfRenderActiveBar();
});
let wfSortDragIdx         = null;

// Shared col-context-menu dispatch: 'mw' | 'wf' | 'af'
let _colCtxTable = 'mw';

let currentPage    = 1;
let itemsPerPage   = 10;
let lastTotalPages = 1;

// ── Dropdown toggle (mutual close) ──
function toggleDropdown(name) {
  const ids = {filter:'filter-panel', sort:'sort-panel', group:'group-panel', display:'display-panel', columns:'columns-panel'};
  const panel = document.getElementById(ids[name]);
  const opening = panel.classList.contains('hidden');
  Object.values(ids).forEach(id => document.getElementById(id).classList.add('hidden'));
  if (opening) {
    panel.classList.remove('hidden');
    if (name === 'filter')  renderFilterPanel();
    if (name === 'sort')    renderSortPanel();
    if (name === 'group')   renderGroupPanel();
    if (name === 'columns') renderColumnsPanel();
  }
}
function closeAllDropdowns() {
  ['filter-panel','sort-panel','group-panel','display-panel','columns-panel'].forEach(id =>
    document.getElementById(id).classList.add('hidden'));
}
document.addEventListener('click', e => { if (!e.target.closest('.tb-wrap')) closeAllDropdowns(); });

// Close case stage popover on outside click
document.addEventListener('click', e => {
  if (_stagePopoverOpen && !e.target.closest('#case-stage-item')) _closeStagePopover();
});

// ── Work Feed stage popover ──
const WF_STAGES = [
  { name: 'Document Collection',  sub: 'Gather all required documents'           },
  { name: 'Invoice Retrieval',    sub: 'Retrieve invoices from vendor portals'   },
  { name: 'Comparison',           sub: 'Compare invoices with PO data'           },
  { name: 'Dispute Resolution',   sub: 'Resolve any discrepancies found'         },
  { name: 'Settlement',           sub: 'Final settlement and case closure'        },
];
let _wfStagePopoverOpen = false;

function toggleWfStagePopover(event) {
  event.stopPropagation();
  _wfStagePopoverOpen ? _closeWfStagePopover() : _openWfStagePopover();
}
function _openWfStagePopover() {
  _wfStagePopoverOpen = true;
  _renderWfStagePopover();
  document.getElementById('wf-stage-popover')?.classList.remove('hidden');
  document.getElementById('wf-stage-chevron')?.classList.add('open');
}
function _closeWfStagePopover() {
  _wfStagePopoverOpen = false;
  document.getElementById('wf-stage-popover')?.classList.add('hidden');
  document.getElementById('wf-stage-chevron')?.classList.remove('open');
}
function _renderWfStagePopover() {
  const popover = document.getElementById('wf-stage-popover');
  if (!popover) return;
  const caseData = _activeWfCases().find(c => c.id === activeWorkFeedCase);
  const currentStage = caseData?.stage || '';
  const currentIdx = WF_STAGES.findIndex(s => s.name === currentStage);
  popover.innerHTML = WF_STAGES.map((s, i) => {
    const isDone    = i < currentIdx;
    const isCurrent = i === currentIdx;
    const cls = isCurrent ? 'current' : (isDone ? 'done' : '');
    const badgeContent = isDone
      ? `<span class="material-symbols-outlined" style="font-size:12px">check</span>`
      : (i + 1);
    return `<div class="stage-pop-item ${cls}">
      <div class="stage-pop-badge">${badgeContent}</div>
      <div>
        <div class="stage-pop-name">${s.name}</div>
        <div class="stage-pop-sub">${isCurrent ? 'In progress' : (isDone ? 'Completed' : s.sub)}</div>
      </div>
    </div>`;
  }).join('');
}
document.addEventListener('click', e => {
  if (_wfStagePopoverOpen && !e.target.closest('#wf-stage-trigger')) _closeWfStagePopover();
});

// ── Filter ──
let activeFilterPopover = null;
let sortEditorOpen = false;
let sortDragIdx = null;

function renderFilterPanel(search) {
  search = search !== undefined ? search : (document.getElementById('filter-dp-search').value || '');
  const active = filterFields.map(f => f.field);
  document.getElementById('filter-field-list').innerHTML = COLS
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="event.stopPropagation();toggleFilterField('${c.key}')">
        <input type="checkbox" ${active.includes(c.key) ? 'checked' : ''} onclick="event.stopPropagation();toggleFilterField('${c.key}')">
        ${c.label}
      </div>`).join('');
}
function filterDpSearch(q) { renderFilterPanel(q); }
function openFilterPicker(event) { event.stopPropagation(); toggleDropdown('filter'); }

function toggleFilterField(key) {
  const idx = filterFields.findIndex(f => f.field === key);
  if (idx >= 0) {
    filterFields.splice(idx, 1);
    activeFilterPopover = null;
  } else {
    filterFields.push({field: key, value: ''});
    activeFilterPopover = key;
  }
  renderFilterPanel();
  renderActiveBar();
  applyAndRender();
}
function removeFilterField(key) {
  filterFields = filterFields.filter(f => f.field !== key);
  if (activeFilterPopover === key) activeFilterPopover = null;
  renderFilterPanel();
  renderActiveBar();
  applyAndRender();
}
function updateFilterValue(key, val) {
  const f = filterFields.find(f => f.field === key);
  if (f) { f.value = val; renderActiveBar(); applyAndRender(); }
}
function openFilterPopover(key, event) {
  event && event.stopPropagation();
  closeAllDropdowns();
  sortEditorOpen = false;
  if (activeFilterPopover === key) { activeFilterPopover = null; renderActiveBar(); return; }
  activeFilterPopover = key;
  renderActiveBar();
}

// Close filter popover / sort editor on outside click
document.addEventListener('click', e => {
  let changed = false;
  if (activeFilterPopover && !e.target.closest('.filter-pill')) {
    activeFilterPopover = null;
    changed = true;
  }
  if (sortEditorOpen && !e.target.closest('.sort-pill') && !e.target.closest('.sort-editor')) {
    sortEditorOpen = false;
    changed = true;
  }
  if (changed) renderActiveBar();
});

function toggleSortEditor(event) {
  event && event.stopPropagation();
  closeAllDropdowns();
  sortEditorOpen = !sortEditorOpen;
  renderActiveBar();
}

// ── Sort ──
function renderSortPanel(search) {
  search = search !== undefined ? search : (document.getElementById('sort-dp-search').value || '');
  document.getElementById('sort-field-list').innerHTML = COLS
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="addSortRule('${c.key}')">${c.label}</div>`).join('');
}
function sortDpSearch(q) { renderSortPanel(q); }

function addSortRule(key) {
  if (key) {
    // Called from sort panel picker — add with specific field
    sortRules.push({field: key, dir: 'asc'});
    sortEditorOpen = true;
    closeAllDropdowns();
    renderActiveBar();
    applyAndRender();
  } else {
    // "+ Add sort" button — add pending row, let user pick field
    sortRules.push({field: '', dir: 'asc'});
    sortEditorOpen = true;
    closeAllDropdowns();
    renderActiveBar();
    // Focus the new row's field select
    const selects = document.querySelectorAll('.sort-editor-row select:first-of-type');
    const last = selects[selects.length - 1];
    if (last) last.focus();
  }
}
function removeSortRule(i) {
  sortRules.splice(i, 1);
  if (!sortRules.length) sortEditorOpen = false;
  renderActiveBar();
  applyAndRender();
}
function setSortField(i, key) { sortRules[i].field = key; renderActiveBar(); applyAndRender(); }
function setSortDir(i, dir)   { sortRules[i].dir   = dir; renderActiveBar(); applyAndRender(); }
function clearAllSorts() {
  sortRules = [];
  sortEditorOpen = false;
  renderActiveBar();
  applyAndRender();
}
function sortDragStart(e, idx) {
  sortDragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function sortDrop(e, toIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (sortDragIdx === null || sortDragIdx === toIdx) { sortDragIdx = null; return; }
  const moved = sortRules.splice(sortDragIdx, 1)[0];
  sortRules.splice(toIdx, 0, moved);
  sortDragIdx = null;
  renderActiveBar();
  applyAndRender();
}

// ── Unified active bar (sort pill | group pill | divider | filter pills | + Filter | ↺ Reset) ──
function renderActiveBar() {
  const bar = document.getElementById('active-bar');
  const sortBtn = document.getElementById('sort-btn');
  const filterBtn = document.getElementById('filter-btn');
  const hasSorts = sortRules.length > 0;
  const hasFilters = filterFields.length > 0;
  const isNamedView = getViewSection(activeViewId) !== 'system';

  if (!hasSorts && !hasFilters && !_aiQuickWinActive || (isNamedView && !isViewModified())) {
    bar.classList.add('hidden');
    sortBtn.classList.remove('active');
    filterBtn.classList.remove('active');
    sortEditorOpen = false;
    return;
  }
  bar.classList.remove('hidden');
  sortBtn.classList.toggle('active', hasSorts);
  filterBtn.classList.toggle('active', hasFilters);

  let html = '';

  // AI quick-wins badge — shown at front of bar so user knows AI is filtering
  if (_aiQuickWinActive) {
    html += `<span class="ai-filter-indicator">
      <span class="material-symbols-outlined">auto_awesome</span>AI filtered
      <button class="ai-fi-close" onclick="clearAiQuickWin()" title="Remove AI filter">&times;</button>
    </span>`;
    if (hasSorts || hasFilters) html += `<div class="active-bar-section-divider"></div>`;
  }

  // Sort pill
  if (hasSorts) {
    const r0 = sortRules[0];
    const col0 = COLS.find(c => c.key === r0.field);
    const pillLabel = sortRules.length === 1
      ? `${col0.label} ${r0.dir === 'asc' ? '↑' : '↓'}`
      : `${sortRules.length} sorts`;
    html += `<button class="sort-pill" onclick="toggleSortEditor(event)">
      ${pillLabel}
      <span class="material-symbols-outlined" style="font-size:14px">${sortEditorOpen ? 'expand_less' : 'expand_more'}</span>
    </button>`;
    if (sortEditorOpen) {
      html += `<div class="sort-editor" onclick="event.stopPropagation()">
        ${sortRules.map((r, i) => `
          <div class="sort-editor-row" draggable="true"
              ondragstart="sortDragStart(event,${i})"
              ondragover="event.preventDefault();this.classList.add('drag-over')"
              ondragleave="this.classList.remove('drag-over')"
              ondrop="sortDrop(event,${i})">
            <span class="material-symbols-outlined" style="color:#ccc;font-size:16px;cursor:grab;flex-shrink:0">drag_indicator</span>
            <select onchange="setSortField(${i},this.value)">
              ${!r.field ? `<option value="" disabled selected>Pick a field…</option>` : ''}
              ${COLS.map(c => `<option value="${c.key}" ${r.field===c.key?'selected':''}>${c.label}</option>`).join('')}
            </select>
            <select onchange="setSortDir(${i},this.value)">
              <option value="asc" ${r.dir==='asc'?'selected':''}>Ascending</option>
              <option value="desc" ${r.dir==='desc'?'selected':''}>Descending</option>
            </select>
            <button class="remove-sort" onclick="removeSortRule(${i})">&times;</button>
          </div>`).join('')}
        <button class="dp-add-sort" onclick="addSortRule(null)">+ Add sort</button>
        <div class="dp-divider"></div>
        <button class="dp-delete-btn" onclick="clearAllSorts()">
          <span class="material-symbols-outlined" style="font-size:15px">delete</span>Delete sort
        </button>
      </div>`;
    }
  }

  // Divider between sort pills and filter pills
  if (hasSorts && hasFilters) {
    html += `<div class="active-bar-section-divider"></div>`;
  }

  // Filter pills
  filterFields.forEach(f => {
    const col = COLS.find(c => c.key === f.field);
    const isEmpty = !f.value;
    const isOpen = activeFilterPopover === f.field;
    const popoverHtml = isOpen ? `
      <div class="filter-popover" onclick="event.stopPropagation()">
        <div class="fp-header">
          <span>${col.label}</span>
          <button class="fp-contains">contains <span class="material-symbols-outlined">expand_more</span></button>
          <button class="fp-overflow">···</button>
        </div>
        <div class="fp-input-row">
          <input class="fp-input" type="text" placeholder="Type a value..." value="${f.value}"
            oninput="updateFilterValue('${f.field}', this.value)" autofocus>
          ${f.value ? `<button class="fp-clear" onclick="updateFilterValue('${f.field}','');renderActiveBar()">&times;</button>` : ''}
        </div>
        <button class="fp-delete" onclick="removeFilterField('${f.field}')">
          <span class="material-symbols-outlined">delete</span>Delete filter
        </button>
      </div>` : '';
    html += `<div class="filter-pill ${isEmpty ? 'empty' : ''}" onclick="openFilterPopover('${f.field}', event)">
      ${f.value ? `<span style="color:#888;margin-right:2px">${col.label}:</span>${f.value}` : col.label}
      <button class="pill-x" onclick="event.stopPropagation();removeFilterField('${f.field}')">&times;</button>
      ${popoverHtml}
    </div>`;
  });

  // Action buttons (always shown when bar is visible)
  html += `<button class="filter-bar-add" onclick="openFilterPicker(event)">
    <span class="material-symbols-outlined">add</span>Filter
  </button>
  <div class="filter-bar-divider"></div>
  <button class="filter-bar-reset" onclick="resetAll()">
    <span class="material-symbols-outlined">refresh</span>Reset
  </button>`;

  bar.innerHTML = html;

  if (activeFilterPopover) {
    const input = bar.querySelector('.fp-input');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
}

function resetAll() {
  filterFields = [];
  sortRules = [];
  activeFilterPopover = null;
  sortEditorOpen = false;
  renderFilterPanel();
  renderSortPanel();
  renderActiveBar();
  applyAndRender();
}

// ── Team dropdown ─────────────────────────────────────────────────────────────
const TEAMS = [
  { id: 'analytics',  label: 'Analytics Team'  },
  { id: 'ocr',        label: 'OCR Team'         },
  { id: 'deductions', label: 'Deductions Team'  },
  { id: 'disputes',   label: 'Disputes Team'    },
  { id: 'compliance', label: 'Compliance Team'  },
];
let _selectedTeams = new Set(TEAMS.map(t => t.id)); // all selected by default

function _renderTeamList() {
  const list = document.getElementById('team-dropdown-list');
  if (!list) return;
  list.innerHTML = TEAMS.map(t => `
    <div class="fd-item" onclick="teamToggle('${t.id}')">
      <input type="checkbox" ${_selectedTeams.has(t.id) ? 'checked' : ''} onclick="event.stopPropagation();teamToggle('${t.id}')">
      ${t.label}
    </div>`).join('');
}
function _syncTeamLabel() {
  const lbl = document.getElementById('team-dropdown-label');
  if (!lbl) return;
  if (_selectedTeams.size === TEAMS.length) { lbl.textContent = 'All selected'; return; }
  if (_selectedTeams.size === 0)            { lbl.textContent = 'None';         return; }
  if (_selectedTeams.size === 1)            { lbl.textContent = TEAMS.find(t => _selectedTeams.has(t.id))?.label; return; }
  lbl.textContent = `${_selectedTeams.size} teams`;
}
function toggleTeamDropdown(e) {
  e && e.stopPropagation();
  const panel = document.getElementById('team-dropdown-panel');
  if (!panel) return;
  const opening = !panel.classList.contains('open');
  // close all other fd-panels first
  document.querySelectorAll('.fd-panel.open').forEach(p => p.classList.remove('open'));
  if (opening) { panel.classList.add('open'); _renderTeamList(); }
}
function teamToggle(id) {
  if (_selectedTeams.has(id)) _selectedTeams.delete(id); else _selectedTeams.add(id);
  _renderTeamList(); _syncTeamLabel();
}
function teamSelectAll() { TEAMS.forEach(t => _selectedTeams.add(t.id)); _renderTeamList(); _syncTeamLabel(); }
function teamClearAll()  { _selectedTeams.clear(); _renderTeamList(); _syncTeamLabel(); }

// Close team (and any fd-panel) on outside click
document.addEventListener('click', () => {
  document.querySelectorAll('.fd-panel.open').forEach(p => p.classList.remove('open'));
});

// ── Group ──
let groupPickerOpen = false;
let hideEmptyGroups = false;

function renderGroupPanel() {
  const panel = document.getElementById('group-panel');

  if (!groupField || groupPickerOpen) {
    panel.innerHTML = `
      <div style="padding:6px 0">
        <input type="text" class="dp-search" id="group-dp-search" placeholder="Search for a property..." oninput="groupDpSearch(this.value)">
        <div id="group-field-list"></div>
      </div>`;
    renderGroupFieldList();
    if (groupPickerOpen) { const inp = panel.querySelector('#group-dp-search'); if (inp) inp.focus(); }
    return;
  }

  const col  = COLS.find(c => c.key === groupField);
  const data = currentTab === 'operation' ? _operationData : currentTab === 'assigned' ? assignedData : queueData;
  // Use custom order if set, else alphabetical
  const allVals = groupOrder.length
    ? groupOrder
    : [...new Set(data.map(r => getRowValue(r, groupField)))].sort();

  panel.innerHTML = `
    <div class="gp-header">
      <span class="gp-label">Group by</span>
      <button class="gp-field-link" onclick="openGroupPicker(event)">
        ${col.label}
        <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">chevron_right</span>
      </button>
    </div>
    <div class="gp-hide-row" onclick="toggleHideEmptyGroups()">
      <span>Hide empty groups</span>
      <button class="dp-eye-btn" onclick="event.stopPropagation();toggleHideEmptyGroups()">
        <span class="material-symbols-outlined">${hideEmptyGroups ? 'visibility_off' : 'visibility'}</span>
      </button>
    </div>
    <div class="dp-section-label" style="padding:6px 14px 2px">Groups</div>
    ${allVals.map((v, i) => {
      const isHidden = hiddenGroups.has(v);
      const safe = v.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `<div class="gp-group-row ${isHidden ? 'gp-row-hidden' : ''}" draggable="true"
          ondragstart="groupDragStart(event,${i})"
          ondragover="event.preventDefault();this.classList.add('drag-over')"
          ondragleave="this.classList.remove('drag-over')"
          ondrop="groupDrop(event,${i})">
        <span class="material-symbols-outlined" style="color:${isHidden?'#ddd':'#aaa'};font-size:16px;cursor:grab;flex-shrink:0">drag_indicator</span>
        <span class="gp-group-name">${v}</span>
        <button class="dp-eye-btn" onclick="event.stopPropagation();toggleGroupHide('${safe}')">
          <span class="material-symbols-outlined" style="${isHidden?'color:#ccc':''}">${isHidden ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>`;
    }).join('')}
    <button class="gp-delete-btn" onclick="clearGroup()">
      <span class="material-symbols-outlined" style="font-size:15px">delete</span>Delete grouping
    </button>`;
}

function groupDragStart(e, idx) {
  groupDragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function groupDrop(e, toIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (groupDragIdx === null || groupDragIdx === toIdx) { groupDragIdx = null; return; }
  const moved = groupOrder.splice(groupDragIdx, 1)[0];
  groupOrder.splice(toIdx, 0, moved);
  groupDragIdx = null;
  renderGroupPanel();
  applyAndRender();
}

function openGroupPicker(event) {
  event && event.stopPropagation();
  groupPickerOpen = true;
  renderGroupPanel();
}
function groupDpSearch(q) { renderGroupFieldList(q); }
function renderGroupFieldList(search='') {
  const el = document.getElementById('group-field-list');
  if (!el) return;
  el.innerHTML = COLS
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="setGroupField('${c.key}')">${c.label}</div>`).join('');
}
function updateGroupBtn() {
  const btn = document.getElementById('group-btn');
  if (groupField) {
    const col = COLS.find(c => c.key === groupField);
    btn.classList.add('active');
    btn.innerHTML = `
      <span class="material-symbols-outlined">view_agenda</span>
      Group by: ${col.label}
      <span onclick="event.stopPropagation();clearGroup()" style="margin-left:4px;cursor:pointer;font-size:15px;opacity:0.8;line-height:1">&times;</span>`;
  } else {
    btn.classList.remove('active');
    btn.innerHTML = `
      <span class="material-symbols-outlined">view_agenda</span>
      <span id="group-btn-label">Group by</span>`;
  }
}
function setGroupField(key) {
  groupField = key;
  groupPickerOpen = false;
  const data = currentTab === 'operation' ? _operationData : currentTab === 'assigned' ? assignedData : queueData;
  groupOrder = [...new Set(data.map(r => getRowValue(r, groupField)))].sort();
  hiddenGroups.clear();
  updateGroupBtn();
  closeAllDropdowns();
  applyAndRender();
}
function clearGroup() {
  groupField = null;
  groupPickerOpen = false;
  groupOrder = [];
  collapsedGroups.clear();
  hiddenGroups.clear();
  updateGroupBtn();
  closeAllDropdowns();
  applyAndRender();
}
function toggleGroupCollapse(val) {
  // Toggle collapse of group rows in table (clicking ∨ header)
  if (collapsedGroups.has(val)) collapsedGroups.delete(val);
  else collapsedGroups.add(val);
  applyAndRender();
}
function toggleGroupHide(val) {
  // Toggle complete visibility of group in table (eye icon in panel)
  if (hiddenGroups.has(val)) hiddenGroups.delete(val);
  else hiddenGroups.add(val);
  renderGroupPanel();
  applyAndRender();
}
function toggleHideEmptyGroups() {
  hideEmptyGroups = !hideEmptyGroups;
  renderGroupPanel();
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared table-header component
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Builds a <thead> <tr> for any table that uses the colOrder / hiddenCols
 * pattern. Called by My Work, Work Feed and Agent Fleet.
 *
 * @param {HTMLElement} thead     — the <thead> element to populate
 * @param {Array}       colOrder  — [{key, label},...] in current order
 * @param {Set}         hiddenCols — keys of hidden columns
 * @param {Object}      colWidths  — {key: pixelWidth} stored widths
 * @param {Object}      [opts]
 *   opts.resizeFn        {string}  — global fn name called onmousedown on resize handle
 *   opts.sortRules       {Array}   — [{field, dir},...] enables sort icon + .sorted class
 *   opts.pinnedCols      {Set}     — enables push_pin icon
 *   opts.colMenuFn       {string}  — enables ··· button; name of global fn(e, key)
 *   opts.colClassMap     {Object}  — {key:'css-class'} per-column th className
 *   opts.baseThClass     {string}  — class added to every data th (e.g. 'af-table-th')
 *   opts.checkboxTh      {Element} — leading th element prepended (My Work checkbox col)
 *   opts.trailingThClass {string}  — className for the zero-width trailing actions th
 *   opts.trailingThStyle {string}  — inline style override for trailing th
 */
function _buildTableHead(thead, colOrder, hiddenCols, colWidths, opts = {}) {
  const {
    resizeFn        = 'startColResize',
    sortRules       = [],
    pinnedCols      = new Set(),
    colMenuFn       = null,
    colClassMap     = {},
    baseThClass     = '',
    checkboxTh      = null,
    trailingThClass = 'row-actions-cell',
    trailingThStyle = '',
  } = opts;

  // Re-use existing tr if present (preserves references), else create one
  let tr = thead.querySelector('tr');
  if (!tr) { tr = document.createElement('tr'); thead.appendChild(tr); }
  tr.innerHTML = '';

  // Leading checkbox column (My Work only)
  if (checkboxTh) tr.appendChild(checkboxTh);

  const visibleCols = colOrder.filter(c => !hiddenCols.has(c.key));
  const richMode    = !!(colMenuFn || sortRules.length || pinnedCols.size);

  visibleCols.forEach(c => {
    const th = document.createElement('th');
    th.dataset.col = c.key;

    // CSS class — per-column override wins, else fall back to baseThClass
    const perColClass = colClassMap[c.key] || '';
    th.className     = [baseThClass, perColClass].filter(Boolean).join(' ');

    if (richMode) {
      // ── Full My-Work style header ──
      const sortRule = sortRules.find(r => r.field === c.key);
      if (sortRule) th.classList.add('sorted');
      const sortIcon = sortRule
        ? (sortRule.dir === 'asc' ? 'arrow_upward' : 'arrow_downward')
        : 'arrow_downward';
      const pinIcon  = pinnedCols.has(c.key)
        ? `<span class="material-symbols-outlined th-pin-icon">push_pin</span>` : '';
      const menuBtn  = colMenuFn
        ? `<button class="th-menu-btn" title="Column options">···</button>` : '';
      th.innerHTML = `<div class="th-inner">
        ${pinIcon}<span class="th-label">${c.label}</span>
        <span class="material-symbols-outlined th-sort-icon">${sortIcon}</span>
        ${menuBtn}
      </div>`;
      if (colMenuFn) {
        th.querySelector('.th-menu-btn').addEventListener('click', e => window[colMenuFn](e, c.key));
      }
    } else {
      // ── Lightweight header (WF / AF) — label only ──
      th.textContent = c.label;
    }

    // Resize handle (all tables)
    if (resizeFn) {
      const handle = document.createElement('div');
      handle.className = 'col-resize-handle';
      handle.addEventListener('mousedown', e => window[resizeFn](e, c.key));
      th.appendChild(handle);
    }

    tr.appendChild(th);
  });

  // Trailing zero-width actions th
  const actionsTh = document.createElement('th');
  actionsTh.className = trailingThClass;
  if (trailingThStyle) actionsTh.style.cssText = trailingThStyle;
  tr.appendChild(actionsTh);

  // Apply stored widths immediately
  Object.entries(colWidths).forEach(([key, width]) => {
    const th = tr.querySelector(`th[data-col="${key}"]`);
    if (th) th.style.width = width + 'px';
  });
}

// ── Columns ──
function renderColumnsPanel(search) {
  search = search !== undefined ? search : (document.getElementById('cols-dp-search').value || '');
  const q = search.toLowerCase();

  // shown = colOrder items that are not hidden
  const shownCols = colOrder.filter(c => !hiddenCols.has(c.key) && (!q || c.label.toLowerCase().includes(q)));
  // hidden = colOrder items that are hidden
  const hiddenColList = colOrder.filter(c => hiddenCols.has(c.key) && (!q || c.label.toLowerCase().includes(q)));

  document.getElementById('shown-count').textContent = colOrder.filter(c => !hiddenCols.has(c.key)).length;

  document.getElementById('shown-cols-list').innerHTML = shownCols
    .map((c, i) => {
      const realIdx = colOrder.indexOf(c);
      const isPinned = pinnedCols.has(c.key);
      const pinBadge = isPinned
        ? `<span class="material-symbols-outlined dp-pin-icon" title="Pinned">push_pin</span>`
        : '';
      return `<div class="dp-col-item${isPinned ? ' dp-col-pinned' : ''}" draggable="true" onclick="event.stopPropagation()"
          ondragstart="colDragStart(event,${realIdx})"
          ondragover="colDragOver(event,${realIdx})"
          ondragleave="colDragLeave(event)"
          ondrop="colDrop(event,${realIdx})">
        <span class="material-symbols-outlined drag-handle">drag_indicator</span>
        ${pinBadge}<span class="col-name">${c.label}</span>
        <button class="dp-eye-btn" onclick="event.stopPropagation();toggleColVisibility('${c.key}')">
          <span class="material-symbols-outlined">visibility</span>
        </button>
      </div>`;
    }).join('');

  const hiddenSection = document.getElementById('hidden-section');
  if (hiddenColList.length) {
    hiddenSection.style.display = 'block';
    document.getElementById('hidden-count').textContent = colOrder.filter(c => hiddenCols.has(c.key)).length;
    document.getElementById('hidden-cols-list').innerHTML = hiddenColList
      .map(c => `<div class="dp-col-item">
        <span class="material-symbols-outlined drag-handle" style="opacity:0.3">drag_indicator</span>
        <span class="col-name" style="color:#aaa">${c.label}</span>
        <button class="dp-eye-btn" onclick="event.stopPropagation();toggleColVisibility('${c.key}')">
          <span class="material-symbols-outlined" style="color:#aaa">visibility_off</span>
        </button>
      </div>`).join('');
  } else {
    hiddenSection.style.display = 'none';
  }
}
function colsDpSearch(q) { renderColumnsPanel(q); }

// Column drag-to-reorder (inside the panel)
function colDragStart(e, idx) {
  colDragIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function colDragOver(e, idx) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('#shown-cols-list .dp-col-item').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.classList.add('drag-over');
}
function colDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function colDrop(e, toIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (colDragIdx === null || colDragIdx === toIdx) { colDragIdx = null; return; }
  const moved = colOrder.splice(colDragIdx, 1)[0];
  // adjust toIdx if we removed an item before it
  const adjusted = colDragIdx < toIdx ? toIdx - 1 : toIdx;
  colOrder.splice(adjusted, 0, moved);
  colDragIdx = null;
  renderColumnsPanel();
  renderTableHeader();
  applyAndRender();
}

function toggleColVisibility(key) {
  if (hiddenCols.has(key)) hiddenCols.delete(key); else hiddenCols.add(key);
  renderColumnsPanel();
  renderTableHeader();
  applyAndRender();
  document.getElementById('columns-btn').classList.toggle('active', hiddenCols.size > 0);
}
function hideAllCols() {
  COLS.forEach(c => hiddenCols.add(c.key));
  renderColumnsPanel(); renderTableHeader(); applyAndRender();
  document.getElementById('columns-btn').classList.add('active');
}
function showAllCols() {
  hiddenCols.clear();
  renderColumnsPanel(); renderTableHeader(); applyAndRender();
  document.getElementById('columns-btn').classList.remove('active');
}

// ── Central render pipeline ──
// ── AI Quick-wins filter ────────────────────────────────────────────────────
function applyAiQuickWin() {
  // Hide pills, show user message bubble
  const pills = document.getElementById('ai-pills');
  if (pills) pills.style.display = 'none';
  const body  = document.getElementById('ai-drawer-body');
  const empty = document.getElementById('ai-empty');
  if (empty) empty.style.display = 'none';

  const userBubble = `<div class="ai-msg user" style="margin-bottom:12px">
    <div class="ai-bubble">Quick wins for today</div>
  </div>`;

  // Show analyzing spinner
  body.innerHTML = userBubble + `
    <div class="ai-analyzing">
      <span class="material-symbols-outlined">autorenew</span>
      <span class="ai-analyzing-text">Analyzing your workload…</span>
    </div>`;

  // After brief delay — apply filter + show AI response
  setTimeout(() => {
    _aiQuickWinActive = true;
    applyAndRender(); // filters table to 3 cases
    renderActiveBar(); // shows "AI filtered" badge in portal

    body.innerHTML = userBubble + `
      <div class="ai-response-msg">I've filtered your table to <strong>3 quick wins</strong> — cases that can be resolved quickly today:</div>
      <div class="ai-qw-list">
        <div class="ai-qw-item"><span class="ai-qw-id"># 2001448</span><span class="ai-qw-name">AMAZONFRESH</span></div>
        <div class="ai-qw-item"><span class="ai-qw-id"># 100003</span><span class="ai-qw-name">Missing Invoice</span></div>
        <div class="ai-qw-item"><span class="ai-qw-id"># 100006</span><span class="ai-qw-name">Approval Pending</span></div>
      </div>
      <div class="ai-response-msg" style="margin-top:8px;font-size:12px;color:#666">Click × on the <em>AI filtered</em> badge in the toolbar to restore all cases.</div>`;
    body.scrollTop = body.scrollHeight;
    _renderAiFooter();
    _updateAiBadge();
  }, 1400);
}

function clearAiQuickWin() {
  _aiQuickWinActive = false;
  applyAndRender();
  renderActiveBar();
}

function applyAndRender() {
  // Solution-aware data selection
  let data;
  if (typeof activeSolution !== 'undefined' && activeSolution === 'deduction') {
    if (currentTab === 'started')   data = [..._deductionStartedData];
    else if (currentTab === 'team') data = [..._deductionTeamData];
    else                            data = [..._operationData]; // operation — all cases
  } else {
    data = currentTab === 'operation' ? [..._operationData]
         : currentTab === 'assigned'  ? [...assignedData]
         : [...queueData];
  }

  // AI quick-wins pre-filter — show only the 3 AI-selected cases
  if (_aiQuickWinActive) {
    data = data.filter(row => _QUICK_WIN_IDS.has(row.id));
  }
  // 1. Filter
  data = data.filter(row => filterFields.every(f => {
    if (!f.value) return true;
    return getRowValue(row, f.field).toLowerCase().includes(f.value.toLowerCase());
  }));
  // 2. Sort
  const activeSortRules = sortRules.filter(r => r.field);
  if (activeSortRules.length) {
    data = [...data].sort((a, b) => {
      for (const r of activeSortRules) {
        const av = getRowValue(a, r.field).toLowerCase();
        const bv = getRowValue(b, r.field).toLowerCase();
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (cmp !== 0) return r.dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }
  // 3. KPI metrics — always reflects full filtered set, not just current page
  updateKPIs(data);

  // 4. Pagination
  const totalFiltered = data.length;
  lastTotalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  if (currentPage > lastTotalPages) currentPage = lastTotalPages;
  renderPagination(totalFiltered);
  data = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 4. Render
  const tbody = document.getElementById('table-body');
  if (groupField) renderGrouped(data, tbody);
  else renderFlat(data, tbody);
  // 5. Dynamic column header (order + visibility)
  renderTableHeader();
  document.getElementById('select-all').checked = false;
  document.getElementById('select-all').indeterminate = false;
  document.getElementById('bulk-action-bar').classList.remove('visible');
  // Apply freeze after DOM is painted so offsetWidths are accurate
  requestAnimationFrame(applyFreezeStyles);
  // Update split list if active
  if (viewMode === 'split') renderSplitList();
}

function renderFlat(data, tbody) {
  // Show global thead in flat view
  const thead = tbody.closest('table').querySelector('thead');
  if (thead) thead.style.display = '';
  tbody.innerHTML = data.map(row => renderRow(row)).join('');
}
function renderGrouped(data, tbody) {
  // Hide global thead — each group gets its own sub-header
  const thead = tbody.closest('table').querySelector('thead');
  if (thead) thead.style.display = 'none';

  // Use custom order if set, else alphabetical
  const allVals = groupOrder.length
    ? groupOrder
    : [...new Set(data.map(r => getRowValue(r, groupField)))].sort();
  // Remove groups hidden via eye icon
  const vals = allVals.filter(v => !hiddenGroups.has(v));

  // Per-group column sub-header (respects colOrder + hiddenCols)
  const visibleCols = colOrder.filter(c => !hiddenCols.has(c.key));
  const subHeaderCells = [
    `<td style="width:36px"><input type="checkbox" onclick="event.stopPropagation()"></td>`,
    ...visibleCols.map(c => `<td data-col="${c.key}">${c.label}</td>`)
  ].join('');
  const subHeader = `<tr class="group-sub-header">${subHeaderCells}</tr>`;

  const totalCols = visibleCols.length + 1; // +1 for checkbox
  tbody.innerHTML = vals.map(val => {
    const rows = data.filter(r => getRowValue(r, groupField) === val);
    const collapsed = collapsedGroups.has(val);
    const safeVal = val.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<tr class="group-header-row" onclick="toggleGroupCollapse('${safeVal}')">
        <td colspan="${totalCols}">
          <div class="group-header-inner">
            <span class="material-symbols-outlined group-chevron">${collapsed ? 'chevron_right' : 'expand_more'}</span>
            <span class="group-name">${val}</span>
            <span class="group-count">${rows.length}</span>
            <span class="group-overflow">···</span>
          </div>
        </td>
      </tr>` + (collapsed ? '' : subHeader + rows.map(renderRow).join(''));
  }).join('');
}

function renderCellContent(row, key) {
  switch (key) {
    case 'id':        return `<span class="cell-id">${row.id}</span>`;
    case 'name':      return `<span class="cell-case">${row.name}</span>`;
    case 'created':   return `<span class="cell-date">${row.created}</span>`;
    case 'due':       return `<span class="cell-date">${row.due}</span>`;
    case 'tier':      return `<span class="tier-badge">${row.tier}</span>`;
    case 'assignee':  return `<div class="assignee-list">${row.assignees.map(a=>`<span class="assignee-badge"><span class="material-symbols-outlined">person</span>${a}</span>`).join('')}${row.overflow?`<span class="assignee-overflow">${row.overflow}</span>`:''}</div>`;
    case 'status': {
      const rowId = String(row.id).replace(/^#\s*/, '');
      const fetched = _fetchedCases[rowId];
      if (!fetched) return `<span class="status-badge ${statusClass(row.status)}">${statusLabel(row.status)}</span>`;
      return `<span class="status-badge on-progress">On Progress</span>${_activeUserAvatarHtml(fetched)}`;
    }
    case 'stage': {
      const s = row.stage || '—';
      const dedStages = {
        'Eyeball Review':          { icon: 'visibility',   color: '#7c3aed', bg: '#ede9fe' },
        'Deduction Validation':    { icon: 'rule',         color: '#1d4ed8', bg: '#dbeafe' },
        'Credit Memo / Billback':  { icon: 'receipt',      color: '#166534', bg: '#dcfce7' },
        'Document Collection':     { icon: 'folder_open',  color: '#92400e', bg: '#fef3c7' },
      };
      const ds = dedStages[s];
      if (ds) return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:6px;background:${ds.bg};color:${ds.color};font-size:11px;font-weight:500;white-space:nowrap"><span class="material-symbols-outlined" style="font-size:12px">${ds.icon}</span>${s}</span>`;
      return `<span class="cell-stage">${s}</span>`;
    }
    case 'fetchedBy': return `<span class="cell-fetched">${row.fetchedBy||'—'}</span>`;
    case 'client':    return `<span class="cell-client">${row.client||'—'}</span>`;
    case 'reasonType': {
      const rt = row.reasonType || '—';
      const rtStyles = {
        'OS&D':                 { color: '#92400e', bg: '#fef3c7' },
        'Price Discrepancy':    { color: '#1d4ed8', bg: '#dbeafe' },
        'Duplicate Billing':    { color: '#6d28d9', bg: '#ede9fe' },
        'Tax/Freight Mismatch': { color: '#0f766e', bg: '#ccfbf1' },
        'RTV':                  { color: '#166534', bg: '#dcfce7' },
        'Wrong Product':        { color: '#9f1239', bg: '#ffe4e6' },
      };
      const s = rtStyles[rt];
      if (s) return `<span style="display:inline-block;padding:2px 8px;border-radius:5px;background:${s.bg};color:${s.color};font-size:11px;font-weight:500;white-space:nowrap">${rt}</span>`;
      return `<span class="cell-client">${rt}</span>`;
    }
    default: return '';
  }
}

function _rowFetchBtn(rowId, rawId) {
  const claimedByMe = _fetchedCases[rowId] === _currentUser;
  return claimedByMe
    ? `<button class="row-action-btn" title="Return case" onclick="event.stopPropagation();returnCaseFromList('${rawId}')"><span class="material-symbols-outlined">undo</span><span>Return</span></button>`
    : `<button class="row-action-btn" title="Fetch case" onclick="event.stopPropagation();fetchCaseFromList('${rawId}')"><span class="material-symbols-outlined">download</span><span>Fetch</span></button>`;
}

function _wfRowFetchBtn(caseId) {
  const fetched = _fetchedCases[caseId];
  if (fetched && fetched !== _currentUser) return ''; // taken by someone else
  const isMe = fetched === _currentUser;
  return `<button class="row-action-btn" title="${isMe ? 'Return case' : 'Fetch case'}" onclick="event.stopPropagation();${isMe ? `returnCaseFromList('${caseId}')` : `fetchCaseFromList('${caseId}')`}"><span class="material-symbols-outlined">${isMe ? 'undo' : 'download'}</span><span>${isMe ? 'Return' : 'Fetch'}</span></button>`;
}

function renderRow(row) {
  const rowId = String(row.id).replace(/^#\s*/, '');
  const visibleCols = colOrder.filter(c => !hiddenCols.has(c.key));
  const cells = visibleCols.map(c => `<td data-col="${c.key}">${renderCellContent(row, c.key)}</td>`).join('');
  const ctxTd = `<td class="col-row-ctx" onclick="event.stopPropagation()"><button class="row-ctx-btn" title="Row actions" onclick="_rowCtxOpen(event,'${row.id}')"><span class="material-symbols-outlined">more_vert</span></button></td>`;
  return `<tr style="cursor:pointer" data-rowid="${rowId}" onclick="handleRowClick(event, '${row.id}')"><td onclick="event.stopPropagation()"><input type="checkbox" onchange="updateBulkBar()"></td>${ctxTd}${cells}</tr>`;
}

function fetchCaseFromList(rawId) {
  const id = String(rawId).replace(/^#\s*/, '');
  _fetchedCases[id] = _currentUser;
  _updateRowClaimUI(id, rawId);
  // Sync case header if this case is currently open
  _renderFetchBtn(id);
  // Refresh card list + solver header button + solver lock
  if (!wfTableMode) {
    renderWorkFeedList();
    if (activeWorkFeedCase === rawId) { _renderWfFetchBtn(rawId); _applyWfSolverLock(rawId); }
  } else renderWorkFeedTable();
}

function returnCaseFromList(rawId) {
  const id = String(rawId).replace(/^#\s*/, '');
  delete _fetchedCases[id];
  _updateRowClaimUI(id, rawId);
  _renderFetchBtn(id);
  // Refresh card list + solver header button + solver lock
  if (!wfTableMode) {
    renderWorkFeedList();
    if (activeWorkFeedCase === rawId) { _renderWfFetchBtn(rawId); _applyWfSolverLock(rawId); }
  } else renderWorkFeedTable();
}

function _updateRowClaimUI(id, rawId) {
  const tr = document.querySelector(`#table-body tr[data-rowid="${id}"]`);
  if (!tr) return;
  // Update the status cell claimed pill
  const statusCell = tr.querySelector('[data-col="status"]');
  if (statusCell) {
    const row = [...(assignedData || []), ...(queueData || [])].find(r => String(r.id).replace(/^#\s*/, '') === id);
    if (row) statusCell.innerHTML = renderCellContent(row, 'status');
  }
  // Swap the fetch/return button inside row-actions
  const actionsDiv = tr.querySelector('.row-actions');
  if (actionsDiv) {
    const oldBtn = actionsDiv.querySelector('[title="Fetch case"],[title="Return case"]');
    if (oldBtn) oldBtn.outerHTML = _rowFetchBtn(id, rawId);
  }
}

function handleRowClick(e, caseId) {
  if (e.target.type === 'checkbox' || e.target.closest('.tb-action')) return;
  openCaseTab(caseId);
}

// Rebuild <thead> — delegates to shared _buildTableHead component
function renderTableHeader() {
  const table = document.getElementById('table-body').closest('table');
  const thead = table.querySelector('thead');
  if (!thead || thead.style.display === 'none') return;
  const checkboxTh = thead.querySelector('tr th:first-child');
  _buildTableHead(thead, colOrder, hiddenCols, colWidths, {
    resizeFn:    'startColResize',
    sortRules,
    pinnedCols,
    colMenuFn:   'openColMenu',
    colClassMap: {
      id: 'col-id', name: 'col-case', created: 'col-date', due: 'col-date',
      tier: 'col-tier', assignee: 'col-assignee', status: 'col-status',
      stage: 'col-stage', fetchedBy: 'col-fetchedby', client: 'col-client',
      reasonType: 'col-reason-type'
    },
    checkboxTh,
    trailingThClass: 'row-actions-cell',
  });
  // Insert ctx-menu th right after checkbox th
  const headerTr = thead.querySelector('tr');
  if (headerTr) {
    const ctxTh = document.createElement('th');
    ctxTh.className = 'col-row-ctx';
    headerTr.insertBefore(ctxTh, headerTr.children[1]);
  }
}

// ── Row context menu ──────────────────────────────────────────────────────────
function _syncRowCtxState(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const table = tbody.closest('table');
  if (!table) return;
  const anyChecked = !!tbody.querySelector('input[type="checkbox"]:checked');
  table.classList.toggle('has-row-selection', anyChecked);
}

function _rowCtxOpen(e, rowId) {
  e.stopPropagation();
  const id = String(rowId).replace(/^#\s*/, '');
  let menu = document.getElementById('row-ctx-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'row-ctx-menu';
    menu.className = 'col-ctx-menu'; // reuse existing menu styles
    document.body.appendChild(menu);
  }
  const isFetched = !!_fetchedCases[id];
  menu.innerHTML = `
    <button class="col-ctx-item" onclick="_rowCtxAct('open','${rowId}')">
      <span class="material-symbols-outlined">open_in_new</span> Open case
    </button>
    <button class="col-ctx-item" onclick="_rowCtxAct('quickview','${rowId}',event)">
      <span class="material-symbols-outlined">preview</span> Quick view
    </button>
    <div class="col-ctx-divider"></div>
    <button class="col-ctx-item" onclick="_rowCtxAct('${isFetched ? 'return' : 'fetch'}','${rowId}')">
      <span class="material-symbols-outlined">${isFetched ? 'upload' : 'download'}</span>
      ${isFetched ? 'Return case' : 'Fetch case'}
    </button>
    <button class="col-ctx-item" onclick="_rowCtxAct('assign','${rowId}')">
      <span class="material-symbols-outlined">person_add</span> Assign
    </button>
  `;
  const rect = e.currentTarget.getBoundingClientRect();
  menu.style.display = '';
  menu.classList.remove('hidden');
  const mw = 200;
  let left = rect.right + 4;
  if (left + mw > window.innerWidth - 8) left = rect.left - mw - 4;
  menu.style.left = left + 'px';
  menu.style.top  = rect.top + 'px';
  menu.onmouseleave = _rowCtxClose;
  setTimeout(() => document.addEventListener('click', _rowCtxClose, { once: true }), 0);
}

function _rowCtxClose() {
  const menu = document.getElementById('row-ctx-menu');
  if (menu) menu.classList.add('hidden');
}

function _rowCtxAct(action, rowId, e) {
  _rowCtxClose();
  if (action === 'open') { openCaseTab(rowId); }
  else if (action === 'quickview') { openQuickView(e || { currentTarget: document.body }, rowId); }
  else if (action === 'fetch')  { fetchCaseFromList(rowId); }
  else if (action === 'return') { returnCaseFromList(rowId); }
  else if (action === 'assign') { alert('Assign — coming soon'); }
}

function _wfRowCtxOpen(e, caseId) {
  e.stopPropagation();
  let menu = document.getElementById('row-ctx-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'row-ctx-menu';
    menu.className = 'col-ctx-menu';
    document.body.appendChild(menu);
  }
  const isFetched = !!_fetchedCases[caseId];
  menu.innerHTML = `
    <button class="col-ctx-item" onclick="_wfRowCtxAct('open','${caseId}')">
      <span class="material-symbols-outlined">open_in_new</span> Open case
    </button>
    <button class="col-ctx-item" onclick="_wfRowCtxAct('quickview','${caseId}')">
      <span class="material-symbols-outlined">preview</span> Quick view
    </button>
    <div class="col-ctx-divider"></div>
    <button class="col-ctx-item" onclick="_wfRowCtxAct('${isFetched ? 'return' : 'fetch'}','${caseId}')">
      <span class="material-symbols-outlined">${isFetched ? 'upload' : 'download'}</span>
      ${isFetched ? 'Return case' : 'Fetch case'}
    </button>
    <button class="col-ctx-item" onclick="_wfRowCtxAct('casey','${caseId}')">
      <span class="material-symbols-outlined">auto_awesome</span> Ask Casey
    </button>
    <button class="col-ctx-item" onclick="_wfRowCtxAct('actions','${caseId}')">
      <span class="material-symbols-outlined">bolt</span> Quick actions
    </button>
  `;
  const rect = e.currentTarget.getBoundingClientRect();
  menu.style.display = '';
  menu.classList.remove('hidden');
  const mw = 200;
  let left = rect.right + 4;
  if (left + mw > window.innerWidth - 8) left = rect.left - mw - 4;
  menu.style.left = left + 'px';
  menu.style.top  = rect.top + 'px';
  menu.onmouseleave = _rowCtxClose;
  setTimeout(() => document.addEventListener('click', _rowCtxClose, { once: true }), 0);
}

function _wfRowCtxAct(action, caseId) {
  _rowCtxClose();
  if (action === 'open')      { openWfCaseTab(caseId); }
  else if (action === 'quickview') { selectWorkFeedCase(caseId); }
  else if (action === 'fetch')     { const r = [...(wfData||[])].find(x=>x.id===caseId); if(r) { _fetchedCases[caseId]=_currentUser; renderWorkFeedTable(); } }
  else if (action === 'return')    { delete _fetchedCases[caseId]; renderWorkFeedTable(); }
  else if (action === 'casey')     { _wfAskCaseyToSolve(caseId); }
  else if (action === 'actions')   { openWfQuickActions(caseId); }
}

// Legacy wrapper (used by search handler)
function renderTable(data) { applyAndRender(); }

function switchTab(tab) {
  switchSolutionFilter(tab);
}

function toggleMetrics() {
  const row = document.getElementById('metrics-row');
  const btn = document.getElementById('toggle-metrics');
  row.classList.toggle('hidden');
  btn.classList.toggle('active');
}

function updateKPIs(filteredData) {
  let total, completed, stuck, onProgress, waiting;

  if (currentTab === 'operation') {
    // Large-scale hardcoded numbers for the full operation view
    total      = 2642;
    completed  = 891;
    onProgress = 743;
    stuck      = 311;
    waiting    = 697;
  } else {
    const _s = r => (r.status || '').toLowerCase();
    total      = filteredData.length;
    completed  = filteredData.filter(r => _s(r) === 'completed').length;
    stuck      = filteredData.filter(r => _s(r) === 'stuck' || _s(r) === 'intervention').length;
    onProgress = filteredData.filter(r => _s(r) === 'on progress' || _s(r) === 'running').length;
    waiting    = filteredData.filter(r => _s(r) === 'pending' || _s(r) === 'awaiting').length;
  }

  document.getElementById('kpi-total').textContent      = total.toLocaleString();
  const _kpiLabels = { assigned: 'Assigned Cases', queue: 'Cases in Queue', started: 'My Cases', team: 'Team Cases', operation: 'Operation Cases' };
  document.getElementById('kpi-tab-label').textContent  = _kpiLabels[currentTab] || 'Cases';
  document.getElementById('kpi-completed').textContent  = completed.toLocaleString();
  document.getElementById('kpi-stuck').textContent      = stuck.toLocaleString();
  document.getElementById('kpi-onprogress').textContent = onProgress.toLocaleString();
  document.getElementById('kpi-waiting').textContent    = waiting.toLocaleString();

  // Progress bar: completed (dark) | on-progress (medium) | stuck+pending (light)
  const active  = onProgress + stuck;
  const passive = waiting;
  // Use at least flex:1 so the bar never fully collapses when count is 0
  const segCompleted = document.getElementById('kpi-seg-completed');
  const segProgress  = document.getElementById('kpi-seg-progress');
  const segWaiting   = document.getElementById('kpi-seg-waiting');
  segCompleted.style.flex = completed || '0.001';
  segProgress.style.flex  = active    || '0.001';
  segWaiting.style.flex   = passive   || '0.001';
  segCompleted.dataset.tooltip = `Completed: ${completed.toLocaleString()}`;
  segProgress.dataset.tooltip  = `On Progress: ${active.toLocaleString()}`;
  segWaiting.dataset.tooltip   = `Waiting: ${passive.toLocaleString()}`;
}

function toggleAll(checkbox) {
  document.querySelectorAll('#table-body input[type="checkbox"]').forEach(cb => {
    cb.checked = checkbox.checked;
  });
  updateBulkBar();
}

// ── Bulk action bar ──
function updateBulkBar() {
  const checked = document.querySelectorAll('#table-body input[type="checkbox"]:checked');
  const bar = document.getElementById('bulk-action-bar');
  const n = checked.length;
  if (n === 0) {
    bar.classList.remove('visible');
  } else {
    bar.classList.add('visible');
    document.getElementById('bulk-count').textContent = `${n} selected`;
  }
  _syncRowCtxState('table-body');
}

function unselectAll() {
  document.querySelectorAll('#table-body input[type="checkbox"]').forEach(cb => cb.checked = false);
  const sa = document.getElementById('select-all');
  sa.checked = false;
  sa.indeterminate = false;
  updateBulkBar();
}

function bulkAssignee()    { /* placeholder — open assignee picker */ }
function bulkReturnCases() { /* placeholder — return selected cases */ }
function bulkReallocate()  { /* placeholder — reallocate to team */ }

// ── Pagination ──
function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  lastTotalPages = totalPages;
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end   = Math.min(currentPage * itemsPerPage, totalItems);

  document.getElementById('pg-per-page-val').textContent = itemsPerPage;
  document.getElementById('pg-count').textContent =
    totalItems === 0 ? '0 of 0' : `${start}–${end} of ${totalItems}`;

  // Sync active class on per-page options
  document.querySelectorAll('.pg-per-page-opt').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === itemsPerPage);
  });

  // Build page number sequence
  const pages = buildPageSequence(currentPage, totalPages);
  const first = currentPage === 1;
  const last  = currentPage === totalPages;

  document.getElementById('pg-controls').innerHTML =
    `<button class="pg-nav-btn" onclick="goToPage(1)" ${first?'disabled':''} title="First page">
       <span class="material-symbols-outlined">first_page</span>
     </button>
     <button class="pg-nav-btn" onclick="goToPage(${currentPage-1})" ${first?'disabled':''} title="Previous">
       <span class="material-symbols-outlined">chevron_left</span>
     </button>
     ${pages.map(p => p === '...'
       ? `<button class="pg-ellipsis" disabled><span class="material-symbols-outlined">more_horiz</span></button>`
       : `<button class="pg-page-btn${p===currentPage?' active':''}" onclick="goToPage(${p})">${p}</button>`
     ).join('')}
     <button class="pg-nav-btn" onclick="goToPage(${currentPage+1})" ${last?'disabled':''} title="Next">
       <span class="material-symbols-outlined">chevron_right</span>
     </button>
     <button class="pg-nav-btn" onclick="goToPage(${totalPages})" ${last?'disabled':''} title="Last page">
       <span class="material-symbols-outlined">last_page</span>
     </button>`;
}

function buildPageSequence(cur, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  if (cur <= 4)         return [1, 2, 3, 4, 5, '...', total];
  if (cur >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
  return [1, '...', cur-1, cur, cur+1, '...', total];
}

function goToPage(page) {
  if (page < 1 || page > lastTotalPages) return;
  currentPage = page;
  applyAndRender();
}

function changeItemsPerPage(n) {
  itemsPerPage = n;
  currentPage  = 1;
  document.getElementById('pg-per-page-menu').classList.add('hidden');
  applyAndRender();
}

function togglePerPageMenu(e) {
  e.stopPropagation();
  document.getElementById('pg-per-page-menu').classList.toggle('hidden');
}

// Close per-page menus on outside click
document.addEventListener('click', () => {
  const menu = document.getElementById('pg-per-page-menu');
  if (menu) menu.classList.add('hidden');
  const wfMenu = document.getElementById('wf-pg-per-page-menu');
  if (wfMenu) wfMenu.classList.add('hidden');
});

// ── New Case drawer ──────────────────────────────────────────────────────────
let newCaseOpen = false;

function renderNewCaseList(search) {
  search = (search || '').toLowerCase().trim();
  // Show workflows relevant to the active solution
  const _wfRows = typeof _activeWorkflows === 'function' ? _activeWorkflows() : [];
  const filtered = search
    ? _wfRows.filter(w => w.wfName.toLowerCase().includes(search) || w.wfId.toLowerCase().includes(search))
    : _wfRows;
  const body = document.getElementById('newcase-drawer-body');
  if (!body) return;
  if (!filtered.length) {
    body.innerHTML = `<div style="padding:24px 16px;text-align:center;color:var(--text-muted);font-size:13px">No workflows found</div>`;
    return;
  }
  body.innerHTML = filtered.map(w => `
    <div class="newcase-wf-item" onclick="showToast('Opening ${w.wfName}…',{type:'info'});closeNewCaseDrawer()">
      <span class="material-symbols-outlined">account_tree</span>
      <div class="newcase-wf-info">
        <div class="newcase-wf-name">${w.wfName}</div>
        <div class="newcase-wf-id">${w.wfId}</div>
      </div>
      <span class="material-symbols-outlined newcase-wf-arrow">chevron_right</span>
    </div>`).join('');
}

function toggleNewCaseDrawer() {
  newCaseOpen = !newCaseOpen;
  document.getElementById('newcase-drawer').classList.toggle('open', newCaseOpen);
  document.getElementById('newcase-overlay').classList.toggle('open', newCaseOpen);
  document.getElementById('newcase-btn').classList.toggle('active', newCaseOpen);
  if (newCaseOpen) {
    // close other drawers
    if (searchOpen) toggleSearchDrawer();
    if (notifOpen) closeNotifDrawer();
    // reset search & populate list
    const inp = document.getElementById('newcase-search-input');
    if (inp) inp.value = '';
    renderNewCaseList('');
    setTimeout(() => document.getElementById('newcase-search-input')?.focus(), 120);
  }
}

function closeNewCaseDrawer() {
  if (!newCaseOpen) return;
  newCaseOpen = false;
  document.getElementById('newcase-drawer').classList.remove('open');
  document.getElementById('newcase-overlay').classList.remove('open');
  document.getElementById('newcase-btn').classList.remove('active');
}

let notifOpen = false;
const _aiMessages = [];
let _aiCurrentCase = null;
let _aiContextDismissed = false;
let _aiFlowState = 'idle'; // idle | analyzing | response | planning | approved | login-required | success | completed | closing | case-done
let _aiFlowUserMsg = '';   // pill text shown as the user's message bubble
let _aiAttentionCaseId = null; // tab ID that should show the AI badge dot
let _workFeedMode = false;     // true when AI drawer is serving the Work Feed panel
let _workFeedCaseId = null;    // active work-feed case shown in the drawer
let _wfInitialized = false;    // whether initial seeded content has been injected this session
let _wfComparisonHandoffSent = false; // whether the supervisor-check handoff message has been sent
let _pdfZoom = 100; // current PDF popover zoom level (%)
let _aiProcessing = false;
let _aiProcessingTimer = null;
let searchOpen = false;
let tasksOpen = false;

function _resetCasey() {
  // Clear conversation messages
  _aiMessages.length = 0;
  // Reset flow state
  _aiFlowState = 'idle';
  _aiFlowUserMsg = '';
  _workFeedMode = false;
  _workFeedCaseId = null;
  _wfInitialized = false;
  _wfComparisonHandoffSent = false;
  _aiContextDismissed = false;
  // Clear case context so _renderAiDrawerContext shows generic state, not old case
  _aiCurrentCase = null;
  // Stop any in-flight processing
  if (_aiProcessingTimer) { clearTimeout(_aiProcessingTimer); _aiProcessingTimer = null; }
  _aiProcessing = false;
  // Clear dynamic drawer content, preserve #ai-empty
  const body = document.getElementById('ai-drawer-body');
  if (body) {
    Array.from(body.children).forEach(child => {
      if (child.id !== 'ai-empty') child.remove();
    });
  }
  const empty = document.getElementById('ai-empty');
  if (empty) empty.style.display = '';
  // Re-render context pills + footer input for the new page
  _renderAiDrawerContext();
  _renderAiFooter();
}

function toggleSearchDrawer() {
  searchOpen = !searchOpen;
  document.getElementById('search-drawer').classList.toggle('open', searchOpen);
  document.getElementById('search-btn').classList.toggle('active', searchOpen);
  document.getElementById('search-view').classList.toggle('hidden', !searchOpen);
  document.getElementById('portal-content').classList.toggle('hidden', searchOpen);
  document.getElementById('empty-state').classList.remove('visible');
  _hideOosState();
  // close other drawers
  if (searchOpen && notifOpen) closeNotifDrawer();
  if (searchOpen && tasksOpen) closeTasksDrawer();
  // deselect top bar tabs
  document.querySelectorAll('.case-tab').forEach(t => t.classList.remove('selected'));
  // deactivate other sidebar nav btns
  if (searchOpen) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('search-btn').classList.add('active');
  }
  // clear search when closing
  if (!searchOpen) {
    document.getElementById('search-input').value = '';
    document.getElementById('search-empty').classList.remove('hidden');
    document.getElementById('search-results').classList.add('hidden');
  }
}

function handleSearch(query) {
  const q = query.trim().toLowerCase();
  const empty = document.getElementById('search-empty');
  const results = document.getElementById('search-results');
  const header = document.getElementById('search-results-header');
  const tbody = document.getElementById('search-tbody');

  if (!q) {
    empty.classList.remove('hidden');
    results.classList.add('hidden');
    return;
  }

  const allData = [...assignedData, ...queueData];
  const filtered = allData.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.name.toLowerCase().includes(q) ||
    r.status.toLowerCase().includes(q) ||
    r.assignees.some(a => a.toLowerCase().includes(q))
  );

  empty.classList.add('hidden');
  results.classList.remove('hidden');
  header.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`;
  tbody.innerHTML = filtered.map(row => `
    <tr>
      <td><input type="checkbox"></td>
      <td class="cell-id">${row.id}</td>
      <td class="cell-case">${row.name}</td>
      <td class="cell-date">${row.created}</td>
      <td class="cell-date">${row.due}</td>
      <td><span class="tier-badge">${row.tier}</span></td>
      <td>
        <div class="assignee-list">
          ${row.assignees.map(a => `<span class="assignee-badge"><span class="material-symbols-outlined">person</span>${a}</span>`).join('')}
          ${row.overflow ? `<span class="assignee-overflow">${row.overflow}</span>` : ''}
        </div>
      </td>
      <td><span class="status-badge ${statusClass(row.status)}">${row.status}</span></td>
    </tr>
  `).join('');
}

function toggleNotifDrawer() {
  notifOpen = !notifOpen;
  document.getElementById('notif-drawer').classList.toggle('open', notifOpen);
  document.getElementById('notif-overlay').classList.toggle('open', notifOpen);
  document.getElementById('notif-btn').classList.toggle('active', notifOpen);
  // close other drawers
  if (notifOpen && searchOpen) {
    searchOpen = false;
    document.getElementById('search-drawer').classList.remove('open');
    document.getElementById('search-btn').classList.remove('active');
    document.getElementById('search-view').classList.add('hidden');
    document.getElementById('portal-content').classList.remove('hidden');
    document.getElementById('search-input').value = '';
    document.getElementById('search-empty').classList.remove('hidden');
    document.getElementById('search-results').classList.add('hidden');
  }
  if (notifOpen && tasksOpen) closeTasksDrawer();
}

function closeNotifDrawer() {
  notifOpen = false;
  document.getElementById('notif-drawer').classList.remove('open');
  document.getElementById('notif-overlay').classList.remove('open');
  document.getElementById('notif-btn').classList.remove('active');
}

function toggleTasksDrawer() {
  tasksOpen = !tasksOpen;
  document.getElementById('tasks-drawer').classList.toggle('open', tasksOpen);
  document.getElementById('tasks-btn').classList.toggle('active', tasksOpen);
  // close other drawers
  if (tasksOpen && notifOpen) closeNotifDrawer();
  if (tasksOpen && searchOpen) {
    searchOpen = false;
    document.getElementById('search-drawer').classList.remove('open');
    document.getElementById('search-btn').classList.remove('active');
    document.getElementById('search-view').classList.add('hidden');
    document.getElementById('portal-content').classList.remove('hidden');
    document.getElementById('search-input').value = '';
    document.getElementById('search-empty').classList.remove('hidden');
    document.getElementById('search-results').classList.add('hidden');
  }
}

function closeTasksDrawer() {
  tasksOpen = false;
  document.getElementById('tasks-drawer').classList.remove('open');
  document.getElementById('tasks-btn').classList.remove('active');
}

function tasksFilterClick(btn) {
  document.querySelectorAll('.tasks-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}


// ── Table view feature ──
const VIEWS = {
  my: [
    {
      id: 'my-tier', name: 'My tier', icon: 'person',
      hiddenCols: ['id','created','stage','fetchedBy','client'],
      sortRules: [{field:'tier', dir:'asc'}],
      filterFields: [{field:'tier', value:'Tier 2'}],
    }
  ],
  shared: [
    {
      id: 'admin', name: 'Admin view', icon: 'manage_accounts',
      hiddenCols: ['fetchedBy','client'],
      sortRules: [],
      filterFields: [],
    },
    {
      id: 'member', name: 'Member View', icon: 'group',
      hiddenCols: ['id','created','stage','fetchedBy','client'],
      sortRules: [],
      filterFields: [],
    },
  ],
  system: [
    {
      id: 'default', name: 'Default view', icon: 'table_chart',
      hiddenCols: ['stage','fetchedBy','client'],
      sortRules: [],
      filterFields: [],
    },
    {
      id: 'allocated', name: 'Allocated view', icon: 'assignment_ind',
      hiddenCols: ['stage','fetchedBy','client'],
      sortRules: [],
      filterFields: [{ field: 'allocated', value: 'yes' }],
    },
    {
      id: 'unallocated', name: 'Unallocated view', icon: 'assignment_late',
      hiddenCols: ['stage','fetchedBy','client'],
      sortRules: [],
      filterFields: [{ field: 'allocated', value: 'no' }],
    },
  ],
};

let activeViewId = 'default';

function findView(id) {
  for (const section of Object.values(VIEWS)) {
    const v = section.find(v => v.id === id);
    if (v) return v;
  }
  return null;
}

function selectView(id) {
  const view = findView(id);
  if (!view) return;
  activeViewId = id;
  hiddenCols = new Set(view.hiddenCols);
  sortRules = view.sortRules.map(r => ({...r}));
  filterFields = view.filterFields.map(f => ({...f}));
  closeViewPicker();
  renderViewBtn();
  renderViewChips();
  renderActiveBar();
  renderTableHeader();
  applyAndRender();
}

function setDensity(d) {
  rowDensity = d;
  document.querySelectorAll('.table-wrapper').forEach(tw => {
    tw.classList.toggle('density-compact',  d === 'compact');
    tw.classList.toggle('density-spacious', d === 'spacious');
  });
  document.querySelectorAll('.display-density-opt').forEach(b => b.classList.remove('active'));
  const opt = document.getElementById('display-opt-' + d);
  if (opt) opt.classList.add('active');
  _syncDisplayBtn();
  const panel = document.getElementById('display-panel');
  if (panel) panel.classList.add('hidden');
}

let viewMode = 'table'; // 'table' | 'split'
let splitActiveCaseId = null;

function _syncDisplayBtn() {
  const btn = document.getElementById('display-btn');
  if (btn) btn.classList.toggle('active', rowDensity !== 'default');
  document.getElementById('view-seg-table')?.classList.toggle('active', viewMode !== 'split');
  document.getElementById('view-seg-split')?.classList.toggle('active', viewMode === 'split');
}

function _splitData() {
  if (typeof activeSolution !== 'undefined' && activeSolution === 'deduction') {
    return [..._operationData];
  }
  return currentTab === 'operation' ? [..._operationData]
       : currentTab === 'assigned'  ? [...assignedData]
       : [...queueData];
}

function setViewMode(mode) {
  viewMode = mode;
  const portalBody = document.querySelector('.portal-body');
  const splitContainer = document.getElementById('split-container');
  const casePage = document.getElementById('case-page');
  document.querySelectorAll('.display-view-opt').forEach(b => b.classList.remove('active'));
  document.getElementById('display-view-' + mode)?.classList.add('active');
  _syncDisplayBtn();
  document.getElementById('display-panel')?.classList.add('hidden');
  if (mode === 'split') {
    portalBody.classList.add('split-mode');
    // Close utility panel if open — no sidebar shown in split mode
    if (typeof closeUtility === 'function') closeUtility();
    // Move #case-page inside the split container so only the table area transforms
    if (casePage.parentElement !== splitContainer) splitContainer.appendChild(casePage);
    _splitPage = 1;
    _splitCheckedIds.clear();
    renderSplitList();
    const data = _splitData();
    if (data.length > 0) openSplitCase(String(data[0].id).replace(/^#\s*/, ''));
  } else {
    portalBody.classList.remove('split-mode');
    portalBody.classList.remove('split-bulk-active');
    // Move #case-page back to .portal-body (as a sibling of #portal-content)
    if (casePage.parentElement !== portalBody) portalBody.appendChild(casePage);
    casePage.classList.add('hidden');
    splitActiveCaseId = null;
  }
  // Narrow header/columns on form cards are driven by the @container query on .case-form-area,
  // so split mode alone no longer forces narrow — when the split case panel is wide enough, 2 columns will apply.
  document.querySelectorAll('.case-form-area').forEach(el => el.classList.remove('narrow'));
}

// ── Cases split-view feed state ───────────────────────────────────────────────
let _splitPage    = 1;
let _splitPerPage = 10;
const _splitCheckedIds = new Set();

function renderSplitList() {
  const allData = _splitData();
  const total   = allData.length;
  const maxPage = Math.max(1, Math.ceil(total / _splitPerPage));
  if (_splitPage > maxPage) _splitPage = maxPage;

  // Paginate
  const data = allData.slice((_splitPage - 1) * _splitPerPage, _splitPage * _splitPerPage);

  const cardList = document.getElementById('split-card-list');
  if (!cardList) return;

  cardList.innerHTML = data.map(row => {
    const id       = String(row.id).replace(/^#\s*/, '');
    const isActive = splitActiveCaseId === id;
    const checked  = _splitCheckedIds.has(id);
    return `<div class="wf-feed-card${isActive ? ' active' : ''}" data-id="${id}" onclick="openSplitCase('${id}')">
      <input type="checkbox" class="wf-card-cb"${checked ? ' checked' : ''} onclick="event.stopPropagation();_splitCbClick(event,this,'${id}')">
      <div class="wf-card-top">
        <span class="material-symbols-outlined wf-card-icon">bookmark</span>
        <span class="wf-card-id"># ${id}</span>
        <button class="wf-card-open-btn" onclick="event.stopPropagation();openSplitCaseInTab()" title="Open in tab"><span class="material-symbols-outlined">open_in_new</span></button>
      </div>
      <div class="wf-card-desc">${row.name || '—'}</div>
      <div class="wf-card-bottom">
        <span class="wf-card-badge ${statusClass(row.status)}">${row.status || '—'}</span>
        <div class="wf-card-actions"></div>
      </div>
    </div>`;
  }).join('');

  // Restore bulk-mode class if any checked
  cardList.closest('.wf-feed-list')?.classList.toggle('wf-bulk-mode', _splitCheckedIds.size > 0);

  // Pagination UI
  _splitRenderPagination(total);
}

function _splitRenderPagination(total) {
  const maxPage = Math.max(1, Math.ceil(total / _splitPerPage));
  const start   = ((_splitPage - 1) * _splitPerPage) + 1;
  const end     = Math.min(_splitPage * _splitPerPage, total);
  const countEl = document.getElementById('split-pg-count');
  const ctrlEl  = document.getElementById('split-pg-controls');
  const valEl   = document.getElementById('split-pg-per-page-val');
  if (countEl) countEl.textContent = total ? `${start}–${end} of ${total}` : '—';
  if (valEl)   valEl.textContent   = _splitPerPage;
  if (!ctrlEl) return;
  const btn = (label, page, disabled) =>
    `<button class="pg-btn${disabled ? ' disabled' : ''}" ${disabled ? 'disabled' : `onclick="_splitGoToPage(${page})"`}>${label}</button>`;
  const pages = [];
  for (let p = 1; p <= maxPage; p++) {
    if (p === 1 || p === maxPage || Math.abs(p - _splitPage) <= 1)
      pages.push(`<button class="pg-btn${p === _splitPage ? ' active' : ''}" onclick="_splitGoToPage(${p})">${p}</button>`);
    else if (pages[pages.length-1] !== '<span class="pg-ellipsis">…</span>')
      pages.push('<span class="pg-ellipsis">…</span>');
  }
  ctrlEl.innerHTML =
    btn('«', 1, _splitPage === 1) +
    btn('‹', _splitPage - 1, _splitPage === 1) +
    pages.join('') +
    btn('›', _splitPage + 1, _splitPage === maxPage) +
    btn('»', maxPage, _splitPage === maxPage);
}

function _splitGoToPage(page) {
  _splitPage = page;
  renderSplitList();
}

function _splitChangePerPage(n) {
  _splitPerPage = n;
  _splitPage    = 1;
  document.querySelectorAll('#split-pg-per-page-menu .pg-per-page-opt').forEach(b => b.classList.toggle('active', parseInt(b.textContent) === n));
  document.getElementById('split-pg-per-page-menu')?.classList.add('hidden');
  renderSplitList();
}

function _splitTogglePerPageMenu(e) {
  e.stopPropagation();
  document.getElementById('split-pg-per-page-menu')?.classList.toggle('hidden');
}

function _splitCbClick(event, cb, id) {
  if (cb.checked) _splitCheckedIds.add(id);
  else _splitCheckedIds.delete(id);
  _splitOnCheck();
}

function _splitOnCheck() {
  const cardList = document.getElementById('split-card-list');
  const countEl  = document.getElementById('split-bulk-count');
  const n = _splitCheckedIds.size;
  if (cardList) cardList.classList.toggle('wf-bulk-mode', n > 0);
  if (countEl)  countEl.textContent = n === 1 ? '1 selected' : `${n} selected`;
  document.querySelector('.portal-body')?.classList.toggle('split-bulk-active', n > 0);
}

function _splitClearBulk() {
  _splitCheckedIds.clear();
  renderSplitList();
  _splitOnCheck();
}

function _splitBulkAction(action) {
  alert(`${action} — ${_splitCheckedIds.size} case(s) selected`);
}

function openSplitCase(caseId) {
  splitActiveCaseId = String(caseId).replace(/^#\s*/, '');
  const casePage = document.getElementById('case-page');
  casePage.classList.remove('hidden');
  renderCasePage(splitActiveCaseId);
  renderSplitList();
}

function openSplitCaseInTab() {
  if (!splitActiveCaseId) return;
  // selectTab will exit split mode (moves #case-page back to .portal-body) and render the case full-page
  openCaseTab(splitActiveCaseId);
}

function wfToggleViewPicker(e) {
  if (e) e.stopPropagation();
  const picker = document.getElementById('wf-view-picker');
  if (picker) picker.classList.toggle('hidden');
}
function wfToggleViewSettings(e) {
  if (e) e.stopPropagation();
  // placeholder — view settings for Work Feed
}

function toggleViewPicker(e) {
  if (e) e.stopPropagation();
  const picker = document.getElementById('view-picker');
  const isHidden = picker.classList.contains('hidden');
  picker.classList.toggle('hidden');
  if (isHidden) {
    document.getElementById('view-picker-search').value = '';
    renderViewPickerList('');
  }
}

function closeViewPicker() {
  document.getElementById('view-picker').classList.add('hidden');
}

function renderViewPickerList(search = '') {
  search = (search || '').toLowerCase();
  const sections = [
    { key: 'my', title: 'My views' },
    { key: 'shared', title: 'Shared views' },
    { key: 'system', title: 'System views' },
  ];
  let html = '';
  for (const sec of sections) {
    const views = VIEWS[sec.key].filter(v => !search || v.name.toLowerCase().includes(search));
    if (!views.length) continue;
    html += `<div class="view-section-title">${sec.title}</div>`;
    for (const v of views) {
      const isActive = v.id === activeViewId;
      html += `<div class="view-item${isActive ? ' active' : ''}" onclick="selectView('${v.id}')">
        <span class="material-symbols-outlined">${v.icon}</span>
        <span>${v.name}</span>
        <span class="material-symbols-outlined view-item-check" style="visibility:${isActive ? 'visible' : 'hidden'}">check</span>
      </div>`;
    }
  }
  document.getElementById('view-picker-list').innerHTML = html;
}

function renderViewBtn() {
  const view = findView(activeViewId);
  const isDefault = activeViewId === 'default';
  const label = view ? view.name : 'Default view';
  const mainBtn = document.getElementById('view-btn-main');
  const settingsBtn = document.getElementById('view-settings-btn');
  if (!mainBtn) return;
  mainBtn.querySelector('.view-name').textContent = label;
  mainBtn.classList.toggle('active-view', !isDefault);
  // Settings btn highlights when view is customised OR when filters/sorts are active
  const hasActiveState = !isDefault || filterFields.length > 0 || sortRules.length > 0;
  if (settingsBtn) settingsBtn.classList.toggle('active-view', hasActiveState);
}

// ── View context menu ──
function getViewSection(id) {
  for (const [key, arr] of Object.entries(VIEWS)) {
    if (arr.find(v => v.id === id)) return key;
  }
  return null;
}

function toggleViewSettings(e) {
  e.stopPropagation();
  closeViewPicker();
  const menu = document.getElementById('view-context-menu');
  const isHidden = menu.classList.contains('hidden');
  menu.classList.toggle('hidden');
  if (isHidden) renderViewContextMenu();
}

function closeViewContextMenu() {
  document.getElementById('view-context-menu')?.classList.add('hidden');
}

function renderViewContextMenu() {
  const isSystemView = getViewSection(activeViewId) === 'system';
  const isModified = isViewModified();
  const menu = document.getElementById('view-context-menu');
  menu.innerHTML = `
    ${isModified ? `<button class="vcm-item" onclick="saveViewChanges()">
      <span class="material-symbols-outlined">save</span> Save changes
    </button>` : ''}
    <button class="vcm-item" onclick="openSaveViewModal('new')">
      <span class="material-symbols-outlined">add_circle</span> Save as new view
    </button>
    ${!isSystemView ? `
    <div class="vcm-divider"></div>
    <button class="vcm-item" onclick="openSaveViewModal('edit')">
      <span class="material-symbols-outlined">edit</span> Edit view
    </button>
    <button class="vcm-item danger" onclick="deleteActiveView()">
      <span class="material-symbols-outlined">delete</span> Delete view
    </button>` : ''}
  `;
}

function isViewModified() {
  const view = findView(activeViewId);
  if (!view) return false;
  const fSame = JSON.stringify(filterFields) === JSON.stringify(view.filterFields);
  const sSame = JSON.stringify(sortRules) === JSON.stringify(view.sortRules);
  return !fSame || !sSame;
}

function saveViewChanges() {
  const view = findView(activeViewId);
  if (!view) return;
  view.filterFields = filterFields.map(f => ({...f}));
  view.sortRules = sortRules.map(r => ({...r}));
  view.hiddenCols = [...hiddenCols];
  closeViewContextMenu();
  renderViewChips();
}

// ── Save new view modal ──
let _saveViewMode = 'new'; // 'new' | 'edit'

function openSaveViewModal(mode = 'new') {
  _saveViewMode = mode;
  closeViewContextMenu();
  const overlay = document.getElementById('save-view-modal-overlay');
  const input = document.getElementById('save-view-name-input');
  const title = document.getElementById('save-view-modal-title');
  if (mode === 'edit') {
    title.textContent = 'Edit View';
    input.value = findView(activeViewId)?.name || '';
  } else {
    title.textContent = 'Save new View';
    input.value = '';
  }
  // Pre-select radio based on current view section
  const section = getViewSection(activeViewId);
  document.getElementById('radio-shared').checked = true;
  if (section === 'my') document.getElementById('radio-my-views').checked = true;
  overlay.classList.remove('hidden');
  setTimeout(() => input.focus(), 50);
}

function closeSaveViewModal() {
  document.getElementById('save-view-modal-overlay').classList.add('hidden');
}

function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('save-view-modal-overlay')) closeSaveViewModal();
}

function confirmSaveView() {
  const name = document.getElementById('save-view-name-input').value.trim();
  if (!name) return;
  const displayIn = document.querySelector('input[name="view-display"]:checked')?.value || 'my';

  if (_saveViewMode === 'edit') {
    const view = findView(activeViewId);
    if (view) view.name = name;
    closeSaveViewModal();
    renderViewBtn();
    renderViewPickerList('');
    return;
  }

  // New view — snapshot current state
  const newId = 'view-' + Date.now();
  const newView = {
    id: newId, name,
    icon: 'table_chart',
    hiddenCols: [...hiddenCols],
    sortRules: sortRules.map(r => ({...r})),
    filterFields: filterFields.map(f => ({...f})),
  };
  VIEWS[displayIn].push(newView);
  activeViewId = newId;
  closeSaveViewModal();
  renderViewBtn();
  renderViewPickerList('');
  renderViewChips();
}

function deleteActiveView() {
  const section = getViewSection(activeViewId);
  if (!section || section === 'system') return;
  VIEWS[section] = VIEWS[section].filter(v => v.id !== activeViewId);
  closeViewContextMenu();
  selectView('default');
}

function renderViewChips() {
  const bar = document.getElementById('view-chips-bar');
  if (!bar) return;
  const hasFilters = filterFields.length > 0;
  const hasSorts = sortRules.length > 0;
  const isSystemView = getViewSection(activeViewId) === 'system';
  const modified = isViewModified();

  const isNamedView = activeViewId !== 'default' && isSystemView === false;
  if (!hasFilters && !hasSorts || (isNamedView && !modified)) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');

  let html = filterFields.map(f => {
    const col = COLS.find(c => c.key === f.field);
    const label = f.value ? `${col ? col.label : f.field}: ${f.value}` : (col ? col.label : f.field);
    return `<span class="view-chip">
      <span class="material-symbols-outlined">filter_list</span>
      ${label}
      <button class="chip-remove" onclick="removeViewChip('${f.field}')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </span>`;
  }).join('');

  html += `<button class="chips-add-filter" onclick="toggleDropdown('filter')">
    <span class="material-symbols-outlined" style="font-size:13px">add</span> Filter
  </button>`;
  html += `<button class="chips-reset" onclick="resetViewFilters()">Reset</button>`;

  // Save actions
  if (isSystemView && (hasFilters || hasSorts)) {
    html += `<button class="chips-save-new" onclick="openSaveViewModal('new')">Save New View</button>`;
  } else if (!isSystemView && modified) {
    html += `<button class="chips-save-changes" onclick="saveViewChanges()">Save changes</button>`;
    html += `<button class="chips-save-new" onclick="openSaveViewModal('new')">Save New View</button>`;
  }

  bar.innerHTML = html;
}

function removeViewChip(field) {
  filterFields = filterFields.filter(f => f.field !== field);
  renderViewBtn(); renderViewChips(); renderActiveBar(); applyAndRender();
}

function resetViewFilters() {
  filterFields = []; sortRules = [];
  renderViewBtn(); renderViewChips(); renderActiveBar(); applyAndRender();
}

// ── Solution switcher ──
const SOLUTIONS = {
  'cora-orchestration': {
    name: 'Cora Orchestration',
    icon: 'view_comfy_alt',
    filters: [
      { key: 'operation', label: 'Operation cases' },
    ]
  },
  'deduction': {
    name: 'Deduction',
    icon: 'calculate',
    filters: [
      { key: 'operation', label: 'Operation cases' },
    ]
  },
  'collections': {
    name: 'Collections',
    icon: 'payments',
    filters: [
      { key: 'operation', label: 'Operation cases' },
    ]
  },
};

let activeSolution = 'deduction';

function _updatePageTitle() {
  const meta = SECTION_META[activeSection] || SECTION_META.mywork;
  document.getElementById('portal-page-title').textContent = meta.label;
}

function renderSolutionHeader() {
  const sol = SOLUTIONS[activeSolution];
  _updatePageTitle();
  // Render filter tabs
  const filtersEl = document.getElementById('solution-filters');
  filtersEl.innerHTML = sol.filters.map(f =>
    `<button class="${f.key === currentTab ? 'active' : ''}" onclick="switchSolutionFilter('${f.key}')">${f.label}</button>`
  ).join('');
  // Update dropdown checkmarks
  document.querySelectorAll('.solution-option').forEach(el => {
    const isActive = el.dataset.solution === activeSolution;
    el.classList.toggle('active', isActive);
    const check = el.querySelector('.solution-option-check');
    if (check) check.style.visibility = isActive ? 'visible' : 'hidden';
  });
}

function switchSolutionFilter(key) {
  currentTab = key;
  renderSolutionHeader();
  applyAndRender();
}

const _SOLUTION_INITIALS = {
  'cora-orchestration': 'CO',
  'deduction':          'DD',
  'collections':        'CL',
};
function _updateSolutionAvatar() {
  const el = document.getElementById('solution-avatar');
  if (el) el.textContent = _SOLUTION_INITIALS[activeSolution] || (SOLUTIONS[activeSolution]?.label || activeSolution).trim().slice(0,2).toUpperCase();
}

// Nav items that only exist in Cora Orchestration
const _CORA_ONLY_NAV = ['tasks-btn'];

function _syncSolutionNav() {
  const isCora = activeSolution === 'cora-orchestration';
  _CORA_ONLY_NAV.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isCora ? '' : 'none';
  });
  // Workflows (allwork) is available in all solutions — no redirect needed
  // Close tasks drawer if switching away from cora
  if (!isCora && tasksOpen) closeTasksDrawer();
}

function selectSolution(id) {
  activeSolution = id;
  currentTab = SOLUTIONS[id].filters[0].key;
  closeSolutionMenu();
  _updateSolutionAvatar();
  _syncSolutionNav();
  renderSolutionHeader();
  // Swap column set for the active solution
  if (id === 'deduction') {
    colOrder   = [..._DEDUCTION_COLS];
    hiddenCols = new Set();
  } else {
    colOrder   = [...COLS];
    hiddenCols = new Set();
  }
  applyAndRender();
  // Reset Work Feed to first case in the new solution's dataset
  const _newWfCases = (id === 'deduction') ? _deductionWfData : workFeedData;
  activeWorkFeedCase = _newWfCases[0]?.id || activeWorkFeedCase;
  renderWorkFeedPage();
}

function _syncSolutionChevron() {
  const isOpen = !document.getElementById('solution-dropdown').classList.contains('hidden');
  document.getElementById('solution-btn')?.classList.toggle('open', isOpen);
  const chev = document.getElementById('solution-chevron');
  if (chev) chev.textContent = isOpen ? 'expand_less' : 'expand_more';
}

function toggleSolutionMenu(e) {
  if (e) e.stopPropagation();
  document.getElementById('solution-dropdown').classList.toggle('hidden');
  _syncSolutionChevron();
}

function closeSolutionMenu() {
  document.getElementById('solution-dropdown').classList.add('hidden');
  _syncSolutionChevron();
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.solution-btn') &&
      !e.target.closest('#solution-dropdown') &&
      !e.target.closest('#solution-name-btn')) {
    closeSolutionMenu();
  }
});

// ── Per-section tab state ──
const SECTION_META = {
  mywork:    { icon: 'home',      label: 'Cases',     subtitle: 'Your assigned cases and queue' },
  allwork:   { icon: 'dynamic_feed', label: 'Workflows', subtitle: 'Manage and view all workflows' },
  analytics: { icon: 'bar_chart', label: 'Analytics', subtitle: 'Performance metrics and reporting'     },
  archive:   { icon: 'archive',   label: 'Archive',   subtitle: 'Closed and historical cases'           },
};

const sectionTabs = {
  mywork:     [{ id: 'home', label: 'Cases',        icon: 'home',         home: true }],
  allwork:    [{ id: 'home', label: 'Workflows',  icon: 'dynamic_feed', home: true }],
  analytics:  [{ id: 'home', label: 'Analytics',  icon: 'bar_chart',    home: true }],
  archive:    [{ id: 'home', label: 'Archive',     icon: 'archive',      home: true }],
  agentfleet: [{ id: 'home', label: 'Agent Fleet', icon: 'smart_toy',   home: true }],
  workfeed:   [{ id: 'home', label: 'Work Feed', icon: 'dynamic_feed', home: true }],
};

// ── Global tooltip helpers ────────────────────────────────────────────────────
function _showTip(e, html) {
  const tip = document.getElementById('g-tip');
  if (!tip) return;
  tip.innerHTML = html;
  tip.style.left = e.clientX + 'px';
  tip.style.top  = e.clientY + 'px';
  tip.classList.add('visible');
}
function _showTipEl(e, el) {
  const label = el.dataset.tipLabel || '';
  const val   = el.dataset.tipVal   || '';
  const desc  = el.dataset.tipDesc  || '';
  _showTip(e, `<strong>${label}</strong>&nbsp;${val}<br><span style="font-size:10px;opacity:.7">${desc}</span>`);
}
function _moveTip(e) {
  const tip = document.getElementById('g-tip');
  if (tip) { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; }
}
function _hideTip() {
  const tip = document.getElementById('g-tip');
  if (tip) tip.classList.remove('visible');
}

// Which tab is selected per section
const sectionActiveTab = { mywork: 'home', allwork: 'home', analytics: 'home', archive: 'home', agentfleet: 'home', workfeed: 'home' };

let activeSection = 'workfeed';
let recentTabs = [];

function renderTopbarTabs() {
  const scroll = document.getElementById('tabs-scroll');
  const tabs = sectionTabs[activeSection];
  const activeId = sectionActiveTab[activeSection];

  const home = tabs.find(t => t.home);
  const cases = tabs.filter(t => !t.home);

  const HOME_W = 164;
  const MIN_TAB = 92;
  const MAX_TAB = 160;
  const CHEVRON_W = 48;

  const totalW = scroll.offsetWidth || 600;
  const caseAreaW = totalW - HOME_W;

  let visibleCases = cases, overflowCases = [], tabW;

  if (cases.length === 0) {
    tabW = MAX_TAB;
  } else {
    const natural = Math.min(MAX_TAB, Math.floor(caseAreaW / cases.length));
    if (natural >= MIN_TAB) {
      tabW = natural;
    } else {
      // Need overflow chevron
      const availForTabs = caseAreaW - CHEVRON_W;
      const maxCount = Math.max(1, Math.floor(availForTabs / MIN_TAB));
      tabW = MIN_TAB;
      visibleCases = cases.slice(0, maxCount);
      overflowCases = cases.slice(maxCount);
      // Keep active tab always visible
      const activeInOverflow = overflowCases.find(t => t.id === activeId);
      if (activeInOverflow) {
        const displaced = visibleCases[visibleCases.length - 1];
        visibleCases = [...visibleCases.slice(0, -1), activeInOverflow];
        overflowCases = [displaced, ...overflowCases.filter(t => t.id !== activeId)];
      }
    }
  }

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const shortcutLabel = isMac ? 'Cmd+K' : 'Ctrl+K';
  const homeHtml = home ? `<button class="case-tab home-tab ${home.id === activeId ? 'selected' : ''}" onclick="selectTab('${home.id}')" data-tab-id="${home.id}">
    <span class="material-symbols-outlined">${home.icon}</span><span class="tab-label">${home.label}</span><span class="home-tab-shortcut">${shortcutLabel}</span>
  </button>` : '';

  const casesHtml = visibleCases.map(t => {
    const hasBadge = t.id === _aiAttentionCaseId;
    return `<button class="case-tab ${t.id === activeId ? 'selected' : ''}" onclick="selectTab('${t.id}')" data-tab-id="${t.id}" style="width:${tabW}px">
      <span class="material-symbols-outlined">${t.icon}</span><span class="tab-label">${t.label}</span>${hasBadge ? '<span class="ai-tab-badge"></span>' : ''}
      <span class="tab-close" onclick="closeTab(event,'${t.id}')">&times;</span>
    </button>`;
  }).join('');

  const chevronHtml = overflowCases.length > 0 ? `<div class="tabs-overflow-wrap">
    <button class="tabs-overflow-btn" onclick="toggleTabsOverflow(event)" id="tabs-overflow-btn">
      <span class="material-symbols-outlined">chevron_right</span>
      <span class="tabs-overflow-count">${overflowCases.length}</span>
    </button>
    <div class="tabs-overflow-menu" id="tabs-overflow-menu" style="display:none">
      ${overflowCases.map(t => `<button class="tabs-overflow-item ${t.id === activeId ? 'selected' : ''}" onclick="selectTab('${t.id}')">
        <span class="material-symbols-outlined">${t.icon}</span>
        <span class="ov-label">${t.label}</span>
        <span class="tab-close" onclick="closeTab(event,'${t.id}')">&times;</span>
      </button>`).join('')}
    </div>
  </div>` : '';

  scroll.innerHTML = homeHtml + casesHtml + chevronHtml;
}

function toggleTabsOverflow(e) {
  e.stopPropagation();
  const menu = document.getElementById('tabs-overflow-menu');
  if (!menu) return;
  const isOpen = menu.style.display !== 'none';
  menu.style.display = isOpen ? 'none' : 'block';
}

// Close overflow menu when clicking outside
document.addEventListener('click', () => {
  const menu = document.getElementById('tabs-overflow-menu');
  if (menu) menu.style.display = 'none';
});

document.addEventListener('click', e => {
  if (!e.target.closest('#qv-popover') && !e.target.closest('.row-action-btn[title="Quick View"]')) {
    closeQuickView();
  }
});

function selectTab(id) {
  _resetCasey();
  sectionActiveTab[activeSection] = id;
  renderTopbarTabs();
  const isHome = id === 'home';
  // Leaving home into a case tab while in split mode → exit split so case-page is a sibling of portal-content
  if (!isHome && viewMode === 'split') setViewMode('table');
  document.getElementById('empty-state').classList.toggle('visible', false);
  _hideOosState();

  // Agent Fleet — handles its own sub-views (fleet table vs agent detail)
  if (activeSection === 'agentfleet') {
    if (isHome) {
      _showFleetView();
    } else if (id.startsWith('agent:')) {
      const type = id.slice(6);
      _showAgentView(type);
    }
    closeSearchIfOpen();
    return;
  }

  // Work Feed is a standalone full-page — swap it with case-page instead of portal-content
  const wfPage = document.getElementById('workfeed-page');
  if (activeSection === 'workfeed' && wfPage) {
    wfPage.style.display = isHome ? 'flex' : 'none';
    document.getElementById('portal-content').classList.add('hidden');
    document.getElementById('case-page').classList.toggle('hidden', isHome);
    if (!isHome) { renderCasePage(id); _syncNavActive(); }
    closeSearchIfOpen();
    return;
  }
  document.getElementById('portal-content').classList.toggle('hidden', !isHome);
  document.getElementById('case-page').classList.toggle('hidden', isHome);
  if (isHome) {
    // returning home: re-show portal, clear search
    document.getElementById('portal-content').classList.remove('hidden');
    document.getElementById('case-page').classList.add('hidden');
  } else {
    // case tab: render the case — keep the section nav-btn active
    renderCasePage(id);
    _syncNavActive();
  }
  closeSearchIfOpen();
}

function closeTab(e, id) {
  if (e) e.stopPropagation();
  const tabs = sectionTabs[activeSection];
  const idx = tabs.findIndex(t => t.id === id);
  if (idx < 0) return;
  // Remember closed tab for recent menu
  const ct = tabs[idx];
  if (!ct.home) {
    recentTabs.unshift({ id: ct.id, label: ct.label, icon: ct.icon || 'folder' });
    if (recentTabs.length > 10) recentTabs.pop();
  }
  tabs.splice(idx, 1);
  // if closed tab was active, go to home
  if (sectionActiveTab[activeSection] === id) {
    sectionActiveTab[activeSection] = 'home';
    document.getElementById('case-page').classList.add('hidden');
    const wfPage = document.getElementById('workfeed-page');
    if (activeSection === 'agentfleet') {
      _showFleetView();
    } else if (activeSection === 'workfeed' && wfPage) {
      wfPage.style.display = 'flex';
    } else {
      document.getElementById('portal-content').classList.remove('hidden');
    }
  }
  renderTopbarTabs();
}

const OOS_SECTIONS = { analytics: { icon: 'bar_chart', label: 'Analytics' }, archive: { icon: 'archive', label: 'Archive' } };
// allwork (Workflows) is handled as a dedicated page — not an OOS placeholder

function _showOosState(section) {
  const meta = OOS_SECTIONS[section];
  document.getElementById('oos-icon').textContent  = meta.icon;
  document.getElementById('oos-title').textContent = meta.label;
  document.getElementById('oos-state').classList.add('visible');
  document.getElementById('portal-content').classList.add('hidden');
  document.getElementById('empty-state').classList.remove('visible');
  document.getElementById('case-page').classList.add('hidden');
}

function _hideOosState() {
  document.getElementById('oos-state').classList.remove('visible');
}

function navSidebar(el, section) {
  _resetCasey();
  const target = section || 'mywork';

  // Hide standalone pages whenever switching away
  const afPage = document.getElementById('agentfleet-page');
  const wfPage = document.getElementById('workfeed-page');

  // Agent Fleet — dedicated full-page, bypasses normal portal flow
  if (target === 'agentfleet') {
    activeSection = target;
    _syncNavActive();
    _updatePageTitle();
    renderTopbarTabs();
    document.getElementById('portal-content').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('visible');
    _hideOosState();
    if (wfPage) wfPage.style.display = 'none';
    const awPageAf = document.getElementById('allwork-page');
    if (awPageAf) awPageAf.style.display = 'none';
    // If agent detail was occupying #case-page, clear it
    if (_casePageMode === 'agent') {
      document.getElementById('case-page').classList.add('hidden');
      _casePageMode = 'case';
    } else {
      document.getElementById('case-page').classList.add('hidden');
    }
    if (afPage) {
      afPage.style.display = 'flex';
      // Restore to fleet home if returning to the section
      if (sectionActiveTab['agentfleet'] === 'home' || !sectionActiveTab['agentfleet']) {
        _showFleetView();
        renderAgentFleetTable();
      } else {
        // Re-enter agent view for the active agent tab
        const tabId = sectionActiveTab['agentfleet'];
        if (tabId.startsWith('agent:')) _showAgentView(tabId.slice(6));
        else { _showFleetView(); renderAgentFleetTable(); }
      }
    }
    closeSearchIfOpen();
    return;
  }

  // Work Feed — dedicated full-page; AI drawer IS the Casey panel
  if (target === 'workfeed') {
    activeSection = target;
    _syncNavActive();
    _updatePageTitle();
    renderTopbarTabs();
    document.getElementById('case-page').classList.add('hidden');
    document.getElementById('portal-content').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('visible');
    _hideOosState();
    if (afPage) afPage.style.display = 'none';
    const awPageWf = document.getElementById('allwork-page');
    if (awPageWf) awPageWf.style.display = 'none';
    if (wfPage) { wfPage.style.display = 'flex'; renderWorkFeedPage(); }
    closeSearchIfOpen();
    return;
  }

  // Workflows (All Work) — dedicated full-page
  if (target === 'allwork') {
    activeSection = target;
    _syncNavActive();
    _updatePageTitle();
    renderTopbarTabs();
    document.getElementById('portal-content').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('visible');
    _hideOosState();
    if (wfPage) wfPage.style.display = 'none';
    if (afPage) afPage.style.display = 'none';
    const awPage = document.getElementById('allwork-page');
    if (awPage) { awPage.style.display = 'flex'; renderAllWorkPage(); }
    closeSearchIfOpen();
    return;
  }

  // Leaving Agent Fleet — clear agent view state
  if (activeSection === 'agentfleet') _activeAgentType = null;
  // Leaving Work Feed — exit mode so drawer reverts to normal
  if (_workFeedMode) _exitWorkFeedMode();

  // Hide standalone pages when navigating away
  if (afPage) afPage.style.display = 'none';
  if (wfPage) wfPage.style.display = 'none';
  const awPage2 = document.getElementById('allwork-page');
  if (awPage2) awPage2.style.display = 'none';

  // If already in this section and on a case → go home
  if (activeSection === target && sectionActiveTab[target] !== 'home') {
    sectionActiveTab[target] = 'home';
    document.getElementById('case-page').classList.add('hidden');
    document.getElementById('portal-content').classList.remove('hidden');
    renderTopbarTabs();
    closeSearchIfOpen();
    _clearAiContext();
    return;
  }
  activeSection = target;
  _syncNavActive();
  _updatePageTitle();
  renderTopbarTabs();
  document.getElementById('case-page').classList.add('hidden');
  if (OOS_SECTIONS[activeSection]) {
    _showOosState(activeSection);
  } else {
    _hideOosState();
    const isHome = sectionActiveTab[activeSection] === 'home';
    document.getElementById('empty-state').classList.toggle('visible', !isHome);
    document.getElementById('portal-content').classList.toggle('hidden', !isHome);
  }
  closeSearchIfOpen();
}

function _syncNavActive() {
  const navId = { mywork: 'nav-mywork', allwork: 'nav-allwork', analytics: 'nav-analytics', archive: 'nav-archive', agentfleet: 'nav-agentfleet', workfeed: 'nav-workfeed' };
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(navId[activeSection]);
  if (btn) btn.classList.add('active');
}

function closeSearchIfOpen() {
  if (searchOpen) {
    searchOpen = false;
    document.getElementById('search-drawer').classList.remove('open');
    document.getElementById('search-view').classList.add('hidden');
    document.getElementById('search-input').value = '';
    document.getElementById('search-empty').classList.remove('hidden');
    document.getElementById('search-results').classList.add('hidden');
  }
}

function toggleRecentMenu() {
  const existing = document.getElementById('recent-dropdown');
  const btn = document.querySelector('.recent-btn');
  if (existing) {
    existing.remove();
    btn && btn.classList.remove('menu-open');
    return;
  }
  btn && btn.classList.add('menu-open');

  const rect = btn ? btn.getBoundingClientRect() : { bottom: 40, right: window.innerWidth };
  const dropdown = document.createElement('div');
  dropdown.id = 'recent-dropdown';
  dropdown.className = 'recent-dropdown';
  dropdown.style.top   = (rect.bottom + 4) + 'px';
  dropdown.style.right = (window.innerWidth - rect.right) + 'px';

  if (recentTabs.length === 0) {
    dropdown.innerHTML = '<div class="recent-dropdown-header">Recently Closed</div><div class="recent-dropdown-empty">No recently closed tabs</div>';
  } else {
    const items = recentTabs.map(t =>
      `<div class="recent-dropdown-item" onclick="closeRecentMenu(); openCaseTab('${t.id}')">
        <span class="material-symbols-outlined">${t.icon || 'folder_open'}</span>
        <span class="rd-label">${t.label}</span>
      </div>`
    ).join('');
    dropdown.innerHTML = '<div class="recent-dropdown-header">Recently Closed</div>' + items;
  }

  document.body.appendChild(dropdown);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', _recentOutsideHandler);
  }, 0);
}

function closeRecentMenu() {
  const d = document.getElementById('recent-dropdown');
  if (d) d.remove();
  const btn = document.querySelector('.recent-btn');
  if (btn) btn.classList.remove('menu-open');
  document.removeEventListener('click', _recentOutsideHandler);
}

function _recentOutsideHandler(e) {
  const d = document.getElementById('recent-dropdown');
  const btn = document.querySelector('.recent-btn');
  if (d && !d.contains(e.target) && btn && !btn.contains(e.target)) {
    closeRecentMenu();
  }
}

// ── Column header context menu ──
let colCtxKey = null;

// ── Col-menu entry points — one per table ──────────────────────────────────
function openColMenu(e, colKey)   { _colCtxTable = 'mw'; _openColMenuCommon(e, colKey); }
function openWfColMenu(e, colKey) { _colCtxTable = 'wf'; _openColMenuCommon(e, colKey); }
function openAfColMenu(e, colKey) { _colCtxTable = 'af'; _openColMenuCommon(e, colKey); }

function _openColMenuCommon(e, colKey) {
  e.stopPropagation();
  colCtxKey = colKey;
  const menu = document.getElementById('col-ctx-menu');
  const rect = e.currentTarget.getBoundingClientRect();
  menu.style.top  = (rect.bottom + 2) + 'px';
  menu.style.left = rect.left + 'px';

  // Resolve state for this table
  let _visCols, _frozenCol, _pinnedCols;
  if (_colCtxTable === 'wf') {
    const wfa  = _wfActiveCols();
    _visCols   = wfa.order.filter(c => !wfa.hidden.has(c.key));
    _frozenCol = wfa.frozenCol;
    _pinnedCols = wfa.pinnedCols;
  } else if (_colCtxTable === 'af') {
    _visCols   = afColOrder.filter(c => !afHiddenCols.has(c.key));
    _frozenCol = afFrozenCol;
    _pinnedCols = afPinnedCols;
  } else {
    _visCols   = colOrder.filter(c => !hiddenCols.has(c.key));
    _frozenCol = frozenCol;
    _pinnedCols = pinnedCols;
  }

  const _colIdx     = _visCols.findIndex(c => c.key === colKey);
  const _frozenIdx  = _frozenCol ? _visCols.findIndex(c => c.key === _frozenCol) : -1;
  const _isInFrozen = _frozenCol !== null && _frozenIdx !== -1 && _colIdx <= _frozenIdx;
  const freezeBtn   = _isInFrozen
    ? `<button class="col-ctx-item" onclick="colCtxUnfreeze()"><span class="material-symbols-outlined">border_clear</span>Unfreeze column</button>`
    : `<button class="col-ctx-item" onclick="colCtxFreeze()"><span class="material-symbols-outlined">border_left</span>Freeze column</button>`;

  const filterByBtn = (_colCtxTable === 'mw' || _colCtxTable === 'wf')
    ? `<button class="col-ctx-item" onclick="colCtxFilterBy()"><span class="material-symbols-outlined">filter_alt</span>Filter by this field</button>`
    : '';
  const groupByBtn = _colCtxTable !== 'af'
    ? `<button class="col-ctx-item" onclick="colCtxGroupBy()"><span class="material-symbols-outlined">view_agenda</span>Group by this field</button>`
    : '';

  menu.innerHTML = `
    ${filterByBtn}
    <button class="col-ctx-item" onclick="colCtxSort('desc')"><span class="material-symbols-outlined">arrow_downward</span>Sort descending</button>
    <button class="col-ctx-item" onclick="colCtxSort('asc')"><span class="material-symbols-outlined">arrow_upward</span>Sort ascending</button>
    ${(filterByBtn || groupByBtn) ? '<div class="col-ctx-divider"></div>' : ''}
    ${groupByBtn}
    <div class="col-ctx-divider"></div>
    ${freezeBtn}
    ${_pinnedCols.has(colKey)
      ? `<button class="col-ctx-item" onclick="colCtxUnpin()"><span class="material-symbols-outlined">push_pin</span>Unpin column</button>`
      : `<button class="col-ctx-item" onclick="colCtxPin()"><span class="material-symbols-outlined">push_pin</span>Pin column</button>`
    }
  `;
  menu.classList.remove('hidden');
}

function closeColMenu() {
  document.getElementById('col-ctx-menu').classList.add('hidden');
  colCtxKey = null;
}

function openQuickView(e, rowId) {
  e.stopPropagation();
  const allRows = [...assignedData, ...queueData];
  const row = allRows.find(r => r.id === rowId);
  if (!row) return;
  const pop = document.getElementById('qv-popover');
  const statusCls = statusClass ? statusClass(row.status) : '';
  pop.innerHTML = `
    <div class="qv-header">
      <div>
        <div class="qv-header-id">${row.id}</div>
        <div class="qv-header-name">${row.name}</div>
      </div>
      <button class="qv-close-btn" onclick="closeQuickView()"><span class="material-symbols-outlined">close</span></button>
    </div>
    <div class="qv-section">
      <div class="qv-field">
        <span class="qv-label">Status</span>
        <span class="qv-value"><span class="status-badge ${statusCls}">${row.status || '—'}</span></span>
      </div>
      <div class="qv-field">
        <span class="qv-label">Stage</span>
        <span class="qv-value">${row.stage || '—'}</span>
      </div>
      <div class="qv-field">
        <span class="qv-label">Tier</span>
        <span class="qv-value">${row.tier || '—'}</span>
      </div>
      <div class="qv-field">
        <span class="qv-label">Client</span>
        <span class="qv-value">${row.client || '—'}</span>
      </div>
      <div class="qv-field">
        <span class="qv-label">Created</span>
        <span class="qv-value">${row.created || '—'}</span>
      </div>
      <div class="qv-field">
        <span class="qv-label">Due Date</span>
        <span class="qv-value">${row.due || '—'}</span>
      </div>
      <div class="qv-field qv-field-full">
        <span class="qv-label">Assignees</span>
        <span class="qv-value">${row.assignees.join(', ')}${row.overflow ? ' ' + row.overflow : ''}</span>
      </div>
    </div>
    <div class="qv-counts">
      <div class="qv-count-chip">
        <span class="material-symbols-outlined">chat</span>
        <span class="qv-count-num">${CONVERSATIONS.length}</span>
        <span class="qv-count-label">Messages</span>
      </div>
      <div class="qv-count-chip">
        <span class="material-symbols-outlined">attach_file</span>
        <span class="qv-count-num">${ATTACH_ITEMS.length}</span>
        <span class="qv-count-label">Files</span>
      </div>
      <div class="qv-count-chip">
        <span class="material-symbols-outlined">history</span>
        <span class="qv-count-num">7</span>
        <span class="qv-count-label">Activity</span>
      </div>
    </div>`;
  // Position below the button, anchored right
  const rect = e.currentTarget.getBoundingClientRect();
  const popW = 300;
  let left = rect.right - popW;
  let top  = rect.bottom + 6;
  if (left < 8) left = 8;
  if (top + 320 > window.innerHeight) top = rect.top - 320 - 6;
  pop.style.left = left + 'px';
  pop.style.top  = top  + 'px';
  pop.classList.remove('hidden');
}

function closeQuickView() {
  document.getElementById('qv-popover').classList.add('hidden');
}

function colCtxFilterBy() {
  const key = colCtxKey; closeColMenu();
  if (_colCtxTable === 'wf') {
    if (!wfFilterFields.find(f => f.field === key)) {
      wfFilterFields.push({ field: key, value: '' });
    }
    setTimeout(() => { wfActiveFilterPopover = key; wfRenderActiveBar(); }, 0);
    wfRenderFilterPanel(); wfRenderActiveBar();
    if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
  } else {
    if (!filterFields.find(f => f.field === key)) {
      filterFields.push({ field: key, value: '' });
    }
    setTimeout(() => { activeFilterPopover = key; renderActiveBar(); }, 0);
    renderFilterPanel(); renderActiveBar(); applyAndRender();
  }
}

function colCtxSort(dir) {
  const key = colCtxKey; closeColMenu();
  if (_colCtxTable === 'wf') {
    const wfa = _wfActiveCols();
    const idx = wfa.sortRules.findIndex(r => r.field === key);
    if (idx >= 0) wfa.sortRules[idx].dir = dir; else wfa.sortRules.push({ field: key, dir });
    renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable();
  } else if (_colCtxTable === 'af') {
    const idx = afSortRules.findIndex(r => r.field === key);
    if (idx >= 0) afSortRules[idx].dir = dir; else afSortRules.push({ field: key, dir });
    afRenderActiveBar(); renderAgentFleetTable();
  } else {
    const idx = sortRules.findIndex(r => r.field === key);
    if (idx >= 0) sortRules[idx].dir = dir; else sortRules.push({ field: key, dir });
    renderActiveBar(); applyAndRender();
  }
}

function colCtxGroupBy() {
  const key = colCtxKey; closeColMenu();
  if (_colCtxTable === 'wf') {
    wfGroupField = wfGroupField === key ? null : key;
    if (wfTableMode) renderWorkFeedTable();
  } else {
    setGroupField(key);
  }
}

function colCtxFreeze() {
  const key = colCtxKey; closeColMenu();
  if (_colCtxTable === 'wf') {
    wfCaseFrozenCol = key;
    applyWfFreezeStyles();
  } else if (_colCtxTable === 'af') {
    afFrozenCol = key; applyAfFreezeStyles();
  } else {
    frozenCol = key; applyFreezeStyles();
  }
}
function colCtxUnfreeze() {
  closeColMenu();
  if (_colCtxTable === 'wf') {
    wfCaseFrozenCol = null;
    applyWfFreezeStyles();
  } else if (_colCtxTable === 'af') {
    afFrozenCol = null; applyAfFreezeStyles();
  } else {
    frozenCol = null; applyFreezeStyles();
  }
}
// ── Column resize ──
function applyColWidths() {
  const table = document.getElementById('table-body').closest('table');
  Object.entries(colWidths).forEach(([key, width]) => {
    const th = table.querySelector(`thead th[data-col="${key}"]`);
    if (th) th.style.width = width + 'px';
  });
}

let _resizeState = null;

function startColResize(e, key) {
  e.stopPropagation();
  e.preventDefault();
  const th = e.currentTarget.closest('th');
  _resizeState = { key, startX: e.clientX, startWidth: th.offsetWidth };
  e.currentTarget.classList.add('resizing');
  document.body.classList.add('col-resizing');
  const table = document.getElementById('table-body').closest('table');
  const tableRect = table ? table.getBoundingClientRect() : { top: 0, height: window.innerHeight };
  const line = document.getElementById('col-resize-line');
  line.style.top    = tableRect.top + 'px';
  line.style.height = tableRect.height + 'px';
  line.style.left   = e.clientX + 'px'; // set initial position immediately
  line.classList.add('visible');
  document.addEventListener('mousemove', _onColResize);
  document.addEventListener('mouseup', _endColResize);
}

function _onColResize(e) {
  if (!_resizeState) return;
  const newWidth = Math.max(50, _resizeState.startWidth + (e.clientX - _resizeState.startX));
  colWidths[_resizeState.key] = newWidth;
  applyColWidths();
  // Track mouse position directly — avoids jumps caused by post-reflow getBoundingClientRect
  document.getElementById('col-resize-line').style.left = e.clientX + 'px';
}

function _endColResize() {
  document.removeEventListener('mousemove', _onColResize);
  document.removeEventListener('mouseup', _endColResize);
  document.body.classList.remove('col-resizing');
  document.getElementById('col-resize-line').classList.remove('visible');
  const table = document.getElementById('table-body').closest('table');
  table.querySelectorAll('.col-resize-handle.resizing').forEach(h => h.classList.remove('resizing'));
  if (_resizeState && frozenCol) applyFreezeStyles();
  _resizeState = null;
}

function colCtxPin() {
  const key = colCtxKey; closeColMenu();
  if (_colCtxTable === 'wf') {
    const { pinnedCols: pc, order } = _wfActiveCols();
    if (pc.has(key)) return;
    pc.add(key);
    const idx = order.findIndex(c => c.key === key);
    const [col] = order.splice(idx, 1);
    order.splice(pc.size - 1, 0, col);
    renderWfColumnsPanel(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable();
  } else if (_colCtxTable === 'af') {
    if (afPinnedCols.has(key)) return;
    afPinnedCols.add(key);
    const idx = afColOrder.findIndex(c => c.key === key);
    const [col] = afColOrder.splice(idx, 1);
    afColOrder.splice(afPinnedCols.size - 1, 0, col);
    renderAfColumnsPanel(); renderAgentFleetTable();
  } else {
    if (pinnedCols.has(key)) return;
    pinnedCols.add(key);
    const idx = colOrder.findIndex(c => c.key === key);
    const [col] = colOrder.splice(idx, 1);
    colOrder.splice(pinnedCols.size - 1, 0, col);
    renderColumnsPanel(); applyAndRender();
  }
}
function colCtxUnpin() {
  const key = colCtxKey; closeColMenu();
  if (_colCtxTable === 'wf') {
    const { pinnedCols: pc, order, defs } = _wfActiveCols();
    pc.delete(key);
    const curIdx = order.findIndex(c => c.key === key);
    const [col] = order.splice(curIdx, 1);
    const origIdx = defs.findIndex(c => c.key === key);
    let insertAt = 0;
    for (let i = 0; i < order.length; i++) {
      if (defs.findIndex(c => c.key === order[i].key) < origIdx) insertAt = i + 1;
    }
    order.splice(insertAt, 0, col);
    renderWfColumnsPanel(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable();
  } else if (_colCtxTable === 'af') {
    afPinnedCols.delete(key);
    const curIdx = afColOrder.findIndex(c => c.key === key);
    const [col] = afColOrder.splice(curIdx, 1);
    const origIdx = AF_COLS.findIndex(c => c.key === key);
    let insertAt = 0;
    for (let i = 0; i < afColOrder.length; i++) {
      if (AF_COLS.findIndex(c => c.key === afColOrder[i].key) < origIdx) insertAt = i + 1;
    }
    afColOrder.splice(insertAt, 0, col);
    renderAfColumnsPanel(); renderAgentFleetTable();
  } else {
    pinnedCols.delete(key);
    const curIdx = colOrder.findIndex(c => c.key === key);
    const [col] = colOrder.splice(curIdx, 1);
    const origIdx = COLS.findIndex(c => c.key === key);
    let insertAt = 0;
    for (let i = 0; i < colOrder.length; i++) {
      if (COLS.findIndex(c => c.key === colOrder[i].key) < origIdx) insertAt = i + 1;
    }
    colOrder.splice(insertAt, 0, col);
    renderColumnsPanel(); applyAndRender();
  }
}

function applyFreezeStyles() {
  const table = document.getElementById('table-body').closest('table');
  // Clear all existing freeze classes
  table.querySelectorAll('.col-frozen, .col-freeze-border').forEach(el => {
    el.classList.remove('col-frozen', 'col-freeze-border');
    el.style.removeProperty('--sticky-left');
  });
  if (!frozenCol) return;

  const visibleCols = colOrder.filter(c => !hiddenCols.has(c.key));
  const frozenIdx = visibleCols.findIndex(c => c.key === frozenCol);
  if (frozenIdx === -1) return; // frozen col is currently hidden, skip

  // Read actual rendered widths from thead cells to compute sticky left offsets
  const theadTr = table.querySelector('thead tr') || table.querySelector('tbody tr.group-sub-header');
  if (!theadTr) return;
  const headerCells = Array.from(theadTr.children);

  // lefts[0] = 0 (checkbox), lefts[1..frozenIdx+1] = cumulative widths
  const lefts = [0];
  let cumul = headerCells[0]?.offsetWidth || 36;
  for (let i = 0; i <= frozenIdx; i++) {
    lefts.push(cumul);
    cumul += (headerCells[i + 1]?.offsetWidth || 0);
  }

  // Apply sticky to all table rows
  const allRows = [
    table.querySelector('thead tr'),
    ...table.querySelectorAll('tbody tr')
  ].filter(Boolean);

  allRows.forEach(row => {
    // Skip group-header-row (colspan row — no individual cells to freeze)
    if (row.classList.contains('group-header-row')) return;

    const cells = Array.from(row.children);

    // Freeze checkbox column
    if (cells[0]) {
      cells[0].classList.add('col-frozen');
      cells[0].style.setProperty('--sticky-left', '0px');
    }

    // Freeze data columns up to and including frozenIdx
    for (let i = 0; i <= frozenIdx; i++) {
      const cell = cells[i + 1];
      if (!cell) continue;
      cell.classList.add('col-frozen');
      cell.style.setProperty('--sticky-left', lefts[i + 1] + 'px');
    }

    // Shadow/border on the last frozen data cell
    const lastFrozenCell = cells[frozenIdx + 1];
    if (lastFrozenCell) lastFrozenCell.classList.add('col-freeze-border');
  });
}

// ── WF freeze styles ─────────────────────────────────────────────────────────
function applyWfFreezeStyles() {
  const thead = document.getElementById('wf-tbl-thead');
  const tbody = document.getElementById('wf-tbl-tbody');
  if (!thead || !tbody) return;
  [thead, tbody].forEach(el => el.querySelectorAll('.col-frozen, .col-freeze-border').forEach(c => {
    c.classList.remove('col-frozen', 'col-freeze-border');
    c.style.removeProperty('--sticky-left');
  }));
  const { order, hidden, frozenCol: fc } = _wfActiveCols();
  if (!fc) return;
  const visCols   = order.filter(c => !hidden.has(c.key));
  const frozenIdx = visCols.findIndex(c => c.key === fc);
  if (frozenIdx === -1) return;
  const headerCells = Array.from(thead.querySelector('tr')?.children || []);
  let cumul = 0;
  const lefts = [];
  for (let i = 0; i <= frozenIdx; i++) { lefts[i] = cumul; cumul += (headerCells[i]?.offsetWidth || 0); }
  [thead.querySelector('tr'), ...tbody.querySelectorAll('tr')].filter(Boolean).forEach(row => {
    if (row.classList.contains('group-header-row')) return;
    const cells = Array.from(row.children);
    for (let i = 0; i <= frozenIdx; i++) {
      if (!cells[i]) continue;
      cells[i].classList.add('col-frozen');
      cells[i].style.setProperty('--sticky-left', lefts[i] + 'px');
    }
    if (cells[frozenIdx]) cells[frozenIdx].classList.add('col-freeze-border');
  });
}

// ── AF freeze styles ─────────────────────────────────────────────────────────
function applyAfFreezeStyles() {
  const wrap = document.getElementById('af-table-wrap');
  if (!wrap) return;
  wrap.querySelectorAll('.col-frozen, .col-freeze-border').forEach(c => {
    c.classList.remove('col-frozen', 'col-freeze-border');
    c.style.removeProperty('--sticky-left');
  });
  if (!afFrozenCol) return;
  const visCols   = afColOrder.filter(c => !afHiddenCols.has(c.key));
  const frozenIdx = visCols.findIndex(c => c.key === afFrozenCol);
  if (frozenIdx === -1) return;
  const table = wrap.querySelector('table');
  if (!table) return;
  const headerCells = Array.from(table.querySelector('thead tr')?.children || []);
  let cumul = 0;
  const lefts = [];
  for (let i = 0; i <= frozenIdx; i++) { lefts[i] = cumul; cumul += (headerCells[i]?.offsetWidth || 0); }
  [table.querySelector('thead tr'), ...table.querySelectorAll('tbody tr')].filter(Boolean).forEach(row => {
    const cells = Array.from(row.children);
    for (let i = 0; i <= frozenIdx; i++) {
      if (!cells[i]) continue;
      cells[i].classList.add('col-frozen');
      cells[i].style.setProperty('--sticky-left', lefts[i] + 'px');
    }
    if (cells[frozenIdx]) cells[frozenIdx].classList.add('col-freeze-border');
  });
}

// Close col menu, view picker, and view context menu on outside click
document.addEventListener('click', (e) => {
  closeColMenu();
  if (!e.target.closest('.view-btn-wrap')) {
    closeViewPicker();
    closeViewContextMenu();
    document.getElementById('wf-view-picker')?.classList.add('hidden');
  }
});

// Snapshot #case-page original structure before any agent view can overwrite it
_casepageTemplate = document.getElementById('case-page').innerHTML;

// Initial render
applyAndRender();
renderTopbarTabs();
renderSolutionHeader();
_updateSolutionAvatar();
_syncSolutionNav();
selectView('default'); // initialise view state + render btn
_renderAiDrawerContext(); // init pills in generic mode
_renderAiFooter();        // init footer with default input

// Default to Work Feed on load
(function() {
  const pc = document.getElementById('portal-content');
  const wfPage = document.getElementById('workfeed-page');
  if (pc) pc.classList.add('hidden');
  if (wfPage) { wfPage.style.display = 'flex'; renderWorkFeedPage(); }
  _syncNavActive();
  _updatePageTitle();
  renderTopbarTabs();
})();

// Cmd+K / Ctrl+K → navigate home
document.addEventListener('keydown', e => {
  const isMeta = e.metaKey || e.ctrlKey;
  if (isMeta && e.key === 'k') {
    e.preventDefault();
    selectTab('home');
  }
});

// Cmd+J / Ctrl+J → fetch or return (case page or agent assist solver)
document.addEventListener('keydown', e => {
  const isMeta = e.metaKey || e.ctrlKey;
  if (isMeta && e.key === 'j') {
    e.preventDefault();
    // Work Feed solver
    if (activeSection === 'workfeed' && activeWorkFeedCase) {
      const fetchedBy = _fetchedCases[activeWorkFeedCase];
      if (!fetchedBy) fetchCaseFromList(activeWorkFeedCase);
      else if (fetchedBy === _currentUser) returnCaseFromList(activeWorkFeedCase);
      return;
    }
    // Case page tab
    const caseId = sectionActiveTab[activeSection];
    if (!caseId || caseId === 'home') return;
    const id = String(caseId).replace(/^#\s*/, '');
    const fetchedBy = _fetchedCases[id];
    if (!fetchedBy) fetchCase(caseId);
    else if (fetchedBy === _currentUser) returnCase();
  }
});

// Row checkbox → bulk bar (event delegation)
document.getElementById('table-body').addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    updateBulkBar();
    // sync select-all indeterminate state
    const all  = document.querySelectorAll('#table-body input[type="checkbox"]');
    const chk  = document.querySelectorAll('#table-body input[type="checkbox"]:checked');
    const sa   = document.getElementById('select-all');
    sa.checked = chk.length === all.length && all.length > 0;
    sa.indeterminate = chk.length > 0 && chk.length < all.length;
  }
});

