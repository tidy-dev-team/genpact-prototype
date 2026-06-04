// ── WF cell content helpers ──────────────────────────────────────────────────
function _renderWfCaseCellContent(c, key) {
  const pClass = (c.priority || 'Low').toLowerCase();
  const isTask = c.type === 'task';
  switch (key) {
    case 'type': {
      const cfg = {
        case:     { icon: 'inventory_2',  label: 'Case task',  cls: 'wf-type-case'     },
        task:     { icon: 'task_alt',     label: 'Agent task', cls: 'wf-type-task'     },
        approval: { icon: 'approval',     label: 'Approval', cls: 'wf-type-approval' },
        review:   { icon: 'rate_review',  label: 'Review',   cls: 'wf-type-review'   },
      }[c.type] || { icon: 'circle',      label: c.type || '—', cls: '' };
      return `<span class="wf-type-pill ${cfg.cls}"><span class="material-symbols-outlined">${cfg.icon}</span>${cfg.label}</span>`;
    }
    case 'id':
      return isTask
        ? `<div class="wf-tbl-case"><span class="material-symbols-outlined">task_alt</span><span class="wf-tbl-case-id">${c.id}</span></div>`
        : `<div class="wf-tbl-case"><span class="material-symbols-outlined">inventory_2</span><span class="wf-tbl-case-id">${c.id}</span></div>`;
    case 'status':
      return isTask
        ? `<span class="wf-tbl-status wf-tbl-status--${c.status}">${c.status}</span>`
        : _wfTableStatusHtml(c.id);
    case 'assists':
      if (isTask) {
        // For tasks: show the "need" pill in place of assists
        return c.need
          ? `<div class="wf-tbl-assists"><span class="wf-tbl-assist-pill"><span class="material-symbols-outlined" style="font-size:11px">${c.needIcon || 'task_alt'}</span>${c.need}</span></div>`
          : '';
      } else {
        const html = (c.assists || []).map(a =>
          `<span class="wf-tbl-assist-pill">${a.label}${(a.count || 0) > 1 ? ' ' + a.count : ''}</span>`
        ).join('');
        return `<div class="wf-tbl-assists">${html}</div>`;
      }
    case 'priority':
      return `<div class="wf-tbl-priority"><div class="wf-tbl-priority-dot ${pClass}"></div>${c.priority || 'Low'}</div>`;
    case 'stage':
      if (isTask) {
        // For tasks: show agent name + summary
        return `<div class="wf-tbl-stage"><div class="wf-tbl-stage-top"><span class="material-symbols-outlined wf-tbl-stage-icon">${c.agentIcon || 'smart_toy'}</span><span class="wf-tbl-stage-name">${c.agent || ''}</span></div><div class="wf-tbl-stage-desc">${c.summary || ''}</div></div>`;
      }
      return `<div class="wf-tbl-stage"><div class="wf-tbl-stage-top"><span class="material-symbols-outlined wf-tbl-stage-icon">auto_awesome_mosaic</span><span class="wf-tbl-stage-steps">${c.stageSteps || ''}</span><span class="wf-tbl-stage-name">${c.stage}</span></div><div class="wf-tbl-stage-desc">${c.stageDesc || ''}</div></div>`;
    case 'team':
      return c.team ? `<span class="wf-team-pill">${c.team}</span>` : '<span class="wf-muted">—</span>';
    case 'assignTo':
      return c.assignTo
        ? `<span class="wf-user-cell">${_activeUserAvatarHtml(c.assignTo, 'sm')}<span>${c.assignTo.split(' ')[0]}</span></span>`
        : '<span class="wf-muted">Unassigned</span>';
    case 'fetchedBy': {
      const fb = _fetchedCases[c.id];
      return fb
        ? `<span class="wf-user-cell">${_activeUserAvatarHtml(fb, 'sm')}<span>${fb === _currentUser ? 'You' : fb.split(' ')[0]}</span></span>`
        : '<span class="wf-muted">—</span>';
    }
    default: return '';
  }
}
function _renderWfTaskCellContent(c, key) {
  const pClass = (c.priority || 'Low').toLowerCase();
  switch (key) {
    case 'agent':
      return `<div class="wf-tbl-agent-cell"><div class="wf-tbl-agent-icon"><span class="material-symbols-outlined">${c.agentIcon}</span></div><span class="wf-tbl-agent-name">${c.agent}</span></div>`;
    case 'status':
      return `<span class="wf-tbl-status wf-tbl-status--${c.status}">${c.status}</span>`;
    case 'need':
      return `<span class="wf-tbl-need-pill"><span class="material-symbols-outlined">${c.needIcon}</span>${c.need}</span>`;
    case 'priority':
      return `<div class="wf-tbl-priority"><div class="wf-tbl-priority-dot ${pClass}"></div>${c.priority || 'Low'}</div>`;
    case 'summary':
      return `<div class="wf-tbl-task-summary">${c.summary}</div>`;
    default: return '';
  }
}

function renderWorkFeedTiles() {
  const grid = document.getElementById('wf-tile-grid');
  if (!grid) return;
  let data = (typeof _wfFilteredData === 'function') ? [..._wfFilteredData()] : [...workFeedData];

  const _statusIcon = { intervention: 'warning', running: 'autorenew', awaiting: 'hourglass_empty', complete: 'check_circle', failed: 'cancel', pending: 'schedule' };
  const _pClass = p => p === 'High' ? 'high' : p === 'Medium' ? 'medium' : 'low';

  grid.innerHTML = data.map(c => {
    const isTask   = c.type === 'task';
    const statusCls = (c.status || 'pending').toLowerCase().replace(/\s+/g,'');
    const icon = _statusIcon[statusCls] || 'circle';
    const assists = isTask
      ? `<span class="wf-tile-assist-pill"><span class="material-symbols-outlined">${c.needIcon||'help'}</span>${c.need||''}</span>`
      : (c.assists||[]).map(a => `<span class="wf-tile-assist-pill">${a.label}${a.count>1?` ×${a.count}`:''}</span>`).join('');
    const stageOrNeed = isTask ? (c.agent||'Agent') : (c.stage||'');
    const titleLine   = isTask ? (c.summary||c.id) : (c.customer||c.id);
    const idLine      = isTask ? c.id : c.id;
    const pDot = `<div class="wf-tile-priority-dot ${_pClass(c.priority)}"></div>`;
    const assignee = c.assignTo ? `<span class="wf-tile-assignee">${c.assignTo}</span>` : '';
    return `
    <div class="wf-tile" onclick="${isTask ? `selectWorkFeedCase('${c.id}')` : `openWfCaseTab('${c.id}')`}">
      <div class="wf-tile-top">
        <div class="wf-tile-top-left">
          <span class="wf-tile-id">${idLine}</span>
          <span class="wf-tile-customer">${titleLine}</span>
        </div>
        <span class="wf-tile-status-badge ${statusCls}">
          <span class="material-symbols-outlined">${icon}</span>${c.status||'pending'}
        </span>
      </div>
      <div class="wf-tile-stage">${stageOrNeed}</div>
      ${assists ? `<div class="wf-tile-assists">${assists}</div>` : ''}
      <div class="wf-tile-divider"></div>
      <div class="wf-tile-footer">
        <div class="wf-tile-meta">
          <div class="wf-tile-priority">${pDot}${c.priority||'Low'}</div>
          ${assignee}
        </div>
        <button class="wf-tile-ctx-btn" title="Row actions"
          onclick="event.stopPropagation();_wfRowCtxOpen(event,'${c.id}')">
          <span class="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

function renderWorkFeedTable() {
  const tbody = document.getElementById('wf-tbl-tbody');
  if (!tbody) return;
  let data = (typeof _wfFilteredData === 'function') ? [..._wfFilteredData()] : [...workFeedData];
  const { order, hidden, sortRules } = _wfActiveCols();
  const visibleCols = order.filter(c => !hidden.has(c.key));

  // Apply sort
  if (sortRules && sortRules.length) {
    data.sort((a, b) => {
      for (const r of sortRules) {
        if (!r.field) continue;
        const av = a[r.field] != null ? String(a[r.field]) : '';
        const bv = b[r.field] != null ? String(b[r.field]) : '';
        const n  = av.localeCompare(bv, undefined, { numeric: true });
        if (n !== 0) return r.dir === 'asc' ? n : -n;
      }
      return 0;
    });
  }

  function _rowHtml(c) {
    const isTask = c.type === 'task';
    const _editCols = new Set(['team','assignTo']);
    const cells = visibleCols.map(col => {
      const extra = _editCols.has(col.key)
        ? ` onclick="event.stopPropagation();_openWfCellDrop(this,'${c.id}','${col.key}')"`
        : '';
      return `<td data-col="${col.key}"${extra}>${_renderWfCaseCellContent(c, col.key)}</td>`;
    }).join('');
    const _fetchedBy = _fetchedCases[c.id];
    const _fetchedByMe = _fetchedBy === _currentUser;
    const _fetchedByOthers = _fetchedBy && !_fetchedByMe;
    // Fetched by me or unfetched → open full form in tab (unfetched shows Fetch button in header)
    // Fetched by others → default solver behaviour (read-only access via row action)
    const _rowClick = !_fetchedByOthers ? `openWfCaseTab('${c.id}')` : `selectWorkFeedCase('${c.id}')`;
    return `<tr data-case="${c.id}" onclick="${_rowClick}">
      <td style="width:36px;padding:0 8px;text-align:center" onclick="event.stopPropagation()">
        <input type="checkbox" class="wf-row-cb" value="${c.id}" onchange="wfUpdateBulkBar()">
      </td>
      <td class="col-row-ctx" onclick="event.stopPropagation()"><button class="row-ctx-btn" title="Row actions" onclick="_wfRowCtxOpen(event,'${c.id}')"><span class="material-symbols-outlined">more_vert</span></button></td>
      ${cells}
    </tr>`;
  }

  // Pagination — clamp page, render bar, slice data
  const _wfTotal = data.length;
  const _wfMaxPage = Math.max(1, Math.ceil(_wfTotal / _wfItemsPerPage));
  if (_wfCurrentPage > _wfMaxPage) _wfCurrentPage = _wfMaxPage;
  _wfRenderPagination(_wfTotal);
  data = data.slice((_wfCurrentPage - 1) * _wfItemsPerPage, _wfCurrentPage * _wfItemsPerPage);

  // Apply group-by
  if (wfGroupField) {
    const groups = new Map();
    data.forEach(c => {
      const key = c[wfGroupField] != null ? String(c[wfGroupField]) : '—';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c);
    });
    const colSpan = visibleCols.length + 2; // +1 actions, +1 checkbox
    tbody.innerHTML = [...groups.entries()].map(([groupVal, rows]) =>
      `<tr class="group-header-row"><td colspan="${colSpan}" class="group-header-cell">
        <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle;margin-right:4px">label</span>${groupVal}
        <span class="group-count" style="color:var(--text-muted);font-size:11px;margin-left:6px">${rows.length}</span>
       </td></tr>` + rows.map(_rowHtml).join('')
    ).join('');
  } else {
    tbody.innerHTML = data.map(_rowHtml).join('');
  }

  if (typeof applyWfFreezeStyles === 'function') applyWfFreezeStyles();
  // Reset bulk bar after re-render (rows rebuilt, all unchecked)
  const wfBulkBarEl = document.getElementById('wf-bulk-bar');
  if (wfBulkBarEl) wfBulkBarEl.classList.remove('visible');
  const wfSa = document.getElementById('wf-select-all');
  if (wfSa) { wfSa.checked = false; wfSa.indeterminate = false; }
}

function _wfAskCaseyToSolve(caseId) {
  // Stay in table mode — Casey handles it in the background
  _updateWfTableStatus(caseId, 'agent-taking-care');
  // After ~4 s simulate Casey completing all assists
  setTimeout(() => {
    _updateWfTableStatus(caseId, 'complete');
  }, 4000);
}

function openWfQuickActions(caseId) {
  const tasks   = _activeWfTasksObj()[caseId];
  const header  = document.getElementById('wf-quick-modal-header');
  const body    = document.getElementById('wf-quick-modal-body');
  const overlay = document.getElementById('wf-quick-modal');
  if (!overlay || !header || !body) return;

  const caseEntry = _activeWfCases().find(d => d.id === caseId) || {};

  header.innerHTML = `
    <span class="wf-pdf-modal-title" style="display:flex;align-items:center;gap:6px">
      <span class="material-symbols-outlined" style="font-size:14px">inventory_2</span>${caseId}
      <span style="font-size:11px;font-weight:400;color:var(--text-muted)">&nbsp;·&nbsp;${caseEntry.stage || ''}</span>
    </span>
    <button class="wf-pdf-close-btn" onclick="closeWfQuickModal()">✕</button>`;

  if (!tasks || tasks.length === 0) {
    body.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px">No pending assists for this case.</div>`;
    overlay.style.display = 'flex';
    return;
  }

  // Pick the first auth task (same as what Assist Mode shows by default)
  const firstTask = tasks.find(t => t.type === 'auth-credential') || tasks[0];
  activeWorkFeedTask[caseId] = firstTask.id;

  // Task tabs (if >1 task)
  const tabsHtml = tasks.length > 1
    ? `<div class="wf-task-tabs" style="padding:0 24px;border-bottom:1px solid var(--border);background:var(--bg-white);flex-shrink:0">
        ${tasks.map(t => `<button class="wf-task-tab${t.id === firstTask.id ? ' active' : ''}"
          onclick="(function(){document.querySelectorAll('#wf-quick-modal .wf-task-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');_wfQuickRenderTask('${caseId}','${t.id}')}).call(this)">
          <span class="material-symbols-outlined wf-task-icon">${t.icon||'task_alt'}</span>${t.label}
          <span class="wf-task-count">${t.count}</span></button>`).join('')}
       </div>`
    : '';

  body.innerHTML = `${tabsHtml}<div id="wf-quick-task-body" style="padding:20px 24px;display:flex;flex-direction:column;gap:16px"></div>`;
  _wfQuickRenderTask(caseId, firstTask.id);
  overlay.style.display = 'flex';
}

function _wfQuickRenderTask(caseId, taskId) {
  const tasks  = _activeWfTasksObj()[caseId] || [];
  const task   = tasks.find(t => t.id === taskId);
  const target = document.getElementById('wf-quick-task-body');
  if (!task || !target) return;
  activeWorkFeedTask[caseId] = taskId;
  const _qOv = (heading, desc) =>
    _wfSec('q-overview', heading, 'Task overview',
      `<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0">${desc}</p>`, true);

  if (task.type === 'auth-credential') {
    const heading = task.heading || 'Intervention Required: Authentication Needed';
    target.innerHTML =
      _qOv(heading, task.desc || '') +
      _wfSec('q-content', 'Credentials', 'Approve or reject each authentication request',
        (task.cards || []).map(c => _wfFormCard({ caseId, taskId: task.id, ...c })).join(''));
  } else if (task.type === 'email-approval') {
    const heading = task.heading || 'Review Required: Outbound Customer Emails';
    target.innerHTML =
      _qOv(heading, task.desc || '') +
      _wfSec('q-content', 'Email Drafts', 'Review and approve each outbound email',
        (task.emails || []).map(e => _wfEmailCard({ caseId, taskId: task.id, ...e })).join(''));
  } else if (task.type === 'comparison') {
    target.innerHTML =
      _qOv('Authorization Required: Invoice Payment',
        'Verify the fields against the invoice document and authorize payment to continue.') +
      _wfSec('q-content', 'Invoice Verification', 'Verify fields and authorize payment',
        _wfComparisonCard({ caseId, taskId: task.id }));
  } else if (task.type === 'eyeball') {
    target.innerHTML =
      _qOv(task.heading, task.desc) +
      _wfSec('q-content', 'Review Items', 'Approve or flag each item',
        _wfEyeballCard(caseId, task));
  } else if (task.type === 'deduction-validation') {
    target.innerHTML =
      _qOv(task.heading, task.desc) +
      _wfSec('q-content', 'Deduction Validation', 'All fields pre-filled by agent — review, adjust if needed, then submit',
        _dedCombinedValidationCard(caseId, task));
    setTimeout(() => _dedApplyInlinePins(`ded-val-tbl-${caseId}`), 0);
  } else if (task.type === 'billback') {
    target.innerHTML =
      _qOv(task.heading, task.desc) +
      _wfSec('q-content', 'Billback Details', 'Review and approve billback items',
        _wfBillbackCard(caseId, task));
  }
}

function closeWfQuickModal() {
  const el = document.getElementById('wf-quick-modal');
  if (el) el.style.display = 'none';
}

// ─── Deductions HITL card renderers ─────────────────────────────────────────

function _wfEyeballCard(caseId, task) {
  return _dedEyeballFormCard(caseId, task);
}

// ── PO table row helpers ──────────────────────────────────────────────────────
function _eybAddPoRow(tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="eyb-po-input" type="text" placeholder="INV-"></td>
    <td><input class="eyb-po-input" type="text" placeholder="PO-"></td>
    <td><input class="eyb-po-input" type="number" placeholder="0" style="-moz-appearance:textfield"></td>
    <td><input class="eyb-po-input" type="number" placeholder="0" style="-moz-appearance:textfield"></td>
    <td><button class="eyb-po-del" onclick="_eybDelPoRow(this)" title="Remove row">×</button></td>`;
  tbody.appendChild(tr);
}
function _eybDelPoRow(btn) {
  btn.closest('tr')?.remove();
}

// ── Eyeball document overlay helpers (case-page slim view) ───────────────────
function _eybOpenDocOverlay(splitId) {
  const overlay = document.getElementById(splitId + '-overlay');
  if (overlay) overlay.style.display = 'flex';
}
function _eybCloseDocOverlay(splitId) {
  const overlay = document.getElementById(splitId + '-overlay');
  if (overlay) { overlay.style.display = 'none'; _splitDocZoom(splitId, null, false); }
}
function _eybZoomField(splitId, fieldKey) {
  _eybOpenDocOverlay(splitId);
  requestAnimationFrame(() => _splitDocZoom(splitId, fieldKey, true));
}

// Eye-icon hover: wide mode → zoom right panel; slim mode → float popup above icon
function _eybOnEyeEnter(splitId, fieldKey, btn) {
  const docPanel = btn.closest('.eyb-slim-card')?.querySelector('.eyb-doc-panel');
  const isSlim = docPanel && getComputedStyle(docPanel).display === 'none';
  if (isSlim) {
    _eybShowFieldPopup(splitId, fieldKey, btn);
  } else {
    _splitDocZoom(splitId, fieldKey, true);
  }
}
function _eybOnEyeLeave(splitId, fieldKey) {
  _eybHideFieldPopup();
  _splitDocZoom(splitId, fieldKey, false);
}
function _eybShowFieldPopup(splitId, fieldKey, btn) {
  let popup = document.getElementById('eyb-field-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'eyb-field-popup';
    popup.className = 'eyb-field-popup';
    popup.innerHTML = `<div class="eyb-field-popup-inner" id="eyb-field-popup-inner"></div><div class="eyb-field-popup-arrow"></div>`;
    document.body.appendChild(popup);
  }
  const docEl = document.getElementById(splitId + '-doc');
  if (!docEl) return;
  const inner = document.getElementById('eyb-field-popup-inner');
  inner.innerHTML = docEl.innerHTML;
  inner.style.transform = 'scale(0.48)';
  popup.style.visibility = 'hidden';
  popup.style.display = 'block';
  requestAnimationFrame(() => {
    const SCALE = 0.48, POP_W = 230, POP_H = 160;
    const fieldEl = inner.querySelector(`[data-fieldkey="${fieldKey}"]`);
    if (fieldEl) {
      fieldEl.classList.add('ded-doc-val-hl');
      const offset = Math.max(0, fieldEl.offsetTop + fieldEl.offsetHeight / 2 - (POP_H / 2) / SCALE);
      inner.style.transform = `scale(${SCALE}) translateY(-${offset}px)`;
    }
    const rect = btn.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - POP_W / 2;
    let top = rect.top - POP_H - 10;
    left = Math.max(4, Math.min(left, window.innerWidth - POP_W - 4));
    top = Math.max(4, top);
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.style.visibility = '';
  });
}
function _eybHideFieldPopup() {
  const p = document.getElementById('eyb-field-popup');
  if (p) p.style.display = 'none';
}

// ── Eyeball structured form card ──────────────────────────────────────────────
function _dedEyeballFormCard(caseId, task, prefix = 'wf') {
  const docs = task.docs || [];
  return docs.map((doc, docIdx) => {
    const splitId = `ded-eyb-${prefix}-${caseId}-${docIdx}`;   // prefix avoids ID collision between work-feed and case-page
    const poTableId = `eyb-po-${splitId}`;
    const f = doc.form || {};
    const h = f.header || {};
    const rows = f.poRows || [];
    const notations = f.notations || '';
    const hw = f.handWritten || '';

    // ── Sub-section toggle helper (inline) ──────────────────────────────
    const _secId = s => `eyb-body-${splitId}-${s}`;
    const _sec = (key, icon, label, bodyHtml) => `
      <div class="eyb-sec">
        <div class="eyb-sec-hdr" onclick="(function(el){var b=document.getElementById('${_secId(key)}');if(b){var h=b.style.display==='none';b.style.display=h?'':'none';el.querySelector('.material-symbols-outlined.eyb-chev').style.transform=h?'':'rotate(-90deg)';})(this)">
          <span class="material-symbols-outlined" style="font-size:15px;color:var(--text-muted)">${icon}</span>
          ${label}
          <span class="material-symbols-outlined eyb-chev" style="margin-left:auto;font-size:14px;color:var(--text-muted);transition:transform .15s">expand_more</span>
        </div>
        <div id="${_secId(key)}" class="eyb-sec-body">${bodyHtml}</div>
      </div>`;

    // Zoom shorthand
    const _z = key => `onfocus="_splitDocZoom('${splitId}','${key}',true)" onblur="_splitDocZoom('${splitId}','${key}',false)"`;

    // ── Header section ────────────────────────────────────────────────────
    const headerHtml = `
      <div class="eyb-field-grid">
        <div class="eyb-field">
          <label class="eyb-label">Document Provider</label>
          <input class="eyb-input" type="text" value="${h.documentProvider || ''}" ${_z('document-provider')}>
        </div>
        <div class="eyb-field">
          <label class="eyb-label">BOL #</label>
          <input class="eyb-input" type="number" value="${h.bol || ''}" ${_z('bol')}>
        </div>
        <div class="eyb-field">
          <label class="eyb-label">Appt Number</label>
          <input class="eyb-input" type="number" value="${h.apptNumber || ''}" ${_z('appt-number')}>
        </div>
        <div class="eyb-field">
          <label class="eyb-label">Freight Charge Terms</label>
          <input class="eyb-input" type="text" value="${h.freightChargeTerms || ''}" ${_z('freight-charge-terms')}>
        </div>
        <div class="eyb-span2">
          <div class="eyb-check-row">
            <label class="eyb-check-item"><input type="checkbox" ${h.carrierSign ? 'checked' : ''} onchange="_splitDocZoom('${splitId}','carrier-sign',true);setTimeout(()=>_splitDocZoom('${splitId}','carrier-sign',false),800)"> Carrier Sign</label>
            <label class="eyb-check-item"><input type="checkbox" ${h.customerSign ? 'checked' : ''} onchange="_splitDocZoom('${splitId}','customer-sign',true);setTimeout(()=>_splitDocZoom('${splitId}','customer-sign',false),800)"> Customer Sign</label>
            <label class="eyb-check-item"><input type="checkbox" ${h.subjectToCount ? 'checked' : ''} onchange="_splitDocZoom('${splitId}','subject-to-count',true);setTimeout(()=>_splitDocZoom('${splitId}','subject-to-count',false),800)"> Subject to Count</label>
          </div>
        </div>
        <div class="eyb-field">
          <label class="eyb-label">Carrier Sign Text</label>
          <input class="eyb-input" type="text" value="${h.carrierSignText || ''}" ${_z('carrier-sign-text')}>
        </div>
        <div></div>
        <div class="eyb-field">
          <label class="eyb-label">Total Package Qty</label>
          <input class="eyb-input" type="number" value="${h.totalPackageQty || ''}" ${_z('total-package-qty')}>
        </div>
        <div class="eyb-field">
          <label class="eyb-label">Weight (LB)</label>
          <input class="eyb-input" type="number" value="${h.weight || ''}" ${_z('weight')}>
        </div>
      </div>`;

    // ── PO Details section ────────────────────────────────────────────────
    const poRowsHtml = rows.map(r => `
      <tr>
        <td><input class="eyb-po-input" type="text" value="${r.invoiceNumber || ''}" ${_z('invoice-number')}></td>
        <td><input class="eyb-po-input" type="text" value="${r.orderNumber || ''}" ${_z('order-number')}></td>
        <td><input class="eyb-po-input" type="number" value="${r.packageQty || ''}" style="-moz-appearance:textfield" ${_z('package-qty')}></td>
        <td><input class="eyb-po-input" type="number" value="${r.lbsQty || ''}" style="-moz-appearance:textfield" ${_z('lbs-qty')}></td>
        <td><button class="eyb-po-del" onclick="_eybDelPoRow(this)" title="Remove row">×</button></td>
      </tr>`).join('');
    const poHtml = `
      <div style="overflow:hidden;width:100%;min-width:0">
        <table class="eyb-po-table" id="${poTableId}">
          <thead><tr>
            <th style="width:28%">Invoice #</th><th style="width:36%">Order #</th><th style="width:16%">Pkg Qty</th><th style="width:16%">LBs</th><th style="width:28px"></th>
          </tr></thead>
          <tbody>${poRowsHtml}</tbody>
        </table>
      </div>
      <button class="eyb-add-row-btn" onclick="_eybAddPoRow('${poTableId}')">+ Add row</button>`;

    // ── Notations section ─────────────────────────────────────────────────
    const notId = `eyb-char-${splitId}`;
    const notHtml = `
      <textarea class="eyb-textarea" maxlength="500"
        oninput="document.getElementById('${notId}').textContent=this.value.length"
        onfocus="_splitDocZoom('${splitId}','notations',true)"
        onblur="_splitDocZoom('${splitId}','notations',false)"
      >${notations}</textarea>
      <div class="eyb-char-count"><span id="${notId}">${notations.length}</span> / 500</div>`;

    // ── Hand Written section ──────────────────────────────────────────────
    const hwHtml = `<input class="eyb-input" type="text" value="${hw.replace(/"/g, '&quot;')}" style="width:100%"
      onfocus="_splitDocZoom('${splitId}','hand-written',true)"
      onblur="_splitDocZoom('${splitId}','hand-written',false)">`;

    // ── Case-page card (prefix='cp'): split layout + responsive breakpoint ──
    if (prefix === 'cp') {
      // Eye icon: wide mode → hover zooms right panel; slim mode → hover shows mini popup above icon; click → open overlay
      const _cpEye = key => `<button class="eyb-eye-icon"
        onmouseenter="_eybOnEyeEnter('${splitId}','${key}',this)"
        onmouseleave="_eybOnEyeLeave('${splitId}','${key}')"
        onclick="event.stopPropagation();_eybOpenDocOverlay('${splitId}')"
        title="View in document"><span class="material-symbols-outlined">visibility</span></button>`;

      const _cpField = (label, inputHtml, key) => `
        <div class="eyb-field">
          <label class="eyb-label">${label}</label>
          <div class="eyb-input-wrap">${inputHtml}${_cpEye(key)}</div>
        </div>`;

      const headerHtmlCp = `
        <div class="eyb-field-grid">
          ${_cpField('Document Provider', `<input class="eyb-input" type="text" value="${h.documentProvider || ''}" ${_z('document-provider')}>`, 'document-provider')}
          ${_cpField('BOL #', `<input class="eyb-input" type="number" value="${h.bol || ''}" ${_z('bol')}>`, 'bol')}
          ${_cpField('Appt Number', `<input class="eyb-input" type="number" value="${h.apptNumber || ''}" ${_z('appt-number')}>`, 'appt-number')}
          ${_cpField('Freight Charge Terms', `<input class="eyb-input" type="text" value="${h.freightChargeTerms || ''}" ${_z('freight-charge-terms')}>`, 'freight-charge-terms')}
          <div class="eyb-span2">
            <div class="eyb-check-row">
              <label class="eyb-check-item"><input type="checkbox" ${h.carrierSign ? 'checked' : ''} onchange="_splitDocZoom('${splitId}','carrier-sign',true);setTimeout(()=>_splitDocZoom('${splitId}','carrier-sign',false),800)"> Carrier Sign</label>
              <label class="eyb-check-item"><input type="checkbox" ${h.customerSign ? 'checked' : ''} onchange="_splitDocZoom('${splitId}','customer-sign',true);setTimeout(()=>_splitDocZoom('${splitId}','customer-sign',false),800)"> Customer Sign</label>
              <label class="eyb-check-item"><input type="checkbox" ${h.subjectToCount ? 'checked' : ''} onchange="_splitDocZoom('${splitId}','subject-to-count',true);setTimeout(()=>_splitDocZoom('${splitId}','subject-to-count',false),800)"> Subject to Count</label>
            </div>
          </div>
          ${_cpField('Carrier Sign Text', `<input class="eyb-input" type="text" value="${h.carrierSignText || ''}" ${_z('carrier-sign-text')}>`, 'carrier-sign-text')}
          <div></div>
          ${_cpField('Total Package Qty', `<input class="eyb-input" type="number" value="${h.totalPackageQty || ''}" ${_z('total-package-qty')}>`, 'total-package-qty')}
          ${_cpField('Weight (LB)', `<input class="eyb-input" type="number" value="${h.weight || ''}" ${_z('weight')}>`, 'weight')}
        </div>`;

      const notIdCp = `eyb-char-${splitId}`;
      const notHtmlCp = `
        <div class="eyb-textarea-wrap">
          <textarea class="eyb-textarea" maxlength="500"
            oninput="document.getElementById('${notIdCp}').textContent=this.value.length"
            onfocus="_splitDocZoom('${splitId}','notations',true)"
            onblur="_splitDocZoom('${splitId}','notations',false)"
          >${notations}</textarea>
          ${_cpEye('notations')}
        </div>
        <div class="eyb-char-count"><span id="${notIdCp}">${notations.length}</span> / 500</div>`;

      const hwHtmlCp = `
        <div class="eyb-input-wrap">
          <input class="eyb-input" type="text" value="${hw.replace(/"/g, '&quot;')}" style="width:100%"
            onfocus="_splitDocZoom('${splitId}','hand-written',true)"
            onblur="_splitDocZoom('${splitId}','hand-written',false)">
          ${_cpEye('hand-written')}
        </div>`;

      return `
        <div class="wf-form-card eyb-slim-card" style="overflow:hidden">
          <div class="wf-form-card-header" style="align-items:center">
            <span class="material-symbols-outlined" style="font-size:20px;color:var(--text-secondary);flex-shrink:0">description</span>
            <div style="flex:1;min-width:0">
              <div class="wf-form-card-vendor">${doc.docLabel}</div>
              <div class="wf-form-card-task-type">${doc.docType} — eyeball review</div>
            </div>
            <button class="eyb-doc-view-btn" onclick="_eybOpenDocOverlay('${splitId}')">
              <span class="material-symbols-outlined">picture_as_pdf</span> View document
            </button>
          </div>
          <div class="ded-eyeball-split">
            <div class="ded-eyeball-left" style="padding:0;overflow-y:auto;overflow-x:hidden">
              ${_sec('hdr', 'receipt_long', 'Header', headerHtmlCp)}
              ${_sec('po',  'table_rows',   'PO Details', poHtml)}
              ${_sec('not', 'notes',        'Notations', notHtmlCp)}
              ${_sec('hw',  'edit',         'Hand Written', hwHtmlCp)}
            </div>
            <div class="eyb-doc-panel" style="display:flex;flex-direction:column;background:#525659;overflow:hidden">
              <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:#3c3f41;flex-shrink:0">
                <span class="material-symbols-outlined" style="font-size:13px;color:#aaa">picture_as_pdf</span>
                <span style="font-size:11px;color:#ccc;font-weight:500">${doc.docLabel}</span>
                <span style="font-size:10px;color:#888;margin-left:2px">· ${doc.docType}</span>
              </div>
              <div class="ded-eyeball-right" id="${splitId}-doc">
                ${_dedRenderDoc(doc, splitId)}
              </div>
            </div>
          </div>
          <div class="wf-form-card-footer">
            <button class="wf-reject-btn">Reject</button>
            <button class="wf-approve-btn" onclick="approveWfCard(this,'${caseId}','eyeball','confirm-${docIdx}','eyeball')">
              <span class="material-symbols-outlined" style="font-size:14px">check</span> Confirm
            </button>
          </div>
        </div>
        <div id="${splitId}-overlay" class="eyb-doc-overlay" style="display:none"
             onclick="if(event.target===this)_eybCloseDocOverlay('${splitId}')">
          <div class="eyb-doc-overlay-box">
            <div class="eyb-doc-overlay-hdr">
              <span class="material-symbols-outlined" style="font-size:14px;color:#aaa">picture_as_pdf</span>
              <span style="font-size:12px;color:#ccc;font-weight:500">${doc.docLabel}</span>
              <span style="font-size:11px;color:#888;margin-left:2px">· ${doc.docType}</span>
              <button class="eyb-doc-overlay-close" onclick="_eybCloseDocOverlay('${splitId}')">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="eyb-doc-overlay-body">
              ${_dedRenderDoc(doc, splitId + '-ov')}
            </div>
          </div>
        </div>`;
    }

    // ── Work-feed split layout (prefix='wf', unchanged) ───────────────────
    return `
      <div class="wf-form-card" style="overflow:hidden">
        <div class="wf-form-card-header" style="align-items:center">
          <span class="material-symbols-outlined" style="font-size:20px;color:var(--text-secondary);flex-shrink:0">description</span>
          <div style="flex:1;min-width:0">
            <div class="wf-form-card-vendor">${doc.docLabel}</div>
            <div class="wf-form-card-task-type">${doc.docType} — eyeball review</div>
          </div>
        </div>
        <div class="ded-eyeball-split">
          <div class="ded-eyeball-left" style="padding:0;overflow-y:auto;overflow-x:hidden">
            ${_sec('hdr', 'receipt_long', 'Header', headerHtml)}
            ${_sec('po',  'table_rows',   'PO Details', poHtml)}
            ${_sec('not', 'notes',        'Notations', notHtml)}
            ${_sec('hw',  'edit',         'Hand Written', hwHtml)}
          </div>
          <div style="display:flex;flex-direction:column;background:#525659;overflow:hidden">
            <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:#3c3f41;flex-shrink:0">
              <span class="material-symbols-outlined" style="font-size:13px;color:#aaa">picture_as_pdf</span>
              <span style="font-size:11px;color:#ccc;font-weight:500">${doc.docLabel}</span>
              <span style="font-size:10px;color:#888;margin-left:2px">· ${doc.docType}</span>
            </div>
            <div class="ded-eyeball-right" id="${splitId}-doc">
              ${_dedRenderDoc(doc, splitId)}
            </div>
          </div>
        </div>
        <div class="wf-form-card-footer">
          <button class="wf-reject-btn">Reject</button>
          <button class="wf-approve-btn" onclick="approveWfCard(this,'${caseId}','eyeball','confirm-${docIdx}','eyeball')">
            <span class="material-symbols-outlined" style="font-size:14px">check</span> Confirm
          </button>
        </div>
      </div>`;
  }).join('');
}

// ── Highlight a field in the right-panel invoice when eye-btn is hovered ──────
// Shared split-view zoom: highlight + zoom-into the matching ded-doc-val element
function _splitDocZoom(splitId, fieldKey, active) {
  const panel = document.getElementById(splitId + '-doc');
  if (!panel) return;
  panel.querySelectorAll('.ded-doc-val').forEach(el => el.classList.remove('ded-doc-val-hl'));
  const doc = panel.querySelector('.wf-invoice-doc');
  if (!active || !fieldKey) {
    if (doc) { doc.style.transition = 'transform 0.22s ease'; doc.style.transform = 'scale(1)'; }
    return;
  }
  const target = panel.querySelector(`.ded-doc-val[data-fieldkey="${fieldKey}"]`);
  if (!target) return;
  target.classList.add('ded-doc-val-hl');
  if (doc) {
    doc.style.transition = 'none';
    doc.style.transform  = 'scale(1)';
    requestAnimationFrame(() => {
      const docR = doc.getBoundingClientRect();
      const tgtR = target.getBoundingClientRect();
      const cx   = (tgtR.left + tgtR.right)  / 2 - docR.left;
      const cy   = (tgtR.top  + tgtR.bottom) / 2 - docR.top;
      doc.style.transition     = 'transform 0.22s ease';
      doc.style.transformOrigin = `${cx}px ${cy}px`;
      doc.style.transform      = 'scale(1.75)';
    });
  }
}

function _dedHighlightField(btn, on) {
  _splitDocZoom(btn.dataset.split, btn.dataset.fieldkey, on);
}

// ── Render the document panel (right side of split view) ──────────────────────
function _dedRenderDoc(doc, splitId) {
  const fk  = f => f.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const fv  = f => { const x = doc.fields.find(d => d.field === f); return x ? x.verified : '—'; };
  const fval = f => `<span class="ded-doc-val" data-fieldkey="${fk(f)}">${fv(f)}</span>`;
  const dv  = (key, val) => `<span class="ded-doc-val" data-fieldkey="${key}">${val || '—'}</span>`;

  if (doc.docType === 'Bill of Lading') {
    const h = (doc.form && doc.form.header) || {};
    const rows = (doc.form && doc.form.poRows) || [];
    const chk = v => v ? '☑' : '☐';
    const poRowsHtml = rows.map(r => `
      <tr>
        <td style="padding:2px 5px;border:1px solid #ddd;font-size:9px">${dv('invoice-number', r.invoiceNumber)}</td>
        <td style="padding:2px 5px;border:1px solid #ddd;font-size:9px">${dv('order-number', r.orderNumber)}</td>
        <td style="padding:2px 5px;border:1px solid #ddd;font-size:9px;text-align:right">${dv('package-qty', r.packageQty)}</td>
        <td style="padding:2px 5px;border:1px solid #ddd;font-size:9px;text-align:right">${dv('lbs-qty', r.lbsQty)}</td>
      </tr>`).join('');
    return `
      <div class="wf-invoice-doc" style="font-size:9px;line-height:1.4">
        <div style="text-align:center;font-size:12px;font-weight:800;letter-spacing:.08em;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:8px">BILL OF LADING</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #bbb;margin-bottom:6px">
          <div style="padding:5px 7px;border-right:1px solid #bbb;border-bottom:1px solid #bbb">
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:2px">Ship From</div>
            <div style="font-weight:700;font-size:10px">${dv('document-provider', h.documentProvider)}</div>
          </div>
          <div style="padding:5px 7px;border-bottom:1px solid #bbb">
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:2px">BOL #</div>
            <div style="font-weight:700;font-size:10px">${dv('bol', h.bol)}</div>
          </div>
          <div style="padding:5px 7px;border-right:1px solid #bbb;border-bottom:1px solid #bbb">
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:2px">Carrier Name / SCAC</div>
            <div style="font-weight:600">${dv('carrier-sign-text', h.carrierSignText)}</div>
          </div>
          <div style="padding:5px 7px;border-bottom:1px solid #bbb">
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:2px">Appt Number</div>
            <div style="font-weight:600">${dv('appt-number', h.apptNumber)}</div>
          </div>
          <div style="padding:5px 7px;grid-column:1/-1;border-bottom:1px solid #bbb">
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:3px">Freight Charge Terms</div>
            <div>${dv('freight-charge-terms', h.freightChargeTerms)}</div>
          </div>
          <div style="padding:5px 7px;grid-column:1/-1;border-bottom:1px solid #bbb;display:flex;gap:12px">
            <span>${dv('carrier-sign', chk(h.carrierSign) + ' Carrier Sign')}</span>
            <span>${dv('customer-sign', chk(h.customerSign) + ' Customer Sign')}</span>
            <span>${dv('subject-to-count', chk(h.subjectToCount) + ' Subject to Count')}</span>
          </div>
        </div>
        <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:3px">Customer Information (PO Details)</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px">
          <thead><tr style="background:#f0f0f0">
            <th style="padding:3px 5px;border:1px solid #bbb;font-size:8px;font-weight:700;text-align:left">Invoice #</th>
            <th style="padding:3px 5px;border:1px solid #bbb;font-size:8px;font-weight:700;text-align:left">Order #</th>
            <th style="padding:3px 5px;border:1px solid #bbb;font-size:8px;font-weight:700;text-align:right"># Pkgs</th>
            <th style="padding:3px 5px;border:1px solid #bbb;font-size:8px;font-weight:700;text-align:right">Weight (LB)</th>
          </tr></thead>
          <tbody>${poRowsHtml}</tbody>
        </table>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;border:1px solid #bbb;padding:5px 7px;margin-bottom:6px">
          <div>
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666">Grand Total Pkgs</div>
            <div style="font-weight:700;font-size:10px">${dv('total-package-qty', h.totalPackageQty)}</div>
          </div>
          <div>
            <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666">Grand Total Weight</div>
            <div style="font-weight:700;font-size:10px">${dv('weight', h.weight)}</div>
          </div>
        </div>
        <div style="border:1px solid #bbb;padding:5px 7px;margin-bottom:4px;background:#fafafa">
          <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:2px">Special Instructions / Notations</div>
          <div style="font-size:9px;color:#333;line-height:1.5">${dv('notations', doc.form && doc.form.notations)}</div>
        </div>
        <div style="border:1px solid #d4c87a;padding:5px 7px;background:#fffdf0">
          <div style="font-size:7px;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:2px">Hand Written Notes</div>
          <div style="font-size:9px;font-style:italic;color:#555;line-height:1.5">${dv('hand-written', doc.form && doc.form.handWritten)}</div>
        </div>
      </div>`;
  }

  if (doc.docType === 'Invoice') {
    return `
      <div class="wf-invoice-doc">
        <div class="wf-invoice-doc-top">
          <div>
            <div class="wf-invoice-doc-brand">${fval('Retailer')}</div>
          </div>
          <div style="text-align:right">
            <div class="wf-invoice-doc-title">INVOICE</div>
            <div class="wf-invoice-doc-num">#${fval('Invoice #')}</div>
          </div>
        </div>
        <div class="wf-invoice-meta" style="grid-template-columns:1fr 1fr;gap:6px 8px;margin:8px 0 10px">
          <div><div class="wf-invoice-meta-lbl">PO Number</div><div class="wf-invoice-meta-val">${fval('PO Number')}</div></div>
          <div><div class="wf-invoice-meta-lbl">Claim Date</div><div class="wf-invoice-meta-val">${fval('Claim Date')}</div></div>
          <div><div class="wf-invoice-meta-lbl">Deduction Type</div><div class="wf-invoice-meta-val">${fval('Deduction Type')}</div></div>
          <div><div class="wf-invoice-meta-lbl">Claim Amount</div><div class="wf-invoice-meta-val">${fval('Claim Amount')}</div></div>
        </div>
        <div class="wf-invoice-total-row">
          <span class="wf-invoice-total-lbl">Total Claimed</span>
          <span class="wf-invoice-total-amt">${fval('Claim Amount')}</span>
        </div>
      </div>`;
  }
  // POD or generic doc — simple table layout
  return `
    <div class="wf-invoice-doc">
      <div class="wf-invoice-doc-top">
        <div><div class="wf-invoice-doc-brand">${doc.docLabel}</div></div>
        <div style="text-align:right"><div class="wf-invoice-doc-title" style="font-size:11px">PROOF OF DELIVERY</div></div>
      </div>
      <table class="wf-invoice-lines" style="margin-top:8px">
        <thead><tr><th>Field</th><th class="r">Value</th></tr></thead>
        <tbody>
          ${doc.fields.map(f => `
            <tr>
              <td style="color:var(--text-muted)">${f.field}</td>
              <td class="r"><span class="ded-doc-val" data-fieldkey="${fk(f.field)}">${f.verified}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Split-view eyeball card (used in case form, not WF solver) ────────────────
function _dedEyeballSplitCard(caseId, task) {
  const docs = task.docs || [];
  return docs.map((doc, docIdx) => {
    const splitId = `ded-eyb-${caseId}-${docIdx}`;
    const fk = f => f.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    const fieldsHtml = doc.fields.map(f => `
        <div class="wf-pa-field">
          <label class="wf-pa-label" style="font-size:12px">${f.field}</label>
          <input class="wf-pa-input" style="height:32px;font-size:12px" type="text" value="${f.verified}"
            onfocus="_splitDocZoom('${splitId}','${fk(f.field)}',true)"
            onblur="_splitDocZoom('${splitId}','${fk(f.field)}',false)">
        </div>`).join('');

    return `
      <div class="wf-form-card" style="overflow:hidden">
        <div class="wf-form-card-header" style="align-items:center">
          <span class="material-symbols-outlined" style="font-size:20px;color:var(--text-secondary);flex-shrink:0">description</span>
          <div style="flex:1;min-width:0">
            <div class="wf-form-card-vendor">${doc.docLabel}</div>
            <div class="wf-form-card-task-type">${doc.docType} — verify extracted fields</div>
          </div>
        </div>
        <div class="ded-eyeball-split">
          <div class="ded-eyeball-left">
            <div style="font-size:11px;color:var(--text-muted)">OCR extracted — click a field to locate in document</div>
            <div class="wf-pa-fields">${fieldsHtml}</div>
          </div>
          <div style="display:flex;flex-direction:column;background:#525659;overflow:hidden">
            <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:#3c3f41;flex-shrink:0">
              <span class="material-symbols-outlined" style="font-size:13px;color:#aaa">picture_as_pdf</span>
              <span style="font-size:11px;color:#ccc;font-weight:500">${doc.docLabel}</span>
              <span style="font-size:10px;color:#888;margin-left:2px">· ${doc.docType}</span>
            </div>
            <div class="ded-eyeball-right" id="${splitId}-doc">
              ${_dedRenderDoc(doc, splitId)}
            </div>
          </div>
        </div>
        <div class="wf-form-card-footer">
          <button class="wf-reject-btn">Reject</button>
          <button class="wf-approve-btn" onclick="approveWfCard(this,'${caseId}','eyeball','confirm-${docIdx}','eyeball')">
            <span class="material-symbols-outlined" style="font-size:14px">check</span> Confirm
          </button>
        </div>
      </div>`;
  }).join('');
}

// ─── Shared inline-table helpers (pin + resize) ───────────────────────────────
function _dedToggleInlinePin(tableId, colKey) {
  if (!_dedInlinePinned[tableId]) _dedInlinePinned[tableId] = new Set();
  const pins = _dedInlinePinned[tableId];
  if (pins.has(colKey)) pins.delete(colKey); else pins.add(colKey);
  _dedApplyInlinePins(tableId);
}

function _dedApplyInlinePins(tableId) {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  const pins = _dedInlinePinned[tableId] || new Set();
  const ths  = [...tbl.querySelectorAll('thead tr th[data-col]')];
  let leftOffset = 0;
  ths.forEach(th => {
    const key = th.dataset.col;
    const isPinned = pins.has(key);
    [th, ...tbl.querySelectorAll(`tbody td[data-col="${key}"]`)].forEach(cell => {
      cell.classList.toggle('col-pinned', isPinned);
      cell.style.left = isPinned ? leftOffset + 'px' : '';
    });
    if (isPinned) leftOffset += th.offsetWidth;
  });
}

function _dedStartResize(e, tableId, colKey) {
  e.stopPropagation(); e.preventDefault();
  const th = e.currentTarget.closest('th');
  _dedResState = { tableId, colKey, startX: e.clientX, startWidth: th.offsetWidth };
  document.body.classList.add('col-resizing');
  document.addEventListener('mousemove', _dedOnResize);
  document.addEventListener('mouseup', _dedEndResize);
}
function _dedOnResize(e) {
  if (!_dedResState) return;
  const { tableId, colKey, startX, startWidth } = _dedResState;
  const newW = Math.max(48, startWidth + (e.clientX - startX));
  if (!_dedInlineColWidths[tableId]) _dedInlineColWidths[tableId] = {};
  _dedInlineColWidths[tableId][colKey] = newW;
  const tbl = document.getElementById(tableId);
  if (tbl) { const th = tbl.querySelector(`thead th[data-col="${colKey}"]`); if (th) th.style.width = newW + 'px'; }
}
function _dedEndResize() {
  document.removeEventListener('mousemove', _dedOnResize);
  document.removeEventListener('mouseup', _dedEndResize);
  document.body.classList.remove('col-resizing');
  if (_dedResState) { _dedApplyInlinePins(_dedResState.tableId); }
  _dedResState = null;
}

// Shared th builder — pin icon + resize handle
function _dedMakeTh(key, label, tableId, cls, width) {
  const wStyle = width ? ` style="width:${width}px"` : '';
  const clsAttr = cls ? ` class="${cls}"` : '';
  return `<th data-col="${key}"${clsAttr}${wStyle}>${label}<button class="ded-tbl-pin-btn" onclick="event.stopPropagation();_dedToggleInlinePin('${tableId}','${key}')" title="Pin column"><span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle">push_pin</span></button><div class="col-resize-handle" onmousedown="_dedStartResize(event,'${tableId}','${key}')"></div></th>`;
}

// Shared table wrapper builder
function _dedBuildInlineTbl(tblId, headHtml, tbodyHtml, tbodyId) {
  return `<div class="ded-inline-tbl-wrap"><table class="ded-inline-tbl" id="${tblId}"><thead><tr>${headHtml}</tr></thead><tbody${tbodyId ? ` id="${tbodyId}"` : ''}>${tbodyHtml}</tbody></table></div>`;
}

// ─── Qty Estimation card ──────────────────────────────────────────────────────
function _dedQtyEstimationCard(caseId, task) {
  const tblId = `ded-qty-tbl-${caseId}`;
  const items = task.items || [];
  const submitted = !!_dedQtySubmitted[caseId];
  const head =
    _dedMakeTh('sku',          'SKU',               tblId, '') +
    _dedMakeTh('csku',         'Customer SKU',      tblId, '') +
    _dedMakeTh('name',         'Item Name',         tblId, '') +
    _dedMakeTh('bkpPriceQty',  'Backup Price/Qty',  tblId, '') +
    _dedMakeTh('invPriceQty',  'Invoice Price/Qty', tblId, '') +
    _dedMakeTh('bkpBilledQty', 'Backup Billed Qty', tblId, 'num') +
    _dedMakeTh('invQty',       'Invoice Qty',       tblId, 'num') +
    _dedMakeTh('denom',        'Denominator',       tblId, '') +
    _dedMakeTh('qtyPerEach',   'Inv. QTY / Each',   tblId, 'num');
  const rows = items.map(item => `
    <tr>
      <td data-col="sku" style="font-family:'SFMono-Regular',Consolas,monospace;font-size:10px;color:var(--text-muted)">${item.sku}</td>
      <td data-col="csku" style="color:var(--text-muted)">${item.customerSku || '—'}</td>
      <td data-col="name">${item.description}</td>
      <td data-col="bkpPriceQty">${item.unitPrice}</td>
      <td data-col="invPriceQty">${item.unitPrice}</td>
      <td data-col="bkpBilledQty" class="num">${item.ordered}</td>
      <td data-col="invQty" class="num">${item.received}</td>
      <td data-col="denom" class="ded-tbl-input"><input type="number" min="1" value="${(_dedQtyDenominators[caseId] || {})[item.sku] || 1}" id="ded-denom-${caseId}-${item.sku}"${submitted ? ' disabled' : ''} oninput="_dedUpdateQtyOutput('${caseId}','${item.sku}')"></td>
      <td data-col="qtyPerEach" class="num ded-tbl-output"><span id="ded-qty-out-${caseId}-${item.sku}" class="ded-output-pill">${((_dedQtyDenominators[caseId] || {})[item.sku] || 1) * item.received}</span></td>
    </tr>`).join('');
  const footerBtn = submitted
    ? `<button class="wf-secondary-btn" style="padding:5px 14px;font-size:11px;border-radius:20px" onclick="_dedEditQty('${caseId}')">
         <span class="material-symbols-outlined" style="font-size:13px">edit</span> Edit
       </button>`
    : `<button class="wf-approve-btn" style="padding:5px 16px;font-size:11px;border-radius:20px" onclick="_dedSubmitQty('${caseId}')">
         <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">check</span> Submit Quantity
       </button>`;
  const footerHint = submitted
    ? `<span style="font-size:11px;color:#166534;flex:1;display:flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:13px">check_circle</span>Quantities submitted</span>`
    : `<span style="font-size:11px;color:var(--text-muted);flex:1">Adjust denominators, then submit to validate</span>`;
  return `
    <div class="wf-form-card" style="padding:0;overflow:hidden">
      ${_dedBuildInlineTbl(tblId, head, rows)}
      <div class="wf-form-card-footer" id="ded-qty-footer-${caseId}" style="padding:8px 12px;gap:8px;border-top:1px solid var(--border-light)">
        ${footerHint}
        ${footerBtn}
      </div>
    </div>`;
}

function _dedUpdateQtyOutput(caseId, sku) {
  const input = document.getElementById(`ded-denom-${caseId}-${sku}`);
  const out   = document.getElementById(`ded-qty-out-${caseId}-${sku}`);
  if (!input || !out) return;
  const denom = Math.max(1, parseInt(input.value) || 1);
  if (!_dedQtyDenominators[caseId]) _dedQtyDenominators[caseId] = {};
  _dedQtyDenominators[caseId][sku] = denom;
  const task = (_deductionWfTasks[caseId] || []).find(t => t.type === 'deduction-validation');
  const item = (task?.items || []).find(i => i.sku === sku);
  out.textContent = item ? item.received * denom : denom;
}

function _dedSubmitQty(caseId) {
  // Mark as submitted, populate all items into validation, lock inputs
  _dedQtySubmitted[caseId] = true;
  const task = (_deductionWfTasks[caseId] || []).find(t => t.type === 'deduction-validation');
  const items = task?.items || [];
  if (!_dedAcceptedItems[caseId]) _dedAcceptedItems[caseId] = new Set();
  items.forEach(item => _dedAcceptedItems[caseId].add(item.sku));
  // Lock denominator inputs
  items.forEach(item => {
    const input = document.getElementById(`ded-denom-${caseId}-${item.sku}`);
    if (input) input.disabled = true;
  });
  // Swap footer to edit state
  _dedRefreshQtyFooter(caseId);
  // Populate validation table
  _dedRefreshValTable(caseId);
  document.getElementById('case-section-validation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function _dedEditQty(caseId) {
  // Unlock denominator inputs and revert button to Submit
  _dedQtySubmitted[caseId] = false;
  const task = (_deductionWfTasks[caseId] || []).find(t => t.type === 'deduction-validation');
  const items = task?.items || [];
  items.forEach(item => {
    const input = document.getElementById(`ded-denom-${caseId}-${item.sku}`);
    if (input) input.disabled = false;
  });
  _dedRefreshQtyFooter(caseId);
}

function _dedRefreshQtyFooter(caseId) {
  const footer = document.getElementById(`ded-qty-footer-${caseId}`);
  if (!footer) return;
  const submitted = !!_dedQtySubmitted[caseId];
  footer.innerHTML = submitted
    ? `<span style="font-size:11px;color:#166534;flex:1;display:flex;align-items:center;gap:4px"><span class="material-symbols-outlined" style="font-size:13px">check_circle</span>Quantities submitted</span>
       <button class="wf-secondary-btn" style="padding:5px 14px;font-size:11px;border-radius:20px" onclick="_dedEditQty('${caseId}')">
         <span class="material-symbols-outlined" style="font-size:13px">edit</span> Edit
       </button>`
    : `<span style="font-size:11px;color:var(--text-muted);flex:1">Adjust denominators, then submit to validate</span>
       <button class="wf-approve-btn" style="padding:5px 16px;font-size:11px;border-radius:20px" onclick="_dedSubmitQty('${caseId}')">
         <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">check</span> Submit Quantity
       </button>`;
}

function _dedRefreshValTable(caseId) {
  const tbody = document.getElementById(`ded-val-tbl-${caseId}-body`);
  if (!tbody) return;
  const accepted = _dedAcceptedItems[caseId] || new Set();
  const task     = (_deductionWfTasks[caseId] || []).find(t => t.type === 'deduction-validation');
  const items    = (task?.items || []).filter(i => accepted.has(i.sku));
  tbody.innerHTML = items.length
    ? items.map(item => _dedValRow(caseId, item)).join('')
    : `<tr><td colspan="23" style="padding:20px;color:var(--text-muted);text-align:center;font-size:12px">Submit quantities from Quantity Estimation to populate this table</td></tr>`;
  _dedCheckValSubmit(caseId);
}

function _dedValStatus(vq, iq) {
  if (vq >= iq && iq > 0) return `<span class="ded-tbl-status-full">Full Valid</span>`;
  if (vq > 0)             return `<span class="ded-tbl-status-partial">Partial Valid</span>`;
  return `<span class="ded-tbl-status-invalid">Invalid</span>`;
}

// ── Combined OS&D cell (Shortage / Damaged / Overage icons + counts) ──────────
function _dedOsdCell(shortage, damaged, overage) {
  const chip = (icon, val, color, label, desc) => {
    const muted = val === 0;
    return `<span class="osd-chip" data-tip-label="${label}" data-tip-val="${val}" data-tip-desc="${desc}"
                  onmouseenter="_showTipEl(event,this)" onmousemove="_moveTip(event)" onmouseleave="_hideTip()"
                  style="display:inline-flex;align-items:center;gap:2px;font-size:11px;font-weight:600;cursor:default;color:${muted ? 'var(--text-muted)' : color}">
      <span class="material-symbols-outlined" style="font-size:12px;line-height:1">${icon}</span>${val}</span>`;
  };
  return `<div style="display:inline-flex;align-items:center;gap:7px;white-space:nowrap">
    ${chip('south',   shortage, '#dc2626', 'Shortage', 'Units missing from shipment')}
    ${chip('warning', damaged,  '#d97706', 'Damaged',  'Units damaged or destroyed')}
    ${chip('north',   overage,  '#16a34a', 'Overage',  'Units received above order qty')}
  </div>`;
}

function _dedValRow(caseId, item) {
  const denom      = (_dedQtyDenominators[caseId] || {})[item.sku] || 1;
  const invQtyEach = item.received * denom;
  const inp        = (_dedValInputs[caseId] || {})[item.sku] || {};
  const validQty   = inp.validQty !== undefined ? inp.validQty : '';
  const reasoning  = inp.reasoning || '';
  const netNum     = parseFloat((item.netPrice || '0').replace(/[^0-9.]/g, '')) || 0;
  const vq         = parseFloat(validQty) || 0;
  const iq         = invQtyEach - vq;
  const hasVal     = validQty !== '';
  const reasons    = ['OS&D','Price Discrepancy','Carrier Error','Admin Error','Accepted','Rejected'];
  return `<tr>
    <td data-col="sku"        style="font-family:'SFMono-Regular',Consolas,monospace;font-size:10px;color:var(--text-muted)">${item.sku}</td>
    <td data-col="name"       >${item.description}</td>
    <td data-col="grossPrice" >${item.unitPrice}</td>
    <td data-col="netPrice"   >${item.netPrice || '—'}</td>
    <td data-col="deductAmt"  style="color:#dc2626">${item.amount}</td>
    <td data-col="invQtyEach" class="num ded-tbl-output"><span class="ded-output-pill">${invQtyEach}</span></td>
    <td data-col="osd"         class="num">${_dedOsdCell(item.discrepancy||0, item.damaged||0, item.overage||0)}</td>
    <td data-col="validQty"   class="ded-tbl-input num"><input type="number" min="0" max="${invQtyEach}" value="${validQty}" placeholder="0" id="ded-vq-${caseId}-${item.sku}" oninput="_dedUpdateValOutputs('${caseId}','${item.sku}',${invQtyEach},${netNum})"></td>
    <td data-col="validAmt"   class="num ded-tbl-output" id="ded-va-${caseId}-${item.sku}">${hasVal ? `<span class="ded-output-pill">$${(vq*netNum).toFixed(2)}</span>` : '—'}</td>
    <td data-col="invalidQty" class="num ded-tbl-output" id="ded-iq-${caseId}-${item.sku}">${hasVal ? `<span class="ded-output-pill">${iq}</span>` : '—'}</td>
    <td data-col="invalidAmt" class="num ded-tbl-output" id="ded-ia-${caseId}-${item.sku}">${hasVal ? `<span class="ded-output-pill">$${(iq*netNum).toFixed(2)}</span>` : '—'}</td>
    <td data-col="valStatus"  id="ded-vs-${caseId}-${item.sku}">${hasVal ? _dedValStatus(vq,invQtyEach) : '<span style="color:var(--text-muted);font-size:11px">—</span>'}</td>
    <td data-col="reasoning"  class="ded-tbl-input"><select required onchange="_dedSaveReasoning('${caseId}','${item.sku}',this.value)" style="${!reasoning ? 'color:var(--text-muted)' : ''}"><option value="" disabled${!reasoning ? ' selected' : ''} style="color:var(--text-muted)">Select reason…</option>${reasons.map(r=>`<option value="${r}"${r===reasoning?' selected':''}>${r}</option>`).join('')}</select></td>
  </tr>`;
}

function _dedUpdateValOutputs(caseId, sku, invQtyEach, netNum) {
  const input = document.getElementById(`ded-vq-${caseId}-${sku}`);
  if (!input) return;
  const vq = Math.min(invQtyEach, Math.max(0, parseFloat(input.value) || 0));
  input.value = vq;
  const iq = invQtyEach - vq;
  if (!_dedValInputs[caseId]) _dedValInputs[caseId] = {};
  if (!_dedValInputs[caseId][sku]) _dedValInputs[caseId][sku] = {};
  _dedValInputs[caseId][sku].validQty = vq;
  const va  = document.getElementById(`ded-va-${caseId}-${sku}`);
  const iqEl = document.getElementById(`ded-iq-${caseId}-${sku}`);
  const ia  = document.getElementById(`ded-ia-${caseId}-${sku}`);
  const vs  = document.getElementById(`ded-vs-${caseId}-${sku}`);
  if (va)   va.innerHTML   = `<span class="ded-output-pill">$${(vq * netNum).toFixed(2)}</span>`;
  if (iqEl) iqEl.innerHTML = `<span class="ded-output-pill">${iq}</span>`;
  if (ia)   ia.innerHTML   = `<span class="ded-output-pill">$${(iq * netNum).toFixed(2)}</span>`;
  if (vs)   vs.innerHTML   = _dedValStatus(vq, invQtyEach);
  _dedUpdateTotalValidated(caseId);
}

function _dedUpdateTotalValidated(caseId) {
  const el = document.getElementById(`ded-total-validated-${caseId}`);
  if (!el) return;
  const tbody = document.getElementById(`ded-val-tbl-${caseId}-body`);
  if (!tbody) return;
  // Sum the text content of all validAmt cells (strip the $ and parse)
  const total = [...tbody.querySelectorAll('td[data-col="validAmt"] .ded-output-pill')]
    .reduce((sum, span) => sum + (parseFloat(span.textContent.replace('$', '')) || 0), 0);
  el.textContent = '$' + total.toFixed(2);
}

function _dedSaveReasoning(caseId, sku, val) {
  if (!_dedValInputs[caseId]) _dedValInputs[caseId] = {};
  if (!_dedValInputs[caseId][sku]) _dedValInputs[caseId][sku] = {};
  _dedValInputs[caseId][sku].reasoning = val;
  // Clear placeholder color and error state on this select
  event.target.style.color = '';
  event.target.classList.remove('ded-reasoning-error');
  _dedCheckValSubmit(caseId);
}

function _dedSetConfirm(caseId, sku, checked) {
  if (!_dedConfirmed[caseId]) _dedConfirmed[caseId] = {};
  _dedConfirmed[caseId][sku] = checked;
}

function _dedCheckValSubmit(caseId) {
  const tbody = document.getElementById(`ded-val-tbl-${caseId}-body`);
  const btn   = document.getElementById(`ded-submit-val-${caseId}`);
  const hint  = document.getElementById(`ded-val-hint-${caseId}`);
  if (!tbody || !btn) return;
  const selects  = [...tbody.querySelectorAll('td[data-col="invalidReason"] select')];
  const unfilled = selects.filter(s => !s.value);
  const allFilled = unfilled.length === 0; // always enabled — all pre-filled with 'Accepted'
  btn.disabled = !allFilled;
  if (hint) {
    hint.style.display = allFilled ? 'none' : '';
    hint.textContent   = unfilled.length
      ? `${unfilled.length} row${unfilled.length > 1 ? 's' : ''} missing an Invalid Reason selection`
      : '';
  }
}

function _dedAttemptValSubmit(caseId) {
  const btn = document.getElementById(`ded-submit-val-${caseId}`);
  if (!btn) return;
  if (!btn.disabled) {
    // All reasoning filled — proceed with submission
    approveWfCard(btn, caseId, 'deduction-validation', 'approve', 'validation');
    return;
  }
  // Disabled: red-stroke empty cells and scroll to first
  const tbody = document.getElementById(`ded-val-tbl-${caseId}-body`);
  if (!tbody) return;
  const selects  = [...tbody.querySelectorAll('td[data-col="invalidReason"] select')];
  const unfilled = selects.filter(s => !s.value);
  selects.forEach(s => s.classList.toggle('ded-reasoning-error', !s.value));
  if (unfilled.length) {
    unfilled[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }
}

// ─── Combined Deduction Validation table (23 columns, first 3 pinned) ───────────
function _dedCombinedValidationCard(caseId, task) {
  const tblId   = `ded-val-tbl-${caseId}`;
  const tbodyId = `ded-val-tbl-${caseId}-body`;
  const items   = task.items || [];

  // Pre-seed pinned state for Item (name+SKU combined) and Customer SKU
  if (!_dedInlinePinned[tblId]) _dedInlinePinned[tblId] = new Set(['item','csku']);

  // Seed input state so all rows are pre-filled
  if (!_dedQtyDenominators[caseId]) _dedQtyDenominators[caseId] = {};
  if (!_dedValInputs[caseId])       _dedValInputs[caseId]       = {};
  if (!_dedConfirmed[caseId])       _dedConfirmed[caseId]       = {};
  items.forEach(item => {
    if (!_dedQtyDenominators[caseId][item.sku]) _dedQtyDenominators[caseId][item.sku] = 1;
    const denom      = _dedQtyDenominators[caseId][item.sku];
    const invQtyEach = item.received * denom;
    if (!_dedValInputs[caseId][item.sku]) {
      _dedValInputs[caseId][item.sku] = { validQty: invQtyEach, reasoning: 'Accepted' };
    }
  });

  const reasons = ['Accepted','OS&D','Price Discrepancy','Carrier Error','Admin Error','Rejected'];

  // Pinned-column th builder (col-pinned + left offset + fixed width)
  const pTh = (key, label, leftPx, widthPx) =>
    `<th data-col="${key}" class="col-pinned" style="left:${leftPx}px;width:${widthPx}px">${label}<button class="ded-tbl-pin-btn" onclick="event.stopPropagation();_dedToggleInlinePin('${tblId}','${key}')" title="Unpin column"><span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle">push_pin</span></button><div class="col-resize-handle" onmousedown="_dedStartResize(event,'${tblId}','${key}')"></div></th>`;

  const head =
    pTh('item',          'Item',                0,  172)  +
    pTh('csku',          'Customer SKU',      172,   80)  +
    _dedMakeTh('unitPrice',   'Price Comp (BK/Inv)', tblId, '',    96) +
    _dedMakeTh('bkpBilledQty','Backup Billed Qty', tblId, 'num', 72) +
    _dedMakeTh('invQty',      'Invoice Qty',       tblId, 'num', 64) +
    _dedMakeTh('denom',       'Denominator',       tblId, '',    68) +
    _dedMakeTh('qtyEach',     'Inv. Qty/Each',     tblId, 'num', 72) +
    _dedMakeTh('grossNet',    'Price (Gross/Net)',  tblId, '',    96) +
    _dedMakeTh('deductAmt',   'Deduct Amt',        tblId, '',    80) +
    _dedMakeTh('deductedQty', 'Deducted Qty',      tblId, 'num', 72) +
    _dedMakeTh('osd',         'OS&D',              tblId, '',    96) +
    _dedMakeTh('validQty',    'Valid Qty',          tblId, 'num', 68) +
    _dedMakeTh('validAmt',    'Valid Amount',       tblId, 'num', 88) +
    _dedMakeTh('invalidQty',  'Invalid Qty',        tblId, 'num', 68) +
    _dedMakeTh('invalidAmt',  'Invalid Amount',    tblId, 'num', 88) +
    _dedMakeTh('valStatus',   'Validation Status', tblId, '',   104) +
    _dedMakeTh('invalidReason','Invalid Reason',   tblId, '',   110) +
    `<th data-col="confirm" style="width:56px;text-align:center;font-size:10px;font-weight:600;color:var(--text-muted);padding:4px 6px">Confirm</th>`;

  const rows = items.map(item => {
    const denom      = _dedQtyDenominators[caseId][item.sku] || 1;
    const invQtyEach = item.received * denom;
    const inp        = _dedValInputs[caseId][item.sku] || {};
    const validQty   = inp.validQty  !== undefined ? inp.validQty  : invQtyEach;
    const reasoning  = inp.reasoning || 'Accepted';
    const netNum     = parseFloat((item.netPrice || '0').replace(/[^0-9.]/g,'')) || 0;
    const vq         = parseFloat(validQty) || 0;
    const iq         = invQtyEach - vq;
    const shortage   = item.shortage  !== undefined ? item.shortage  : (item.discrepancy || 0);
    const damaged    = item.damaged   || 0;
    const overage    = item.overage   || 0;
    const deductedQty = item.discrepancy || 0;
    const confirmed   = !!(_dedConfirmed[caseId] && _dedConfirmed[caseId][item.sku]);
    return `<tr>
      <td data-col="item" class="col-pinned" style="left:0px;width:172px;max-width:172px">
        <div style="font-size:11px;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${item.description}">${item.description}</div>
        <div style="font-family:'SFMono-Regular',Consolas,monospace;font-size:9px;color:var(--text-muted);margin-top:2px">${item.sku}</div>
      </td>
      <td data-col="csku" class="col-pinned" style="left:172px;width:80px;color:var(--text-muted);font-size:11px">${item.customerSku || '—'}</td>
      <td data-col="unitPrice">${(() => {
        const bkp  = item.unitPrice || '—';
        const inv  = item.invPrice  || item.unitPrice || '—';
        const same = bkp === inv;
        const lbl  = 'font-size:9px;font-weight:700;letter-spacing:0.2px;margin-right:3px;';
        const sep  = same
          ? ``
          : `<span style="font-size:9px;color:var(--text-muted);margin:0 2px">/</span>`;
        const invColor = same ? 'color:var(--text-muted)' : 'color:#d97706;font-weight:600';
        return `<div style="white-space:nowrap"><span style="${lbl}color:#0369a1">BKP</span><span style="font-size:11px;font-weight:500">${bkp}</span></div>`
             + `<div style="white-space:nowrap;margin-top:2px">${sep}<span style="${lbl}color:#0369a1">INV</span><span style="font-size:11px;${invColor}">${inv}</span></div>`;
      })()}</td>
      <td data-col="bkpBilledQty" class="num"><span class="ded-qty-pill">${item.ordered}</span></td>
      <td data-col="invQty"       class="num"><span class="ded-qty-pill">${item.received}</span></td>
      <td data-col="denom"        class="ded-tbl-input"><input type="number" min="1" value="${denom}" data-received="${item.received}" data-netprice="${netNum}" id="ded-denom-${caseId}-${item.sku}" oninput="_dedCombinedUpdate('${caseId}','${item.sku}')"></td>
      <td data-col="qtyEach"      class="num ded-tbl-output"><span class="ded-output-pill" id="ded-qty-out-${caseId}-${item.sku}">${invQtyEach}</span></td>
      <td data-col="grossNet">${(() => {
        const grs  = item.unitPrice || '—';
        const net  = item.netPrice  || '—';
        const same = grs === net;
        const lbl  = 'font-size:9px;font-weight:700;letter-spacing:0.2px;margin-right:3px;';
        const sep  = same ? `` : `<span style="font-size:9px;color:var(--text-muted);margin:0 2px">/</span>`;
        const netColor = same ? 'color:var(--text-muted)' : 'color:#d97706;font-weight:600';
        return `<div style="white-space:nowrap"><span style="${lbl}color:#0369a1">GRS</span><span style="font-size:11px;font-weight:500">${grs}</span></div>`
             + `<div style="white-space:nowrap;margin-top:2px">${sep}<span style="${lbl}color:#0369a1">NET</span><span style="font-size:11px;${netColor}">${net}</span></div>`;
      })()}</td>
      <td data-col="deductAmt" style="color:#dc2626;white-space:nowrap">${item.amount}</td>
      <td data-col="deductedQty"  class="num"><span class="ded-qty-pill">${deductedQty}</span></td>
      <td data-col="osd">${_dedOsdCell(shortage, damaged, overage)}</td>
      <td data-col="validQty"     class="ded-tbl-input num"><input type="number" min="0" max="${invQtyEach}" value="${validQty}" id="ded-vq-${caseId}-${item.sku}" oninput="_dedUpdateValOutputs('${caseId}','${item.sku}',${invQtyEach},${netNum})"></td>
      <td data-col="validAmt"     class="num ded-tbl-output" id="ded-va-${caseId}-${item.sku}"><span class="ded-output-pill">$${(vq*netNum).toFixed(2)}</span></td>
      <td data-col="invalidQty"   class="num ded-tbl-output" id="ded-iq-${caseId}-${item.sku}"><span class="ded-output-pill">${iq}</span></td>
      <td data-col="invalidAmt"   class="num ded-tbl-output" id="ded-ia-${caseId}-${item.sku}"><span class="ded-output-pill">$${(iq*netNum).toFixed(2)}</span></td>
      <td data-col="valStatus"    id="ded-vs-${caseId}-${item.sku}">${_dedValStatus(vq, invQtyEach)}</td>
      <td data-col="invalidReason" class="ded-tbl-input"><select onchange="_dedSaveReasoning('${caseId}','${item.sku}',this.value)">${reasons.map(r=>`<option value="${r}"${r===reasoning?' selected':''}>${r}</option>`).join('')}</select></td>
      <td data-col="confirm" style="text-align:center;padding:0"><input type="checkbox"${confirmed ? ' checked' : ''} onchange="_dedSetConfirm('${caseId}','${item.sku}',this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:var(--text-primary);vertical-align:middle"></td>
    </tr>`;
  }).join('');

  const totalValidated = items.reduce((sum, item) => {
    const inp    = _dedValInputs[caseId][item.sku] || {};
    const netNum = parseFloat((item.netPrice || '0').replace(/[^0-9.]/g,'')) || 0;
    const denom  = _dedQtyDenominators[caseId][item.sku] || 1;
    const vq     = parseFloat(inp.validQty ?? item.received * denom) || 0;
    return sum + vq * netNum;
  }, 0);

  return `
    <div class="wf-form-card" style="padding:0;overflow:hidden">
      ${_dedBuildInlineTbl(tblId, head, rows, tbodyId)}
      <div class="wf-form-card-footer" style="padding:8px 12px;gap:10px;border-top:1px solid var(--border-light)">
        <span id="ded-val-hint-${caseId}" style="font-size:11px;color:#dc2626;flex:1;display:none"></span>
        <div style="display:flex;align-items:center;gap:5px;border-right:1px solid var(--border);padding-right:10px">
          <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.3px;font-weight:600">Validated</span>
          <span id="ded-total-validated-${caseId}" class="ded-output-pill" style="font-weight:700">$${totalValidated.toFixed(2)}</span>
        </div>
        <div onclick="_dedAttemptValSubmit('${caseId}')" style="display:inline-flex">
          <button id="ded-submit-val-${caseId}" class="wf-approve-btn" style="padding:5px 16px;font-size:11px;border-radius:20px">
            <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">check_circle</span> Submit Validation
          </button>
        </div>
      </div>
    </div>`;
}

function _dedCombinedUpdate(caseId, sku) {
  const denomInput = document.getElementById(`ded-denom-${caseId}-${sku}`);
  if (!denomInput) return;
  const denom      = Math.max(1, parseInt(denomInput.value) || 1);
  const received   = parseInt(denomInput.dataset.received) || 0;
  const netNum     = parseFloat(denomInput.dataset.netprice) || 0;
  if (!_dedQtyDenominators[caseId]) _dedQtyDenominators[caseId] = {};
  _dedQtyDenominators[caseId][sku] = denom;
  const invQtyEach = received * denom;
  const qtyOut = document.getElementById(`ded-qty-out-${caseId}-${sku}`);
  if (qtyOut) qtyOut.textContent = invQtyEach;
  const vqInput = document.getElementById(`ded-vq-${caseId}-${sku}`);
  if (vqInput) {
    vqInput.max   = invQtyEach;
    vqInput.value = Math.min(invQtyEach, parseFloat(vqInput.value) || 0);
    _dedUpdateValOutputs(caseId, sku, invQtyEach, netNum);
  }
}

// ─── Deduction Validation card (Box 3) ───────────────────────────────────────
function _dedDeductionValidationCard(caseId, task) {
  const tblId   = `ded-val-tbl-${caseId}`;
  const tbodyId = `ded-val-tbl-${caseId}-body`;
  const head =
    _dedMakeTh('sku',        'SKU',            tblId, '') +
    _dedMakeTh('name',       'Item Name',       tblId, '') +
    _dedMakeTh('grossPrice', 'Gross Price',     tblId, '') +
    _dedMakeTh('netPrice',   'Net Price',       tblId, '') +
    _dedMakeTh('deductAmt',  'Deduct Amount',   tblId, '') +
    _dedMakeTh('invQtyEach', 'Inv. Qty/Each',   tblId, 'num') +
    _dedMakeTh('osd',         'OS&D',            tblId, 'num') +
    _dedMakeTh('validQty',   'Valid Qty',       tblId, 'num') +
    _dedMakeTh('validAmt',   'Valid Amount',    tblId, 'num') +
    _dedMakeTh('invalidQty', 'Invalid Qty',     tblId, 'num') +
    _dedMakeTh('invalidAmt', 'Invalid Amount',  tblId, 'num') +
    _dedMakeTh('valStatus',  'Status',          tblId, '') +
    _dedMakeTh('reasoning',  'Reasoning',       tblId, '');
  const accepted = _dedAcceptedItems[caseId] || new Set();
  const items    = (task.items || []).filter(i => accepted.has(i.sku));
  const placeholder = `<tr><td colspan="23" style="padding:16px;color:var(--text-muted);text-align:center;font-size:11px">Submit quantities from Qty Estimation to populate this table</td></tr>`;
  return `
    <div class="wf-form-card" style="padding:0;overflow:hidden">
      ${_dedBuildInlineTbl(tblId, head, items.length ? items.map(i => _dedValRow(caseId, i)).join('') : placeholder, tbodyId)}
      <div class="wf-form-card-footer" style="padding:8px 12px;gap:10px;border-top:1px solid var(--border-light)">
        <span id="ded-val-hint-${caseId}" style="font-size:11px;color:#dc2626;flex:1">Select a Reasoning for each row</span>
        <div style="display:flex;align-items:center;gap:5px;border-right:1px solid var(--border);padding-right:10px">
          <span style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.3px;font-weight:600">Validated</span>
          <span id="ded-total-validated-${caseId}" class="ded-output-pill" style="font-weight:700">$0.00</span>
        </div>
        <div onclick="_dedAttemptValSubmit('${caseId}')" style="display:inline-flex">
          <button id="ded-submit-val-${caseId}" disabled class="wf-approve-btn" style="pointer-events:none;padding:5px 16px;font-size:11px;border-radius:20px">
            <span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">check_circle</span> Submit Validation
          </button>
        </div>
      </div>
    </div>`;
}

function _wfDeductionValidationCard(caseId, task) {
  const c         = task.case || {};
  const allItems  = task.items || [];
  const flagged   = allItems.filter(i => i.needsReview);
  const autoCount = allItems.length - flagged.length;
  if (!_wfRowDecisions[caseId]) _wfRowDecisions[caseId] = {};

  const rowsHtml = flagged.map(item => {
    const dec = _wfRowDecisions[caseId][item.sku] || null;
    return `
      <tr class="wf-ded-flag-row${dec === 'accept' ? ' row-accepted' : dec === 'dispute' ? ' row-disputed' : ''}" id="wf-flagrow-${caseId}-${item.sku}">
        <td style="font-family:'SFMono-Regular',Consolas,monospace;font-size:10px;color:var(--text-muted);white-space:nowrap">${item.sku}</td>
        <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px">${item.description}</td>
        <td class="num">${item.ordered}</td>
        <td class="num">${item.received}</td>
        <td class="num wf-ded-disc">${item.discrepancy}</td>
        <td class="num wf-ded-amount">${item.amount}</td>
      </tr>
      <tr class="wf-ded-flag-meta${dec === 'accept' ? ' row-accepted' : dec === 'dispute' ? ' row-disputed' : ''}" id="wf-flagmeta-${caseId}-${item.sku}">
        <td colspan="6">
          <div class="wf-ded-agent-note">
            <span class="material-symbols-outlined" style="font-size:12px;vertical-align:middle;margin-right:3px;color:#6366f1">smart_toy</span>${item.agentNote}
          </div>
          <div class="wf-row-decisions">
            <button class="wf-row-accept-btn${dec === 'accept' ? ' active' : ''}" onclick="_wfRowDecide('${caseId}','${item.sku}','accept')">
              <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle">check</span> Accept
            </button>
            <button class="wf-row-dispute-btn${dec === 'dispute' ? ' active' : ''}" onclick="_wfRowDecide('${caseId}','${item.sku}','dispute')">
              <span class="material-symbols-outlined" style="font-size:11px;vertical-align:middle">close</span> Dispute
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="wf-form-card" style="padding:0;overflow:hidden">
      <div class="wf-ded-agent-banner">
        <span class="material-symbols-outlined">smart_toy</span>
        <span>Casey reviewed <strong>${allItems.length} items</strong> — auto-resolved <strong>${autoCount}</strong> · <strong>${flagged.length} need your decision</strong></span>
      </div>
      <div class="wf-ded-header">
        <div class="wf-ded-header-item"><span class="wf-ded-header-label">Retailer</span><span class="wf-ded-header-value">${c.retailer}</span></div>
        <div class="wf-ded-header-item"><span class="wf-ded-header-label">Invoice</span><span class="wf-ded-header-value">${c.invoiceNo}</span></div>
        <div class="wf-ded-header-item"><span class="wf-ded-header-label">PO Number</span><span class="wf-ded-header-value">${c.poNo}</span></div>
        <div class="wf-ded-header-item"><span class="wf-ded-header-label">Type</span><span class="wf-ded-header-value">${c.deductionType}</span></div>
        <div class="wf-ded-header-item" style="margin-left:auto"><span class="wf-ded-header-label">Claim Amount</span><span class="wf-ded-header-value" style="color:#dc2626;font-size:14px">${c.claimAmount}</span></div>
      </div>
      <div style="overflow-x:auto;padding:0 14px">
        <table class="wf-ded-val-table">
          <thead>
            <tr>
              <th>SKU</th><th>Description</th>
              <th class="num">Ordered</th><th class="num">Received</th>
              <th class="num">Shortage</th><th class="num">Amount</th>
            </tr>
          </thead>
          <tbody id="wf-ded-flagbody-${caseId}">${rowsHtml}</tbody>
        </table>
      </div>
      <div class="wf-ded-submit-bar">
        <span class="wf-ded-submit-progress" id="wf-ded-progress-${caseId}">
          <strong>0 of ${flagged.length}</strong> decisions made
        </span>
        <button class="wf-approve-btn" id="wf-ded-submit-${caseId}" disabled
          style="pointer-events:none;padding:7px 18px;font-size:12px;opacity:0.45"
          onclick="approveWfCard(this,'${caseId}','deduction-validation','approve','deduction-validation')">
          <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">check_circle</span> Submit Decisions
        </button>
      </div>
    </div>`;
}

function _wfBillbackCard(caseId, task) {
  const c = task.case || {};
  const initials = (c.retailer || '??').split(' ').slice(0,2).map(w => w[0] || '').join('').toUpperCase();
  const bodyHtml = (task.bodyText || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  return `
    <div class="wf-email-card">
      <div class="wf-email-header" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--border-light)">
        <div class="wf-email-avatar" style="background:#1d4ed8;border-radius:9px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">${initials}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${c.retailer} — Deductions Team</div>
          <div style="font-size:11px;color:var(--text-muted)">${task.to}</div>
        </div>
        <span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted);flex-shrink:0">send</span>
      </div>
      <div style="padding:8px 14px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;font-weight:600;color:var(--text-muted);white-space:nowrap">Subject</span>
        <input class="wf-email-subject" type="text" value="${task.subject}" style="flex:1;border:none;background:none;font-size:12px;font-family:inherit;outline:none;color:var(--text-primary);font-weight:500">
      </div>
      <div style="padding:12px 14px;max-height:220px;overflow-y:auto;border-bottom:1px solid var(--border-light)">
        <div class="wf-email-body" contenteditable="true" style="font-size:12px;line-height:1.7;outline:none;white-space:pre-wrap;font-family:inherit;min-height:80px;color:var(--text-primary)">${bodyHtml}</div>
      </div>
      <div class="wf-form-card-footer">
        <button class="wf-reject-btn">Decline</button>
        <button class="wf-approve-btn" onclick="approveWfCard(this,'${caseId}','billback','send','billback')">
          <span class="material-symbols-outlined" style="font-size:14px">send</span> Approve &amp; Send
        </button>
      </div>
    </div>`;
}

function _wfRowDecide(caseId, sku, decision) {
  if (!_wfRowDecisions[caseId]) _wfRowDecisions[caseId] = {};
  // Toggle off if same decision clicked again
  _wfRowDecisions[caseId][sku] = _wfRowDecisions[caseId][sku] === decision ? null : decision;
  const dec = _wfRowDecisions[caseId][sku];
  // Update row highlight
  const row  = document.getElementById(`wf-flagrow-${caseId}-${sku}`);
  const meta = document.getElementById(`wf-flagmeta-${caseId}-${sku}`);
  [row, meta].forEach(el => {
    if (!el) return;
    el.classList.toggle('row-accepted', dec === 'accept');
    el.classList.toggle('row-disputed', dec === 'dispute');
  });
  // Update button active states
  if (meta) {
    meta.querySelector('.wf-row-accept-btn')?.classList.toggle('active', dec === 'accept');
    meta.querySelector('.wf-row-dispute-btn')?.classList.toggle('active', dec === 'dispute');
  }
  _wfUpdateDecisionProgress(caseId);
}

function _wfUpdateDecisionProgress(caseId) {
  const tasks  = _activeWfTasksObj()[caseId] || [];
  const task   = tasks.find(t => t.type === 'deduction-validation');
  const flagged = (task?.items || []).filter(i => i.needsReview);
  const decs   = _wfRowDecisions[caseId] || {};
  const done   = flagged.filter(i => decs[i.sku]).length;
  const total  = flagged.length;
  const prog   = document.getElementById(`wf-ded-progress-${caseId}`);
  const btn    = document.getElementById(`wf-ded-submit-${caseId}`);
  if (prog) prog.innerHTML = `<strong>${done} of ${total}</strong> decisions made`;
  if (btn) {
    const allDone = done === total && total > 0;
    btn.disabled = !allDone;
    btn.style.opacity = allDone ? '1' : '0.45';
    btn.style.pointerEvents = allDone ? '' : 'none';
  }
}

function _toggleWfPartial(caseId) {
  const row = document.getElementById(`wf-partial-row-${caseId}`);
  if (row) row.classList.toggle('visible');
}

function _submitWfPartialApproval(caseId) {
  const input = document.getElementById(`wf-partial-amount-${caseId}`);
  const amount = input ? input.value.trim() : '';
  if (!amount) { showToast('Enter an amount to confirm partial approval'); return; }
  const btn = document.querySelector(`#wf-partial-row-${caseId} .wf-approve-btn`);
  if (btn) approveWfCard(btn, caseId, 'deduction-validation', 'partial', 'deduction-validation');
  showToast(`Partial approval of ${amount} submitted`);
}

function _wfUpdateKPIs() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const isOnMe = _wfSegFilter === 'on-me';
  const defaultGrp = document.getElementById('wf-kpis-default');
  const onMeGrp    = document.getElementById('wf-kpis-onme');
  if (defaultGrp) defaultGrp.style.display = isOnMe ? 'none' : 'contents';
  if (onMeGrp)    onMeGrp.style.display    = isOnMe ? 'flex'  : 'none';

  const allCases = _activeWfCases();

  if (!isOnMe) {
    // Demo numbers — would come from backend in production
    set('wf-kpi-total',    600);
    set('wf-kpi-solved',   431);
    set('wf-kpi-progress', 32);
    set('wf-kpi-queue',    150);
  } else {
    // Demo numbers — would come from backend in production
    const total      = 140;
    const completed  = 105;
    const inProgress = 0;
    const waitForMe  = 35;
    // Progress bar flex values
    const setFlex = (id, val) => { const el = document.getElementById(id); if (el) el.style.flex = String(Math.max(val, 0)); };
    setFlex('wf-kpi-onme-seg-completed', completed);
    setFlex('wf-kpi-onme-seg-progress',  inProgress);
    setFlex('wf-kpi-onme-seg-wait',      Math.max(waitForMe, 1));
    set('wf-kpi-onme-total',          total);
    set('wf-kpi-onme-waittoday',      waitForMe);
    set('wf-kpi-onme-completedtoday', waitForMe);
  }
}

// ── Work Feed pagination ──────────────────────────────────────────────────────
function _wfRenderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / _wfItemsPerPage));
  _wfLastTotalPages = totalPages;
  const start = totalItems === 0 ? 0 : (_wfCurrentPage - 1) * _wfItemsPerPage + 1;
  const end   = Math.min(_wfCurrentPage * _wfItemsPerPage, totalItems);
  const countText = totalItems === 0 ? '0 of 0' : `${start}–${end} of ${totalItems}`;

  // Update table bar
  const countEl = document.getElementById('wf-pg-count');
  const valEl   = document.getElementById('wf-pg-per-page-val');
  if (countEl) countEl.textContent = countText;
  if (valEl)   valEl.textContent   = _wfItemsPerPage;
  document.querySelectorAll('#wf-pg-per-page-menu .pg-per-page-opt').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === _wfItemsPerPage);
  });

  // Update feed bar
  const feedCountEl = document.getElementById('wf-feed-pg-count');
  const feedValEl   = document.getElementById('wf-feed-pg-per-page-val');
  if (feedCountEl) feedCountEl.textContent = countText;
  if (feedValEl)   feedValEl.textContent   = _wfItemsPerPage;
  document.querySelectorAll('#wf-feed-pg-per-page-menu .pg-per-page-opt').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === _wfItemsPerPage);
  });

  const first = _wfCurrentPage === 1;
  const last  = _wfCurrentPage === totalPages;
  const pages = buildPageSequence(_wfCurrentPage, totalPages);
  const navHtml = (goFn) =>
    `<button class="pg-nav-btn" onclick="${goFn}(1)" ${first?'disabled':''} title="First page">
       <span class="material-symbols-outlined">first_page</span>
     </button>
     <button class="pg-nav-btn" onclick="${goFn}(${_wfCurrentPage-1})" ${first?'disabled':''} title="Previous">
       <span class="material-symbols-outlined">chevron_left</span>
     </button>
     ${pages.map(p => p === '...'
       ? `<button class="pg-ellipsis" disabled><span class="material-symbols-outlined">more_horiz</span></button>`
       : `<button class="pg-page-btn${p===_wfCurrentPage?' active':''}" onclick="${goFn}(${p})">${p}</button>`
     ).join('')}
     <button class="pg-nav-btn" onclick="${goFn}(${_wfCurrentPage+1})" ${last?'disabled':''} title="Next">
       <span class="material-symbols-outlined">chevron_right</span>
     </button>
     <button class="pg-nav-btn" onclick="${goFn}(${totalPages})" ${last?'disabled':''} title="Last page">
       <span class="material-symbols-outlined">last_page</span>
     </button>`;

  const controls     = document.getElementById('wf-pg-controls');
  const feedControls = document.getElementById('wf-feed-pg-controls');
  if (controls)     controls.innerHTML     = navHtml('wfGoToPage');
  if (feedControls) feedControls.innerHTML = navHtml('wfGoToPage');
}

function wfGoToPage(page) {
  if (page < 1 || page > _wfLastTotalPages) return;
  _wfCurrentPage = page;
  if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}

function wfChangeItemsPerPage(n) {
  _wfItemsPerPage = n;
  _wfCurrentPage  = 1;
  const menu = document.getElementById('wf-pg-per-page-menu');
  if (menu) menu.classList.add('hidden');
  renderWorkFeedTable();
}

function wfTogglePerPageMenu(e) {
  e.stopPropagation();
  document.getElementById('wf-pg-per-page-menu').classList.toggle('hidden');
}

// Feed-panel per-page helpers (mirror the table ones but re-render feed)
function wfFeedChangeItemsPerPage(n) {
  _wfItemsPerPage = n;
  _wfCurrentPage  = 1;
  const menu = document.getElementById('wf-feed-pg-per-page-menu');
  if (menu) menu.classList.add('hidden');
  renderWorkFeedList();
}

function wfFeedTogglePerPageMenu(e) {
  e.stopPropagation();
  document.getElementById('wf-feed-pg-per-page-menu').classList.toggle('hidden');
}

function renderWorkFeedPage() {
  _wfUpdateKPIs();
  if (wfTableMode) {
    renderWfTableHeader();
    renderWorkFeedTable();
  } else {
    renderWorkFeedList();
    renderWorkFeedSolver(activeWorkFeedCase);
    renderWorkFeedCasey(activeWorkFeedCase);
  }
}

function renderAllWorkPage() {
  const el = document.getElementById('aw-kpi-total');
  if (el) el.textContent = _activeWorkflows().length;
  renderAllWorkTable();
}
function renderAllWorkTable() {
  const tbody = document.getElementById('aw-tbl-tbody');
  if (!tbody) return;
  const data = _activeWorkflows();
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px">No workflows found</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(w => `
    <tr>
      <td data-col="wfId">${w.wfId}</td>
      <td data-col="wfName">${w.wfName}</td>
      <td data-col="createdDate">${w.createdDate}</td>
      <td data-col="updatedDate">${w.updatedDate}</td>
      <td data-col="ownedBy">${w.ownedBy ? `<span class="wf-user-cell">${_activeUserAvatarHtml(w.ownedBy,'sm')}<span>${w.ownedBy}</span></span>` : '<span class="wf-muted">—</span>'}</td>
      <td class="row-actions-cell"></td>
    </tr>`).join('');
}

function renderWorkflowsTable() {
  const tbody = document.getElementById('wf-tbl-tbody');
  if (!tbody) return;
  const data = _activeWorkflows();
  // Apply any active column header filters
  let rows = [...data];
  Object.entries(_wfColFilters).forEach(([col, vals]) => {
    if (!vals || vals.size === 0) return;
    rows = rows.filter(w => vals.has(w[col] || ''));
  });
  // Apply sort rules
  const { sortRules } = _wfActiveCols();
  if (sortRules && sortRules.length) {
    rows.sort((a, b) => {
      for (const r of sortRules) {
        const av = a[r.field] != null ? String(a[r.field]) : '';
        const bv = b[r.field] != null ? String(b[r.field]) : '';
        const n  = av.localeCompare(bv, undefined, { numeric: true });
        if (n !== 0) return r.dir === 'asc' ? n : -n;
      }
      return 0;
    });
  }
  const { order, hidden } = _wfActiveCols();
  const visibleCols = order.filter(c => !hidden.has(c.key));
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="${visibleCols.length + 1}" style="text-align:center;padding:40px;color:var(--text-muted);font-size:13px">No workflows found</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(w => {
    const cells = visibleCols.map(col => {
      let content = '';
      if (col.key === 'ownedBy') {
        content = w.ownedBy
          ? `<span class="wf-user-cell">${_activeUserAvatarHtml(w.ownedBy, 'sm')}<span>${w.ownedBy}</span></span>`
          : '<span class="wf-muted">—</span>';
      } else {
        content = w[col.key] != null ? String(w[col.key]) : '—';
      }
      return `<td data-col="${col.key}">${content}</td>`;
    }).join('');
    const checkTd = `<td style="padding:0 8px;text-align:center;vertical-align:middle"><input type="checkbox" class="wf-row-cb" data-id="${w.wfId}"></td>`;
    return `<tr>${checkTd}${cells}<td class="row-actions-cell"></td></tr>`;
  }).join('');
}

function renderWorkFeedList() {
  const list = document.getElementById('wf-feed-list');
  if (!list) return;
  let data = (typeof _wfFilteredData === 'function') ? [..._wfFilteredData()] : [...workFeedData];
  // Apply toolbar sort rules when set, otherwise default card ordering
  const { sortRules: _feedSortRules } = _wfActiveCols();
  if (_feedSortRules && _feedSortRules.length) {
    data.sort((a, b) => {
      for (const r of _feedSortRules) {
        if (!r.field) continue;
        const av = a[r.field] != null ? String(a[r.field]) : '';
        const bv = b[r.field] != null ? String(b[r.field]) : '';
        const n  = av.localeCompare(bv, undefined, { numeric: true });
        if (n !== 0) return r.dir === 'asc' ? n : -n;
      }
      return 0;
    });
  } else {
    // default: tasks first, then priority (High → Medium → Low)
    data.sort((a, b) => {
      const aTask = a.type === 'task' ? 0 : 1;
      const bTask = b.type === 'task' ? 0 : 1;
      if (aTask !== bTask) return aTask - bTask;
      return (_WF_PRIORITY_ORDER[a.priority] ?? 3) - (_WF_PRIORITY_ORDER[b.priority] ?? 3);
    });
  }
  function _buildCard(c) {
    const isActive       = c.id === activeWorkFeedCase;
    const isTask         = c.type === 'task';
    const isDed          = !isTask && c.retailer != null;
    const fetched        = _fetchedCases[c.id];
    const fetchedByMe    = fetched === _currentUser;
    const fetchedByOther = fetched && !fetchedByMe;

    const cardIcon  = isTask ? c.agentIcon : (isDed ? 'receipt_long' : 'inventory_2');
    const cardName  = isTask ? c.agent     : c.id;
    const cardDesc  = isTask
      ? `<span class="wf-card-stage-tag"><span class="material-symbols-outlined">${c.needIcon || 'smart_toy'}</span>${c.need}</span>`
      : c.stage;
    const _caseTasks = _activeWfTasksObj()[c.id] || [];
    const _realTaskCount = isTask ? c.items.length : (_caseTasks.reduce((sum, t) => sum + (t.docs ? t.docs.length : 1), 0) || c.tasks || 0);
    const cardCount = isTask
      ? `${_realTaskCount} Item${_realTaskCount !== 1 ? 's' : ''}`
      : `${_realTaskCount} Task${_realTaskCount !== 1 ? 's' : ''}`;
    const badgeClass = c.status === 'intervention' ? 'intervention' : '';

    // Avatar — shows who has the case (no action overlay; pill handles actions now)
    const avatarHtml = (fetchedByMe || fetchedByOther)
      ? `<span class="wf-card-avatar-wrap" title="${fetchedByMe ? 'Fetched by you' : 'Fetched by ' + fetched}">${_activeUserAvatarHtml(fetched, 'sm')}</span>`
      : '';

    const openFn = fetchedByOther ? `openWfCaseReadOnly('${c.id}')` : `openWfCaseTab('${c.id}')`;
    return `<div class="wf-feed-card${isActive ? ' active' : ''}${fetchedByOther ? ' wf-taken' : ''}" data-id="${c.id}" onclick="selectWorkFeedCase('${c.id}')">
      <input type="checkbox" class="wf-card-cb" onclick="event.stopPropagation();_wfCardCbClick(event,this)">
      <div class="wf-card-top">
        <span class="material-symbols-outlined wf-card-icon">${cardIcon}</span>
        <span class="wf-card-id${isTask ? ' wf-card-id-ai' : ''}">${cardName}</span>
        <button class="wf-card-open-btn" onclick="event.stopPropagation();${openFn}" title="Open in new tab"><span class="material-symbols-outlined">open_in_new</span></button>
      </div>
      <div class="wf-card-desc">${cardDesc}</div>
      <div class="wf-card-bottom">
        <span class="wf-card-badge ${badgeClass}">${cardCount}</span>
        <div class="wf-card-actions">${avatarHtml}</div>
      </div>
    </div>`;
  }

  // Paginate the feed list using the same state as the table view
  const _feedTotal = data.length;
  const _feedMaxPage = Math.max(1, Math.ceil(_feedTotal / _wfItemsPerPage));
  if (_wfCurrentPage > _feedMaxPage) _wfCurrentPage = _feedMaxPage;
  _wfRenderPagination(_feedTotal);
  data = data.slice((_wfCurrentPage - 1) * _wfItemsPerPage, _wfCurrentPage * _wfItemsPerPage);

  list.innerHTML = data.map(_buildCard).join('');

  // Restore persisted checkbox selections after DOM rebuild
  if (_wfCheckedIds.size) {
    list.querySelectorAll('.wf-feed-card').forEach(card => {
      if (_wfCheckedIds.has(card.dataset.id)) {
        const cb = card.querySelector('.wf-card-cb');
        if (cb) cb.checked = true;
      }
    });
    _wfOnCardCheck();
  }
}

let _wfLastCheckedIdx = null;   // anchor for shift-range selection
const _wfCheckedIds   = new Set(); // persists checked card IDs across re-renders

function _wfCardCbClick(event, cb) {
  const list = document.getElementById('wf-feed-list');
  if (!list) return;
  const allCbs = [...list.querySelectorAll('.wf-card-cb')];
  const currentIdx = allCbs.indexOf(cb);

  if (event.shiftKey && _wfLastCheckedIdx !== null && currentIdx !== _wfLastCheckedIdx) {
    // Fill the range between anchor and current with the current checked state
    const start  = Math.min(_wfLastCheckedIdx, currentIdx);
    const end    = Math.max(_wfLastCheckedIdx, currentIdx);
    const target = cb.checked;
    for (let i = start; i <= end; i++) {
      allCbs[i].checked = target;
      const id = allCbs[i].closest('.wf-feed-card')?.dataset?.id;
      if (id) { if (target) _wfCheckedIds.add(id); else _wfCheckedIds.delete(id); }
    }
  } else {
    // Normal click — update anchor and persist
    _wfLastCheckedIdx = currentIdx;
    const id = cb.closest('.wf-feed-card')?.dataset?.id;
    if (id) { if (cb.checked) _wfCheckedIds.add(id); else _wfCheckedIds.delete(id); }
  }

  _wfOnCardCheck();
}

function _wfOnCardCheck() {
  const list        = document.getElementById('wf-feed-list');
  const bar         = document.getElementById('wf-feed-bulk-bar');
  const countEl     = document.getElementById('wf-feed-bulk-count');
  const placeholder = document.getElementById('wf-bulk-placeholder');
  const phCount     = document.getElementById('wf-bulk-placeholder-count');
  const feedPgBar   = document.getElementById('wf-feed-pagination-bar');
  const solver      = document.querySelector('#wf-split-view .wf-solver');
  if (!list) return;
  const checked = list.querySelectorAll('.wf-card-cb:checked');
  const n = checked.length;
  const label = n === 1 ? '1 item selected' : `${n} items selected`;
  const bulkActive = n > 0;
  list.classList.toggle('wf-bulk-mode', bulkActive);
  if (bar)     bar.classList.toggle('visible', bulkActive);
  if (countEl) countEl.textContent = n === 1 ? '1 selected' : `${n} selected`;
  if (solver)  solver.classList.toggle('bulk-locked', bulkActive);
  // Swap pagination ↔ bulk bar below the panel
  if (feedPgBar && !wfTableMode) feedPgBar.style.display = bulkActive ? 'none' : '';
}

function _wfClearBulk() {
  const list = document.getElementById('wf-feed-list');
  if (!list) return;
  list.querySelectorAll('.wf-card-cb').forEach(cb => cb.checked = false);
  _wfCheckedIds.clear();
  _wfLastCheckedIdx = null;
  _wfOnCardCheck();
}

function _wfBulkAction(action) {
  const list = document.getElementById('wf-feed-list');
  if (!list) return;
  const ids = [...list.querySelectorAll('.wf-card-cb:checked')].map(cb => cb.closest('.wf-feed-card')?.dataset?.id).filter(Boolean);
  if (!ids.length) return;
  if (action === 'fetch')      ids.forEach(id => fetchCaseFromList(id));
  if (action === 'assign')     wfBulkAssign();
  if (action === 'reallocate') wfBulkReallocate();
  _wfClearBulk();
}

function selectWorkFeedCase(id) {
  activeWorkFeedCase = id;
  renderWorkFeedList();
  renderWorkFeedSolver(id);  // updates breadcrumb + stage badge + task tabs + body
  renderWorkFeedCasey(id);
  _renderWfFetchBtn(id);
  const cr = document.getElementById('wf-case-ref');
  if (cr) cr.innerHTML = `<span class="material-symbols-outlined" style="font-size:11px">inbox</span>${id}<span class="material-symbols-outlined" style="font-size:11px">expand_more</span>`;
}

// ── Shared task section builder (split view + tab view) ──────────────────────
function _wfSec(key, title, desc, bodyHtml, startCollapsed = false) {
  return `
    <div class="wf-task-sec${startCollapsed ? ' minimized' : ''}" id="wf-ts-${key}">
      <div class="wf-task-sec-header" onclick="_toggleWfTaskSec('${key}')">
        <div class="case-section-toggle${startCollapsed ? ' collapsed' : ''}" id="wf-ts-tog-${key}">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
        <div class="case-section-labels">
          <div class="case-section-title">${title}</div>
          <div class="case-section-desc">${desc}</div>
        </div>
      </div>
      <div class="wf-task-sec-divider" id="wf-ts-div-${key}"${startCollapsed ? ' style="display:none"' : ''}></div>
      <div class="wf-task-sec-body" id="wf-ts-body-${key}"${startCollapsed ? ' style="display:none"' : ''}>${bodyHtml}</div>
    </div>`;
}

function _toggleWfTaskSec(secId) {
  const body    = document.getElementById(`wf-ts-body-${secId}`);
  const divider = document.getElementById(`wf-ts-div-${secId}`);
  const toggle  = document.getElementById(`wf-ts-tog-${secId}`);
  const section = document.getElementById(`wf-ts-${secId}`);
  if (!body) return;
  const willHide = body.style.display !== 'none';
  body.style.display    = willHide ? 'none' : '';
  if (divider) divider.style.display = willHide ? 'none' : '';
  if (toggle)  toggle.classList.toggle('collapsed', willHide);
  if (section) section.classList.toggle('minimized', willHide);
}

function _buildWfTaskBody(task, ctx) {
  // ctx: 'solver' (split) | 'tab' (case-page tab)
  const allItems   = task.items || [];
  const actions    = _WF_TASK_ITEM_ACTIONS[task.agent] || [];
  const toggleItem = ctx === 'solver' ? '_toggleWfTaskItem' : '_toggleWfTaskInPage';
  const resolveCtx = ctx === 'solver' ? 'solver' : 'tab';

  const actionsHtml = actions.map(a =>
    `<button class="wf-item-action-btn${a.primary ? ' primary' : ''}" onclick="event.stopPropagation()">
       <span class="material-symbols-outlined">${a.icon}</span>${a.label}
     </button>`
  ).join('');

  const itemsHtml = allItems.map((item, idx) => {
    const key  = `${task.id}-${idx}`;
    const open = !!_wfTaskItemOpen[key];
    return `<div class="wf-task-panel-item${open ? ' open' : ''}" onclick="${toggleItem}('${task.id}',${idx})" style="margin-bottom:6px">
      <div class="wf-task-panel-item-row"><span class="material-symbols-outlined">chevron_right</span>${item}</div>
      <div class="wf-task-panel-item-actions">${actionsHtml}</div>
    </div>`;
  }).join('') || `<p style="font-size:12px;color:var(--text-muted);margin:0">No action items.</p>`;

  const metaFields = [
    { label: 'Agent',    val: task.agent    || '—' },
    { label: 'Need',     val: task.need     || '—' },
    { label: 'Priority', val: task.priority || 'Normal' },
    { label: 'Task ID',  val: task.id },
  ].map(f => `
    <div style="display:flex;flex-direction:column;gap:2px">
      <span style="font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.4px">${f.label}</span>
      <span style="font-size:13px;color:var(--text-primary);font-weight:500">${f.val}</span>
    </div>`).join('');

  return `
    ${_wfSec('overview', 'Task Overview', `${task.agent || 'Agent'} · ${task.need || 'Needs attention'}`, `
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0 0 14px">${task.summary}</p>
      <div style="display:flex;gap:20px;flex-wrap:wrap">${metaFields}</div>
    `)}
    ${_wfSec('items', `Action Items (${allItems.length})`, 'Items requiring your attention', `
      <div id="wf-task-items-${task.id}">${itemsHtml}</div>
    `)}
    ${_wfSec('resolution', 'Resolution', 'Mark this task complete or dismiss it', `
      <div class="wf-task-panel-actions" style="padding:0">
        <button class="wf-task-resolve-btn" onclick="_resolveWfTask('${task.id}','${resolveCtx}')">
          <span class="material-symbols-outlined">check_circle</span> Mark as resolved
        </button>
        <button class="wf-task-dismiss-btn" onclick="_dismissWfTask('${task.id}','${resolveCtx}')">
          <span class="material-symbols-outlined">close</span> Dismiss
        </button>
      </div>
    `)}`;
}

function _renderWfTaskSolver(task) {
  // Switch solver into task mode (CSS hides case-specific chrome)
  document.querySelector('.wf-solver')?.classList.add('wf-task-mode');
  // Restore header if it was hidden by empty state
  const _wfHeader = document.getElementById('wf-case-header');
  if (_wfHeader) _wfHeader.style.display = '';
  // Hide case-only header rows
  const _wfFooter = document.getElementById('wf-case-header-footer');
  if (_wfFooter) _wfFooter.style.height = '0';
  const _custItem = document.getElementById('wf-customer-item');
  if (_custItem) _custItem.style.display = 'none';
  const _custSep = document.getElementById('wf-customer-sep');
  if (_custSep) _custSep.style.display = 'none';

  // Row 1: show agent name, update icon
  const bc = document.getElementById('wf-solver-breadcrumb');
  if (bc) bc.textContent = task.agent;
  const icon = document.querySelector('#case-page .wf-case-icon, .wf-solver .wf-case-icon');
  if (icon) icon.textContent = task.agentIcon;

  // Task need row (replaces stage row)
  const needIcon = document.getElementById('wf-task-need-icon');
  const needLabel = document.getElementById('wf-task-need-label');
  if (needIcon) needIcon.textContent = task.needIcon;
  if (needLabel) needLabel.textContent = 'Needs: ' + task.need;

  _renderWfFetchBtn(task.id);

  // Render task detail panel in solver body
  const body = document.getElementById('wf-solver-body');
  if (!body) return;
  body.innerHTML = `<div style="padding:20px 24px;overflow-y:auto;flex:1">${_buildWfTaskBody(task, 'solver')}</div>`;
  _applyWfSolverLock(task.id);
}

function _toggleWfTaskItem(taskId, idx) {
  const key = `${taskId}-${idx}`;
  _wfTaskItemOpen[key] = !_wfTaskItemOpen[key];
  const isDeduction = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';
  const task = isDeduction
    ? _deductionWfData.find(d => d.id === taskId && d.type === 'task')
    : (generalTasksData || []).find(t => t.id === taskId);
  if (task) _renderWfTaskSolver(task);
}

function _toggleWfTaskItems(taskId) {
  _wfTaskItemsExpanded[taskId] = !_wfTaskItemsExpanded[taskId];
  const isDeduction = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';
  const task = isDeduction
    ? _deductionWfData.find(d => d.id === taskId && d.type === 'task')
    : (generalTasksData || []).find(t => t.id === taskId);
  if (task) _renderWfTaskSolver(task);
}

function _wfSolverShowEmptyState() {
  document.querySelector('.wf-solver')?.classList.remove('wf-task-mode');
  const header = document.getElementById('wf-case-header'); if (header) header.style.display = 'none';
  const tabsWrap = document.getElementById('wf-task-tabs-wrap'); if (tabsWrap) tabsWrap.innerHTML = '';
  const body = document.getElementById('wf-solver-body');
  if (body) body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;color:var(--text-muted)">
      <span class="material-symbols-outlined" style="font-size:40px;opacity:0.2">inbox</span>
      <span style="font-size:13px">Select a case from the list</span>
    </div>`;
}

function renderWorkFeedSolver(caseId) {
  const isDeduction = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';
  // Check if it's a global agent task (works for both Cora and Deduction solutions)
  const taskData = isDeduction
    ? _deductionWfData.find(d => d.id === caseId && d.type === 'task')
    : generalTasksData.find(t => t.id === caseId);
  if (taskData) { _renderWfTaskSolver(taskData); return; }

  // Restore case mode: remove task mode class
  document.querySelector('.wf-solver')?.classList.remove('wf-task-mode');

  // Update case ID label
  const bc = document.getElementById('wf-solver-breadcrumb');
  if (bc) bc.textContent = caseId;
  // Update icon
  const icon = document.querySelector('#wf-case-header .wf-case-icon');
  if (icon) icon.textContent = isDeduction ? 'receipt_long' : 'inventory_2';
  // Update stage badge + name + status
  const caseData = _activeWfCases().find(c => c.id === caseId);
  if (!caseData) { _wfSolverShowEmptyState(); return; }
  // Restore header if it was hidden by empty state
  const _wfHeader = document.getElementById('wf-case-header');
  if (_wfHeader) _wfHeader.style.display = '';
  const sb = document.getElementById('wf-stage-badge');
  if (sb && caseData) sb.textContent = caseData.tasks;
  const sn = document.getElementById('wf-stage-name');
  if (sn && caseData) sn.textContent = caseData.stage || '—';
  const st = document.getElementById('wf-status-text');
  const _wfStatusLabel = { intervention: 'Awaiting human', running: 'In progress', awaiting: 'Awaiting human', failed: 'Failed', completed: 'Completed' };
  if (st && caseData) st.textContent = _wfStatusLabel[caseData.status] || caseData.status || '—';
  // Customer name (row 1)
  const custEl = document.getElementById('wf-customer-text');
  if (custEl) custEl.textContent = caseData?.customer || caseData?.retailer || '—';
  const custItem = document.getElementById('wf-customer-item');
  if (custItem) custItem.style.display = '';
  const custSep = document.getElementById('wf-customer-sep');
  if (custSep) custSep.style.display = '';
  // Footer metadata strip
  const _wfFooter = document.getElementById('wf-case-header-footer');
  if (_wfFooter) _wfFooter.style.height = '';  // let CSS hover handle it; restore from task-mode hide
  const _priorityColor = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' };
  const _setWfChf = (id, val, color) => {
    const el = document.getElementById(id); if (!el) return;
    el.textContent = val || '—';
    el.style.color = color || '';
  };
  _setWfChf('wf-chf-created',  caseData?.created  || caseData?.claimDate || '—');
  _setWfChf('wf-chf-priority', caseData?.priority || '—', _priorityColor[caseData?.priority] || '');
  _setWfChf('wf-chf-category', caseData?.category || caseData?.deductionType || '—');
  _setWfChf('wf-chf-type',     caseData?.caseType || '—');
  _setWfChf('wf-chf-subtype',  caseData?.subtype  || '—');
  // Close stage popover if open from previous case
  _closeWfStagePopover();
  // Render task tabs + body
  _renderWfTaskTabs(caseId);
  _renderWfTaskBody(caseId);
  _renderWfFetchBtn(caseId);
  _applyWfSolverLock(caseId);
}

function _renderWfTaskTabs(caseId) {
  const wrap = document.getElementById('wf-task-tabs-wrap');
  if (!wrap) return;
  const tasks = _activeWfTasksObj()[caseId];
  if (!tasks || !tasks.length) { wrap.innerHTML = ''; return; }
  if (!activeWorkFeedTask[caseId]) activeWorkFeedTask[caseId] = tasks[0].id;
  const activeId = activeWorkFeedTask[caseId];
  wrap.innerHTML = `<div class="segmented-btn" style="height:30px;width:fit-content">` +
    tasks.map(t => `
      <button class="${t.id === activeId ? 'active' : ''}"
              onclick="selectWorkFeedTask('${caseId}','${t.id}')" style="font-size:12px;padding:0 12px;display:inline-flex;align-items:center;gap:6px">
        ${t.icon ? `<span class="material-symbols-outlined" style="font-size:13px">${t.icon}</span>` : ''}
        ${t.label}
        <span style="display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 4px;border-radius:9px;font-size:10px;font-weight:600;background:rgba(255,255,255,0.25);color:inherit">${t.count}</span>
      </button>`).join('') +
    `</div>`;
}

function selectWorkFeedTask(caseId, taskId) {
  activeWorkFeedTask[caseId] = taskId;
  _renderWfTaskTabs(caseId);
  _renderWfTaskBody(caseId);
  _applyWfSolverLock(caseId);
  // When entering comparison tab for the first time, Casey explains the supervisor check
  if (taskId === 'comparison' && !_wfComparisonHandoffSent) {
    _wfComparisonHandoffSent = true;
    _appendWfComparisonHandoffMessage();
  }
  // Update the footer pill (Receiver → Viewer)
  _renderAiFooter();
}

function _renderWfTaskBody(caseId) {
  const body = document.getElementById('wf-solver-body');
  if (!body) return;
  const tasks = _activeWfTasksObj()[caseId];
  const taskId = activeWorkFeedTask[caseId];
  const task = tasks?.find(t => t.id === taskId);

  if (!task) {
    body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px">Select a case to view details</div>`;
    return;
  }

  const _taskWrap = (sections) =>
    `<div style="padding:20px 24px;overflow-y:auto;flex:1">${sections}</div>`;
  const _ovSec = (heading, desc) =>
    _wfSec('t-overview', heading, 'Task overview',
      `<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0">${desc}</p>`, true);

  if (task.type === 'auth-credential') {
    const heading = task.heading || 'Intervention Required: Authentication Needed';
    const desc = task.desc || 'Casey has paused because vendor portals require active credentials. Review and approve or reject each request below.';
    body.innerHTML = _taskWrap(
      _ovSec(heading, desc) +
      _wfSec('t-content', 'Credentials', 'Approve or reject each authentication request',
        (task.cards || []).map(c => _wfFormCard({ caseId, taskId: task.id, ...c })).join('')));
  } else if (task.type === 'email-approval') {
    const heading = task.heading || 'Review Required: Outbound Customer Emails';
    const desc = task.desc || 'The Communicator has drafted emails to customers with missing data. Review each email and approve to send.';
    body.innerHTML = _taskWrap(
      _ovSec(heading, desc) +
      _wfSec('t-content', 'Email Drafts', 'Review and approve each outbound email',
        (task.emails || []).map(e => _wfEmailCard({ caseId, taskId: task.id, ...e })).join('')));
  } else if (task.type === 'comparison') {
    body.innerHTML = _taskWrap(
      _ovSec('Authorization Required: Invoice Payment',
        'Casey has retrieved Invoice #INV-2024-0891 and extracted the data below. Verify the fields against the invoice document and authorize payment to continue.') +
      _wfSec('t-content', 'Invoice Verification', 'Verify fields and authorize payment',
        _wfComparisonCard({ caseId, taskId: task.id })));
  } else if (task.type === 'eyeball') {
    body.innerHTML = _taskWrap(
      _ovSec(task.heading, task.desc) +
      _wfSec('t-content', 'Review Items', 'Approve or flag each item',
        _wfEyeballCard(caseId, task)));
  } else if (task.type === 'deduction-validation') {
    body.innerHTML = _taskWrap(
      _ovSec(task.heading, task.desc) +
      _wfSec('t-content', 'Deduction Validation', 'All fields pre-filled by agent — review, adjust if needed, then submit',
        _dedCombinedValidationCard(caseId, task)));
    setTimeout(() => _dedApplyInlinePins(`ded-val-tbl-${caseId}`), 0);
  } else if (task.type === 'billback') {
    body.innerHTML = _taskWrap(
      _ovSec(task.heading, task.desc) +
      _wfSec('t-content', 'Billback Details', 'Review and approve billback items',
        _wfBillbackCard(caseId, task)));
  }
}

function _wfFormCard({ caseId, taskId, vendorLabel, vendorKey, invoiceId, authType, dstClass, dstInitials, desc, fields, otp, captcha, investigation }) {
  const fieldsHtml = (fields || []).map(f => `
    <div class="wf-cred-field">
      <span class="wf-cred-label">${f.label}:</span>
      <input class="wf-cred-input" type="${f.type}" value="${f.value}" readonly>
    </div>`).join('');
  const otpHtml = otp ? `
    <div class="wf-otp-label">6 digit code</div>
    <div class="wf-otp-grid">
      ${Array(6).fill(0).map((_,i) => `<input class="wf-otp-box" type="text" maxlength="1" inputmode="numeric"
        oninput="this.value=this.value.replace(/\\D/,'');if(this.value&&this.nextElementSibling)this.nextElementSibling.focus();">`).join('')}
    </div>` : '';
  // CAPTCHA tiles: 9 tiles, target = traffic lights (indices 1,4,6)
  const _captchaTiles = [
    { icon: 'directions_car',   bg: '#64748b', target: false },
    { icon: 'traffic',          bg: '#16a34a', target: true  },
    { icon: 'pedal_bike',       bg: '#0369a1', target: false },
    { icon: 'local_shipping',   bg: '#9333ea', target: false },
    { icon: 'traffic',          bg: '#15803d', target: true  },
    { icon: 'directions_walk',  bg: '#b45309', target: false },
    { icon: 'traffic',          bg: '#166534', target: true  },
    { icon: 'directions_bus',   bg: '#0c4a6e', target: false },
    { icon: 'two_wheeler',      bg: '#7c3aed', target: false },
  ];
  const captchaHtml = captcha ? `
    <div class="wf-captcha-prompt">Select all images with <strong>traffic lights</strong></div>
    <div class="wf-captcha-grid">
      ${_captchaTiles.map(t => `
        <div class="wf-captcha-tile" style="background:${t.bg}" onclick="this.classList.toggle('selected')">
          <span class="material-symbols-outlined">${t.icon}</span>
        </div>`).join('')}
    </div>` : '';
  // Auto-generate investigation context if not explicitly provided
  if (!investigation) {
    if (authType === 'Account login') {
      investigation = {
        trigger: `Session expired — re-authentication required`,
        reason: `The Retriever agent was actively navigating the ${vendorLabel} portal when the session token was invalidated. The portal displayed a login wall, blocking the agent from continuing the current task.`,
        agentStep: 'Accessing vendor portal — credentials required',
        screenshotType: 'session-timeout',
        screenshotMeta: { vendor: vendorLabel, url: `portal.${vendorLabel.toLowerCase().replace(/\s+/g,'-')}.com` }
      };
    } else if (authType === '2FA authentication') {
      investigation = {
        trigger: `2FA challenge triggered after credentials accepted`,
        reason: `The Retriever agent submitted stored credentials for ${vendorLabel}. The portal accepted them but immediately required a second-factor verification code sent to the registered email before granting access.`,
        agentStep: 'Completing portal authentication — 2FA required',
        screenshotType: '2fa',
        screenshotMeta: { vendor: vendorLabel, url: `app.${vendorLabel.toLowerCase().replace(/\s+/g,'-')}.com/verify` }
      };
    } else if (authType === 'CAPTCHA verification') {
      investigation = {
        trigger: `CAPTCHA wall detected on portal access`,
        reason: `${vendorLabel} detected an automated access pattern from the Retriever agent and presented an image-based CAPTCHA challenge. Per security policy, the agent cannot solve image CAPTCHAs autonomously.`,
        agentStep: 'Initial portal access — CAPTCHA required',
        screenshotType: 'captcha',
        screenshotMeta: { vendor: vendorLabel, url: `${vendorLabel.toLowerCase().replace(/\s+/g,'-')}.com/login` }
      };
    }
  }
  const caseyMsg = `Why did the ${vendorLabel} ${authType.toLowerCase()} request appear in my work feed?`;
  const invBtnHtml = investigation
    ? `<div class="wf-card-actions">
        <button class="wf-inv-btn" title="Why this appeared" onclick='openWfInvestigation(${JSON.stringify(investigation)})'><span class="material-symbols-outlined">manage_search</span></button>
        <button class="wf-ask-casey-btn" onclick="sendAiPill('${caseyMsg.replace(/'/g,"&#39;")}')"><span class="material-symbols-outlined">auto_awesome</span>Ask Casey</button>
       </div>`
    : '';
  return `
    <div class="wf-form-card">
      <div class="wf-form-card-header">
        <span class="wf-form-card-vendor">${vendorLabel}</span>
        <span class="wf-form-card-task-type">${authType}</span>
        ${invBtnHtml}
      </div>
      <div class="wf-form-card-flow">
        <div class="wf-form-card-flow-src"><span class="material-symbols-outlined">smart_toy</span></div>
        <span class="material-symbols-outlined wf-form-card-flow-arrow">arrow_forward</span>
        <div class="wf-form-card-flow-dst ${dstClass}">${dstInitials}</div>
      </div>
      <p class="wf-form-card-desc">${desc}</p>
      <div class="wf-form-card-body">${fieldsHtml}${otpHtml}${captchaHtml}</div>
      <div class="wf-form-card-footer">
        <button class="wf-reject-btn">Reject</button>
        <button class="wf-approve-btn" onclick="approveWfCard(this,'${caseId}','${taskId}','${vendorKey}','${invoiceId}')">${captcha ? 'Verify' : 'Approve'}</button>
      </div>
    </div>`;
}

function openCaseActivityLog(caseId) {
  const overlay = document.getElementById('wf-inv-overlay');
  const header  = document.getElementById('wf-inv-modal-header');
  const body    = document.getElementById('wf-inv-modal-body');
  if (!overlay || !header || !body) return;

  const tasks = _activeWfTasksObj()[caseId] || [];
  const authTasks = tasks.filter(t => t.type === 'auth-credential');
  const totalCards = authTasks.reduce((n, t) => n + (t.cards || []).length, 0);
  const blockers = authTasks.flatMap(t => (t.cards || []).map(c => c.authType));
  const blockerSummary = [...new Set(blockers)].join(', ') || 'authentication required';

  // Build case-level timeline
  const steps = [
    { status:'ok',   time:'10:00 AM', label:'Case received',          desc:`Case ${caseId} assigned to Casey for processing` },
    { status:'ok',   time:'10:01 AM', label:'Casey analysed case',     desc:'Reviewed case scope, task requirements, and available tools' },
    { status:'ok',   time:'10:02 AM', label:'Task plan created',       desc:`${tasks.length} task${tasks.length!==1?'s':''} queued — starting with ${tasks[0]?.label||'first task'}` },
    { status:'ok',   time:'10:08 AM', label:'Work underway',           desc:'Casey began executing tasks autonomously' },
    ...authTasks.map((t,i) => ({
      status:'warn', time:`10:${12+i*3} AM`, label:`Blocked on ${t.label}`,
      desc:`${(t.cards||[]).length} vendor portal${(t.cards||[]).length!==1?'s require':' requires'} human authentication to continue`
    })),
    { status:'err',  time:'Now',      label:'Paused — awaiting you',   desc:`${totalCards} auth request${totalCards!==1?'s':''} pending your approval (${blockerSummary})` },
  ];

  header.innerHTML = `
    <span class="wf-pdf-modal-title" style="display:flex;align-items:center;gap:6px">
      <span class="material-symbols-outlined" style="font-size:15px">history</span>Activity Log — ${caseId}
    </span>
    <button class="wf-pdf-close-btn" onclick="closeWfInvestigation()">✕</button>`;

  body.innerHTML = `<div class="wf-al-list">${steps.map(s => `
    <div class="wf-al-item">
      <div class="wf-al-spine">
        <div class="wf-al-dot ${s.status}"><span class="material-symbols-outlined">${s.status==='ok'?'check':s.status==='warn'?'warning':'block'}</span></div>
        <div class="wf-al-connector"></div>
      </div>
      <div class="wf-al-body">
        <div class="wf-al-label ${s.status==='ok'?'':s.status}">${s.label}</div>
        <div class="wf-al-desc">${s.desc}</div>
        <div class="wf-al-time">${s.time}</div>
      </div>
    </div>`).join('')}
  </div>`;

  overlay.style.display = 'flex';
}

function openActivityLog(inv) {
  const overlay = document.getElementById('wf-inv-overlay');
  const header  = document.getElementById('wf-inv-modal-header');
  const body    = document.getElementById('wf-inv-modal-body');
  if (!overlay || !header || !body) return;

  header.innerHTML = `
    <span class="wf-pdf-modal-title" style="display:flex;align-items:center;gap:6px">
      <span class="material-symbols-outlined" style="font-size:15px">history</span>Activity Log
    </span>
    <button class="wf-pdf-close-btn" onclick="closeWfInvestigation()">✕</button>`;

  const steps = _wfActivitySteps(inv.screenshotType, inv.screenshotMeta);
  body.innerHTML = `<div class="wf-al-list">${steps.map(s => `
    <div class="wf-al-item">
      <div class="wf-al-spine">
        <div class="wf-al-dot ${s.status}"><span class="material-symbols-outlined">${s.status==='ok'?'check':s.status==='warn'?'warning':'block'}</span></div>
        <div class="wf-al-connector"></div>
      </div>
      <div class="wf-al-body">
        <div class="wf-al-label ${s.status==='ok'?'':''+s.status}">${s.label}</div>
        <div class="wf-al-desc">${s.desc}</div>
        <div class="wf-al-time">${s.time}</div>
      </div>
    </div>`).join('')}
  </div>`;

  overlay.style.display = 'flex';
}

function _wfActivitySteps(type, meta) {
  const v = meta.vendor;
  if (type === 'session-timeout') return [
    { status:'ok',   time:'10:14 AM', label:'Task started',          desc:`Invoice retrieval initiated for ${v}` },
    { status:'ok',   time:'10:14 AM', label:'Portal located',        desc:`Resolved portal URL — navigating to ${meta.url}` },
    { status:'ok',   time:'10:15 AM', label:'Credentials loaded',    desc:'Stored credentials retrieved from secure vault' },
    { status:'ok',   time:'10:15 AM', label:'Login successful',      desc:'Active session established with vendor portal' },
    { status:'ok',   time:'10:16 AM', label:'Navigating portal',     desc:'Accessed invoice listing page successfully' },
    { status:'ok',   time:'10:19 AM', label:'Retrieving records',    desc:'Retrieved 3 of 7 invoice records before interruption' },
    { status:'warn', time:'10:27 AM', label:'Session expired',       desc:`${v} portal invalidated the session token after inactivity` },
    { status:'err',  time:'10:27 AM', label:'Paused — awaiting you', desc:'Re-authentication required to continue retrieval' },
  ];
  if (type === '2fa') return [
    { status:'ok',   time:'10:22 AM', label:'Task started',          desc:`Authentication initiated for ${v}` },
    { status:'ok',   time:'10:22 AM', label:'Portal located',        desc:`Resolved portal URL — navigating to ${meta.url}` },
    { status:'ok',   time:'10:22 AM', label:'Credentials submitted', desc:'Username and password sent to portal login form' },
    { status:'ok',   time:'10:22 AM', label:'Primary auth passed',   desc:`${v} accepted credentials successfully` },
    { status:'warn', time:'10:23 AM', label:'2FA challenge received',desc:'Portal requires a one-time code sent to registered email' },
    { status:'err',  time:'10:23 AM', label:'Paused — awaiting you', desc:'Cannot retrieve email code autonomously — human input needed' },
  ];
  if (type === 'captcha') return [
    { status:'ok',   time:'10:31 AM', label:'Task started',          desc:`Portal access initiated for ${v}` },
    { status:'ok',   time:'10:31 AM', label:'Portal located',        desc:`Resolved portal URL — navigating to ${meta.url}` },
    { status:'warn', time:'10:31 AM', label:'CAPTCHA detected',      desc:`${v} presented an image-based CAPTCHA challenge on the login page` },
    { status:'err',  time:'10:31 AM', label:'Paused — awaiting you', desc:'Cannot solve image CAPTCHAs autonomously per security policy' },
  ];
  return [
    { status:'ok',  time:'—', label:'Task started', desc:'Agent initiated the task' },
    { status:'err', time:'—', label:'Paused',        desc:'Human intervention required' },
  ];
}

function openWfInvestigation(inv) {
  const overlay = document.getElementById('wf-inv-overlay');
  const header  = document.getElementById('wf-inv-modal-header');
  const body    = document.getElementById('wf-inv-modal-body');
  if (!overlay || !header || !body) return;
  header.innerHTML = `
    <span class="wf-pdf-modal-title" style="display:flex;align-items:center;gap:6px">
      <span class="material-symbols-outlined" style="font-size:15px">manage_search</span>Why this appeared
    </span>
    <button class="wf-pdf-close-btn" onclick="closeWfInvestigation()">✕</button>`;
  body.innerHTML = `
    <div class="wf-inv-trigger">
      <span class="material-symbols-outlined">warning</span>
      <span class="wf-inv-trigger-text">${inv.trigger}</span>
    </div>
    <div class="wf-inv-reason">${inv.reason}</div>
    <div class="wf-inv-step">
      <span class="material-symbols-outlined">route</span>
      Agent was at: <strong style="margin-left:3px">${inv.agentStep}</strong>
    </div>
    <div class="wf-inv-screenshot-wrap">
      <div class="wf-inv-browser-bar">
        <div class="wf-inv-browser-dots">
          <div class="wf-inv-browser-dot" style="background:#f87171"></div>
          <div class="wf-inv-browser-dot" style="background:#fbbf24"></div>
          <div class="wf-inv-browser-dot" style="background:#34d399"></div>
        </div>
        <div class="wf-inv-browser-url">${inv.screenshotMeta.url}</div>
      </div>
      <div class="wf-inv-browser-body">
        <div class="wf-inv-site-bg"></div>
        ${_wfInvScreenshot(inv.screenshotType, inv.screenshotMeta)}
      </div>
    </div>`;
  overlay.style.display = 'flex';
}
function closeWfInvestigation() {
  const el = document.getElementById('wf-inv-overlay');
  if (el) el.style.display = 'none';
}
function _wfInvScreenshot(type, meta) {
  if (type === 'session-timeout') return `
    <div class="wf-inv-popup">
      <div class="wf-inv-popup-icon">⏱</div>
      <div class="wf-inv-popup-title">Session Expired</div>
      <div class="wf-inv-popup-body">Your ${meta.vendor} session expired due to inactivity. Please log in again.</div>
      <button class="wf-inv-popup-btn secondary">Cancel</button>
      <button class="wf-inv-popup-btn primary">Log in again</button>
    </div>`;
  if (type === '2fa') return `
    <div class="wf-inv-popup">
      <div class="wf-inv-popup-icon">🔐</div>
      <div class="wf-inv-popup-title">Two-Factor Authentication</div>
      <div class="wf-inv-popup-body">A verification code was sent to your registered email.</div>
      <div style="display:flex;gap:5px;justify-content:center;margin-bottom:12px">
        ${Array(6).fill('<div style="width:26px;height:34px;border:1px solid #d1d5db;border-radius:5px;background:#f9fafb"></div>').join('')}
      </div>
      <button class="wf-inv-popup-btn primary" style="width:100%">Verify</button>
    </div>`;
  if (type === 'captcha') return `
    <div class="wf-inv-popup" style="min-width:260px">
      <div class="wf-inv-popup-icon">🤖</div>
      <div class="wf-inv-popup-title">Verify you're human</div>
      <div class="wf-inv-popup-body">Select all images with traffic lights</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:12px">
        ${['#64748b','#16a34a','#0369a1','#9333ea','#15803d','#b45309','#166534','#0c4a6e','#7c3aed'].map(c=>`<div style="aspect-ratio:1;border-radius:4px;background:${c}"></div>`).join('')}
      </div>
      <button class="wf-inv-popup-btn primary" style="width:100%">Submit</button>
    </div>`;
  return `<div class="wf-inv-popup"><div class="wf-inv-popup-body">No screenshot available</div></div>`;
}

function _wfEmailCard({ caseId, taskId, customerName, customerEmail, avatarInitials, avatarColor, caseRef, subject, missingFields, bodyText }) {
  const pills = (missingFields || []).map(f => `<span class="wf-email-missing-pill">${f}</span>`).join('');
  return `
    <div class="wf-form-card">
      <div class="wf-form-card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="wf-email-avatar ${avatarColor}">${avatarInitials}</div>
          <div>
            <div class="wf-form-card-vendor">${customerName}</div>
            <div class="wf-form-card-task-type">Customer email</div>
          </div>
        </div>
        <span class="wf-email-draft-badge">Draft</span>
      </div>
      <div class="wf-email-meta">
        <div class="wf-email-meta-row">
          <span class="wf-email-meta-lbl">From</span>
          <span class="wf-email-meta-val">Casey (Genpact AI) &lt;casey@genpact-ai.com&gt;</span>
        </div>
        <div class="wf-email-meta-row">
          <span class="wf-email-meta-lbl">To</span>
          <span class="wf-email-meta-val">${customerName} &lt;${customerEmail}&gt;</span>
        </div>
        <div class="wf-email-meta-row">
          <span class="wf-email-meta-lbl">Subject</span>
          <input class="wf-email-subject" type="text" value="${subject}">
        </div>
      </div>
      <div class="wf-email-missing-row">
        <span class="wf-email-missing-lbl">Missing</span>
        <div class="wf-email-pills">${pills}</div>
      </div>
      <div class="wf-email-body-wrap">
        <div class="wf-email-body" contenteditable="true" spellcheck="false">${bodyText}</div>
      </div>
      <div class="wf-form-card-footer" style="flex-direction:column;align-items:stretch;gap:8px">
        <div class="wf-email-footer-inner">
          <div class="wf-email-send-note">
            <span class="material-symbols-outlined">lock</span>
            Sends from casey@genpact-ai.com on your behalf — review before approving
          </div>
          <div class="wf-email-footer-actions">
            <button class="wf-reject-btn">Decline</button>
            <button class="wf-approve-btn wf-email-send-btn" onclick="approveWfCard(this,'${caseId}','${taskId}','${customerName}','${caseRef}','email')">
              <span class="material-symbols-outlined">send</span>
              Approve &amp; Send
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// Invoice doc with data-fieldkey spans for split-view inline highlighting
function _wfInvoiceDocKeyed(inv) {
  const kv = (key, val) => `<span class="ded-doc-val" data-fieldkey="${key}">${val}</span>`;
  const lines = inv.lines.map(l => `
    <tr>
      <td>${kv('description', l.desc)}</td>
      <td class="r">${kv('quantity', l.qty)}</td>
      <td class="r">${kv('unitPrice', l.rate)}</td>
      <td class="r">${l.amount}</td>
    </tr>`).join('');
  return `
    <div class="wf-invoice-doc">
      <div class="wf-invoice-doc-top">
        <div>
          <div class="wf-invoice-doc-brand">${kv('vendor', inv.vendorFull)}</div>
          <div class="wf-invoice-doc-addr">${inv.vendorAddr}</div>
        </div>
        <div style="text-align:right">
          <div class="wf-invoice-doc-title">INVOICE</div>
          <div class="wf-invoice-doc-num">#${inv.invoiceNum}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-bottom:8px">
        <div>
          <div class="wf-invoice-meta-lbl">Bill To</div>
          <div class="wf-invoice-doc-brand wf-invoice-billto-name" style="margin-top:1px">${kv('billTo', inv.billTo)}</div>
          <div class="wf-invoice-doc-addr">${inv.billToAddr}</div>
        </div>
        <div class="wf-invoice-meta">
          <div><div class="wf-invoice-meta-lbl">Invoice Date</div><div class="wf-invoice-meta-val">${inv.date}</div></div>
          <div><div class="wf-invoice-meta-lbl">Due Date</div><div class="wf-invoice-meta-val">${inv.dueDate}</div></div>
          <div><div class="wf-invoice-meta-lbl">PO Number</div><div class="wf-invoice-meta-val">${inv.po}</div></div>
          <div><div class="wf-invoice-meta-lbl">Terms</div><div class="wf-invoice-meta-val">${inv.terms}</div></div>
        </div>
      </div>
      <table class="wf-invoice-lines">
        <thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <div class="wf-invoice-total-row">
        <span class="wf-invoice-total-lbl">Total</span>
        <span class="wf-invoice-total-amt">${inv.total}</span>
      </div>
      <div><span class="wf-invoice-verified"><span class="material-symbols-outlined">verified</span> Verified</span></div>
    </div>`;
}

// Eye button hover — delegates to shared zoom
function _wfHighlightInvoice(btn, show) {
  _splitDocZoom(btn.dataset.split, btn.dataset.fieldkey, show);
}

// Input focus/blur — same shared zoom
function _wfFocusInvoiceField(splitId, hkey, active) {
  _splitDocZoom(splitId, hkey, active);
}

function _wfInvoiceDoc(inv, highlight) {
  // Wrap matching value in amber highlight mark
  const hl = (key, val) => highlight === key ? `<mark class="wf-hl">${val}</mark>` : val;
  const lines = inv.lines.map(l => `
    <tr>
      <td>${hl('description', l.desc)}</td>
      <td class="r">${hl('quantity', l.qty)}</td>
      <td class="r">${hl('unitPrice', l.rate)}</td>
      <td class="r">${l.amount}</td>
    </tr>`).join('');
  return `
    <div class="wf-invoice-doc">
      <div class="wf-invoice-doc-top">
        <div>
          <div class="wf-invoice-doc-brand">${hl('vendor', inv.vendorFull)}</div>
          <div class="wf-invoice-doc-addr">${inv.vendorAddr}</div>
        </div>
        <div style="text-align:right">
          <div class="wf-invoice-doc-title">INVOICE</div>
          <div class="wf-invoice-doc-num">#${inv.invoiceNum}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-bottom:8px">
        <div>
          <div class="wf-invoice-meta-lbl">Bill To</div>
          <div class="wf-invoice-doc-brand wf-invoice-billto-name" style="margin-top:1px">${hl('billTo', inv.billTo)}</div>
          <div class="wf-invoice-doc-addr">${inv.billToAddr}</div>
        </div>
        <div class="wf-invoice-meta">
          <div><div class="wf-invoice-meta-lbl">Invoice Date</div><div class="wf-invoice-meta-val">${inv.date}</div></div>
          <div><div class="wf-invoice-meta-lbl">Due Date</div><div class="wf-invoice-meta-val">${inv.dueDate}</div></div>
          <div><div class="wf-invoice-meta-lbl">PO Number</div><div class="wf-invoice-meta-val">${inv.po}</div></div>
          <div><div class="wf-invoice-meta-lbl">Terms</div><div class="wf-invoice-meta-val">${inv.terms}</div></div>
        </div>
      </div>
      <table class="wf-invoice-lines">
        <thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <div class="wf-invoice-total-row">
        <span class="wf-invoice-total-lbl">Total</span>
        <span class="wf-invoice-total-amt">${inv.total}</span>
      </div>
      <div><span class="wf-invoice-verified"><span class="material-symbols-outlined">verified</span> Verified</span></div>
    </div>`;
}

function _wfComparisonCard({ caseId, taskId }) {
  const inv = {
    vendorFull: 'TechLogic Systems Inc.',
    vendorAddr: '88 Enterprise Way, Austin TX',
    billTo: 'Walmart Corporation',
    billToAddr: 'Accounts Payable Dept.',
    invoiceNum: 'INV-2024-0891',
    date: 'Mar 12, 2024',
    dueDate: 'Apr 11, 2024',
    po: 'PO-7723-0024',
    lines: [{ desc: 'Enterprise Software License Q1 2024 + Support', qty: '1', rate: '$12,450.00', amount: '$12,450.00' }],
    total: '$12,450.00',
    terms: 'Net 30',
  };

  const splitId = `wf-cmp-${caseId}`;

  const fields = [
    { label: 'Vendor Name',  value: inv.vendorFull,              hkey: 'vendor'      },
    { label: 'Bill To',      value: inv.billTo,                  hkey: 'billTo'      },
    { label: 'Description',  value: 'Enterprise SW License Q1', hkey: 'description' },
    { label: 'Quantity',     value: '1',                         hkey: 'quantity'    },
    { label: 'Unit Price',   value: '$12,450.00',                hkey: 'unitPrice'   },
  ];

  const fieldsHtml = fields.map(f => `
    <div class="wf-pa-field">
      <label class="wf-pa-label" style="font-size:12px">${f.label}</label>
      <input class="wf-pa-input" style="height:32px;font-size:12px" type="text" value="${f.value}"
        onfocus="_wfFocusInvoiceField('${splitId}','${f.hkey}',true)"
        onblur="_wfFocusInvoiceField('${splitId}','${f.hkey}',false)">
    </div>`).join('');

  // PDF overlay kept for full-screen expand
  const pdfOverlayHtml = `
    <div class="wf-pdf-overlay" id="wf-pdf-overlay" style="display:none" onclick="if(event.target===this)_closeInvoicePdf()">
      <div class="wf-pdf-modal">
        <div class="wf-pdf-modal-header">
          <span class="wf-pdf-modal-title">Invoice #${inv.invoiceNum} · ${inv.vendorFull}</span>
          <div class="wf-pdf-zoom-controls">
            <button class="wf-pdf-zoom-btn" onclick="_pdfZoomOut()">−</button>
            <span class="wf-pdf-zoom-lbl" id="wf-pdf-zoom-lbl">100%</span>
            <button class="wf-pdf-zoom-btn" onclick="_pdfZoomIn()">+</button>
          </div>
          <button class="wf-pdf-close-btn" onclick="_closeInvoicePdf()">✕</button>
        </div>
        <div class="wf-pdf-modal-body">
          <div class="wf-pdf-doc-wrapper" id="wf-pdf-doc-wrapper">
            ${_wfInvoiceDoc(inv)}
          </div>
        </div>
      </div>
    </div>`;

  return `
    ${pdfOverlayHtml}
    <div class="wf-form-card" style="overflow:hidden">
      <div class="wf-form-card-header" style="align-items:center">
        <span class="material-symbols-outlined" style="font-size:20px;color:#7c3aed;flex-shrink:0">receipt_long</span>
        <div style="flex:1;min-width:0">
          <div class="wf-form-card-vendor">TechLogic Systems</div>
          <div class="wf-form-card-task-type">Invoice #${inv.invoiceNum} — verify extracted fields</div>
        </div>
        <span class="wf-form-card-task-type">Payment Authorization</span>
      </div>
      <div class="ded-eyeball-split">
        <div class="ded-eyeball-left">
          <div style="font-size:11px;color:var(--text-muted)">Agent extracted — click a field to locate in document</div>
          <div class="wf-pa-fields">${fieldsHtml}</div>
        </div>
        <div style="display:flex;flex-direction:column;background:#525659;overflow:hidden">
          <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:#3c3f41;flex-shrink:0">
            <span class="material-symbols-outlined" style="font-size:13px;color:#aaa">receipt_long</span>
            <span style="font-size:11px;color:#ccc;font-weight:500">Invoice #${inv.invoiceNum}</span>
            <span style="font-size:10px;color:#888;margin-left:2px">· ${inv.vendorFull}</span>
            <button style="margin-left:auto;background:none;border:none;cursor:pointer;padding:2px 4px;border-radius:4px;display:flex;align-items:center;gap:4px;color:#aaa;font-size:11px" onclick="_openInvoicePdf()" title="View full document">
              <span class="material-symbols-outlined" style="font-size:13px">open_in_full</span>
              View
            </button>
          </div>
          <div class="ded-eyeball-right" id="${splitId}-doc">
            ${_wfInvoiceDocKeyed(inv)}
          </div>
        </div>
      </div>
      <div class="wf-auth-note">
        <span class="material-symbols-outlined">lock</span>
        Authorizes payment of ${inv.total} to ${inv.vendorFull}
      </div>
      <div class="wf-form-card-footer">
        <button class="wf-reject-btn">Dispute</button>
        <button class="wf-approve-btn" onclick="approveWfCard(this,'${caseId}','${taskId}','TechLogic Systems','${inv.invoiceNum}','comparison')">
          <span class="material-symbols-outlined" style="font-size:14px">payments</span>
          Authorize Payment
        </button>
      </div>
    </div>`;
}

function renderWorkFeedCasey(caseId) {
  _workFeedMode = true;
  _workFeedCaseId = caseId;
  const body  = document.getElementById('ai-drawer-body');
  const empty = document.getElementById('ai-empty');
  if (!body) return;
  if (empty) empty.style.display = 'none';

  // Clear previous case content and render fresh stream for this case
  body.querySelectorAll('.wf-ai-content').forEach(e => e.remove());
  _wfInitialized = true;

  const content = workFeedCaseyContent[caseId];
  const el = document.createElement('div');
  el.className = 'wf-ai-content';
  el.style.cssText = 'display:contents';

  if (content) {
    const thoughtsHtml = content.thoughts.map(t => `<p>${t}</p>`).join('');
    const sep = content.thoughts.length ? '<div class="wf-stream-sep"></div>' : '';
    el.innerHTML = `
      <div class="wf-stream-wrap">
        <div class="wf-stream-thoughts" id="wf-stream-thoughts">${thoughtsHtml}</div>
        ${sep}
        <div class="wf-stream-final wf-stream-fresh" id="wf-stream-final">${content.output}<span class="wf-stream-caret"></span></div>
      </div>
      ${content.contextCards || ''}`;
  } else {
    el.innerHTML = `
      <div class="wf-stream-wrap">
        <div class="wf-stream-thoughts" id="wf-stream-thoughts"></div>
        <div class="wf-stream-final wf-stream-fresh" id="wf-stream-final">Select a case from the feed to get started.<span class="wf-stream-caret"></span></div>
      </div>`;
  }
  body.appendChild(el);

  body.scrollTop = body.scrollHeight;
  _renderAiDrawerContext();
  _renderAiFooter();
}

function approveWfCard(btn, caseId, taskId, vendorKey, invoiceId, msgType) {
  // 1. Replace the card with a completed state
  const card = btn.closest('.wf-form-card');
  if (!card) return;
  const doneText = msgType === 'comparison'
    ? 'Payment authorized — $12,450.00 to TechLogic Systems Inc.'
    : msgType === 'email'
    ? `Email sent to ${vendorKey}`
    : 'Casey is now retrieving the invoice';
  const doneVendor = msgType === 'comparison'
    ? `Authorized — ${vendorKey} Inc.`
    : msgType === 'email'
    ? `Sent — ${vendorKey}`
    : `Approved — ${vendorKey}`;
  card.className = 'wf-form-card wf-form-card-done';
  card.innerHTML = `
    <div class="wf-form-card-done-inner">
      <span class="material-symbols-outlined wf-form-card-done-icon">check_circle</span>
      <span class="wf-form-card-done-vendor">${doneVendor}</span>
      <span class="wf-form-card-done-sub">${doneText}</span>
    </div>`;
  // Update table row status to "Agent taking care"
  _updateWfTableStatus(caseId, 'agent-taking-care');

  // 2. Decrement the task counter for this tab
  const tasks = _activeWfTasksObj()[caseId];
  const task = tasks?.find(t => t.id === taskId);
  if (task && task.count > 0) {
    task.count--;
    _renderWfTaskTabs(caseId);
    // When all cards approved, update stage badge and auto-advance to next uncompleted tab
    if (task.count === 0) {
      const wfStageBadge = document.getElementById('wf-stage-badge');
      const caseData = _activeWfCases().find(c => c.id === caseId);
      if (wfStageBadge && caseData && caseData.tasks > 0) {
        caseData.tasks--;
        wfStageBadge.textContent = caseData.tasks;
      }
      // Auto-advance to the next tab that still has pending items
      const allTasks = _activeWfTasksObj()[caseId];
      const nextTask = allTasks?.find(t => t.id !== taskId && t.count > 0);
      if (nextTask) {
        setTimeout(() => selectWorkFeedTask(caseId, nextTask.id), 700);
      } else {
        // All tasks cleared — hand the case back to the agent pipeline
        setTimeout(() => _triggerCaseHandback(caseId), 900);
      }
    }
  }

  // 3. Update the Casey panel invoice badge (only for credential cards)
  if (msgType !== 'comparison') {
    const badge = document.querySelector(`[data-invoice="${invoiceId}"]`);
    if (badge) {
      badge.textContent = 'In progress';
      badge.style.cssText = 'padding:2px 7px;border-radius:10px;background:#064e3b;color:#6ee7b7;font-size:10px;font-weight:600;white-space:nowrap;flex-shrink:0';
    }
  }

  // 4. Append an AI acknowledgment in the Casey panel
  _appendWfApprovalMessage(vendorKey, invoiceId, msgType);
}

function _appendWfApprovalMessage(vendorKey, invoiceId, msgType) {
  const outputText = msgType === 'comparison'
    ? `Payment for Invoice <strong>#${invoiceId}</strong> authorized. Initiating payment of $12,450.00 to TechLogic Systems Inc. — I'll notify you once processing is confirmed.`
    : msgType === 'email'
    ? `Email sent to <strong>${vendorKey}</strong> (case <strong>#${invoiceId}</strong>) requesting missing information. I'll follow up automatically if there's no response within 48 hours.`
    : `Credentials approved for <strong>${vendorKey}</strong>. Now retrieving invoice <strong>#${invoiceId}</strong> — I'll notify you once it's indexed and ready for comparison.`;
  const thought = msgType === 'comparison'
    ? 'Payment handoff confirmed — initiating transfer...'
    : msgType === 'email'
    ? `Email queued for ${vendorKey} — awaiting delivery confirmation...`
    : `Credential handoff confirmed — resuming retrieval for ${vendorKey}...`;
  _setCaseyOutput(outputText, thought);
}

function _appendWfComparisonHandoffMessage() {
  const body = document.getElementById('ai-drawer-body');
  if (!body) return;
  _setCaseyOutput(
    `I've retrieved Invoice <strong>#INV-2024-0891</strong> from TechLogic Systems and extracted the data shown in the card below.<br><br><strong>⚠ Payment authorization required:</strong> Policy requires human sign-off before I can process this $12,450.00 payment. Please review the extracted fields against the invoice document, correct any errors, then authorize.`,
    'Switching to Viewer mode — awaiting payment authorization...'
  );
}

