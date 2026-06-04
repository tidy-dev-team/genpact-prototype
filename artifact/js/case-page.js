// ── Case Page ──────────────────────────────────────────────────────────────

const CONVERSATIONS = [
  { name: 'Me, Ahmed Arah',  preview: 'Good evening to all',       time: '14:06', tag: true,  initials: 'MA' },
  { name: 'Michael Nguyen',  preview: 'Analysis of market t...',   time: '14:16', tag: true,  initials: 'MN' },
  { name: 'Sarah Johnson',   preview: 'Quarterly financ...',       time: '14:26', tag: true,  initials: 'SJ' },
  { name: 'David Kim',       preview: 'Project timeline upd...',   time: '14:36', tag: false, initials: 'DK' },
  { name: 'Emily Chen',      preview: 'User feedback an...',       time: '14:46', tag: false, initials: 'EC' },
  { name: 'John Doe',        preview: 'Sales performance...',      time: '14:56', tag: false, initials: 'JD' },
  { name: 'Anna Smith',      preview: 'New feature sugg...',       time: '15:06', tag: true,  initials: 'AS' },
  { name: 'Chris Lee',       preview: 'Team collaboration t...',   time: '15:16', tag: false, initials: 'CL' },
  { name: 'Jessica Patel',   preview: 'Upcoming events...',        time: '15:26', tag: true,  initials: 'JP' },
];

function openCaseTab(caseId) {
  const id = String(caseId).replace(/^#\s*/, '');
  const tabs = sectionTabs[activeSection];
  if (!tabs.find(t => t.id === id)) {
    tabs.push({ id, label: id, icon: 'folder_open', home: false });
  }
  selectTab(id);
}

// ── Read-only case tracking (cases opened from Work Feed) ──
const _readOnlyCaseIds = new Set();
const _wfCaseStageData = {}; // caseId → workFeedData entry, for stage sync

function openWfCaseReadOnly(caseId) {
  if (!caseId) return;
  const id = String(caseId).replace(/^#\s*/, '');
  _readOnlyCaseIds.add(id);
  // Store WF stage data so renderCasePage can sync the stage badge
  const wfEntry = _activeWfCases().find(c => c.id === caseId);
  if (wfEntry) _wfCaseStageData[id] = wfEntry;
  // Open case tab in the current Work Feed section — no section change
  openCaseTab(id);
}

function openWfCaseTab(caseId) {
  // Open case fetched by current user — full editable form in a new tab
  if (!caseId) return;
  const id = String(caseId).replace(/^#\s*/, '');
  // NOT read-only — fetched by me, full access
  _readOnlyCaseIds.delete(id);
  const wfEntry = _activeWfCases().find(c => c.id === caseId);
  if (wfEntry) _wfCaseStageData[id] = wfEntry;
  openCaseTab(id);
}

// ── Case form section definitions ── (order matches header nav tabs)
const CASE_SECTIONS = [
  {
    key: 'history', title: 'History', subtitle: 'Related cases and historical context',
    fields: [
      { id: 'field-hist-prev',    label: 'Previous Case ID',    type: 'text' },
      { id: 'field-hist-related', label: 'Related Cases',       type: 'text' },
      { id: 'field-hist-contact', label: 'Prior Contact Count', type: 'text', readonly: true },
      { id: 'field-hist-outcome', label: 'Prior Outcome',       type: 'select', options: ['None','Resolved','Declined','Escalated'] },
      { id: 'field-hist-notes',   label: 'Historical Notes',    type: 'textarea', rows: 3, fullWidth: true },
    ]
  },
  {
    key: 'details', title: 'Details', subtitle: 'Core case information and assignment',
    missingFields: ['Case Type', 'Priority'],
    fields: [
      { id: 'field-case-id',    label: 'Case ID',          type: 'text',   readonly: true },
      { id: 'field-case-title', label: 'Case Title',        type: 'text' },
      { id: 'field-case-type',  label: 'Case Type',         type: 'select', options: ['Dispute','Claim','Inquiry','Escalation'] },
      { id: 'field-priority',   label: 'Priority',          type: 'select', options: ['High','Medium','Low'] },
      { id: 'field-date-filed', label: 'Date Filed',        type: 'text' },
      { id: 'field-status',     label: 'Status',            type: 'select', options: ['Active','Pending Review','In Progress','Resolved','Closed'] },
      { id: 'field-department', label: 'Department',        type: 'select', options: ['Finance','Operations','Legal','Support'] },
      { id: 'field-assigned-to',label: 'Assigned To',       type: 'text' },
      { id: 'field-description',label: 'Case Description',  type: 'textarea', rows: 4, fullWidth: true },
    ]
  },
  {
    key: 'research', title: 'Research', subtitle: 'Investigation and research notes',
    missingFields: ['Root Cause'],
    fields: [
      { id: 'field-res-findings', label: 'Initial Findings',    type: 'textarea', rows: 3, fullWidth: true },
      { id: 'field-res-risk',     label: 'Risk Level',          type: 'select', options: ['Low','Medium','High','Critical'] },
      { id: 'field-res-outcome',  label: 'Recommended Outcome', type: 'select', options: ['Approve','Decline','Escalate','Further Review'] },
      { id: 'img-evidence', label: 'Evidence Photo', type: 'image-investigation',
        src: 'https://placehold.co/800x450/e8e8e8/999?text=Evidence+Photo',
        instructions: 'Review the attached evidence photo. Verify that the damage is consistent with the claim description. Note any discrepancies in the condition, date stamps, or identifying markers.',
        aspectRatio: '16/9', fullWidth: true,
        inputs: [
          { id: 'img-ev-damage-type', label: 'Damage Type',   type: 'select',   options: ['Physical','Water','Fire','Theft','Other'] },
          { id: 'img-ev-severity',    label: 'Severity',      type: 'select',   options: ['Minor','Moderate','Severe','Total Loss'] },
          { id: 'img-ev-discrepancy', label: 'Discrepancies', type: 'textarea', rows: 4 },
        ] },
    ]
  },
  {
    key: 'host', title: 'Host', subtitle: 'Host and customer information',
    fields: [
      { id: 'field-host-name',    label: 'Host Name',       type: 'text' },
      { id: 'field-host-id',      label: 'Host ID',         type: 'text', readonly: true },
      { id: 'field-host-email',   label: 'Email Address',   type: 'text' },
      { id: 'field-host-phone',   label: 'Phone Number',    type: 'text' },
      { id: 'field-host-country', label: 'Country',         type: 'select', options: ['United States','United Kingdom','Canada','Australia','Other'] },
      { id: 'field-host-account', label: 'Account Status',  type: 'select', options: ['Active','Suspended','Pending','Closed'] },
    ]
  },
  {
    key: 'general', title: 'General', subtitle: 'General case information',
    fields: [
      { id: 'field-gen-channel',  label: 'Channel',           type: 'select', options: ['Email','Phone','Portal','Chat'] },
      { id: 'field-gen-source',   label: 'Source',             type: 'text' },
      { id: 'field-gen-category', label: 'Category',           type: 'select', options: ['Billing','Technical','Account','Compliance'] },
      { id: 'field-gen-region',   label: 'Region',             type: 'select', options: ['APAC','EMEA','AMER','LATAM'] },
      { id: 'field-gen-target',   label: 'Resolution Target',  type: 'text' },
      { id: 'field-gen-notes',    label: 'General Notes',      type: 'textarea', rows: 3, fullWidth: true },
    ]
  },
  {
    key: 'payment', title: 'Payment', subtitle: 'Receipt items and transaction breakdown',
    fields: [
      {
        id: 'table-receipt', label: 'Receipt Items', type: 'table',
        columns: [
          { key: 'item',  label: 'Item Description', width: '45%' },
          { key: 'qty',   label: 'Qty',        align: 'right', width: '10%' },
          { key: 'price', label: 'Unit Price',  align: 'right', prefix: '$', width: '20%' },
          { key: 'total', label: 'Total',       align: 'right', prefix: '$', computed: true, width: '20%' },
        ],
        rows: [
          { item: 'Service Fee',    qty: '1', price: '250.00' },
          { item: 'Processing Fee', qty: '2', price: '15.00'  },
          { item: 'Tax (8%)',       qty: '1', price: '22.40'  },
        ]
      },
    ]
  },
  {
    key: 'scmt', title: 'SCMT', subtitle: 'SCMT-specific fields and data',
    fields: [
      { id: 'field-scmt-id',    label: 'SCMT Reference',   type: 'text' },
      { id: 'field-scmt-team',  label: 'SCMT Team',        type: 'select', options: ['Alpha','Beta','Gamma','Delta'] },
      { id: 'field-scmt-level', label: 'Escalation Level', type: 'select', options: ['L1','L2','L3','L4'] },
      { id: 'field-scmt-owner', label: 'Case Owner',       type: 'text' },
      { id: 'field-scmt-sla',   label: 'SLA Target',       type: 'text' },
      { id: 'field-scmt-flag',  label: 'Flag',             type: 'select', options: ['None','VIP','Regulatory','Legal Hold'] },
    ]
  },
  {
    key: 'tracking', title: 'Tracking', subtitle: 'Status tracking and milestones',
    fields: [
      { id: 'field-trk-stage',     label: 'Current Stage',  type: 'select', options: ['Intake','Review','Investigation','Resolution','Closed'] },
      { id: 'field-trk-opened',    label: 'Opened Date',    type: 'text', readonly: true },
      { id: 'field-trk-updated',   label: 'Last Updated',   type: 'text', readonly: true },
      { id: 'field-trk-due',       label: 'Due Date',       type: 'text' },
      { id: 'field-trk-days',      label: 'Days Open',      type: 'text', readonly: true },
      { id: 'field-trk-milestone', label: 'Next Milestone', type: 'text' },
    ]
  },
];

// ── Editable table field ──
const _TABLES = {};

function _buildTableHTML(tid) {
  const { columns, rows, sortKey, sortDir } = _TABLES[tid];

  // Sort rows (copy to avoid mutating original order index)
  let sorted = rows.map((r, i) => ({ ...r, _origIdx: i }));
  if (sortKey) {
    sorted.sort((a, b) => {
      const av = parseFloat(a[sortKey]) || a[sortKey] || '';
      const bv = parseFloat(b[sortKey]) || b[sortKey] || '';
      return av < bv ? -sortDir : av > bv ? sortDir : 0;
    });
  }

  const headers = columns.map(c => {
    const isSorted = sortKey === c.key;
    const icon = sortDir === 1 ? 'arrow_upward' : 'arrow_downward';
    const innerCls = c.align === 'right' ? 'ft-th-inner align-right' : 'ft-th-inner';
    const wStyle = c.width ? ` style="width:${c.width}"` : '';
    return `<th class="${c.align==='right'?'align-right':''} ${isSorted?'ft-sorted':''}"
              onclick="_tSort('${tid}','${c.key}')"${wStyle}>
      <div class="${innerCls}">
        ${c.align === 'right' && isSorted
          ? `<span class="material-symbols-outlined ft-sort-icon">${icon}</span>` : ''}
        ${c.label}
        ${c.align !== 'right' && isSorted
          ? `<span class="material-symbols-outlined ft-sort-icon">${icon}</span>` : ''}
        ${!isSorted
          ? `<span class="material-symbols-outlined ft-sort-icon">unfold_more</span>` : ''}
      </div>
    </th>`;
  }).join('') + '<th class="ft-del-th" style="width:40px"></th>';

  const bodyRows = sorted.map((row) => {
    const ri = row._origIdx;
    const cells = columns.map(c => {
      const raw  = c.computed ? _tCompute(row, c) : (row[c.key] ?? '');
      const disp = (c.prefix||'') + raw;
      return `<td class="field-table-cell${c.computed?' computed':''}${c.align==='right'?' align-right':''}">
        <input value="${disp}"
          ${c.computed
            ? 'readonly tabindex="-1"'
            : `oninput="_tInput('${tid}',${ri},'${c.key}',this.value,this)"`}/>
      </td>`;
    }).join('');
    return `<tr>${cells}
      <td class="field-table-del-cell">
        <button class="field-table-del-btn" onclick="_tDelRow('${tid}',${ri})" title="Remove row">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td></tr>`;
  }).join('');

  const grand = _tGrandTotal(tid);
  return `<table class="field-table">
    <thead><tr>${headers}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="field-table-footer">
    <button class="field-table-add-btn" onclick="_tAddRow('${tid}')">
      <span class="material-symbols-outlined">add</span> Add item
    </button>
    ${grand !== null ? `<span class="field-table-total" id="${tid}-grand">Total: $${grand}</span>` : ''}
  </div>`;
}

function _tSort(tid, key) {
  if (!_TABLES[tid]) return;
  if (_TABLES[tid].sortKey === key) {
    _TABLES[tid].sortDir = (_TABLES[tid].sortDir || 1) * -1;
  } else {
    _TABLES[tid].sortKey = key;
    _TABLES[tid].sortDir = 1;
  }
  const wrap = document.getElementById(tid + '-wrap');
  if (wrap) wrap.innerHTML = _buildTableHTML(tid);
}

function _tCompute(row, col) {
  if (col.key === 'total') {
    const q = parseFloat(row.qty) || 0;
    const p = parseFloat(String(row.price||'').replace(/[^0-9.]/g,'')) || 0;
    return (q * p).toFixed(2);
  }
  return '';
}

function _tGrandTotal(tid) {
  const { columns, rows } = _TABLES[tid];
  if (!columns.find(c => c.computed && c.key === 'total')) return null;
  return rows.reduce((s, r) => {
    const q = parseFloat(r.qty) || 0;
    const p = parseFloat(String(r.price||'').replace(/[^0-9.]/g,'')) || 0;
    return s + q * p;
  }, 0).toFixed(2);
}

function _tInput(tid, ri, key, val, inputEl) {
  if (!_TABLES[tid]) return;
  _TABLES[tid].rows[ri][key] = val.replace(/^\$/, '');
  // update computed cells in same row without full re-render (preserves focus)
  const tr = inputEl.closest('tr');
  if (tr) {
    _TABLES[tid].columns.forEach((c, ci) => {
      if (!c.computed) return;
      const cell = tr.cells[ci];
      if (cell) cell.querySelector('input').value = (c.prefix||'') + _tCompute(_TABLES[tid].rows[ri], c);
    });
  }
  const grand = _tGrandTotal(tid);
  const el = document.getElementById(tid + '-grand');
  if (el && grand !== null) el.textContent = `Total: $${grand}`;
}

function _tAddRow(tid) {
  if (!_TABLES[tid]) return;
  const empty = {};
  _TABLES[tid].columns.forEach(c => { if (!c.computed) empty[c.key] = ''; });
  _TABLES[tid].rows.push(empty);
  const wrap = document.getElementById(tid + '-wrap');
  if (wrap) {
    wrap.innerHTML = _buildTableHTML(tid);
    const trs = wrap.querySelectorAll('tbody tr');
    const last = trs[trs.length - 1];
    if (last) last.querySelector('input:not([readonly])')?.focus();
  }
}

function _tDelRow(tid, ri) {
  if (!_TABLES[tid]) return;
  _TABLES[tid].rows.splice(ri, 1);
  const wrap = document.getElementById(tid + '-wrap');
  if (wrap) wrap.innerHTML = _buildTableHTML(tid);
}

function _imgInvClick(el) {
  openImgLightbox(el.dataset.imgSrc, el.dataset.imgCaption);
}
function openImgLightbox(src, caption) {
  if (!src) return;
  const overlay = document.getElementById('img-lightbox-overlay');
  const img     = document.getElementById('img-lightbox-img');
  const cap     = document.getElementById('img-lightbox-caption');
  if (!overlay || !img) return;
  img.src = src;
  if (caption) { cap.textContent = caption; cap.classList.remove('hidden'); }
  else         { cap.textContent = '';       cap.classList.add('hidden');    }
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeImgLightbox() {
  document.getElementById('img-lightbox-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function _renderField(f) {
  if (f.type === 'image-investigation') {
    const ar = f.aspectRatio || '16/9';
    const safeSrc     = (f.src || '').replace(/"/g, '&quot;');
    const safeCaption = (f.instructions || '').replace(/"/g, '&quot;');
    const imgContent  = f.src
      ? `<img class="img-inv-img" src="${safeSrc}" alt="${f.label}">`
      : `<div class="img-inv-placeholder">
           <span class="material-symbols-outlined">image</span>
           <span class="img-inv-placeholder-text">No image</span>
         </div>`;
    const instrHTML = f.instructions
      ? `<div class="img-inv-instructions">${f.instructions}</div>` : '';
    const inputsHTML = (f.inputs || []).map(inp => {
      let inputEl;
      if (inp.type === 'select') {
        inputEl = `<select id="${inp.id}"><option value="">—</option>${(inp.options||[]).map(o=>`<option>${o}</option>`).join('')}</select>`;
      } else if (inp.type === 'textarea') {
        inputEl = `<textarea id="${inp.id}" rows="${inp.rows||3}" placeholder="${inp.placeholder||'Value'}"></textarea>`;
      } else {
        inputEl = `<input type="text" id="${inp.id}" placeholder="${inp.placeholder||'Value'}">`;
      }
      return `<div class="case-field"><label>${inp.label}</label>${inputEl}</div>`;
    }).join('');
    const imgCol = `<div class="img-inv-wrap" data-img-src="${safeSrc}" data-img-caption="${safeCaption}" onclick="_imgInvClick(this)">
        <div class="img-inv-ratio" style="aspect-ratio:${ar}">${imgContent}</div>
        ${instrHTML}
      </div>`;
    const inner = inputsHTML
      ? `<div class="img-inv-layout">${imgCol}<div class="img-inv-inputs">${inputsHTML}</div></div>`
      : imgCol;
    return `<div class="case-field full-width">
      <label>${f.label}</label>
      ${inner}
    </div>`;
  }
  if (f.type === 'table') {
    _TABLES[f.id] = { columns: f.columns, rows: (f.rows||[]).map(r => ({...r})), sortKey: null, sortDir: 1 };
    return `<div class="case-field full-width">
      <label>${f.label}</label>
      <div class="field-table-wrap" id="${f.id}-wrap">${_buildTableHTML(f.id)}</div>
    </div>`;
  }
  const cls = `case-field${f.readonly ? ' readonly' : ''}${f.fullWidth ? ' full-width' : ''}`;
  let input;
  if (f.type === 'select') {
    input = `<select id="${f.id}"><option value="">—</option>${(f.options||[]).map(o=>`<option>${o}</option>`).join('')}</select>`;
  } else if (f.type === 'textarea') {
    input = `<textarea id="${f.id}" rows="${f.rows||3}" placeholder="Value"></textarea>`;
  } else {
    input = `<input type="text" id="${f.id}" placeholder="Value"${f.readonly?' readonly':''}>`;
  }
  return `<div class="${cls}"><label>${f.label}</label>${input}</div>`;
}

function renderCaseSections(sections) {
  const area = document.getElementById('case-form-area');
  if (!area) return;
  area.innerHTML = sections.map(s => {
    const missing = s.missingFields || [];
    const warnTitle = missing.length
      ? `${missing.length} required field${missing.length>1?'s':''} missing: ${missing.join(', ')}`
      : '';
    const warnHTML = missing.length ? `<button class="case-section-warn" title="${warnTitle}" onclick="event.stopPropagation()"><span class="material-symbols-outlined">error</span></button>` : '';
    return `
    <div class="case-section" id="case-section-${s.key}">
      <div class="case-section-header" onclick="toggleCaseSection('${s.key}')">
        <div class="case-section-toggle" id="case-toggle-${s.key}">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
        <div class="case-section-labels">
          <div class="case-section-title">${s.title}${warnHTML}</div>
          <div class="case-section-desc">${s.subtitle}</div>
        </div>
        <div class="case-section-actions">
          <button class="case-section-menu-btn" onclick="event.stopPropagation(); toggleCaseSectionMenu('${s.key}', event)">
            <span class="material-symbols-outlined">more_horiz</span>
          </button>
          <div class="case-section-menu hidden" id="case-section-menu-${s.key}">
            <button class="csm-item" onclick="collapseCaseSection('${s.key}', event)"><span class="material-symbols-outlined">unfold_less</span> Collapse</button>
            <button class="csm-item" onclick="copyCaseSection('${s.key}', event)"><span class="material-symbols-outlined">content_copy</span> Copy</button>
            <button class="csm-item" onclick="resetCaseSection('${s.key}', event)"><span class="material-symbols-outlined">restart_alt</span> Reset fields</button>
          </div>
        </div>
      </div>
      <div class="case-section-divider"></div>
      <div class="case-fields" id="case-fields-${s.key}">
        ${s.fields.map(_renderField).join('')}
      </div>
    </div>`;
  }).join('');
  _syncNavTabWarnings();
}

function _syncNavTabWarnings() {
  CASE_SECTIONS.forEach(s => {
    const tab = document.querySelector(`.chf-tab[data-tab="${s.key}"]`);
    if (!tab) return;
    const hasWarn = (s.missingFields || []).length > 0;
    tab.classList.toggle('has-warning', hasWarn);
    if (hasWarn) {
      const n = s.missingFields.length;
      tab.title = `${n} required field${n>1?'s':''} missing: ${s.missingFields.join(', ')}`;
    } else {
      tab.removeAttribute('title');
    }
  });
}

function _renderWfTaskInCasePage(task) {
  // Render an agent task in the full case-page tab — matches split-view task presentation
  _closeStagePopover();
  const id = String(task.id);

  // Apply task-tab mode (hides case-header-meta, company text)
  const casePage = document.getElementById('case-page');
  if (casePage) casePage.classList.add('case-task-tab');

  // Header: show agent icon + task ID in breadcrumb
  const iconEl = document.querySelector('#case-page .wf-case-icon');
  if (iconEl) iconEl.textContent = task.agentIcon || 'smart_toy';
  document.getElementById('case-num-text').textContent = task.agent || id;

  // Inject / update the need row below the case-header-main (like wf-task-need-row in split view)
  let needRow = document.getElementById('case-task-tab-need');
  const caseHeader = document.getElementById('case-header');
  if (!needRow && caseHeader) {
    needRow = document.createElement('div');
    needRow.id = 'case-task-tab-need';
    // Insert after case-header-main, before case-header-footer
    const chMain = caseHeader.querySelector('.case-header-main');
    if (chMain && chMain.nextSibling) caseHeader.insertBefore(needRow, chMain.nextSibling);
    else if (caseHeader) caseHeader.appendChild(needRow);
  }
  if (needRow) {
    needRow.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px">${task.needIcon || 'help'}</span>
      <span>Needs: <strong>${task.need || 'Attention'}</strong></span>`;
  }

  // Hide utility sidebar and section nav tabs
  const utSidebar = document.getElementById('utility-sidebar');
  if (utSidebar) utSidebar.style.display = 'none';
  closeUtility();
  document.querySelectorAll('.case-header-footer').forEach(el => el.style.display = 'none');

  // Render task body in form area
  const formArea = document.getElementById('case-form-area');
  if (formArea) {
    formArea.classList.remove('readonly');
    formArea.dataset.taskId = task.id;
    const _taskFetched = _fetchedCases[task.id] === _currentUser;
    formArea.classList.toggle('task-locked', !_taskFetched);
    if (formArea._taskLockHandler) { formArea.removeEventListener('click', formArea._taskLockHandler); }
    if (!_taskFetched) {
      formArea._taskLockHandler = () => showToast('Fetch this task first to take action', { type: 'warning' });
      formArea.addEventListener('click', formArea._taskLockHandler);
    } else {
      delete formArea._taskLockHandler;
    }
    formArea.innerHTML = `<div style="padding:20px 24px;max-width:780px;flex:1;overflow-y:auto">${_buildWfTaskBody(task, 'tab')}</div>`;
  }
  // Fetch / return button
  _renderFetchBtn(id);
}

function _toggleWfTaskInPage(taskId, idx) {
  const key = `${taskId}-${idx}`;
  _wfTaskItemOpen[key] = !_wfTaskItemOpen[key];
  const task = _activeWfCases().find(c => c.id === taskId && c.type === 'task');
  if (task) _renderWfTaskInCasePage(task);
}

function _toggleWfTaskItemsInPage(taskId) {
  _wfTaskItemsExpanded[taskId] = !_wfTaskItemsExpanded[taskId];
  const task = _activeWfCases().find(c => c.id === taskId && c.type === 'task');
  if (task) _renderWfTaskInCasePage(task);
}

// ── Task resolve / dismiss ────────────────────────────────────────────────────
function _resolveWfTask(taskId, ctx) {
  if (_fetchedCases[taskId] !== _currentUser) {
    showToast('Fetch this task first to take action', { type: 'warning' });
    return;
  }
  if (ctx === 'solver') {
    // Split-view: delegate to the existing case-handback flow
    _triggerCaseHandback(taskId);
    return;
  }
  // Tab-view: show completion screen in form area then close tab
  const formArea = document.getElementById('case-form-area');
  if (formArea) {
    formArea.innerHTML = `
      <div class="wf-handback-screen" style="min-height:320px;justify-content:center">
        <span class="material-symbols-outlined wf-handback-check">check_circle</span>
        <div class="wf-handback-title">Task ${taskId} — Resolved</div>
        <div class="wf-handback-sub">Task cleared. Returning to Work Feed…</div>
        <div class="wf-handback-bar"><div class="wf-handback-bar-fill"></div></div>
        <div class="wf-handback-dots"><span></span><span></span><span></span></div>
      </div>`;
  }
  _updateWfTableStatus(taskId, 'complete');
  const arr = _activeWfCases();
  const idx = arr.findIndex(c => c.id === taskId);
  if (idx !== -1) arr.splice(idx, 1);
  setTimeout(() => {
    closeTab(null, taskId);
    if (wfTableMode) renderWorkFeedTable();
    else renderWorkFeedList();
    _wfUpdateKPIs();
  }, 2400);
}

function _dismissWfTask(taskId, ctx) {
  if (_fetchedCases[taskId] !== _currentUser) {
    showToast('Fetch this task first to take action', { type: 'warning' });
    return;
  }
  const arr = _activeWfCases();
  const idx = arr.findIndex(c => c.id === taskId);
  if (idx !== -1) arr.splice(idx, 1);
  if (ctx === 'solver') {
    const next = _activeWfCases()[0];
    if (next) selectWorkFeedCase(next.id);
    else renderWorkFeedList();
  } else {
    closeTab(null, taskId);
    if (wfTableMode) renderWorkFeedTable();
    else renderWorkFeedList();
    _wfUpdateKPIs();
  }
}

function renderCasePage(caseId) {
  _casePageMode = 'case';
  // If agent view replaced #case-page content, restore original structure first
  if (!document.getElementById('case-form-area') && _casepageTemplate) {
    document.getElementById('case-page').innerHTML = _casepageTemplate;
  }
  const id = String(caseId);
  const _isDed = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';

  // ── Agent task opened in a tab ──────────────────────────────────────────────
  // If this ID belongs to an agent task from the Work Feed, render the task
  // panel in place of the case form and hide the utility sidebar.
  const _wfTaskEntry = _activeWfCases().find(c =>
    c.type === 'task' && String(c.id).replace(/^#\s*/, '') === id.replace(/^#\s*/, '')
  );
  if (_wfTaskEntry) {
    _renderWfTaskInCasePage(_wfTaskEntry);
    return;
  }
  // Restore utility sidebar and section nav tabs in case they were hidden for a task
  const _utSidebar = document.getElementById('utility-sidebar');
  if (_utSidebar) _utSidebar.style.display = '';
  document.querySelectorAll('.case-header-footer').forEach(el => el.style.display = '');
  // Remove task-tab mode styles + need row
  document.getElementById('case-page')?.classList.remove('case-task-tab');
  document.getElementById('case-task-tab-need')?.remove();
  const _iconEl = document.querySelector('#case-page .wf-case-icon');
  if (_iconEl) _iconEl.textContent = 'bookmark';
  const allData = _isDed
    ? [...(_deductionStartedData || []), ...(_deductionTeamData || [])]
    : [...(assignedData || []), ...(queueData || [])];
  const row = allData.find(r => String(r.id).replace(/^#\s*/, '') === id.replace(/^#\s*/, ''));
  // Close stage popover if open from a previous case
  _closeStagePopover();

  // Header
  document.getElementById('case-num-text').textContent = id;
  const companyEl = document.getElementById('case-company-text');
  if (companyEl) companyEl.textContent = (_isDed ? row?.name : row?.client) || 'Unknown';
  const cleanIdEarly = id.replace(/^#\s*/, '');
  const wfStage = _wfCaseStageData?.[cleanIdEarly];
  const stageNames = ['Intake','Review','Escalated','Pending Review','Resolved'];
  const _dedStageNums = { 'Eyeball Review': 1, 'Deduction Validation': 2, 'Credit Memo / Billback': 3, 'Document Collection': 0 };
  const stageIdx = _isDed
    ? (_dedStageNums[row?.stage] ?? 1)
    : (wfStage ? wfStage.tasks : (stageNames.indexOf(row?.stage) + 1 || 1));
  const stageBadge = document.getElementById('case-stage-badge');
  if (stageBadge) stageBadge.textContent = stageIdx;
  const stageText = document.getElementById('case-stage-text');
  if (stageText) stageText.textContent = wfStage ? wfStage.stage : (row?.stage || 'In progress');
  const statusEl = document.getElementById('case-status-text');
  if (statusEl) {
    statusEl.textContent = row?.status || 'Active';
    // Apply exception class to status element for styling
    statusEl.className = 'case-status-text ' + (row?.status === 'Exception' ? 'exception' : '');
  }
  document.getElementById('case-category').textContent = row?.category || 'General';
  document.getElementById('case-vendor-num').textContent = row?.vendorNum || 'V-' + (caseId || '00000').toString().slice(-5);
  // Footer metadata row (chf-right)
  const _wfEntry = _isDed ? (_deductionWfData || []).find(d => d.id === cleanIdEarly) : null;
  const _priColors = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' };
  const _setChf = (elId, val, color) => { const el = document.getElementById(elId); if (!el) return; el.textContent = val || '—'; el.style.color = color || ''; };
  const _pri = row?.priority || _wfEntry?.priority || '—';
  _setChf('chf-created',  row?.created  || _wfEntry?.claimDate || '—');
  _setChf('chf-priority', _pri, _priColors[_pri] || '');
  _setChf('chf-category', row?.client   || row?.category || _wfEntry?.deductionType || '—');
  _setChf('chf-type',     row?.caseType || _wfEntry?.caseType  || 'Multiple Validation');
  _setChf('chf-subtype',  row?.subtype  || _wfEntry?.subtype   || 'No Casualties');
  // Render sections — deduction cases get the 3-stage pipeline layout
  if (_isDed) {
    _renderDeductionCase(row, id);
  } else if (row?.documents) {
    _renderDocumentCase(row);
  } else {
    _setCaseTabs(_ORIGINAL_TABS);
    renderCaseSections(CASE_SECTIONS);
    // Populate known fields from row data
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('field-case-id', id);
    set('field-case-title', row?.name || '');
    set('field-assigned-to', (row?.assignees && row.assignees[0]) || '');
    set('field-date-filed', row?.created || '');
    set('field-trk-opened', row?.created || '');
    set('field-trk-updated', row?.created || '');
  }
  // Apply read-only mode if case was opened from Work Feed
  const casePage = document.getElementById('case-page');
  const isReadOnly = _readOnlyCaseIds.has(cleanIdEarly);
  if (casePage) casePage.classList.toggle('wf-readonly', isReadOnly);
  // Back button — inject/remove from header left
  const headerLeft = document.querySelector('#case-page .case-header-left');
  if (headerLeft) {
    headerLeft.querySelector('.case-back-btn')?.remove();
    if (isReadOnly) {
      const btn = document.createElement('button');
      btn.className = 'case-back-btn';
      btn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>Work Feed';
      btn.onclick = () => selectTab('home');
      headerLeft.insertBefore(btn, headerLeft.firstChild);
    }
  }
  if (isReadOnly) {
    const area = document.getElementById('case-form-area');
    if (area) {
      area.classList.add('readonly');
      const banner = document.createElement('div');
      banner.className = 'case-readonly-banner';
      banner.innerHTML = '<span class="material-symbols-outlined">visibility</span> Read Only — opened from Work Feed';
      area.insertBefore(banner, area.firstChild);
      area.querySelectorAll('input, select, textarea').forEach(el => {
        el.setAttribute('readonly', '');
        el.setAttribute('disabled', '');
      });
    }
  }
  // Reset utility panel (tabs already set to first-active by _setCaseTabs)
  closeUtility();
  // Update AI context to this case (if drawer is open)
  if (document.getElementById('ai-drawer')?.classList.contains('open')) {
    _setAiContext(caseId);
  } else {
    // Pre-set so it's ready when the drawer opens
    const all = [...(assignedData || []), ...(queueData || [])];
    _aiCurrentCase = all.find(r => String(r.id).replace(/^#\s*/, '') === String(caseId).replace(/^#\s*/, '')) || null;
    _aiContextDismissed = false;
  }
  // Render the fetch / return / fetched-by-other action button
  _renderFetchBtn(caseId);
  // Lock form inputs until fetched by current user
  const _fcId = String(caseId).replace(/^#\s*/, '');
  _applyCaseFormLock(_fetchedCases[_fcId] !== _currentUser);
}

function _renderFetchBtn(caseId) {
  if (_casePageMode !== 'case') return;
  const el = document.getElementById('case-header-fetch');
  if (!el) return;
  el.innerHTML = '';
  const id = String(caseId).replace(/^#\s*/, '');
  const fetchedBy = _fetchedCases[id];
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kbd = isMac ? 'Cmd+J' : 'Ctrl+J';
  if (!fetchedBy) {
    el.innerHTML = `
      <div class="fetch-split" id="fetch-split-wrap">
        <button class="fetch-split-main" onclick="fetchCase('${caseId}')">
          <span class="material-symbols-outlined">download</span>
          Fetch case
          <span class="case-fetch-shortcut">${kbd}</span>
        </button>
        <div class="fetch-split-sep"></div>
        <button class="fetch-split-arrow" title="More options" onclick="_fetchSplitToggle(event)">
          <span class="material-symbols-outlined">expand_more</span>
        </button>
        <div class="fetch-split-drop" id="fetch-split-drop">
          <button class="fetch-split-drop-item" onclick="_fetchSplitAct('allocate','${caseId}')">
            <span class="material-symbols-outlined">group</span> Allocate
          </button>
          <button class="fetch-split-drop-item" onclick="_fetchSplitAct('assign','${caseId}')">
            <span class="material-symbols-outlined">person_add</span> Assign
          </button>
        </div>
      </div>`;
  } else if (fetchedBy === _currentUser) {
    el.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
        ${_activeUserAvatarHtml(fetchedBy, 'sm')}
        <span>Fetched by you</span>
        <div class="fetch-split" id="fetch-split-wrap">
          <button class="fetch-split-main" onclick="returnCase()">
            <span class="material-symbols-outlined">undo</span> Return
            <span class="case-fetch-shortcut">${kbd}</span>
          </button>
          <div class="fetch-split-sep"></div>
          <button class="fetch-split-arrow" title="More options" onclick="_fetchSplitToggle(event)">
            <span class="material-symbols-outlined">expand_more</span>
          </button>
          <div class="fetch-split-drop" id="fetch-split-drop">
            <button class="fetch-split-drop-item" onclick="_fetchSplitAct('allocate','${caseId}')">
              <span class="material-symbols-outlined">group</span> Allocate
            </button>
            <button class="fetch-split-drop-item" onclick="_fetchSplitAct('assign','${caseId}')">
              <span class="material-symbols-outlined">person_add</span> Assign
            </button>
          </div>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
        ${_activeUserAvatarHtml(fetchedBy, 'sm')}
        <span>In progress by <strong>${fetchedBy}</strong></span>
      </div>`;
  }
}

// Solver panel (Work Feed) fetch/return button
function _renderWfFetchBtn(caseId) {
  const ctrl = document.getElementById('wf-fetch-ctrl');
  if (!ctrl) return;
  const fetchedBy = _fetchedCases[caseId];
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kbd = isMac ? 'Cmd+J' : 'Ctrl+J';
  const _dropHtml = `
    <div class="fetch-split-drop" id="wf-fetch-split-drop">
      <button class="fetch-split-drop-item" onclick="_wfFetchSplitAct('allocate','${caseId}')">
        <span class="material-symbols-outlined">group</span> Allocate
      </button>
      <button class="fetch-split-drop-item" onclick="_wfFetchSplitAct('assign','${caseId}')">
        <span class="material-symbols-outlined">person_add</span> Assign
      </button>
    </div>`;
  if (!fetchedBy) {
    ctrl.innerHTML = `
      <div class="fetch-split" id="wf-fetch-split-wrap">
        <button class="fetch-split-main" onclick="fetchCaseFromList('${caseId}')">
          <span class="material-symbols-outlined">download</span>
          Fetch case
          <span class="case-fetch-shortcut">${kbd}</span>
        </button>
        <div class="fetch-split-sep"></div>
        <button class="fetch-split-arrow" title="More options" onclick="_wfFetchSplitToggle(event)">
          <span class="material-symbols-outlined">expand_more</span>
        </button>
        ${_dropHtml}
      </div>`;
  } else if (fetchedBy === _currentUser) {
    ctrl.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
        ${_activeUserAvatarHtml(fetchedBy, 'sm')}
        <span>Fetched by you</span>
        <div class="fetch-split" id="wf-fetch-split-wrap">
          <button class="fetch-split-main" onclick="returnCaseFromList('${caseId}')">
            <span class="material-symbols-outlined">undo</span> Return
            <span class="case-fetch-shortcut">${kbd}</span>
          </button>
          <div class="fetch-split-sep"></div>
          <button class="fetch-split-arrow" title="More options" onclick="_wfFetchSplitToggle(event)">
            <span class="material-symbols-outlined">expand_more</span>
          </button>
          ${_dropHtml}
        </div>
      </div>`;
  } else {
    ctrl.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)">
        ${_activeUserAvatarHtml(fetchedBy, 'sm')}
        <span>In progress by <strong>${fetchedBy}</strong></span>
      </div>`;
  }
}

function _wfFetchSplitToggle(e) {
  e.stopPropagation();
  const drop = document.getElementById('wf-fetch-split-drop');
  if (!drop) return;
  const isOpen = drop.classList.toggle('open');
  if (isOpen) {
    // Use fixed positioning to escape overflow:hidden on .wf-solver / .wf-panels
    const btnRect = e.currentTarget.getBoundingClientRect();
    drop.style.position = 'fixed';
    drop.style.top      = (btnRect.bottom + 6) + 'px';
    drop.style.right    = (window.innerWidth - btnRect.right) + 'px';
    drop.style.left     = '';
    setTimeout(() => document.addEventListener('click', _wfFetchSplitClose, { once: true }), 0);
  }
}
function _wfFetchSplitClose() {
  const drop = document.getElementById('wf-fetch-split-drop');
  if (drop) drop.classList.remove('open');
}
function _wfFetchSplitAct(action, caseId) {
  _wfFetchSplitClose();
  if (action === 'allocate') alert('Allocate — coming soon');
  else if (action === 'assign') alert('Assign — coming soon');
}

// Lock / unlock the full case page form area
function _applyCaseFormLock(lock) {
  const area = document.querySelector('#case-page .case-form-area');
  if (!area) return;
  // Remove any existing lock click handler first
  if (area._lockClickHandler) {
    area.removeEventListener('click', area._lockClickHandler);
    delete area._lockClickHandler;
  }
  if (lock) {
    area.classList.add('readonly');
    area.querySelectorAll('input, select, textarea').forEach(el => {
      el.setAttribute('readonly', ''); el.setAttribute('disabled', '');
    });
    area._lockClickHandler = () => showToast('Fetch this case first to start editing', { type: 'warning' });
    area.addEventListener('click', area._lockClickHandler);
  } else {
    area.classList.remove('readonly');
    area.querySelectorAll('input, select, textarea').forEach(el => {
      el.removeAttribute('readonly'); el.removeAttribute('disabled');
    });
  }
}

// Lock / unlock the WF solver body
function _applyWfSolverLock(caseId) {
  const body = document.getElementById('wf-solver-body');
  if (!body) return;
  const locked = _fetchedCases[String(caseId)] !== _currentUser;
  body.classList.toggle('locked', locked);
  if (body._lockHandler) { body.removeEventListener('click', body._lockHandler); delete body._lockHandler; }
  if (locked) {
    body._lockHandler = () => showToast('Fetch this case first to start editing', { type: 'warning' });
    body.addEventListener('click', body._lockHandler);
  }
}

function _fetchSplitToggle(e) {
  e.stopPropagation();
  const drop = document.getElementById('fetch-split-drop');
  if (!drop) return;
  const isOpen = drop.classList.toggle('open');
  if (isOpen) {
    setTimeout(() => document.addEventListener('click', _fetchSplitClose, { once: true }), 0);
  }
}
function _fetchSplitClose() {
  const drop = document.getElementById('fetch-split-drop');
  if (drop) drop.classList.remove('open');
}
function _fetchSplitAct(action, caseId) {
  _fetchSplitClose();
  if (action === 'allocate') alert('Allocate — coming soon');
  else if (action === 'assign')   alert('Assign — coming soon');
}

function fetchCase(caseId) {
  const id = String(caseId).replace(/^#\s*/, '');
  _fetchedCases[id] = _currentUser;
  _renderFetchBtn(caseId);
  _applyCaseFormLock(false); // unlock now that user has claimed it
  // If this is a task open in a tab, re-render task panel to unlock buttons
  const formArea = document.getElementById('case-form-area');
  if (formArea && formArea.dataset.taskId === id) {
    const task = _activeWfCases().find(c => c.id === id && c.type === 'task');
    if (task) _renderWfTaskInCasePage(task);
  }
  // Refresh list row and WF row if visible
  const rawId = String(caseId);
  _updateRowClaimUI(id, rawId);
  if (!wfTableMode) renderWorkFeedList(); else renderWorkFeedTable();
}

let activeUtil = null;

function toggleUtility(util) {
  const panel = document.getElementById('utility-panel');
  const body = document.getElementById('utility-panel-body');

  // If same button clicked again — close the panel
  if (activeUtil === util) {
    closeUtility();
    return;
  }

  activeUtil = util;
  // Update strip button states
  document.querySelectorAll('.util-strip-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.util === util);
  });

  // Reset read mode when switching away from conversations
  if (_activeConvIndex !== null) {
    _activeConvIndex = null;
    document.getElementById('conv-read-header').style.display = 'none';
    document.getElementById('conv-read-footer').style.display = 'none';
  }

  // Show/hide conversations-specific header elements
  const convToolbar = document.getElementById('conv-toolbar');
  const convTitleRow = document.getElementById('conv-title-row');
  const isConv = util === 'conversations';
  if (convToolbar) convToolbar.style.display = isConv ? 'flex' : 'none';
  if (convTitleRow) convTitleRow.style.display = isConv ? 'flex' : 'none';

  // Render content
  if (util === 'conversations') {
    renderConversationsPanel(body);
  } else if (util === 'attachments') {
    renderAttachmentsPanel(body);
  } else if (util === 'activity') {
    renderActivityPanel(body);
  }

  const wasOpen = panel.classList.contains('open');
  panel.classList.add('open');
  if (!wasOpen) {
    // Animate open: set target width in the next frame so CSS transition fires from 0
    const caseBody = document.querySelector('.case-body');
    const tw = caseBody ? Math.max(280, Math.floor(caseBody.offsetWidth * 0.5) - 44) : 316;
    requestAnimationFrame(() => { panel.style.width = tw + 'px'; });
  }
}

function closeUtility() {
  activeUtil = null;
  if (_activeConvIndex !== null) {
    _activeConvIndex = null;
    document.getElementById('conv-read-header').style.display = 'none';
    document.getElementById('conv-read-footer').style.display = 'none';
    document.getElementById('conv-toolbar').style.display = 'none';
    document.getElementById('conv-title-row').style.display = 'none';
  }
  const panel = document.getElementById('utility-panel');
  if (panel) {
    panel.classList.remove('open');
    panel.style.width = ''; // clear any inline resize width
  }
  document.querySelectorAll('.util-strip-btn').forEach(b => b.classList.remove('active'));
}

/* ── Agent Utility Sidebar ── */
let _activeAgentUtil = null;

function toggleAgentUtil(util) {
  const panel = document.getElementById('av-util-panel');
  const strip  = document.getElementById('av-util-strip');
  if (!panel || !strip) return;
  if (_activeAgentUtil === util) { closeAgentUtil(); return; }
  _activeAgentUtil = util;
  strip.querySelectorAll('.util-strip-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.util === util));
  const titleEl = document.getElementById('av-util-panel-title');
  if (titleEl) {
    titleEl.textContent = util === 'activity' ? 'Activity' : util === 'prompt' ? 'System Prompt' : 'Configuration';
  }
  const body = document.getElementById('av-util-panel-body');
  if (body) body.innerHTML = _agentUtilContent(util, _activeAgentType);
  panel.classList.add('open');
}

function closeAgentUtil() {
  _activeAgentUtil = null;
  const panel = document.getElementById('av-util-panel');
  if (panel) {
    panel.classList.remove('open');
    panel.style.width = '';
  }
  document.getElementById('av-util-strip')?.querySelectorAll('.util-strip-btn')
    .forEach(b => b.classList.remove('active'));
}

function startAgentPanelResize(e) {
  e.preventDefault();
  const panel = document.getElementById('av-util-panel');
  const handle = document.getElementById('av-panel-resize-handle');
  const startX = e.clientX;
  const startW = panel.offsetWidth;
  panel.style.transition = 'none';
  if (handle) handle.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  function onMove(ev) {
    const delta = startX - ev.clientX;
    const newW = Math.min(600, Math.max(240, startW + delta));
    panel.style.width = newW + 'px';
  }
  function onUp() {
    panel.style.transition = '';
    if (handle) handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function _agentUtilContent(util, type) {
  const d = agentDetailData[type] || {};
  const fd = agentData.find(a => a.type === type) || {};
  if (util === 'activity') {
    const logsByType = {
      Retriever: [
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #2947-5839 resolved',                  sub: 'Invoice matched & forwarded to Signer',               time: 'Just now',  tag: null },
        { icon: 'search',          color: '#2563eb', label: 'Querying vendor portal — TechLogic Inc.',   sub: 'Endpoint: /api/invoices?ref=INV-9921',                 time: '1m ago',    tag: 'API call' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Invoice INV-9921 located',                  sub: 'File size: 142 KB · Pages: 3',                        time: '2m ago',    tag: null },
        { icon: 'person',          color: '#7c3aed', label: 'Assist requested: Credentials',             sub: 'Portal login token expired — escalated to agent',     time: '7m ago',    tag: 'Assist' },
        { icon: 'sync',            color: '#2563eb', label: 'Batch run initiated (14 documents)',         sub: 'Cases: #1002–#1015 · Priority: Normal',               time: '12m ago',   tag: 'Batch' },
        { icon: 'warning',         color: '#d97706', label: 'CAPTCHA block on case #1233-9845',          sub: 'Vendor: GlobalSource LLC · Retrying in 60s',          time: '18m ago',   tag: 'Blocked' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #3212-2345 closed',                    sub: '2 documents retrieved · Handoff complete',            time: '31m ago',   tag: null },
        { icon: 'search',          color: '#2563eb', label: 'Querying portal — Apex Freight',            sub: 'Retry #2 of 3 · Previous timeout: 30s',               time: '38m ago',   tag: 'Retry' },
        { icon: 'file_present',    color: '#0891b2', label: 'Document cached: CERT-4490.pdf',            sub: 'Expiry: 24h · Stored in secure buffer',               time: '45m ago',   tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Portal unreachable — ClearBridge Inc.',     sub: 'HTTP 503 · Case #5510-2231 paused',                   time: '54m ago',   tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #4401-1120 resolved',                  sub: '1 document retrieved in 4.2s',                        time: '1h ago',    tag: null },
        { icon: 'sync',            color: '#2563eb', label: 'Auth token refreshed — NovaBridge Portal',  sub: 'Session extended by 8h',                             time: '1h 12m ago',tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Rate limit hit — PrimeDocs API',            sub: '60 req/min exceeded · Queue paused 2m',               time: '1h 20m ago',tag: 'Blocked' },
        { icon: 'file_present',    color: '#0891b2', label: '3 invoices retrieved — Batch #007',         sub: 'Cases #1010, #1011, #1012 · Total: 540 KB',           time: '1h 34m ago',tag: 'Batch' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist resolved by Alex K.',                sub: 'New credentials applied · 2 blocked cases resumed',   time: '1h 41m ago',tag: 'Assist' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #2201-8830 closed',                    sub: 'SLA met · 3 min under deadline',                      time: '2h ago',    tag: null },
        { icon: 'search',          color: '#2563eb', label: 'Deep crawl — Nexus Vendor Hub',             sub: 'Traversed 4 pages · Found ref: NX-00492',             time: '2h 15m ago',tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Extraction failed — INV-7731.pdf',          sub: 'Corrupted file · Case escalated for manual review',   time: '2h 29m ago',tag: 'Error' },
        { icon: 'sync',            color: '#2563eb', label: 'Scheduled batch started (22 documents)',    sub: 'Priority: High · ETA 8 min',                         time: '3h ago',    tag: 'Batch' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #1998-6610 resolved',                  sub: 'Retrieval time: 1.8s · No assist needed',             time: '3h 20m ago',tag: null },
      ],
      Signer: [
        { icon: 'task_alt',        color: '#16a34a', label: 'Document signed — AGRMT-2291.pdf',          sub: 'Signature applied at field 3 of 3 · Case #4481',      time: 'Just now',  tag: null },
        { icon: 'draw',            color: '#2563eb', label: 'Signature fields detected (3)',              sub: 'Fields: sign_1, initials_1, date_1',                  time: '3m ago',    tag: 'OCR' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist requested: Authority check',         sub: 'Signatory not in approved list — escalated',          time: '9m ago',    tag: 'Assist' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Certificate validated — CERT-8820',         sub: 'Chain of trust verified · Expiry: 2026-01-01',        time: '15m ago',   tag: null },
        { icon: 'task_alt',        color: '#16a34a', label: 'Batch signed: 6 documents',                 sub: 'Cases #3310–#3315 · Avg 1.2s/doc',                    time: '24m ago',   tag: 'Batch' },
        { icon: 'warning',         color: '#d97706', label: 'Signature mismatch on CONTR-0041.pdf',      sub: 'Expected: DocuSign · Found: WetInk scan',             time: '33m ago',   tag: 'Warning' },
        { icon: 'draw',            color: '#2563eb', label: 'Signing — INVOICE-5510.pdf',                sub: 'Field 2 of 4 · Vendor: ClearPath Ltd',                time: '41m ago',   tag: null },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #5102-3390 resolved',                  sub: '2 documents signed · Forwarded to Comparer',         time: '52m ago',   tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Auth failure — e-Sign gateway',             sub: 'Token expired mid-flow · Case #5290 paused',         time: '1h 5m ago', tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Document countersigned — NDA-0029.pdf',     sub: 'Both parties confirmed · Case closed',                time: '1h 18m ago',tag: null },
        { icon: 'person',          color: '#7c3aed', label: 'Assist resolved — Sarah M.',                sub: 'New signing cert uploaded · 3 cases resumed',         time: '1h 30m ago',tag: 'Assist' },
        { icon: 'sync',            color: '#2563eb', label: 'Batch signing started (11 documents)',      sub: 'Priority: Urgent · Est. 14s total',                   time: '1h 45m ago',tag: 'Batch' },
        { icon: 'draw',            color: '#2563eb', label: 'Signature placed — AGRMT-1902.pdf',         sub: 'Annotation: clause 7.2 initialled',                   time: '2h ago',    tag: null },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #4809-2210 closed',                    sub: 'SLA met · 7 min under deadline',                     time: '2h 20m ago',tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'PDF locked — cannot apply signature',       sub: 'Owner password required · Escalated',                time: '2h 40m ago',tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: '8 documents signed in batch run',           sub: 'All fields populated · No mismatches',               time: '3h ago',    tag: 'Batch' },
        { icon: 'warning',         color: '#d97706', label: 'Date field auto-fill overridden',           sub: 'Doc requested specific format: DD/MM/YYYY',           time: '3h 15m ago',tag: 'Warning' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #3220-1105 resolved',                  sub: 'Signed in 2.1s · Routed to OCR for extraction',       time: '3h 30m ago',tag: null },
      ],
      OCR: [
        { icon: 'task_alt',        color: '#16a34a', label: 'Extraction complete — INV-9921.pdf',        sub: '12 fields extracted · Confidence: 98.4%',             time: 'Just now',  tag: null },
        { icon: 'document_scanner',color: '#2563eb', label: 'Scanning page 2/3 — CONTR-4410.pdf',        sub: 'Vendor: TechLogic Inc. · Resolution: 300dpi',         time: '2m ago',    tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Low confidence — field "Total Amount"',     sub: 'Score: 61% · Flagged for human review',               time: '8m ago',    tag: 'Review' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Batch extraction — 9 documents',            sub: 'Avg confidence: 96.1% · 2 flagged',                   time: '14m ago',   tag: 'Batch' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist requested: Handwriting',             sub: 'Signature block unreadable — escalated',              time: '22m ago',   tag: 'Assist' },
        { icon: 'document_scanner',color: '#2563eb', label: 'Re-scanning — CERT-8820.pdf (attempt 2)',   sub: 'Increased contrast · DPI: 600',                       time: '29m ago',   tag: 'Retry' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Field mapping complete — Case #3312',       sub: '8 fields → CRM schema · 0 errors',                   time: '37m ago',   tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Corrupt page — INVOICE-0042.pdf p.4',       sub: 'Skipped · Remaining 3 pages extracted',              time: '48m ago',   tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #2991-4410 resolved',                  sub: 'All 14 fields validated · Forwarded to Writer',       time: '57m ago',   tag: null },
        { icon: 'document_scanner',color: '#2563eb', label: 'Template matched — StandardInvoice_v3',    sub: 'Confidence: 99.2% · Fields pre-mapped',               time: '1h 5m ago', tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Currency mismatch — field "Amount Due"',   sub: 'USD vs EUR detected · Flagged',                       time: '1h 18m ago',tag: 'Review' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Batch extraction — 14 documents',           sub: 'All fields above 90% confidence',                     time: '1h 32m ago',tag: 'Batch' },
        { icon: 'document_scanner',color: '#2563eb', label: 'Scanning AGRMT-5510.pdf',                   sub: '6 pages · Clause extraction mode',                   time: '1h 50m ago',tag: null },
        { icon: 'person',          color: '#7c3aed', label: 'Assist resolved — Jamie T.',                sub: 'Handwritten amount confirmed: $4,220.00',             time: '2h 8m ago', tag: 'Assist' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #4102-1189 closed',                    sub: 'Extraction rate: 100% · SLA met',                     time: '2h 30m ago',tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Scan engine timeout — NDA-0044.pdf',        sub: 'File size 48 MB exceeded limit · Chunked retry',      time: '2h 50m ago',tag: 'Error' },
        { icon: 'check_circle',    color: '#16a34a', label: '20 fields extracted — CERT-3390.pdf',       sub: 'Confidence: 97.7% · Zero manual corrections',         time: '3h 12m ago',tag: null },
      ],
      Writer: [
        { icon: 'task_alt',        color: '#16a34a', label: 'Email drafted — Case #5510',                sub: 'To: vendor@techlogic.com · 142 words · Tone: formal', time: 'Just now',  tag: null },
        { icon: 'edit_note',       color: '#2563eb', label: 'Generating dispute letter — Case #4481',    sub: 'Template: InvoiceDisputeV2 · 3 clauses',              time: '4m ago',    tag: null },
        { icon: 'check_circle',    color: '#16a34a', label: 'Summary report created — Case #3312',       sub: '280 words · PDF exported',                           time: '11m ago',   tag: null },
        { icon: 'person',          color: '#7c3aed', label: 'Assist requested: Legal tone review',       sub: 'Output flagged for compliance check',                 time: '19m ago',   tag: 'Assist' },
        { icon: 'edit_note',       color: '#2563eb', label: 'Drafting follow-up email — Case #2291',     sub: 'Prior thread: 4 messages · Context injected',         time: '27m ago',   tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Ambiguous instruction — Case #5290',        sub: '"Send reminder" — multiple contacts found',           time: '35m ago',   tag: 'Warning' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Notification batch sent — 8 cases',         sub: 'Channel: email · 0 bounces',                          time: '44m ago',   tag: 'Batch' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #1998-6610 resolved',                  sub: 'Closing summary approved · Case archived',            time: '53m ago',   tag: null },
        { icon: 'edit_note',       color: '#2563eb', label: 'Generating SLA breach notice — Case #4809', sub: 'Deadline: 2026-05-02 · Days overdue: 1',             time: '1h 2m ago', tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Template not found — InvoiceEscalation_v4', sub: 'Fallback to v3 · Minor format diff',                  time: '1h 15m ago',tag: 'Error' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Batch notifications sent — 12 vendors',     sub: 'All delivered · Open rate: 83%',                      time: '1h 28m ago',tag: 'Batch' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist resolved — Dana L.',                 sub: 'Escalation letter approved · Sent',                   time: '1h 40m ago',tag: 'Assist' },
        { icon: 'edit_note',       color: '#2563eb', label: 'Contract amendment drafted — CONTR-0099',   sub: 'Clause 4.1 revised · 3 redlines',                    time: '2h ago',    tag: null },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #3220-1105 resolved',                  sub: '2 emails sent · No reply required',                  time: '2h 20m ago',tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Tone mismatch flagged — Case #4102',        sub: 'AI draft: assertive · Expected: neutral',            time: '2h 38m ago',tag: 'Warning' },
        { icon: 'task_alt',        color: '#16a34a', label: '14 case summaries generated',               sub: 'Avg 210 words/summary · Batch #12',                  time: '3h ago',    tag: 'Batch' },
      ],
      Comparer: [
        { icon: 'task_alt',        color: '#16a34a', label: 'Comparison passed — Case #4481',            sub: 'Invoice matches PO #PO-2291 · 0 discrepancies',       time: 'Just now',  tag: null },
        { icon: 'compare_arrows',  color: '#2563eb', label: 'Comparing INV-9921 vs PO-2291',             sub: '6 fields compared · 1 delta found',                   time: '3m ago',    tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Amount delta — Case #5102',                 sub: 'Invoice: $12,450 · PO: $12,200 · Diff: $250',         time: '9m ago',    tag: 'Delta' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Batch comparison — 8 pairs complete',       sub: '7 passed · 1 flagged · Avg 1.4s/pair',                time: '16m ago',   tag: 'Batch' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist requested: Ambiguous PO line',       sub: 'PO-4490 line 4 has two matching SKUs',                time: '24m ago',   tag: 'Assist' },
        { icon: 'compare_arrows',  color: '#2563eb', label: 'Line-item comparison — INVOICE-5510',       sub: '14 line items · Tolerance: ±$0.01',                   time: '32m ago',   tag: null },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #3312-2345 resolved',                  sub: 'Match confirmed · Approved for payment',              time: '41m ago',   tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Schema mismatch — AGRMT-0042 vs template',  sub: 'Missing field: "delivery_date" · Escalated',          time: '50m ago',   tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #2947-5839 resolved',                  sub: 'All 9 fields matched · Forwarded to Signer',          time: '1h ago',    tag: null },
        { icon: 'compare_arrows',  color: '#2563eb', label: 'Re-compare after correction — Case #5290',  sub: 'Retry #1 · Previous: 2 deltas',                      time: '1h 12m ago',tag: 'Retry' },
        { icon: 'warning',         color: '#d97706', label: 'Date format delta — Case #4809',            sub: 'PO: 2026-04-30 · Invoice: 30/04/2026',               time: '1h 25m ago',tag: 'Delta' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Batch comparison — 11 pairs complete',      sub: 'All passed · No manual review needed',               time: '1h 38m ago',tag: 'Batch' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist resolved — Alex K.',                 sub: 'Correct PO identified · Comparison rerun',            time: '1h 55m ago',tag: 'Assist' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Case #4102-1189 closed',                    sub: '6 pairs compared · 100% match rate',                 time: '2h 10m ago',tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Comparison engine error — timeout',         sub: 'Case #3220 paused · Retrying in 30s',                time: '2h 30m ago',tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: '18 comparisons run — Batch #14',            sub: '16 passed · 2 flagged for review',                   time: '3h ago',    tag: 'Batch' },
        { icon: 'compare_arrows',  color: '#2563eb', label: 'Deep diff — CONTR-0099 vs CONTR-0098',      sub: '3 clause changes detected · Highlighted',            time: '3h 20m ago',tag: null },
      ],
      Classifier: [
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #5510 classified: Invoice',            sub: 'Confidence: 99.1% · Routed to Retriever',             time: 'Just now',  tag: null },
        { icon: 'category',        color: '#2563eb', label: 'Classifying CONTR-4410.pdf',                sub: 'Model: DocClassifier-v4 · 3 candidate labels',        time: '2m ago',    tag: null },
        { icon: 'warning',         color: '#d97706', label: 'Low confidence — Case #4481',               sub: 'Score: 58% · Invoice vs Receipt ambiguous',           time: '7m ago',    tag: 'Review' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Batch classified — 12 documents',           sub: '11 auto-routed · 1 flagged · Avg 0.4s/doc',           time: '13m ago',   tag: 'Batch' },
        { icon: 'person',          color: '#7c3aed', label: 'Assist requested: New doc type',            sub: 'Unknown format "GmbH Rechnung" — escalated',          time: '21m ago',   tag: 'Assist' },
        { icon: 'category',        color: '#2563eb', label: 'Re-classifying after label correction',     sub: 'Case #3312 · Updated: Receipt → Invoice',            time: '29m ago',   tag: 'Retry' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Routing rule applied — Case #2291',         sub: 'Invoice → OCR → Comparer → Signer pipeline',          time: '37m ago',   tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Classification model error — Case #5290',   sub: 'Fallback to rule-based · Manual review flagged',      time: '46m ago',   tag: 'Error' },
        { icon: 'task_alt',        color: '#16a34a', label: 'Case #1998-6610 resolved',                  sub: 'Classified + routed in 0.3s',                        time: '55m ago',   tag: null },
        { icon: 'category',        color: '#2563eb', label: 'Classifying 20-document batch',             sub: 'Batch #009 · Mixed: Invoice, PO, Cert',              time: '1h 4m ago', tag: 'Batch' },
        { icon: 'warning',         color: '#d97706', label: 'Routing conflict — Case #4809',             sub: '2 rules matched · Highest priority applied',          time: '1h 17m ago',tag: 'Warning' },
        { icon: 'check_circle',    color: '#16a34a', label: 'New template learned — "EU Invoice"',       sub: 'Added to model registry · v4.1.2',                   time: '1h 32m ago',tag: null },
        { icon: 'person',          color: '#7c3aed', label: 'Assist resolved — Jamie T.',                sub: '"GmbH Rechnung" mapped to Invoice class',             time: '1h 48m ago',tag: 'Assist' },
        { icon: 'task_alt',        color: '#16a34a', label: '25 documents classified — Batch #010',      sub: 'All above 90% · 0 manual reviews',                   time: '2h ago',    tag: 'Batch' },
        { icon: 'category',        color: '#2563eb', label: 'Priority re-classification — Case #4102',   sub: 'Urgency score updated: Normal → High',               time: '2h 22m ago',tag: null },
        { icon: 'error_outline',   color: '#dc2626', label: 'Duplicate detected — Case #3220',           sub: 'Matches Case #3215 · Merged and closed',             time: '2h 42m ago',tag: 'Error' },
        { icon: 'check_circle',    color: '#16a34a', label: 'Classification accuracy report generated',  sub: '30-day avg: 97.3% · Top miss: Receipt vs Invoice',   time: '3h ago',    tag: null },
      ],
    };
    const events = logsByType[type] || logsByType['Retriever'];
    const tagColors = { 'Assist':'#7c3aed', 'Batch':'#0891b2', 'Error':'#dc2626', 'Blocked':'#d97706', 'Retry':'#2563eb', 'Warning':'#d97706', 'Delta':'#d97706', 'Review':'#d97706', 'OCR':'#2563eb', 'API call':'#2563eb' };
    return `<div style="padding:0 16px 16px">` +
      events.map((e, i) => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;${i < events.length-1 ? 'border-bottom:1px solid var(--border-light)' : ''}">
          <div style="display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;padding-top:1px">
            <span class="material-symbols-outlined" style="font-size:16px;color:${e.color}">${e.icon}</span>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span style="font-size:12px;color:var(--text-primary);line-height:1.4;font-weight:500">${e.label}</span>
              ${e.tag ? `<span style="font-size:10px;font-weight:600;color:${tagColors[e.tag]||'#666'};background:${tagColors[e.tag]||'#666'}18;border-radius:4px;padding:1px 5px;line-height:1.5">${e.tag}</span>` : ''}
            </div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;line-height:1.4">${e.sub}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:3px">${e.time}</div>
          </div>
        </div>`).join('') + `</div>`;
  }
  if (util === 'prompt') {
    const caps = (d.capabilities || []).slice(0, 5);
    return `<div style="padding:16px">
      <div style="margin-bottom:14px">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Objective</div>
        <div style="font-size:12px;color:var(--text-primary);line-height:1.6;background:var(--bg-light);border-radius:6px;padding:10px 12px;border:1px solid var(--border-light)">${d.objective || '—'}</div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Capabilities</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${caps.map(c => `<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)"><span class="material-symbols-outlined" style="font-size:14px;color:#16a34a">check_small</span>${c}</div>`).join('')}
        </div>
      </div>
    </div>`;
  }
  if (util === 'config') {
    const rows = [
      ['Model',         'claude-3-5-sonnet'],
      ['Timeout',       '120s per step'],
      ['Retry Policy',  '3× with backoff'],
      ['Max Instances', fd.running ?? '—'],
      ['Portals',       (d.portals || ['—']).join(', ')],
    ];
    return `<div style="padding:4px 16px 16px">` +
      rows.map(([k, v]) => `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--border-light);gap:8px">
          <span style="font-size:12px;color:var(--text-muted);flex-shrink:0">${k}</span>
          <span style="font-size:12px;color:var(--text-primary);text-align:right;word-break:break-all">${v}</span>
        </div>`).join('') + `</div>`;
  }
  return '';
}

/* ── Stage Popover ── */
let _stagePopoverOpen = false;

const _CASE_STAGES = [
  { name: 'Intake',         sub: 'Case received & logged' },
  { name: 'Review',         sub: 'Initial assessment' },
  { name: 'Escalated',      sub: 'Requires senior review' },
  { name: 'Pending Review', sub: 'Awaiting decision' },
  { name: 'Resolved',       sub: 'Resolution confirmed' },
];

function toggleStagePopover(event) {
  event.stopPropagation();
  _stagePopoverOpen ? _closeStagePopover() : _openStagePopover();
}

function _openStagePopover() {
  _stagePopoverOpen = true;
  _renderStagePopover();
  document.getElementById('stage-popover')?.classList.remove('hidden');
  document.getElementById('stage-chevron')?.classList.add('open');
}

function _closeStagePopover() {
  _stagePopoverOpen = false;
  document.getElementById('stage-popover')?.classList.add('hidden');
  document.getElementById('stage-chevron')?.classList.remove('open');
}

const _DEDUCTION_STAGES = [
  { name: 'Eyeball Review',         sub: 'OCR field verification'         },
  { name: 'Deduction Validation',   sub: 'Analyst determination'          },
  { name: 'Credit Memo / Billback', sub: 'Authorization & notification'   },
];

function _renderStagePopover() {
  const popover = document.getElementById('stage-popover');
  if (!popover) return;

  const _isDed = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';
  const allData = _isDed
    ? [...(_deductionStartedData || []), ...(_deductionTeamData || [])]
    : [...(assignedData || []), ...(queueData || [])];
  const activeId = sectionActiveTab[activeSection];
  const row = allData.find(r => String(r.id).replace(/^#\s*/, '') === String(activeId).replace(/^#\s*/, ''));

  const stages     = _isDed ? _DEDUCTION_STAGES : _CASE_STAGES;
  const currentStage = row?.stage || (_isDed ? 'Eyeball Review' : 'Review');
  const currentIdx = stages.findIndex(s => s.name === currentStage);

  popover.innerHTML = stages.map((s, i) => {
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

// renderProgressSection removed — stepper moved to stage popover in header

const CONV_ITEMS = [
  { type: 'email', initials: 'LC', name: 'Laura Chen', subject: 'Re: Freight discrepancy — BOL #64868',
    preview: 'We\'ve reviewed the documentation and there are several outstanding items.',
    tag: 'Freight', secondary: 'Action needed', time: '09:12', ts: '2026-05-28T09:12:00', unread: true,
    messages: [
      { initials: 'LC', name: 'Laura Chen', time: '08 May 09:14',
        body: 'Hi team,\n\nI wanted to flag a discrepancy we\'ve identified on BOL #64868 for the Walmart Inc. shipment dispatched on May 6th. The declared freight weight on the BOL is listed as 4,820 lbs, however the carrier\'s weigh-in at the Chicago distribution hub recorded 5,310 lbs — a difference of 490 lbs. This exceeds our standard tolerance threshold of ±150 lbs and will trigger an automatic freight charge adjustment under our current carrier agreement with RCEV Logistics.\n\nI\'ve attached the original BOL scan, the carrier weigh-in ticket, and the relevant section of the carrier agreement for your reference. Please review and let me know how you\'d like to proceed. We\'ll need a resolution before the carrier invoices on May 15th to avoid a dispute.\n\nBest,\nLaura',
        attachments: [
          { name: 'BOL_64868_Original.pdf', size: '312 KB', icon: 'picture_as_pdf' },
          { name: 'WeighIn_Ticket_CHI.pdf', size: '88 KB', icon: 'picture_as_pdf' },
          { name: 'RCEV_Agreement_Section4.pdf', size: '540 KB', icon: 'picture_as_pdf' }
        ]
      },
      { initials: 'ME', name: 'Me', time: '08 May 11:03',
        body: 'Laura,\n\nThanks for flagging this. I\'ve reviewed the documents you attached. The weight difference of 490 lbs is significant. A few initial thoughts:\n\n1. We need to verify whether the 4,820 lbs figure on the BOL matches what was logged in our WMS at the time of dispatch. I\'ve asked our warehouse team in Clorox University Park to pull the original outbound scan records.\n<div class="conv-msg-img-wrap"><img class="conv-ss-img" src="assets/wms_screenshot.png" alt="WMS Outbound Scan — May 6"/><div class="conv-msg-img-cap"><span class="material-symbols-outlined" style="font-size:13px;vertical-align:-2px">image</span> WMS_OutboundScan_May6.png <span class="conv-img-fsize">248 KB</span></div></div>\n2. The carrier weigh-in ticket shows a timestamp of 07:22 on May 7th — which is after an overnight hold at the Chicago hub. There\'s a possibility of a re-palleting event during that hold that added weight. I\'ve reached out to RCEV\'s operations team for clarification.\n3. In the meantime, I recommend we do not acknowledge the weight discrepancy in writing with the carrier until we have our internal records verified.\n\nI\'ll update you once I hear back from the warehouse and RCEV.\n\nRegards',
        attachments: []
      },
      { initials: 'RP', name: 'Ravi Patel', time: '08 May 14:47',
        body: 'Hi all,\n\nJumping in here as the account manager for RCEV. I\'ve spoken with our operations team in Chicago and they\'ve confirmed the re-palleting event you mentioned. On the evening of May 6th, a partial load from a cancelled shipment (Order #WM-7741) was temporarily staged on the same pallet bay as the Walmart goods. The re-palleting that took place at 06:55 on May 7th should have restored the original configuration, but our team believes there may have been a pallet mis-assignment error.\n\nWe\'re treating this as an internal error on our side and will be issuing a corrected weigh-in ticket reflecting the original 4,820 lbs. I\'ll email that over by end of day today. This means the freight charge adjustment should not apply and the original BOL weight should stand.\n\nApologies for the confusion. Let me know if you need anything further from us.\n\nRavi Patel\nAccount Manager, RCEV Logistics',
        attachments: [{ name: 'RCEV_Internal_Memo_WM7741.pdf', size: '176 KB', icon: 'picture_as_pdf' }]
      },
      { initials: 'LC', name: 'Laura Chen', time: '08 May 16:22',
        body: 'Ravi,\n\nThank you for the quick response and for the internal memo. That clarifies the situation considerably. A few follow-up items before we close this out:\n\n1. Please ensure the corrected weigh-in ticket is issued on official RCEV letterhead and references both the original BOL #64868 and the cancelled Order #WM-7741. We\'ll need this for our audit trail.\n2. Can you also provide a written confirmation from your Chicago hub supervisor acknowledging the mis-assignment error? Our compliance team requires this for any weight discrepancy cases that exceed the 300 lb threshold.\n3. Once I receive both documents, I\'ll file the resolution in our case management system and notify the billing team to hold on any charge adjustment processing.\n\nI\'ll keep this thread open until we have everything documented.\n\nThanks again,\nLaura',
        attachments: []
      },
      { initials: 'ME', name: 'Me', time: '09:12',
        body: 'Laura, Ravi,\n\nI\'ve now received the corrected weigh-in ticket and the hub supervisor\'s written confirmation from Ravi\'s team (see attached). Both documents reference BOL #64868 and Order #WM-7741 as requested. I\'ve uploaded everything to the case file under DED-00124.\n\nOur warehouse team has also confirmed that the outbound WMS scan recorded 4,820 lbs at dispatch, which is consistent with the corrected ticket. The discrepancy is fully explained by the pallet mis-assignment and no freight charge adjustment will apply.\n\nI\'m marking this issue as resolved. The billing team has been notified and the carrier invoice will be processed at the original rate. Please let me know if there\'s anything else needed on your end.\n\nThanks to both of you for the quick turnaround.',
        attachments: [
          { name: 'RCEV_Corrected_WeighIn.pdf', size: '91 KB', icon: 'picture_as_pdf' },
          { name: 'HubSupervisor_Confirmation.pdf', size: '64 KB', icon: 'picture_as_pdf' }
        ]
      }
    ]
  },
  { type: 'email', initials: 'AH', name: 'Ahmed Arah', subject: 'Invoice follow-up',
    preview: 'The client responded with the invoice confirmation.',
    tag: 'Invoice', secondary: 'Please review ASAP', time: '14:06', ts: '2026-05-28T14:06:00', unread: true,
    messages: [
      { initials: 'AH', name: 'Ahmed Arah', time: '13:45',
        body: 'Hi, just wanted to follow up on the Q1 invoice. Please let me know if you need any additional information to process it.',
        attachments: [{ name: 'Invoice_Q1_2024.pdf', size: '245 KB', icon: 'picture_as_pdf' }] },
      { initials: 'ME', name: 'Me', time: '14:06',
        body: 'The client responded with the invoice confirmation. They are processing the payment now.',
        attachments: [] },
    ]
  },
  { type: 'comment', initials: 'BS', name: 'Ben Septer', subject: 'Good evening to all',
    preview: 'Can you check the attachment I sent?',
    tag: 'General', secondary: '', time: '2h ago', ts: '2026-05-28T12:30:00', unread: false,
    messages: [
      { initials: 'BS', name: 'Ben Septer', time: '2h ago',
        body: 'Good evening to all. Can you check the attachment I sent? I think there might be an issue with the formatting on page 3.',
        attachments: [{ name: 'Report_Draft.docx', size: '1.2 MB', icon: 'description' }] },
    ]
  },
  { type: 'task', initials: 'EF', name: 'Emily Foster', subject: 'Status update required',
    preview: 'Updated the status to Pending Review.',
    tag: 'Status', secondary: 'Due tomorrow', time: '1d ago', ts: '2026-05-27T09:15:00', unread: true,
    messages: [
      { initials: 'EF', name: 'Emily Foster', time: '1d ago',
        body: 'Updated the status to Pending Review. Please take a look and confirm if everything is in order before the deadline.',
        attachments: [] },
      { initials: 'ME', name: 'Me', time: '1d ago',
        body: 'Thanks Emily, I will review it shortly.',
        attachments: [] },
    ]
  },
  { type: 'email', initials: 'CD', name: "Cara D'Angelo", subject: 'Escalation notice',
    preview: 'Escalated to Tier 2 team for resolution.',
    tag: 'Escalation', secondary: '', time: '2d ago', ts: '2026-05-26T16:45:00', unread: false,
    messages: [
      { initials: 'CD', name: "Cara D'Angelo", time: '2d ago',
        body: 'Escalated to Tier 2 team for resolution. The issue has been assigned to the senior support team and they will follow up within 24 hours.',
        attachments: [] },
    ]
  },
  { type: 'task', initials: 'DE', name: 'David Ellis', subject: 'Settlement confirmation',
    preview: 'Please confirm the settlement amount.',
    tag: 'Settlement', secondary: 'Overdue', time: '3d ago', ts: '2026-05-25T11:20:00', unread: false,
    messages: [
      { initials: 'DE', name: 'David Ellis', time: '3d ago',
        body: 'Please confirm the settlement amount. We need this by end of week to proceed with the closing documentation.',
        attachments: [{ name: 'Settlement_Draft.pdf', size: '890 KB', icon: 'picture_as_pdf' }] },
    ]
  },
];
const CONV_TYPE_ICONS  = { email: 'mail', comment: 'chat_bubble', task: 'check_box' };
const CONV_TYPE_LABELS = { email: 'mail', comment: 'comment',     task: 'task'      };

const CONV_LABELS = [
  { id: 'urgent',    name: 'Urgent',    color: '#b91c1c', bg: '#fee2e2' },
  { id: 'follow-up', name: 'Follow-up', color: '#c2410c', bg: '#ffedd5' },
  { id: 'billing',   name: 'Billing',   color: '#a16207', bg: '#fef9c3' },
  { id: 'legal',     name: 'Legal',     color: '#7c3aed', bg: '#ede9fe' },
  { id: 'approved',  name: 'Approved',  color: '#15803d', bg: '#dcfce7' },
  { id: 'pending',   name: 'Pending',   color: '#1d4ed8', bg: '#dbeafe' },
];
// Ensure each message has its own labels, flagged, and unread state
CONV_ITEMS.forEach(c => {
  c.messages.forEach((msg, i) => {
    if (!msg.labels)            msg.labels  = [];
    if (!('flagged' in msg))    msg.flagged = false;
    if (!('unread'  in msg))    msg.unread  = (c.unread && i === c.messages.length - 1);
  });
});

function _convFmtDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

window._convLabelFilter = new Set(); // active label IDs for filter

function renderConversationsPanel(container) {
  // Flatten all messages first, then filter at row level
  let rows = [];
  CONV_ITEMS.forEach((c, convIdx) => {
    c.messages.forEach((msg, msgIdx) => {
      rows.push({ c, convIdx, msg, msgIdx, _sortKey: (new Date(c.ts).getTime() || 0) + msgIdx });
    });
  });

  // Text search filter (matches sender name or subject)
  if (window._convFilter) {
    rows = rows.filter(({ c, msg }) =>
      msg.name.toLowerCase().includes(window._convFilter) ||
      c.subject.toLowerCase().includes(window._convFilter));
  }

  // Label filter — show only rows whose message has the label
  if (window._convLabelFilter.size > 0) {
    rows = rows.filter(({ msg }) =>
      msg.labels && msg.labels.some(lid => window._convLabelFilter.has(lid)));
  }

  rows.sort((a, b) => b._sortKey - a._sortKey);

  const badge = document.getElementById('conv-count-badge');
  if (badge) badge.textContent = rows.length;

  const wasKey = _activeEmailKey;
  _activeEmailKey = null;
  _activeConvIndex = null;

  container.innerHTML = rows.map(({ c, convIdx, msg, msgIdx }) => {
    const key       = `${convIdx}-${msgIdx}`;
    const typeIcon  = CONV_TYPE_ICONS[c.type] || 'mail';
    const isSent    = msg.name === 'Me';
    const isReply   = msgIdx > 0;
    const subject   = isReply ? 'Re: ' + c.subject : c.subject;
    const snippet   = msg.body.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim().substring(0, 90);
    const hasAttach = msg.attachments.length > 0;
    const unread    = !!msg.unread;
    const labels    = msg.labels && msg.labels.length
      ? msg.labels.map(lid => { const lb = CONV_LABELS.find(l => l.id === lid); return lb ? `<span class="conv-label-chip" style="color:${lb.color};background:${lb.bg}">${lb.name}</span>` : ''; }).join('')
      : '';
    return `
    <div class="conv-item-wrap" id="conv-email-wrap-${key}">
      <div class="conv-email-row" onclick="_convOpenEmail(${convIdx},${msgIdx})">
        <div class="conv-type-badge conv-type-${c.type}" style="flex-shrink:0">
          <span class="material-symbols-outlined">${typeIcon}</span>
        </div>
        <div class="conv-email-info">
          <div class="conv-email-row1">
            <span class="conv-email-sender${isSent ? ' sent' : ''}">${isSent ? 'Team Member (Sent)' : msg.name}</span>
            ${isReply ? '<span class="conv-email-reply-tag">Re</span>' : ''}
            ${hasAttach ? '<span class="material-symbols-outlined" style="font-size:12px;color:var(--text-muted);opacity:.7">attach_file</span>' : ''}
            <button class="conv-item-action-btn conv-flag-btn${msg.flagged ? ' active' : ''}"
                    style="margin-left:auto;flex-shrink:0"
                    title="${msg.flagged ? 'Remove flag' : 'Flag'}"
                    onclick="event.stopPropagation();_convToggleFlag(${convIdx},${msgIdx},this)">
              <span class="material-symbols-outlined">flag</span>
            </button>
            <div class="conv-item-actions" onclick="event.stopPropagation()">
              <button class="conv-item-action-btn${unread ? ' active' : ''}"
                      title="${unread ? 'Mark as read' : 'Mark as unread'}"
                      onclick="_convMarkUnread(${convIdx},${msgIdx},this)">
                <span class="material-symbols-outlined">${unread ? 'mark_email_read' : 'mark_email_unread'}</span>
              </button>
              <button class="conv-item-action-btn"
                      title="Add label"
                      onclick="_convLabelDropdown(${convIdx},${msgIdx},this,event)">
                <span class="material-symbols-outlined">label</span>
              </button>
            </div>
            <span class="conv-email-time">${msg.time}</span>
          </div>
          <div class="conv-email-subject${unread ? ' unread' : ''}">${subject}${labels ? `&nbsp;<span class="conv-item-labels-inline">${labels}</span>` : ''}</div>
          <div class="conv-email-snippet">${snippet}</div>
        </div>
      </div>
      <div class="conv-thread-inline" id="conv-email-inline-${key}"></div>
    </div>`;
  }).join('');

  // Re-open previously open email
  if (wasKey) {
    const [ci, mi] = wasKey.split('-').map(Number);
    _convOpenEmail(ci, mi);
  }
}

function filterConversations(val) {
  window._convFilter = val.toLowerCase().trim() || null;
  const body = document.getElementById('utility-panel-body');
  if (body) renderConversationsPanel(body);
}

function refreshConversations() {
  window._convFilter = null;
  const input = document.getElementById('conv-search-input');
  if (input) input.value = '';
  const body = document.getElementById('utility-panel-body');
  if (body) renderConversationsPanel(body);
}

/* ── Label filter dropdown ── */
function _convToggleLabelFilter(e) {
  e.stopPropagation();
  const drop = document.getElementById('conv-label-filter-drop');
  if (!drop) return;
  if (drop.style.display !== 'none') { drop.style.display = 'none'; return; }

  drop.innerHTML = CONV_LABELS.map(l => `
    <label class="conv-lf-item" onclick="event.stopPropagation()">
      <input type="checkbox" ${window._convLabelFilter.has(l.id) ? 'checked' : ''}
        onchange="_convToggleLabelCheck('${l.id}',this.checked)"/>
      <span class="conv-label-chip" style="color:${l.color};background:${l.bg}">${l.name}</span>
    </label>`).join('') +
    `<hr class="conv-filter-divider"/>
     <button class="conv-lf-clear" onclick="_convClearLabelFilter()">Clear all filters</button>`;

  drop.style.display = 'block';
  setTimeout(() => document.addEventListener('click', () => {
    drop.style.display = 'none';
  }, { once: true }), 0);
}

function _convToggleLabelCheck(id, checked) {
  if (checked) window._convLabelFilter.add(id);
  else window._convLabelFilter.delete(id);
  const body = document.getElementById('utility-panel-body');
  if (body) renderConversationsPanel(body);
  _convUpdateFilterBtn();
}

function _convClearLabelFilter() {
  window._convLabelFilter.clear();
  const body = document.getElementById('utility-panel-body');
  if (body) renderConversationsPanel(body);
  _convUpdateFilterBtn();
  const drop = document.getElementById('conv-label-filter-drop');
  if (drop) drop.style.display = 'none';
}

function _convUpdateFilterBtn() {
  const btn = document.getElementById('conv-filter-btn');
  if (!btn) return;
  const n = window._convLabelFilter.size;
  if (n > 0) {
    btn.classList.add('active');
    btn.title = `Filter by label (${n} active)`;
  } else {
    btn.classList.remove('active');
    btn.title = 'Filter by label';
  }
}

function openComposeConversation() {
  alert('New conversation compose — coming soon.');
}

function toggleComposeMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('conv-compose-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

let _cncCurrentType = 'email';
const _cncTypeMap = {
  email:   { icon: 'mail',        label: 'New Email',   subjectLabel: 'Subject' },
  comment: { icon: 'chat_bubble', label: 'New Comment', subjectLabel: 'Topic'   },
  task:    { icon: 'check_box',   label: 'New Task',    subjectLabel: 'Title'   }
};

function _cncSetComposeBtnState(disabled) {
  const btn = document.getElementById('conv-compose-btn') ||
              document.querySelector('.conv-compose-btn');
  if (btn) btn.disabled = disabled;
}

function openNewConversation(type) {
  _cncCurrentType = type || 'email';
  const def = _cncTypeMap[_cncCurrentType];

  _cncSetComposeBtnState(true); // disable + button while composing

  // Close the "+" dropdown
  const menu = document.getElementById('conv-compose-menu');
  if (menu) menu.style.display = 'none';

  // Discard any open reply compose
  _convDiscardCompose();

  // Hide body and footer to give compose full space
  const body = document.getElementById('utility-panel-body');
  if (body) body.style.display = 'none';
  const footer = document.getElementById('conv-read-footer');
  if (footer) footer.style.display = 'none';

  // Hide minimized bar if visible
  const bar = document.getElementById('conv-new-compose-bar');
  if (bar) bar.style.display = 'none';

  // Update type indicator
  document.getElementById('cnc-type-icon').textContent = def.icon;
  document.getElementById('cnc-type-label').textContent = def.label;
  document.getElementById('cnc-subject-label').textContent = def.subjectLabel;

  // Show compose panel, then restore any saved draft
  const compose = document.getElementById('conv-new-compose');
  if (compose) {
    compose.classList.remove('cnc-popup-mode');
    compose.style.display = 'flex';
    setTimeout(() => {
      if (compose.style.display === 'none') return; // already docked — don't interfere
      const hasDraft = _cncRestoreDraft();
      // Focus body if draft restored (to is already filled), else focus To
      document.getElementById(hasDraft ? 'cnc-body' : 'cnc-to')?.focus();
    }, 50);
  }
}

function _cncDockToStrip() {
  // Dock compose to strip icon + immediately open as popup with icon active
  const compose = document.getElementById('conv-new-compose');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  const body = document.getElementById('utility-panel-body');
  if (!compose) return;

  const def = _cncTypeMap[_cncCurrentType] || {};
  const subject = document.getElementById('cnc-subject')?.value.trim();
  if (draftBtn) {
    draftBtn.title = (subject || def.label || 'Draft') + ' — click to open';
    draftBtn.style.display = 'flex';
    draftBtn.classList.add('active');
  }

  // Restore panel body behind the popup
  if (body) body.style.display = '';
  // Immediately open as popup (strip icon stays active/pressed)
  compose.classList.add('cnc-popup-mode');
  compose.style.display = 'flex';
  const toggleBtn = document.getElementById('cnc-size-toggle-btn');
  if (toggleBtn) { toggleBtn.querySelector('span').textContent = 'open_in_full'; toggleBtn.title = 'Switch to full panel'; }
  setTimeout(() => document.getElementById('cnc-body')?.focus(), 50);
}

function _cncMinimize() {
  const compose  = document.getElementById('conv-new-compose');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  const body     = document.getElementById('utility-panel-body');
  if (!compose) return;

  // Remove popup mode and just hide the compose panel
  compose.classList.remove('cnc-popup-mode');
  compose.style.display = 'none';

  // Restore the panel body (so the thread list is visible again)
  if (body) body.style.display = '';

  // Show the strip draft button
  if (draftBtn) {
    const def = _cncTypeMap[_cncCurrentType] || {};
    const subject = document.getElementById('cnc-subject')?.value.trim();
    draftBtn.title = (subject || def.label || 'Draft') + ' — click to open';
    draftBtn.style.display = 'flex';
    draftBtn.classList.add('active');
  }

  // Reset size-toggle icon back to panel mode for when it reopens
  const toggleBtn = document.getElementById('cnc-size-toggle-btn');
  if (toggleBtn) { toggleBtn.querySelector('span').textContent = 'close_fullscreen'; toggleBtn.title = 'Switch to popup'; }
}

function _cncToggleSize() {
  const compose = document.getElementById('conv-new-compose');
  const btn = document.getElementById('cnc-size-toggle-btn');
  const body = document.getElementById('utility-panel-body');
  const footer = document.getElementById('conv-read-footer');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  if (!compose) return;

  const isPopup = compose.classList.contains('cnc-popup-mode');
  if (isPopup) {
    // Popup → Full panel — ensure utility panel is open
    const panel = document.getElementById('utility-panel');
    if (panel && !panel.classList.contains('open')) toggleUtility('conversations');
    compose.classList.remove('cnc-popup-mode');
    if (body) body.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (draftBtn) { draftBtn.style.display = 'none'; draftBtn.classList.remove('active'); }
    if (btn) { btn.querySelector('span').textContent = 'close_fullscreen'; btn.title = 'Switch to popup'; }
  } else {
    // Full panel → Popup
    compose.classList.add('cnc-popup-mode');
    if (body) body.style.display = '';
    if (draftBtn) {
      const def = _cncTypeMap[_cncCurrentType] || {};
      const subject = document.getElementById('cnc-subject')?.value.trim();
      draftBtn.title = (subject || def.label || 'Draft') + ' — click to open';
      draftBtn.style.display = 'flex';
      draftBtn.classList.add('active');
    }
    if (btn) { btn.querySelector('span').textContent = 'open_in_full'; btn.title = 'Switch to full panel'; }
  }
  setTimeout(() => document.getElementById('cnc-body')?.focus(), 50);
}

function _cncToggleDraftPopup() {
  // Strip icon click: restore compose into panel (same pattern as reply compose)
  const compose  = document.getElementById('conv-new-compose');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  const body     = document.getElementById('utility-panel-body');
  if (!compose) return;

  // Ensure conversations panel is open
  const panel = document.getElementById('utility-panel');
  if (panel && !panel.classList.contains('open')) toggleUtility('conversations');

  // Show compose in panel mode, hide panel body list
  compose.classList.remove('cnc-popup-mode');
  compose.style.display = 'flex';
  if (body) body.style.display = 'none';

  // Hide + deactivate strip button
  if (draftBtn) { draftBtn.style.display = 'none'; draftBtn.classList.remove('active'); }

  setTimeout(() => document.getElementById('cnc-body')?.focus(), 50);
}

function _cncRestoreAsPopup() {
  // Open compose as popup and mark strip icon active
  const compose = document.getElementById('conv-new-compose');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  if (!compose) return;

  if (draftBtn) draftBtn.classList.add('active');
  compose.classList.add('cnc-popup-mode');
  compose.style.display = 'flex';
  const toggleBtn = document.getElementById('cnc-size-toggle-btn');
  if (toggleBtn) { toggleBtn.querySelector('span').textContent = 'open_in_full'; toggleBtn.title = 'Switch to full panel'; }
  setTimeout(() => document.getElementById('cnc-body')?.focus(), 50);
}

function _cncToPanel() {
  // Promote popup back to full panel mode (hides body, fills panel)
  const compose = document.getElementById('conv-new-compose');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  const body = document.getElementById('utility-panel-body');
  const footer = document.getElementById('conv-read-footer');
  if (!compose) return;

  if (draftBtn) { draftBtn.style.display = 'none'; draftBtn.classList.remove('active'); }
  compose.classList.remove('cnc-popup-mode');
  compose.style.display = 'flex';
  if (body) body.style.display = 'none';
  if (footer) footer.style.display = 'none';
  const toggleBtn = document.getElementById('cnc-size-toggle-btn');
  if (toggleBtn) { toggleBtn.querySelector('span').textContent = 'close_fullscreen'; toggleBtn.title = 'Switch to popup'; }
  setTimeout(() => document.getElementById('cnc-body')?.focus(), 50);
}

function _cncApplyTemplate(key) {
  if (!key) return;
  const body = document.getElementById('cnc-body');
  if (!body) return;
  const tpl = _CONV_TEMPLATES[key];
  if (!tpl) return;
  const current = body.innerText.trim();
  if (current && !confirm('Replace current message with this template?')) {
    const sel = document.querySelector('#conv-new-compose .conv-field-select[onchange]');
    if (sel) sel.value = '';
    return;
  }
  body.innerHTML = tpl;
  body.focus();
  const range = document.createRange();
  range.selectNodeContents(body);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function _cncClose() {
  const compose = document.getElementById('conv-new-compose');
  const draftBtn = document.getElementById('util-btn-compose-draft');
  const body = document.getElementById('utility-panel-body');

  if (compose) { compose.classList.remove('cnc-popup-mode'); compose.style.display = 'none'; }
  if (draftBtn) { draftBtn.style.display = 'none'; draftBtn.classList.remove('active'); }
  if (body) body.style.display = '';

  _cncSetComposeBtnState(false); // re-enable + button after discard

  // Clear fields and draft
  _cncClearDraft();
  ['cnc-to','cnc-subject'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const bdEl2 = document.getElementById('cnc-body');
  if (bdEl2) bdEl2.innerHTML = '';
  const attachRow = document.getElementById('cnc-attach-row');
  if (attachRow) attachRow.style.display = 'none';

  // Restore footer if in thread mode
  if (_activeConvIndex !== null && !document.getElementById('conv-compose-card')) {
    const footer = document.getElementById('conv-read-footer');
    if (footer) footer.style.display = 'flex';
  }
  _cncCurrentType = 'email';
}

function _cncToggleTypeMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('cnc-type-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function _cncSetType(type) {
  _cncCurrentType = type;
  const def = _cncTypeMap[type];
  document.getElementById('cnc-type-icon').textContent = def.icon;
  document.getElementById('cnc-type-label').textContent = def.label;
  document.getElementById('cnc-subject-label').textContent = def.subjectLabel;
  document.getElementById('cnc-type-menu').style.display = 'none';
}

function _cncTriggerAttach() {
  alert('Attach file — coming soon');
}

// ── Draft auto-save ──────────────────────────────────────────
const CNC_DRAFT_KEY = 'cnc_draft';
let _cncSaveTimer = null;

function _cncScheduleSave() {
  clearTimeout(_cncSaveTimer);
  _cncSaveTimer = setTimeout(_cncSaveDraft, 1000);
}

function _cncSaveDraft() {
  const draft = {
    type:    _cncCurrentType,
    to:      document.getElementById('cnc-to')?.value      || '',
    subject: document.getElementById('cnc-subject')?.value || '',
    body:    document.getElementById('cnc-body')?.innerHTML || '',
    savedAt: new Date().toISOString()
  };
  try { localStorage.setItem(CNC_DRAFT_KEY, JSON.stringify(draft)); } catch(e) {}

  // Show "Saved HH:MM" in header
  const lbl = document.getElementById('cnc-saved-label');
  if (lbl) {
    const t = new Date(draft.savedAt);
    lbl.textContent = 'Saved ' + t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}

function _cncRestoreDraft() {
  try {
    const raw = localStorage.getItem(CNC_DRAFT_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.type) { _cncCurrentType = d.type; _cncSetType(d.type); }
    if (d.to)      { const el = document.getElementById('cnc-to');      if (el) el.value = d.to; }
    if (d.subject) { const el = document.getElementById('cnc-subject'); if (el) el.value = d.subject; }
    if (d.body)    { const el = document.getElementById('cnc-body');    if (el) el.innerHTML = d.body; }
    // Show saved timestamp
    const lbl = document.getElementById('cnc-saved-label');
    if (lbl && d.savedAt) {
      const t = new Date(d.savedAt);
      lbl.textContent = 'Saved ' + t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return !!(d.to || d.subject || d.body);
  } catch(e) { return false; }
}

function _cncClearDraft() {
  clearTimeout(_cncSaveTimer);
  try { localStorage.removeItem(CNC_DRAFT_KEY); } catch(e) {}
  const lbl = document.getElementById('cnc-saved-label');
  if (lbl) lbl.textContent = '';
}

// ── (floating mini compose removed) ──
const FC_DRAFT_KEY = 'fc_draft'; // keep key so stale localStorage doesn't break
let _fcCurrentType = 'email';
let _fcSaveTimer   = null;

const _fcTypeMap = {
  email:   { icon: 'mail',        label: 'New Email',   subjectLabel: 'Subject' },
  comment: { icon: 'chat_bubble', label: 'New Comment', subjectLabel: 'Topic'   },
  task:    { icon: 'check_box',   label: 'New Task',    subjectLabel: 'Title'   }
};

function _fcToggle() {
  const fl = document.getElementById('fc-float');
  if (!fl) return;
  if (fl.style.display === 'none') {
    fl.style.display = 'flex';
    _fcRestoreDraft();
    setTimeout(() => document.getElementById('fc-to')?.focus(), 50);
    // Highlight the compose button as active
    document.getElementById('util-btn-fc-compose')?.classList.add('active');
  } else {
    fl.style.display = 'none';
    document.getElementById('util-btn-fc-compose')?.classList.remove('active');
  }
}

function _fcClose() {
  const fl = document.getElementById('fc-float');
  if (fl) fl.style.display = 'none';
  document.getElementById('util-btn-fc-compose')?.classList.remove('active');
  _fcClearDraft();
  ['fc-to','fc-subject','fc-body'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const lbl = document.getElementById('fc-saved-label');
  if (lbl) lbl.textContent = '';
}

function _fcToggleTypeMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('fc-type-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function _fcSetType(type) {
  _fcCurrentType = type;
  const def = _fcTypeMap[type];
  document.getElementById('fc-type-icon').textContent = def.icon;
  document.getElementById('fc-type-label').textContent = def.label;
  document.getElementById('fc-subject-label').textContent = def.subjectLabel;
  document.getElementById('fc-type-menu').style.display = 'none';
}

function _fcScheduleSave() {
  clearTimeout(_fcSaveTimer);
  _fcSaveTimer = setTimeout(_fcSaveDraft, 1000);
}

function _fcSaveDraft() {
  const draft = {
    type:    _fcCurrentType,
    to:      document.getElementById('fc-to')?.value      || '',
    subject: document.getElementById('fc-subject')?.value || '',
    body:    document.getElementById('fc-body')?.value     || '',
    savedAt: new Date().toISOString()
  };
  try { localStorage.setItem(FC_DRAFT_KEY, JSON.stringify(draft)); } catch(e) {}
  const lbl = document.getElementById('fc-saved-label');
  if (lbl) {
    const t = new Date(draft.savedAt);
    lbl.textContent = 'Saved ' + t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}

function _fcRestoreDraft() {
  try {
    const raw = localStorage.getItem(FC_DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.type) { _fcCurrentType = d.type; _fcSetType(d.type); }
    if (d.to)      { const el = document.getElementById('fc-to');      if (el) el.value = d.to; }
    if (d.subject) { const el = document.getElementById('fc-subject'); if (el) el.value = d.subject; }
    if (d.body)    { const el = document.getElementById('fc-body');    if (el) el.value = d.body; }
    if (d.savedAt) {
      const lbl = document.getElementById('fc-saved-label');
      if (lbl) {
        const t = new Date(d.savedAt);
        lbl.textContent = 'Saved ' + t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    }
  } catch(e) {}
}

function _fcClearDraft() {
  clearTimeout(_fcSaveTimer);
  try { localStorage.removeItem(FC_DRAFT_KEY); } catch(e) {}
}

function _fcExpandToPanel() {
  // Copy float fields into panel compose
  const to      = document.getElementById('fc-to')?.value      || '';
  const subject = document.getElementById('fc-subject')?.value || '';
  const body    = document.getElementById('fc-body')?.value     || '';
  const type    = _fcCurrentType;

  // Close the float
  _fcClose();

  // Ensure conversations panel is open
  if (activeUtil !== 'conversations') toggleUtility('conversations');

  // Open panel compose with the type, then populate fields
  openNewConversation(type);
  setTimeout(() => {
    const toEl = document.getElementById('cnc-to');
    const sjEl = document.getElementById('cnc-subject');
    const bdEl = document.getElementById('cnc-body');
    if (toEl) toEl.value = to;
    if (sjEl) sjEl.value = subject;
    if (bdEl) { bdEl.innerHTML = body; bdEl.focus(); }
    _cncSaveDraft(); // persist in panel draft
  }, 100);
}

// Close compose dropdowns on outside click
document.addEventListener('click', (e) => {
  const m = document.getElementById('conv-compose-menu');
  if (m) m.style.display = 'none';
  const mm = document.getElementById('conv-compose-mode-menu');
  if (mm) mm.style.display = 'none';
  const mt = document.getElementById('cnc-type-menu');
  if (mt) mt.style.display = 'none';
});

let _activeConvIndex = null;
let _activeEmailKey  = null;

// Label dropdown — per message
function _convLabelDropdown(convIdx, msgIdx, btn, ev) {
  ev.stopPropagation();
  const key = `${convIdx}-${msgIdx}`;
  const existing = document.getElementById('conv-label-dropdown');
  if (existing) {
    const same = existing.dataset.key === key;
    existing.remove();
    if (same) return;
  }
  const msg  = CONV_ITEMS[convIdx].messages[msgIdx];
  const rect = btn.getBoundingClientRect();
  const drop = document.createElement('div');
  drop.id = 'conv-label-dropdown';
  drop.dataset.key = key;
  drop.className = 'conv-label-drop';
  drop.style.cssText = `position:fixed;top:${rect.bottom + 6}px;left:${rect.left - 8}px;z-index:9999;`;
  drop.innerHTML = `
    <div class="conv-label-drop-title">Add label</div>
    ${CONV_LABELS.map(label => `
    <div class="conv-label-opt${msg.labels.includes(label.id) ? ' selected' : ''}"
         onclick="_convToggleLabel(${convIdx},${msgIdx},'${label.id}',this)">
      <span class="conv-label-dot" style="background:${label.color}"></span>
      <span class="conv-label-opt-name">${label.name}</span>
      <span class="conv-label-check material-symbols-outlined"
            style="opacity:${msg.labels.includes(label.id) ? 1 : 0}">check</span>
    </div>`).join('')}
  `;
  document.body.appendChild(drop);
  setTimeout(() => {
    document.addEventListener('click', function _handler(e) {
      if (!drop.contains(e.target)) { drop.remove(); document.removeEventListener('click', _handler); }
    });
  }, 0);
}

function _convToggleLabel(convIdx, msgIdx, labelId, optEl) {
  const msg = CONV_ITEMS[convIdx].messages[msgIdx];
  if (msg.labels.includes(labelId)) {
    msg.labels = msg.labels.filter(l => l !== labelId);
    optEl.classList.remove('selected');
    optEl.querySelector('.conv-label-check').style.opacity = 0;
  } else {
    msg.labels.push(labelId);
    optEl.classList.add('selected');
    optEl.querySelector('.conv-label-check').style.opacity = 1;
  }
  _convUpdateLabelChips(convIdx, msgIdx);
}

function _convUpdateLabelChips(convIdx, msgIdx) {
  const msg   = CONV_ITEMS[convIdx].messages[msgIdx];
  const chips = msg.labels.map(lid => {
    const lb = CONV_LABELS.find(l => l.id === lid);
    return lb ? `<span class="conv-label-chip" style="color:${lb.color};background:${lb.bg}">${lb.name}</span>` : '';
  }).join('');
  const wrap = document.getElementById(`conv-email-wrap-${convIdx}-${msgIdx}`);
  if (!wrap) return;
  const subj = wrap.querySelector('.conv-email-subject');
  if (!subj) return;
  let chipsEl = subj.querySelector('.conv-item-labels-inline');
  if (!chipsEl && chips) {
    chipsEl = document.createElement('span');
    chipsEl.className = 'conv-item-labels-inline';
    subj.appendChild(chipsEl);
  }
  if (chipsEl) chipsEl.innerHTML = chips;
}

// Mark message as unread / read
function _convMarkUnread(convIdx, msgIdx, btn) {
  const msg = CONV_ITEMS[convIdx].messages[msgIdx];
  msg.unread = !msg.unread;
  const wrap = document.getElementById(`conv-email-wrap-${convIdx}-${msgIdx}`);
  if (wrap) {
    const subj = wrap.querySelector('.conv-email-subject');
    if (subj) subj.classList.toggle('unread', msg.unread);
  }
  btn.classList.toggle('active', msg.unread);
  btn.title = msg.unread ? 'Mark as read' : 'Mark as unread';
  const icon = btn.querySelector('.material-symbols-outlined');
  if (icon) icon.textContent = msg.unread ? 'mark_email_read' : 'mark_email_unread';
}

// Flag / unflag message
function _convToggleFlag(convIdx, msgIdx, btn) {
  const msg = CONV_ITEMS[convIdx].messages[msgIdx];
  msg.flagged = !msg.flagged;
  btn.classList.toggle('active', msg.flagged);
  btn.title = msg.flagged ? 'Remove flag' : 'Flag';
}

/* ── Per-email open/close ── */
function _convOpenEmail(convIdx, msgIdx) {
  const key  = `${convIdx}-${msgIdx}`;
  const conv = CONV_ITEMS[convIdx];
  if (!conv) return;

  // Close previously open email
  if (_activeEmailKey && _activeEmailKey !== key) {
    const prevWrap   = document.getElementById(`conv-email-wrap-${_activeEmailKey}`);
    const prevInline = document.getElementById(`conv-email-inline-${_activeEmailKey}`);
    if (prevWrap)   prevWrap.classList.remove('open');
    if (prevInline) prevInline.innerHTML = '';
    _activeEmailKey  = null;
    _activeConvIndex = null;
  }

  const wrap = document.getElementById(`conv-email-wrap-${key}`);
  if (!wrap) return;

  // Toggle: collapse if already open
  if (wrap.classList.contains('open')) {
    wrap.classList.remove('open');
    document.getElementById(`conv-email-inline-${key}`).innerHTML = '';
    _activeEmailKey  = null;
    _activeConvIndex = null;
    return;
  }

  _activeEmailKey  = key;
  _activeConvIndex = convIdx;
  wrap.classList.add('open');

  const msg       = conv.messages[msgIdx];
  const prevMsgs  = conv.messages.slice(0, msgIdx); // all messages before this one
  const inline    = document.getElementById(`conv-email-inline-${key}`);

  function _msgBodyHtml(m) {
    const files = m.attachments.filter(a => a.icon !== 'image');
    const imgs  = m.attachments.filter(a => a.icon === 'image');
    return `
      <div class="conv-msg-body">${m.body}${imgs.map(a => `
        <div class="conv-msg-img-wrap">
          <img class="conv-ss-img" src="assets/wms_screenshot.png" alt="${a.name}"/>
          <div class="conv-msg-img-cap">
            <span class="material-symbols-outlined" style="font-size:13px;vertical-align:-2px">image</span>
            ${a.name} <span class="conv-img-fsize">${a.size}</span>
          </div>
        </div>`).join('')}</div>
      ${files.length ? `
      <div class="conv-msg-attach-section">
        <span class="conv-msg-attach-count">${files.length} attachment${files.length > 1 ? 's' : ''}</span>
        <div class="conv-msg-attach-chips">${files.map(a => `
          <div class="conv-msg-attach-chip">
            <span class="material-symbols-outlined">${a.icon}</span>
            <span class="conv-msg-attach-name">${a.name}</span>
            <span class="conv-msg-attach-size">${a.size}</span>
          </div>`).join('')}
        </div>
      </div>` : ''}`;
  }

  inline.innerHTML = `
    <div class="conv-thread">
      <div class="conv-msg">
        <div class="conv-msg-top">
          <div class="conv-msg-avatar${msg.name === 'Me' ? ' self' : ''}">${msg.initials}</div>
          <div class="conv-msg-meta">
            <div class="conv-msg-name">${msg.name}</div>
            <div class="conv-msg-time">${msg.time}</div>
          </div>
        </div>
        ${_msgBodyHtml(msg)}
      </div>
    </div>
    ${prevMsgs.length ? `
    <div class="conv-email-history">
      <button class="conv-history-toggle" onclick="_convToggleHistory(this)">
        <span class="material-symbols-outlined">expand_more</span>
        ${prevMsgs.length} previous message${prevMsgs.length > 1 ? 's' : ''} in this thread
      </button>
      <div class="conv-history-list" style="display:none">
        ${[...prevMsgs].reverse().map(pm => {
          const snip = pm.body.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').substring(0, 100);
          return `
          <div class="conv-msg collapsed" onclick="_convToggleMsg(this)">
            <div class="conv-msg-top">
              <div class="conv-msg-avatar${pm.name === 'Me' ? ' self' : ''}">${pm.initials}</div>
              <div class="conv-msg-meta">
                <div class="conv-msg-name">${pm.name}</div>
                <div class="conv-msg-time">${pm.time}</div>
              </div>
              <span class="conv-msg-snippet">${snip}</span>
            </div>
            ${_msgBodyHtml(pm)}
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}
    <div class="conv-inline-footer">
      <button class="conv-footer-primary" onclick="_convOpenCompose('reply')">
        <span class="material-symbols-outlined">reply</span> Reply
      </button>
      <button class="conv-footer-btn" onclick="_convOpenCompose('reply_all')">
        <span class="material-symbols-outlined">reply_all</span> Reply All
      </button>
      <button class="conv-footer-btn" onclick="_convOpenCompose('forward')">
        <span class="material-symbols-outlined">forward</span> Forward
      </button>
      <div style="flex:1"></div>
      <button class="conv-footer-btn" title="Download">
        <span class="material-symbols-outlined">download</span>
      </button>
    </div>`;

  requestAnimationFrame(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
}

// Kept for backward-compat
function _convToggleThread(idx) { /* no-op — replaced by per-email view */ }
function openConversation(idx)  { /* no-op */ }

function _convToggleMsg(el) { el.classList.toggle('collapsed'); }

function _convToggleHistory(btn) {
  btn.classList.toggle('open');
  const list = btn.nextElementSibling;
  if (list) list.style.display = list.style.display === 'none' ? 'block' : 'none';
}

function _convOpenCompose(mode) {
  const existing = document.getElementById('conv-compose-card');
  if (existing) existing.remove();

  const conv = CONV_ITEMS[_activeConvIndex];
  if (!conv) return;

  const others = [...new Set(conv.messages.filter(m => m.name !== 'Me').map(m => m.name))];
  let toVal = '';
  if (mode === 'forward') toVal = '';
  else if (mode === 'reply_all') toVal = others.join(', ');
  else { const lo = [...conv.messages].reverse().find(m => m.name !== 'Me'); toVal = lo ? lo.name : (others[0] || ''); }

  const origSubject = conv.subject.replace(/^(Re:|Fwd:)\s*/i, '');
  const subjectVal  = mode === 'forward' ? `Fwd: ${origSubject}` : `Re: ${origSubject}`;
  const modeIcons   = { reply: 'reply', reply_all: 'reply_all', forward: 'forward' };
  const modeLabels  = { reply: 'Reply', reply_all: 'Reply All', forward: 'Forward' };

  const card = document.createElement('div');
  card.className = 'conv-compose';
  card.id = 'conv-compose-card';
  card.dataset.mode = mode;
  card.innerHTML = `
    <div class="conv-compose-titlebar">
      <div class="cnc-type-wrap">
        <button class="cnc-type-btn" id="conv-mode-btn" onclick="_convToggleModeMenu(event)" title="Change mode">
          <span class="material-symbols-outlined" id="conv-mode-icon">${modeIcons[mode]||'reply'}</span>
          <span id="conv-mode-label">${modeLabels[mode]||'Reply'}</span>
          <span class="material-symbols-outlined">arrow_drop_down</span>
        </button>
        <div class="conv-compose-mode-menu" id="conv-compose-mode-menu" style="display:none">
          <button onclick="_convSwitchMode('reply')"><span class="material-symbols-outlined">reply</span> Reply</button>
          <button onclick="_convSwitchMode('reply_all')"><span class="material-symbols-outlined">reply_all</span> Reply All</button>
          <button onclick="_convSwitchMode('forward')"><span class="material-symbols-outlined">forward</span> Forward</button>
        </div>
      </div>
      <div style="flex:1"></div>
      <button class="conv-cmp-icon-btn" id="conv-compose-popup-btn" onclick="_convToggleComposePopup()" title="Switch to popup">
        <span class="material-symbols-outlined">open_in_full</span>
      </button>
      <button class="conv-cmp-icon-btn" onclick="_convMinimizeCompose()" title="Minimize">
        <span class="material-symbols-outlined">remove</span>
      </button>
      <button class="conv-cmp-icon-btn" onclick="_convDiscardCompose()" title="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    <div class="conv-compose-fields">
      <div class="conv-field-row">
        <label class="conv-field-lbl">From <span class="conv-field-req">*</span></label>
        <select class="conv-field-select"><option>me@company.com</option><option>team@company.com</option></select>
      </div>
      <div class="conv-field-row">
        <label class="conv-field-lbl">To</label>
        <input class="conv-field-input" id="conv-compose-to-input" type="text" value="${toVal}" placeholder="Add recipients…"/>
        <div class="conv-cc-bcc">
          <button onclick="_convToggleCcBcc('cc')">Cc</button>
          <button onclick="_convToggleCcBcc('bcc')">Bcc</button>
        </div>
      </div>
      <div class="conv-field-row" id="conv-cc-row" style="display:none">
        <label class="conv-field-lbl">Cc</label>
        <input class="conv-field-input" type="text" placeholder="Cc recipients…"/>
      </div>
      <div class="conv-field-row" id="conv-bcc-row" style="display:none">
        <label class="conv-field-lbl">Bcc</label>
        <input class="conv-field-input" type="text" placeholder="Bcc recipients…"/>
      </div>
      <div class="conv-field-row">
        <label class="conv-field-lbl">Subject <span class="conv-field-req">*</span></label>
        <input class="conv-field-input" type="text" value="${subjectVal}"/>
      </div>
      <div class="conv-field-row conv-field-row-template">
        <label class="conv-field-lbl">Template</label>
        <select class="conv-field-select" style="flex:1;min-width:0" onchange="_convApplyTemplate(this.value)">
          <option value="">Select a template…</option>
          <option value="freight">Freight discrepancy response</option>
          <option value="invoice">Invoice follow-up</option>
          <option value="escalation">Escalation acknowledgement</option>
        </select>
        <span class="conv-field-divider"></span>
        <label class="conv-field-lbl" style="white-space:nowrap">Signature</label>
        <select class="conv-field-select conv-field-sig">
          <option>Default Signature</option>
          <option>Case Email Signature</option>
          <option selected>Deduction Case Email Signature</option>
        </select>
        <button class="conv-cmp-icon-btn" title="Attach file" onclick="_convOpenAttachOverlay(event)"><span class="material-symbols-outlined">attach_file</span></button>
        <button class="conv-cmp-icon-btn" title="More"><span class="material-symbols-outlined">more_vert</span></button>
      </div>
    </div>

    <div class="conv-compose-attached" id="conv-compose-attached" style="display:none"></div>

    <div class="conv-rte-toolbar">
      <div class="conv-rte-btns">
        <button class="conv-rte-btn" title="Bold"      onclick="_rte('bold')">     <span class="material-symbols-outlined">format_bold</span></button>
        <button class="conv-rte-btn" title="Italic"    onclick="_rte('italic')">   <span class="material-symbols-outlined">format_italic</span></button>
        <button class="conv-rte-btn" title="Underline" onclick="_rte('underline')"><span class="material-symbols-outlined">format_underlined</span></button>
        <div class="conv-rte-sep"></div>
        <button class="conv-rte-btn" title="Text color"  onclick="_rtePickColor('foreColor')"><span class="material-symbols-outlined">format_color_text</span></button>
        <button class="conv-rte-btn" title="Highlight"   onclick="_rtePickColor('backColor')"><span class="material-symbols-outlined">border_color</span></button>
        <div class="conv-rte-sep"></div>
        <button class="conv-rte-btn" title="Insert link" onclick="_rteLink()"><span class="material-symbols-outlined">link</span></button>
        <div class="conv-rte-sep"></div>
        <button class="conv-rte-btn" title="Bullet list"   onclick="_rte('insertUnorderedList')"><span class="material-symbols-outlined">format_list_bulleted</span></button>
        <button class="conv-rte-btn" title="Numbered list" onclick="_rte('insertOrderedList')"> <span class="material-symbols-outlined">format_list_numbered</span></button>
        <div class="conv-rte-sep"></div>
        <button class="conv-rte-btn" title="Indent"  onclick="_rte('indent')"> <span class="material-symbols-outlined">format_indent_increase</span></button>
        <button class="conv-rte-btn" title="Outdent" onclick="_rte('outdent')"><span class="material-symbols-outlined">format_indent_decrease</span></button>
      </div>
      <button class="conv-rte-btn" style="flex-shrink:0;margin-right:4px" title="More formatting options" onclick="_rteToggleMore(this,'_rte')"><span class="material-symbols-outlined">more_horiz</span></button>
    </div>

    <div class="conv-compose-body" id="conv-compose-body" contenteditable="true" spellcheck="true" data-placeholder="Write your message…"></div>

    <div class="conv-compose-footer">
      <button class="conv-compose-save-btn" onclick="_convDiscardCompose()">Save &amp; Close</button>
      <button class="conv-compose-send-email-btn">Send Email</button>
    </div>
  `;

  const footer = document.getElementById('conv-read-footer');
  if (footer) {
    footer.parentNode.insertBefore(card, footer);
    footer.style.display = 'none';
    // Hide panel body so compose fills the full panel
    const panelBody = document.getElementById('utility-panel-body');
    if (panelBody) panelBody.style.display = 'none';
    card.classList.add('conv-compose-expanded');
    // Populate body with quoted thread then place cursor at top
    requestAnimationFrame(() => {
      const body = card.querySelector('#conv-compose-body');
      if (!body) return;
      body.innerHTML = _buildQuotedThread(conv, mode);
      body.focus();
      // Move cursor to the very first node (before quoted thread)
      const range = document.createRange();
      range.setStart(body, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }
}

// Build quoted thread HTML — placed below a separator line in the compose body
function _buildQuotedThread(conv, mode) {
  const msgs = conv.messages;
  if (!msgs || msgs.length === 0) return '<br>';
  const label = mode === 'forward' ? 'Forwarded message' : 'Previous messages';
  const items = msgs.map(msg => {
    const name = msg.name === 'Me' ? 'Me' : msg.name;
    // Preserve <img> tags, strip everything else
    const bodyHtml = msg.body
      .replace(/<(?!img\b)[^>]+>/gi, '')   // remove all tags except <img ...>
      .replace(/\n/g, '<br>')
      .trim();
    return `
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:#7a7a7a;margin-bottom:3px">
          <strong style="color:#1a1a1a">${name}</strong>&nbsp;·&nbsp;${msg.time}
        </div>
        <div style="font-size:12px;color:#474747;line-height:1.5">${bodyHtml}</div>
      </div>`;
  }).join('');
  return `<br><hr style="border:none;border-top:1px solid #e0e0e0;margin:12px 0"><div style="font-size:10px;font-weight:600;color:#9e9e9e;letter-spacing:0.4px;margin-bottom:10px;text-transform:uppercase">${label}</div>${items}`;
}

/* ── Rich-text editor helpers ── */
function _rte(cmd, val) {
  const b = document.getElementById('conv-compose-body');
  if (b) { b.focus(); document.execCommand(cmd, false, val || null); }
}
function _rtePickColor(cmd) {
  const colors = ['#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff'];
  const existing = document.getElementById('rte-color-picker');
  if (existing) { existing.remove(); return; }
  const btn = document.activeElement;
  const pick = document.createElement('div');
  pick.id = 'rte-color-picker';
  pick.style.cssText = 'position:fixed;background:white;border:1px solid #e0e0e0;border-radius:8px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;width:136px;box-shadow:0 4px 16px rgba(0,0,0,0.14);z-index:9999';
  const rect = btn.getBoundingClientRect ? btn.getBoundingClientRect() : {bottom:200,left:200};
  pick.style.top  = (rect.bottom + 4) + 'px';
  pick.style.left = (rect.left  - 8)  + 'px';
  colors.forEach(c => {
    const s = document.createElement('div');
    s.style.cssText = `width:20px;height:20px;border-radius:4px;background:${c};cursor:pointer;border:1px solid rgba(0,0,0,0.15)`;
    s.onclick = () => { _rte(cmd, c); pick.remove(); };
    pick.appendChild(s);
  });
  document.body.appendChild(pick);
  setTimeout(() => document.addEventListener('click', function h(e){ if(!pick.contains(e.target)){pick.remove();document.removeEventListener('click',h);} }), 0);
}
function _rteLink() {
  const url = prompt('Enter URL:', 'https://');
  if (url) _rte('createLink', url);
}
function _rteTable() {
  const b = document.getElementById('conv-compose-body');
  if (!b) return;
  b.focus();
  document.execCommand('insertHTML', false,
    `<table style="border-collapse:collapse;width:100%;margin:8px 0"><thead><tr>
      <th style="padding:6px 10px;background:#f0f4f8;border:1px solid #ccd5e0;text-align:left">Column 1</th>
      <th style="padding:6px 10px;background:#f0f4f8;border:1px solid #ccd5e0;text-align:left">Column 2</th>
      <th style="padding:6px 10px;background:#f0f4f8;border:1px solid #ccd5e0;text-align:left">Column 3</th>
    </tr></thead><tbody><tr>
      <td style="padding:6px 10px;border:1px solid #ccd5e0">&nbsp;</td>
      <td style="padding:6px 10px;border:1px solid #ccd5e0">&nbsp;</td>
      <td style="padding:6px 10px;border:1px solid #ccd5e0">&nbsp;</td>
    </tr></tbody></table><br>`);
}
function _convToggleCcBcc(which) {
  const row = document.getElementById(`conv-${which}-row`);
  if (row) row.style.display = row.style.display === 'none' ? 'flex' : 'none';
}

/* ── More-formatting floating panel (shared by both compose forms) ── */
function _rteToggleMore(btn, fn) {
  const existing = document.getElementById('_rte_more_panel');
  if (existing) { existing.remove(); return; }

  // Derive table/link helpers from function prefix
  const tableCall = fn === '_rte' ? '_rteTable()' : '_cncRteTable()';
  const linkCall  = fn === '_rte' ? '_rteLink()'  : '_cncRteLink()';

  const panel = document.createElement('div');
  panel.id = '_rte_more_panel';
  panel.className = 'conv-rte-more-panel';
  panel.onclick = e => e.stopPropagation();
  panel.innerHTML = `
    <div class="conv-rte-more-row">
      <button class="conv-rte-btn" title="Cut"          onclick="window['${fn}']('cut')">  <span class="material-symbols-outlined">content_cut</span></button>
      <button class="conv-rte-btn" title="Copy"         onclick="window['${fn}']('copy')"> <span class="material-symbols-outlined">content_copy</span></button>
      <button class="conv-rte-btn" title="Paste"        onclick="window['${fn}']('paste')"><span class="material-symbols-outlined">content_paste</span></button>
      <div class="conv-rte-sep"></div>
      <button class="conv-rte-btn" title="Remove link"  onclick="window['${fn}']('unlink')"><span class="material-symbols-outlined">link_off</span></button>
      <button class="conv-rte-btn" title="Insert table" onclick="${tableCall}">             <span class="material-symbols-outlined">table</span></button>
      <button class="conv-rte-btn" title="Format painter" onclick="">                       <span class="material-symbols-outlined">format_paint</span></button>
    </div>
    <div class="conv-rte-more-row" style="margin-top:2px">
      <select class="conv-rte-select conv-rte-font" onchange="window['${fn}']('fontName',this.value)" title="Font family">
        <option value="inherit">Default</option><option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option><option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option><option value="Verdana">Verdana</option>
      </select>
      <select class="conv-rte-select conv-rte-size" onchange="window['${fn}']('fontSize',this.value)" title="Font size" style="margin-left:4px">
        <option value="1">10px</option><option value="2">12px</option>
        <option value="3" selected>14px</option><option value="4">16px</option>
        <option value="5">18px</option><option value="6">24px</option><option value="7">32px</option>
      </select>
    </div>
    <div class="conv-rte-more-row" style="margin-top:2px">
      <button class="conv-rte-btn" title="Align left"    onclick="window['${fn}']('justifyLeft')">  <span class="material-symbols-outlined">format_align_left</span></button>
      <button class="conv-rte-btn" title="Align center"  onclick="window['${fn}']('justifyCenter')"><span class="material-symbols-outlined">format_align_center</span></button>
      <button class="conv-rte-btn" title="Align right"   onclick="window['${fn}']('justifyRight')"> <span class="material-symbols-outlined">format_align_right</span></button>
      <button class="conv-rte-btn" title="Justify"       onclick="window['${fn}']('justifyFull')">  <span class="material-symbols-outlined">format_align_justify</span></button>
    </div>`;

  document.body.appendChild(panel);
  const r = btn.getBoundingClientRect();
  // Position above the button if it would go off bottom, otherwise below
  const panelH = 120; // approx height
  if (r.bottom + panelH > window.innerHeight) {
    panel.style.bottom = (window.innerHeight - r.top + 4) + 'px';
  } else {
    panel.style.top = (r.bottom + 4) + 'px';
  }
  panel.style.right = (window.innerWidth - r.right) + 'px';
  setTimeout(() => document.addEventListener('click', () => panel.remove(), { once: true }), 0);
}

/* ── New-email compose RTE helpers (target #cnc-body) ── */
function _cncRte(cmd, val) {
  const b = document.getElementById('cnc-body');
  if (b) { b.focus(); document.execCommand(cmd, false, val || null); }
}
function _cncRtePickColor(cmd) {
  const colors = ['#000000','#374151','#6b7280','#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];
  const existing = document.getElementById('_cnc_color_picker');
  if (existing) { existing.remove(); return; }
  const pick = document.createElement('div');
  pick.id = '_cnc_color_picker';
  pick.style.cssText = 'position:fixed;z-index:9999;background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:8px;display:grid;grid-template-columns:repeat(3,24px);gap:6px;box-shadow:0 4px 16px rgba(0,0,0,0.15)';
  colors.forEach(c => {
    const s = document.createElement('div');
    s.style.cssText = `width:24px;height:24px;border-radius:4px;background:${c};cursor:pointer;border:1px solid rgba(0,0,0,0.1)`;
    s.onclick = () => { _cncRte(cmd, c); pick.remove(); };
    pick.appendChild(s);
  });
  document.body.appendChild(pick);
  const btn = event.currentTarget;
  const r = btn.getBoundingClientRect();
  pick.style.top  = (r.bottom + 4) + 'px';
  pick.style.left = r.left + 'px';
  setTimeout(() => document.addEventListener('click', () => pick.remove(), { once: true }), 0);
}
function _cncRteLink() { const url = prompt('Enter URL:', 'https://'); if (url) _cncRte('createLink', url); }
function _cncRteTable() {
  const html = `<table style="border-collapse:collapse;width:100%"><thead><tr>
    <th style="padding:6px 10px;background:#f0f4f8;border:1px solid #ccd5e0;text-align:left">Column 1</th>
    <th style="padding:6px 10px;background:#f0f4f8;border:1px solid #ccd5e0;text-align:left">Column 2</th>
    <th style="padding:6px 10px;background:#f0f4f8;border:1px solid #ccd5e0;text-align:left">Column 3</th>
    </tr></thead><tbody><tr>
    <td style="padding:6px 10px;border:1px solid #ccd5e0">&nbsp;</td>
    <td style="padding:6px 10px;border:1px solid #ccd5e0">&nbsp;</td>
    <td style="padding:6px 10px;border:1px solid #ccd5e0">&nbsp;</td>
    </tr></tbody></table><br>`;
  const b = document.getElementById('cnc-body');
  if (b) { b.focus(); document.execCommand('insertHTML', false, html); }
}
function _cncToggleCcBcc(which) {
  const row = document.getElementById(`cnc-${which}-row`);
  if (row) row.style.display = row.style.display === 'none' ? 'flex' : 'none';
}

function _convDiscardCompose() {
  const card     = document.getElementById('conv-compose-card');
  const stripBtn = document.getElementById('util-btn-reply-draft');
  if (card) card.remove();
  if (stripBtn) { stripBtn.style.display = 'none'; stripBtn.classList.remove('active'); }
  _convAttachSelected.clear();
  // Restore conversations list
  const panelBody = document.getElementById('utility-panel-body');
  if (panelBody) { panelBody.style.display = ''; renderConversationsPanel(panelBody); }
}

/* ── Attach-from-case overlay ── */
let _convAttachSelected = new Set(); // tracks selected attachment names

function _convOpenAttachOverlay(e) {
  if (e) e.stopPropagation();
  if (!ATTACH_ITEMS || !ATTACH_ITEMS.length) return;

  // Build overlay HTML from case ATTACH_ITEMS
  const overlay = document.createElement('div');
  overlay.id = 'conv-attach-overlay';
  overlay.className = 'conv-attach-overlay';

  // Search state
  let _searchVal = '';

  function _buildList(filter) {
    const items = filter
      ? ATTACH_ITEMS.filter(f =>
          f.name.toLowerCase().includes(filter) ||
          f.ext.toLowerCase().includes(filter) ||
          f.type.toLowerCase().includes(filter))
      : ATTACH_ITEMS;
    return items.map((f, i) => {
      const key = f.name + '|' + f.ext;
      const checked = _convAttachSelected.has(key) ? 'checked' : '';
      return `
      <label class="conv-attach-item" onclick="event.stopPropagation()">
        <input type="checkbox" ${checked} onchange="_convAttachToggle('${f.name.replace(/'/g,"\\'").replace(/"/g,"&quot;")}','${f.ext}',this.checked)"/>
        <span class="att-ext-badge" style="font-size:9px;padding:2px 5px;border-radius:4px;background:#2d2d2d;color:#fff;flex-shrink:0">${f.ext}</span>
        <div class="conv-attach-item-info">
          <div class="conv-attach-item-name">${f.name}</div>
          <div class="conv-attach-item-size">${f.size} · ${f.uploader} · <span style="color:var(--text-muted)">${f.type}</span></div>
        </div>
      </label>`;
    }).join('') || '<div style="padding:16px;color:var(--text-muted);font-size:12px;text-align:center">No files match your search</div>';
  }

  overlay.innerHTML = `
    <div class="conv-attach-backdrop" onclick="_convCloseAttachOverlay()"></div>
    <div class="conv-attach-panel">
      <div class="conv-attach-panel-hd">
        <span class="material-symbols-outlined" style="font-size:18px;color:var(--text-muted)">attach_file</span>
        <h3>Attach from case</h3>
        <button onclick="_convCloseAttachOverlay()"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>
      </div>
      <div style="padding:8px 12px;border-bottom:1px solid var(--border-light);flex-shrink:0">
        <input id="conv-attach-search" type="text" placeholder="Search files…"
          style="width:100%;box-sizing:border-box;padding:6px 10px;border:1px solid var(--border);border-radius:7px;font-size:12px;outline:none"
          oninput="_convAttachSearch(this.value)"/>
      </div>
      <div class="conv-attach-list" id="conv-attach-list">${_buildList('')}</div>
      <div class="conv-attach-panel-ft">
        <button class="conv-attach-cancel-btn" onclick="_convCloseAttachOverlay()">Cancel</button>
        <button class="conv-attach-attach-btn" id="conv-attach-attach-btn"
          onclick="_convConfirmAttach()"
          ${_convAttachSelected.size === 0 ? 'disabled' : ''}>
          Attach${_convAttachSelected.size ? ' (' + _convAttachSelected.size + ')' : ''}
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => document.getElementById('conv-attach-search')?.focus());
}

function _convAttachSearch(val) {
  const list = document.getElementById('conv-attach-list');
  if (!list) return;
  const filter = val.toLowerCase().trim();
  const items = filter
    ? ATTACH_ITEMS.filter(f =>
        f.name.toLowerCase().includes(filter) ||
        f.ext.toLowerCase().includes(filter) ||
        f.type.toLowerCase().includes(filter))
    : ATTACH_ITEMS;
  list.innerHTML = items.map(f => {
    const key = f.name + '|' + f.ext;
    const checked = _convAttachSelected.has(key) ? 'checked' : '';
    return `
    <label class="conv-attach-item" onclick="event.stopPropagation()">
      <input type="checkbox" ${checked} onchange="_convAttachToggle('${f.name.replace(/'/g,"\\'").replace(/"/g,"&quot;")}','${f.ext}',this.checked)"/>
      <span class="att-ext-badge" style="font-size:9px;padding:2px 5px;border-radius:4px;background:#2d2d2d;color:#fff;flex-shrink:0">${f.ext}</span>
      <div class="conv-attach-item-info">
        <div class="conv-attach-item-name">${f.name}</div>
        <div class="conv-attach-item-size">${f.size} · ${f.uploader} · <span style="color:var(--text-muted)">${f.type}</span></div>
      </div>
    </label>`;
  }).join('') || '<div style="padding:16px;color:var(--text-muted);font-size:12px;text-align:center">No files match your search</div>';
}

function _convAttachToggle(name, ext, checked) {
  const key = name + '|' + ext;
  if (checked) _convAttachSelected.add(key);
  else _convAttachSelected.delete(key);
  // Update button label + disabled state
  const btn = document.getElementById('conv-attach-attach-btn');
  if (btn) {
    const n = _convAttachSelected.size;
    btn.disabled = n === 0;
    btn.textContent = n ? 'Attach (' + n + ')' : 'Attach';
  }
}

function _convCloseAttachOverlay() {
  const ov = document.getElementById('conv-attach-overlay');
  if (ov) ov.remove();
}

function _convConfirmAttach() {
  _convCloseAttachOverlay();
  _convRenderAttachedStrip();
}

function _convRenderAttachedStrip() {
  const strip = document.getElementById('conv-compose-attached');
  if (!strip) return;
  if (_convAttachSelected.size === 0) {
    strip.style.display = 'none';
    strip.innerHTML = '';
    return;
  }
  strip.style.display = 'flex';
  strip.innerHTML = Array.from(_convAttachSelected).map(key => {
    const [name, ext] = key.split('|');
    return `
    <div class="conv-attached-chip">
      <span style="font-size:9px;padding:1px 4px;border-radius:3px;background:#2d2d2d;color:#fff;flex-shrink:0;font-weight:600">${ext || 'FILE'}</span>
      <span class="conv-attached-chip-name" title="${name}">${name}</span>
      <button class="conv-attached-chip-remove" title="Remove" onclick="_convRemoveAttached('${key.replace(/'/g,"\\'")}')">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>`;
  }).join('');
}

function _convRemoveAttached(key) {
  _convAttachSelected.delete(key);
  _convRenderAttachedStrip();
}

/* ── Reply compose templates ── */
const _CONV_TEMPLATES = {
  freight: `<p>Hi {recipient},</p>
<p>Thank you for bringing this to our attention. We have reviewed the freight discrepancy on BOL #{BOL_NUMBER} and are currently investigating the weight variance reported at the {HUB} distribution hub.</p>
<p>Our warehouse team is pulling the original outbound scan records to verify the declared weight against the WMS logs. We will have a resolution before the carrier invoice date to ensure no incorrect charge adjustments are applied.</p>
<p>Please let us know if you require any additional documentation in the meantime.</p>
<p>Best regards,</p>`,

  invoice: `<p>Hi {recipient},</p>
<p>Thank you for your follow-up on the Q1 invoice. We have received your documentation and it is currently under review by our billing team.</p>
<p>We anticipate completing the review within 2–3 business days. Should we require any additional information or supporting documents, we will reach out directly.</p>
<p>Once approved, payment will be processed per the agreed terms. Please do not hesitate to contact us if you have any questions in the meantime.</p>
<p>Kind regards,</p>`,

  escalation: `<p>Hi {recipient},</p>
<p>Thank you for reaching out. We acknowledge receipt of your escalation and want to assure you that this matter is being treated as a priority.</p>
<p>Your case has been assigned to our Tier 2 support team, who will be in contact with you within 24 hours with an update and a proposed resolution path.</p>
<p>We apologize for any inconvenience this has caused and appreciate your patience as we work to resolve this matter promptly.</p>
<p>Best regards,</p>`
};

function _convApplyTemplate(key) {
  if (!key) return;
  const body = document.getElementById('conv-compose-body');
  if (!body) return;
  const tpl = _CONV_TEMPLATES[key];
  if (!tpl) return;
  // If body already has content, confirm before replacing
  const current = body.innerText.trim();
  if (current && !confirm('Replace current message with this template?')) {
    // Reset select back to blank
    const sel = document.querySelector('#conv-compose-card .conv-field-select[onchange]');
    if (sel) sel.value = '';
    return;
  }
  body.innerHTML = tpl;
  body.focus();
  // Move cursor to end
  const range = document.createRange();
  range.selectNodeContents(body);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function _convToggleModeMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('conv-compose-mode-menu');
  if (!menu) return;
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function _convSwitchMode(mode) {
  const card = document.getElementById('conv-compose-card');
  if (!card) return;
  card.dataset.mode = mode;

  const conv = CONV_ITEMS[_activeConvIndex];
  const others = [...new Set(conv.messages.filter(m => m.name !== 'Me').map(m => m.name))];
  let toVal = '';
  if (mode === 'reply_all') {
    toVal = others.join(', ');
  } else if (mode === 'reply') {
    const last = [...conv.messages].reverse().find(m => m.name !== 'Me');
    toVal = last ? last.name : (others[0] || '');
  }

  const modeMap = {
    reply:     { icon: 'reply',     label: 'Reply',     placeholder: 'Write your reply…' },
    reply_all: { icon: 'reply_all', label: 'Reply All', placeholder: 'Write your reply…' },
    forward:   { icon: 'forward',   label: 'Forward',   placeholder: 'Add a message…' }
  };
  const m = modeMap[mode];
  // Update the badge in the titlebar
  const modeIcon  = document.getElementById('conv-mode-icon');
  const modeLabel = document.getElementById('conv-mode-label');
  if (modeIcon)  modeIcon.textContent  = m.icon;
  if (modeLabel) modeLabel.textContent = m.label;
  document.getElementById('conv-compose-to-input').value = toVal;
  document.getElementById('conv-compose-to-input').placeholder = mode === 'forward' ? 'Add recipient…' : '';
  card.querySelector('.conv-compose-textarea').placeholder = m.placeholder;
  document.getElementById('conv-compose-mode-menu').style.display = 'none';
}

function _convToggleComposePopup() {
  const card     = document.getElementById('conv-compose-card');
  const btn      = document.getElementById('conv-compose-popup-btn');
  const body     = document.getElementById('utility-panel-body');
  const draftBtn = document.getElementById('util-btn-reply-draft');
  if (!card) return;

  const isPopup = card.classList.contains('ccc-popup-mode');
  if (isPopup) {
    // Popup → dock back: full panel compose, hide body
    const panel = document.getElementById('utility-panel');
    if (panel && !panel.classList.contains('open')) toggleUtility('conversations');
    card.classList.remove('ccc-popup-mode');
    card.classList.add('conv-compose-expanded');
    if (body) body.style.display = 'none';
    if (draftBtn) { draftBtn.style.display = 'none'; draftBtn.classList.remove('active'); }
    if (btn) { btn.querySelector('span').textContent = 'open_in_full'; btn.title = 'Switch to popup'; }
  } else {
    // Panel → popup: float compose, restore conversations list in panel
    card.classList.add('ccc-popup-mode');
    card.classList.remove('conv-compose-expanded');
    if (body) { body.style.display = ''; renderConversationsPanel(body); }
    if (draftBtn) {
      const conv = _activeConvIndex !== null ? CONV_ITEMS[_activeConvIndex] : null;
      draftBtn.title = (conv ? conv.subject : 'Reply') + ' — click to open';
      draftBtn.style.display = 'flex';
      draftBtn.classList.add('active');
    }
    if (btn) { btn.querySelector('span').textContent = 'close_fullscreen'; btn.title = 'Dock back'; }
  }
  setTimeout(() => document.getElementById('conv-compose-body')?.focus(), 50);
}

function _convMinimizeCompose() {
  const card     = document.getElementById('conv-compose-card');
  const stripBtn = document.getElementById('util-btn-reply-draft');
  if (!card) return;
  // Dock out of popup mode before hiding so it returns to panel on restore
  card.classList.remove('ccc-popup-mode');
  card.style.display = 'none';
  if (stripBtn) {
    const conv = _activeConvIndex !== null ? CONV_ITEMS[_activeConvIndex] : null;
    stripBtn.title = (conv ? conv.subject : 'Reply') + ' — click to open';
    stripBtn.style.display = 'flex';
    stripBtn.classList.add('active');
  }
}

function _convRestoreCompose() {
  const card     = document.getElementById('conv-compose-card');
  const stripBtn = document.getElementById('util-btn-reply-draft');
  if (!card) return;
  // Ensure the utility panel is open
  const panel = document.getElementById('utility-panel');
  if (panel && !panel.classList.contains('open')) toggleUtility('conversations');
  card.style.display = '';
  if (stripBtn) { stripBtn.style.display = 'none'; stripBtn.classList.remove('active'); }
  requestAnimationFrame(() => card.querySelector('#conv-compose-body')?.focus());
}

function closeConversation() {
  // Collapse the active thread (accordion — no navigation needed)
  if (_activeConvIndex !== null) _convToggleThread(_activeConvIndex);
}

function startPanelResize(e) {
  e.preventDefault();
  const panel = document.getElementById('utility-panel');
  const handle = document.getElementById('panel-resize-handle');
  const startX = e.clientX;
  const startW = panel.offsetWidth;
  // Disable transition during drag for instant feedback
  panel.style.transition = 'none';
  if (handle) handle.classList.add('dragging');
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  function onMove(ev) {
    const delta = startX - ev.clientX; // drag left = wider (panel is on the right)
    const caseBody = document.querySelector('.case-body');
    const maxW = caseBody ? Math.floor(caseBody.offsetWidth * 0.60) - 44 : 800;
    const newW = Math.min(maxW, Math.max(240, startW + delta));
    panel.style.width = newW + 'px';
  }
  function onUp() {
    panel.style.transition = '';
    if (handle) handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function popOutConversations() {
  // Toggle: close if already open
  const existing = document.getElementById('conv-popout-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'conv-popout-overlay';
  overlay.className = 'conv-popout-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) closePopOut(); });

  overlay.innerHTML = `
    <div class="conv-popout-modal">
      <div id="pop-modal-content" style="display:flex;flex-direction:column;flex:1;min-height:0;"></div>
    </div>`;

  document.body.appendChild(overlay);

  if (_activeConvIndex !== null) {
    _popRenderConv(_activeConvIndex);
  } else {
    _popRenderList();
  }
}

function closePopOut() {
  const el = document.getElementById('conv-popout-overlay');
  if (el) el.remove();
}

function popOutAttachments() {
  const existing = document.getElementById('att-popout-overlay');
  if (existing) { existing.remove(); return; }
  const overlay = document.createElement('div');
  overlay.id = 'att-popout-overlay';
  overlay.className = 'conv-popout-overlay';
  overlay.addEventListener('click', e => { if (e.target === overlay) closeAttachPopOut(); });
  overlay.innerHTML = `
    <div class="conv-popout-modal" style="height:680px;">
      <div id="att-modal-content" style="display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;"></div>
    </div>`;
  document.body.appendChild(overlay);
  _attPopRender();
}

function closeAttachPopOut() {
  const el = document.getElementById('att-popout-overlay');
  if (el) el.remove();
}

function _attPopRender() {
  const el = document.getElementById('att-modal-content');
  if (!el) return;
  const items = _attachFilter
    ? ATTACH_ITEMS.filter(f => f.name.toLowerCase().includes(_attachFilter) || f.ext.toLowerCase().includes(_attachFilter) || f.type.toLowerCase().includes(_attachFilter))
    : ATTACH_ITEMS;
  el.innerHTML = `
    <div class="pop-title-row">
      <span class="pop-title-text">Attachments</span>
      <span class="pop-count-badge">${items.length}</span>
      <div style="flex:1"></div>
      <button class="conv-popout-close" onclick="closeAttachPopOut()" title="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="conv-popout-topbar">
      <button class="att-upload-btn" title="Upload file">
        <span class="material-symbols-outlined">upload</span>
      </button>
      <button class="att-sort-btn" title="Sort">
        <span class="material-symbols-outlined">expand_more</span>
      </button>
      <input class="conv-search" type="text" placeholder="Search files…"
        value="${_attachFilter}"
        oninput="_attPopFilter(this.value)" style="flex:1;min-width:0" />
      <button class="conv-action-btn" title="Refresh">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>
    <div class="att-table-wrap" style="margin:0 16px 16px;flex:1;min-height:0;">
      ${items.map(f => _attRowHtml(f, ATTACH_ITEMS.indexOf(f), '_attPopPreview')).join('')}
    </div>`;
}

function _attPopFilter(val) {
  _attachFilter = val.toLowerCase().trim();
  _attPopRender();
}

function _popRenderList() {
  const el = document.getElementById('pop-modal-content');
  if (!el) return;
  const total = CONV_ITEMS.length;
  el.innerHTML = `
    <div class="pop-title-row">
      <span class="pop-title-text">Conversations</span>
      <span class="pop-count-badge">${total}</span>
      <div style="flex:1"></div>
      <button class="conv-popout-close" onclick="closePopOut()" title="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="conv-popout-topbar">
      <button class="pop-new-btn primary" onclick="openNewConversation('email')">
        <span class="material-symbols-outlined">mail</span> New Email
      </button>
      <button class="pop-new-btn" onclick="openNewConversation('comment')">
        <span class="material-symbols-outlined">chat_bubble</span> New Comment
      </button>
      <button class="pop-new-btn" onclick="openNewConversation('task')">
        <span class="material-symbols-outlined">check_box</span> New Task
      </button>
      <input class="conv-search" type="text" placeholder="Type to search.." oninput="_popFilter(this.value)" style="flex:1;min-width:0" />
      <button class="conv-action-btn" onclick="refreshConversations()" title="Refresh">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>
    <div class="pop-conv-table" id="pop-conv-list"></div>`;
  _popRenderItems(CONV_ITEMS);
}

function _popRenderItems(items) {
  const list = document.getElementById('pop-conv-list');
  if (!list) return;
  list.innerHTML = items.map((c) => {
    const idx = CONV_ITEMS.indexOf(c);
    const hasAttach = c.messages.some(m => m.attachments.length > 0);
    const avatarInitials = c.initials;
    return `<div class="pop-table-row" onclick="_popRenderConv(${idx})">
      <div class="pop-avatar-col">
        <div class="pop-avatar">${avatarInitials}</div>
      </div>
      <div class="pop-name-col">
        <span class="pop-name-text${c.unread ? ' unread' : ''}">${c.name}</span>
      </div>
      <div class="pop-preview-col">
        <span class="pop-preview-subject${c.unread ? ' unread' : ''}">${c.subject}</span>
        <span class="pop-preview-sub">${c.preview}</span>
      </div>
      <div class="pop-badge-col">
        <span class="pop-type-badge">${c.tag}</span>
      </div>
      <div class="pop-time-col">
        <span class="pop-time-text">${c.time}</span>
        ${hasAttach ? '<span class="pop-attach-icon"><span class="material-symbols-outlined">attach_file</span></span>' : ''}
      </div>
    </div>`;
  }).join('');
}

function _popFilter(val) {
  const q = val.toLowerCase().trim();
  const items = q ? CONV_ITEMS.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.subject.toLowerCase().includes(q) ||
    c.preview.toLowerCase().includes(q)
  ) : CONV_ITEMS;
  _popRenderItems(items);
}

function _popRenderConv(index) {
  const el = document.getElementById('pop-modal-content');
  if (!el) return;
  const c = CONV_ITEMS[index];
  el.innerHTML = `
    <div class="conv-read-header">
      <button class="conv-read-back" onclick="_popRenderList()">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <span class="conv-read-title">${c.subject}</span>
      <button class="conv-action-btn" title="Attachments">
        <span class="material-symbols-outlined">attach_file</span>
      </button>
      <button class="conv-popout-close" onclick="closePopOut()" title="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="conv-thread" style="flex:1;overflow-y:auto;">${c.messages.map(m => `
      <div class="conv-msg">
        <div class="conv-msg-top">
          <div class="conv-msg-avatar${m.name === 'Me' ? ' self' : ''}">${m.initials}</div>
          <div class="conv-msg-meta">
            <div class="conv-msg-name">${m.name}</div>
            <div class="conv-msg-time">${m.time}</div>
          </div>
          <div class="conv-msg-actions">
            <button class="conv-msg-action-btn" title="Reply"><span class="material-symbols-outlined">reply</span></button>
            <button class="conv-msg-action-btn" title="Forward"><span class="material-symbols-outlined">forward</span></button>
            <button class="conv-msg-action-btn" title="More"><span class="material-symbols-outlined">more_horiz</span></button>
          </div>
        </div>
        <div class="conv-msg-body">${m.body}</div>
        ${m.attachments.length ? `<div class="conv-msg-attachments">${m.attachments.map(a => `
          <div class="conv-msg-attach-chip">
            <span class="material-symbols-outlined">${a.icon}</span>
            <span class="conv-msg-attach-name">${a.name}</span>
            <span class="conv-msg-attach-size">${a.size}</span>
          </div>`).join('')}</div>` : ''}
      </div>`).join('')}
    </div>
    <div class="conv-read-footer">
      <button class="conv-footer-primary"><span class="material-symbols-outlined">reply</span> Reply</button>
      <button class="conv-footer-btn"><span class="material-symbols-outlined">forward</span> Forward</button>
      <button class="conv-footer-icon"><span class="material-symbols-outlined">more_horiz</span></button>
    </div>`;
}

function _attRowHtml(f, idx, clickFn) {
  return `<div class="att-row" onclick="${clickFn}(${idx})">
    <div class="att-cell att-cell-ext">
      <span class="att-ext-badge">${f.ext}</span>
    </div>
    <div class="att-cell att-cell-name">
      <span class="att-file-name" title="${f.name}">${f.name}</span>
      <span class="att-file-tag">${f.type}</span>
    </div>
    <div class="att-cell-actions" onclick="event.stopPropagation()">
      <button class="att-action-btn" title="Download"><span class="material-symbols-outlined">download</span></button>
      <button class="att-action-btn" title="Preview"><span class="material-symbols-outlined">visibility</span></button>
      <button class="att-action-btn" title="Copy link"><span class="material-symbols-outlined">link</span></button>
      <button class="att-action-btn" title="Delete"><span class="material-symbols-outlined">delete</span></button>
    </div>
  </div>`;
}

const ATTACH_ITEMS = [
  { name: 'KPMG Sequence Co-Termed Renewal 05-27-2022 to 05-06-2023v2.pdf', ext: 'PDF', size: '2.4 MB', date: 'Mar 12, 2026', uploader: 'Ahmed Arah', type: 'Contract' },
  { name: 'Project Proposal 06-01-2023 to 06-30-2023.docx', ext: 'DOCX', size: '1.1 MB', date: 'Mar 10, 2026', uploader: 'Ben Septer', type: 'Proposal' },
  { name: 'Sales Data Q2 2023.xlsx', ext: 'XLSX', size: '890 KB', date: 'Mar 8, 2026', uploader: 'Emily Foster', type: 'Report' },
  { name: 'Marketing Strategy 2023.pptx', ext: 'PPTX', size: '3.2 MB', date: 'Mar 5, 2026', uploader: 'Cara D\'Angelo', type: 'Strategy' },
  { name: 'Contract Agreement v3.pdf', ext: 'PDF', size: '540 KB', date: 'Feb 28, 2026', uploader: 'David Ellis', type: 'Contract' },
  { name: 'Customer Data Export Q1-Q2.csv', ext: 'CSV', size: '1.8 MB', date: 'Feb 25, 2026', uploader: 'Ahmed Arah', type: 'Data' },
  { name: 'System Architecture Diagram Final.png', ext: 'PNG', size: '4.1 MB', date: 'Feb 20, 2026', uploader: 'Ben Septer', type: 'Technical' },
  { name: 'Meeting Notes Q1 2026.docx', ext: 'DOCX', size: '220 KB', date: 'Feb 15, 2026', uploader: 'Emily Foster', type: 'Notes' },
  { name: 'Budget Forecast 2026 Revised.xlsx', ext: 'XLSX', size: '1.3 MB', date: 'Feb 10, 2026', uploader: 'Cara D\'Angelo', type: 'Finance' },
  { name: 'Legal Review Summary Final.pdf', ext: 'PDF', size: '670 KB', date: 'Feb 5, 2026', uploader: 'David Ellis', type: 'Legal' },
  { name: 'Product Roadmap Q2 2026.pptx', ext: 'PPTX', size: '5.8 MB', date: 'Jan 30, 2026', uploader: 'Ahmed Arah', type: 'Roadmap' },
];

let _attachFilter = '';
let _attachTypeFilter = new Set();

function _attFilteredItems() {
  let items = _attachFilter
    ? ATTACH_ITEMS.filter(f => f.name.toLowerCase().includes(_attachFilter) || f.ext.toLowerCase().includes(_attachFilter) || f.type.toLowerCase().includes(_attachFilter))
    : ATTACH_ITEMS;
  if (_attachTypeFilter.size > 0) {
    items = items.filter(f => _attachTypeFilter.has(f.ext));
  }
  return items;
}

function renderAttachmentsPanel(container) {
  const items = _attFilteredItems();
  const allTypes = [...new Set(ATTACH_ITEMS.map(f => f.type))].sort();
  const filterActive = _attachTypeFilter.size > 0;

  container.innerHTML = `
    <div class="att-panel">
      <div class="att-toolbar">
        <div class="att-toolbar-left">
          <button class="att-upload-btn" title="Upload file">
            <span class="material-symbols-outlined">upload</span>
          </button>
          <input class="att-search" type="text" placeholder="Search files…"
            value="${_attachFilter}"
            oninput="filterAttachments(this.value)" />
        </div>
        <div class="att-toolbar-right">
          <div class="conv-filter-wrap" id="att-filter-wrap">
            <button class="conv-action-btn${filterActive ? ' active' : ''}" id="att-filter-btn"
              title="Filter by type${filterActive ? ' (' + _attachTypeFilter.size + ' active)' : ''}"
              onclick="_attToggleTypeFilter(event)">
              <span class="material-symbols-outlined">filter_list</span>
            </button>
            <div class="conv-label-filter-drop" id="att-type-filter-drop" style="display:none"></div>
          </div>
        </div>
      </div>
      <div class="att-title-row">
        <span class="att-title-text">Attachments</span>
        <span class="att-count-badge">${items.length}</span>
      </div>
      <div class="att-table-wrap">
        ${items.map(f => _attRowHtml(f, ATTACH_ITEMS.indexOf(f), 'openAttachPreview')).join('')}
      </div>
    </div>`;
}

function filterAttachments(val) {
  _attachFilter = val.toLowerCase().trim();
  const body = document.getElementById('utility-panel-body');
  if (body) renderAttachmentsPanel(body);
}

function _attToggleTypeFilter(e) {
  e.stopPropagation();
  const drop = document.getElementById('att-type-filter-drop');
  if (!drop) return;
  if (drop.style.display !== 'none') { drop.style.display = 'none'; return; }
  const allTypes = [...new Set(ATTACH_ITEMS.map(f => f.ext))].sort();
  drop.innerHTML = allTypes.map(t => `
    <label class="conv-lf-item" onclick="event.stopPropagation()">
      <input type="checkbox" ${_attachTypeFilter.has(t) ? 'checked' : ''}
        onchange="_attToggleTypeCheck('${t}', this.checked)"/>
      <span style="font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;background:#2d2d2d;color:#fff">${t}</span>
    </label>`).join('') +
    `<hr class="conv-filter-divider"/>
     <button class="conv-lf-clear" onclick="_attClearTypeFilter()">Clear all filters</button>`;
  drop.style.display = 'block';
  setTimeout(() => document.addEventListener('click', () => { drop.style.display = 'none'; }, { once: true }), 0);
}

function _attToggleTypeCheck(ext, checked) {
  if (checked) _attachTypeFilter.add(ext);
  else _attachTypeFilter.delete(ext);
  const body = document.getElementById('utility-panel-body');
  if (body) renderAttachmentsPanel(body);
}

function _attClearTypeFilter() {
  _attachTypeFilter.clear();
  const drop = document.getElementById('att-type-filter-drop');
  if (drop) drop.style.display = 'none';
  const body = document.getElementById('utility-panel-body');
  if (body) renderAttachmentsPanel(body);
}

/* ── Attachment Preview (drawer) ── */
let _attachPreviewIndex = null;

function openAttachPreview(idx) {
  _attachPreviewIndex = idx;
  const body = document.getElementById('utility-panel-body');
  if (body) {
    _renderAttachPreviewDrawer(body, idx);
    // Scroll active thumb into view
    requestAnimationFrame(() => {
      const strip = document.getElementById('att-thumb-strip');
      const active = strip?.querySelector('.att-thumb-item.active');
      if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }
}

function closeAttachPreview() {
  _attachPreviewIndex = null;
  const body = document.getElementById('utility-panel-body');
  if (body) renderAttachmentsPanel(body);
}

function prevAttachPreview() {
  const i = (_attachPreviewIndex - 1 + ATTACH_ITEMS.length) % ATTACH_ITEMS.length;
  openAttachPreview(i);
}

function nextAttachPreview() {
  const i = (_attachPreviewIndex + 1) % ATTACH_ITEMS.length;
  openAttachPreview(i);
}

function _renderAttachPreviewDrawer(container, idx) {
  const f = ATTACH_ITEMS[idx];
  const total = ATTACH_ITEMS.length;
  container.innerHTML = `
    <div class="att-preview-wrap">
      <div class="att-preview-header">
        <button class="att-preview-back" onclick="closeAttachPreview()" title="Back to list">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <div class="att-preview-title-wrap">
          <span class="att-preview-title" title="${f.name}">${f.name}</span>
          <span class="att-ext-badge">${f.ext}</span>
        </div>
      </div>
      <div class="att-preview-body">
        <div class="att-preview-area">
          <div class="att-preview-placeholder">
            <span class="material-symbols-outlined">description</span>
            <span>${f.ext} · ${f.size}</span>
          </div>
        </div>
        <div class="att-preview-meta">${f.date} · ${f.uploader}</div>
        <div class="att-preview-nav-row">
          <button class="att-nav-arrow" onclick="prevAttachPreview()" title="Previous" ${idx === 0 ? 'disabled' : ''}>
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <div class="att-thumb-strip" id="att-thumb-strip">
            ${ATTACH_ITEMS.map((item, i) => `
              <div class="att-thumb-item${i === idx ? ' active' : ''}" onclick="openAttachPreview(${i})" title="${item.name}">
                <div class="att-thumb-box">
                  <span style="font-size:9px;font-weight:700;color:#474747;font-family:inherit">${item.ext}</span>
                </div>
                <span class="att-thumb-label">${item.name.replace(/\.[^.]+$/, '').slice(0, 8)}</span>
              </div>`).join('')}
          </div>
          <button class="att-nav-arrow" onclick="nextAttachPreview()" title="Next" ${idx === total - 1 ? 'disabled' : ''}>
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div class="att-preview-footer">
        <button class="att-preview-action active" title="Search">
          <span class="material-symbols-outlined">search</span>
        </button>
        <button class="att-preview-action" title="Info">
          <span class="material-symbols-outlined">info</span>
        </button>
        <button class="att-preview-action" title="Checklist">
          <span class="material-symbols-outlined">check_box_outline_blank</span>
        </button>
      </div>
    </div>`;
}

/* ── Attachment Preview (modal) ── */
function _attPopPreview(idx) {
  _attachPreviewIndex = idx;
  const el = document.getElementById('att-modal-content');
  if (!el) return;
  const f = ATTACH_ITEMS[idx];
  const total = ATTACH_ITEMS.length;
  el.innerHTML = `
    <div class="pop-title-row">
      <button class="att-preview-back" onclick="_attPopBackToList()" title="Back">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <div class="att-preview-title-wrap" style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;overflow:hidden;">
        <span class="pop-title-text" title="${f.name}" style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.name}</span>
        <span class="att-ext-badge" style="flex-shrink:0;">${f.ext}</span>
      </div>
      <button class="conv-popout-close" onclick="closeAttachPopOut()" title="Close">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="att-pop-preview-body">
      <div class="att-pop-preview-left">
        <div class="att-preview-area" style="flex:1;min-height:0;">
          <div class="att-preview-placeholder">
            <span class="material-symbols-outlined">description</span>
            <span>${f.ext} · ${f.size}</span>
          </div>
        </div>
        <div class="att-pop-preview-footer">
          <button class="att-preview-action active" title="Search">
            <span class="material-symbols-outlined">search</span>
          </button>
          <button class="att-preview-action" title="Info">
            <span class="material-symbols-outlined">info</span>
          </button>
          <button class="att-preview-action" title="Checklist">
            <span class="material-symbols-outlined">check_box_outline_blank</span>
          </button>
          <div style="flex:1"></div>
          <button class="att-nav-arrow" onclick="_attPopPreview(${(idx - 1 + total) % total})" ${idx === 0 ? 'disabled' : ''}>
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="att-nav-counter" style="padding:0 8px;">${idx + 1} / ${total}</span>
          <button class="att-nav-arrow" onclick="_attPopPreview(${(idx + 1) % total})" ${idx === total - 1 ? 'disabled' : ''}>
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div class="att-pop-nav-list">
        ${ATTACH_ITEMS.map((item, i) => `
        <div class="att-nav-item${i === idx ? ' active' : ''}" onclick="_attPopPreview(${i})">
          <div class="att-nav-thumb"></div>
          <span class="att-nav-name" title="${item.name}">${item.name}</span>
        </div>`).join('')}
      </div>
    </div>`;
}

function _attPopBackToList() {
  _attachPreviewIndex = null;
  _attPopRender();
}

const HISTORY_ITEMS = [
  // Today
  { initials:'AH', actor:'Ahmed Arah',    action:'changed status',  desc:'Pending Review → In Progress',      tag:'Status',     time:'14:06', date:'Today' },
  { initials:'ME', actor:'Me',            action:'added note',       desc:'Followed up with client on invoice', tag:'Note',       time:'13:45', date:'Today' },
  { initials:'EF', actor:'Emily Foster',  action:'uploaded file',    desc:'Contract Agreement v3.pdf',          tag:'Attachment', time:'11:20', date:'Today' },
  { initials:'BS', actor:'Ben Septer',    action:'changed priority', desc:'Medium → High',                      tag:'Priority',   time:'09:30', date:'Today' },
  // Yesterday
  { initials:'CD', actor:"Cara D'Angelo", action:'reassigned to',    desc:'Emily Foster',                       tag:'Assignment', time:'17:02', date:'Yesterday' },
  { initials:'EF', actor:'Emily Foster',  action:'changed stage',    desc:'Intake → Pending Review',            tag:'Stage',      time:'15:44', date:'Yesterday' },
  { initials:'AH', actor:'Ahmed Arah',    action:'added comment',    desc:'Invoice confirmed, processing now',  tag:'Comment',    time:'10:15', date:'Yesterday' },
  // Mar 19
  { initials:'DE', actor:'David Ellis',   action:'changed field',    desc:'Department: Legal → Finance',        tag:'Field',      time:'16:30', date:'Mar 19' },
  { initials:'BS', actor:'Ben Septer',    action:'uploaded file',    desc:'Budget Forecast 2026 Revised.xlsx',  tag:'Attachment', time:'14:00', date:'Mar 19' },
  { initials:'ME', actor:'Me',            action:'changed status',   desc:'Open → Pending Review',              tag:'Status',     time:'11:05', date:'Mar 19' },
  // Mar 18
  { initials:'AH', actor:'Ahmed Arah',    action:'opened case',      desc:'Case #100002 created',               tag:'Case',       time:'09:00', date:'Mar 18' },
  { initials:'ME', actor:'Me',            action:'assigned to',      desc:'Assignee #1',                        tag:'Assignment', time:'09:00', date:'Mar 18' },
];

function renderActivityPanel(container) {
  const q = window._histFilter || '';
  const items = q ? HISTORY_ITEMS.filter(h =>
    h.actor.toLowerCase().includes(q) ||
    h.action.toLowerCase().includes(q) ||
    h.desc.toLowerCase().includes(q) ||
    h.tag.toLowerCase().includes(q)
  ) : HISTORY_ITEMS;

  const rows = items.map(h => `
    <div class="hist-item">
      <div class="hist-cell-left">
        <div><span class="hist-actor">${h.actor}</span> <span class="hist-action">${h.action}</span></div>
        <div class="hist-desc">${h.desc}</div>
      </div>
      <div class="hist-cell-right">
        <div class="hist-date-label">${h.date}</div>
        <div class="hist-time-val">${h.time}</div>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="att-panel">
      <div class="att-toolbar">
        <div class="att-toolbar-left">
          <input class="att-search" type="text" placeholder="Search history…"
            value="${q}" oninput="filterHistory(this.value)" />
        </div>
        <div class="att-toolbar-right">
          <button class="conv-action-btn" title="Refresh" onclick="filterHistory('')">
            <span class="material-symbols-outlined">refresh</span>
          </button>
          <button class="conv-action-btn" title="Pop out" onclick="popOutHistory()">
            <span class="material-symbols-outlined">open_in_new</span>
          </button>
        </div>
      </div>
      <div class="att-title-row">
        <span class="att-title-text">Case history</span>
        <span class="att-count-badge">${items.length}</span>
      </div>
      <div class="att-table-wrap">${rows || '<div class="util-empty"><p>No history found</p></div>'}</div>
    </div>`;
}

function filterHistory(val) {
  window._histFilter = val.toLowerCase().trim() || '';
  const body = document.getElementById('utility-panel-body');
  if (body) renderActivityPanel(body);
}

function popOutHistory() {
  const existing = document.getElementById('hist-popout-overlay');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'hist-popout-overlay';
  overlay.className = 'conv-popout-overlay';
  overlay.innerHTML = `
    <div class="conv-popout-modal" style="height:640px;">
      <div id="hist-pop-body" style="flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;"></div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  renderActivityPanel(document.getElementById('hist-pop-body'));
}

function formatUpdatedAt(dateStr) {
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth()+1}/${String(d.getFullYear()).slice(2)} 09:00`;
  } catch(e) { return dateStr; }
}

function toggleCaseSection(key) {
  const section  = document.getElementById('case-section-' + key);
  const fields   = document.getElementById('case-fields-' + key);
  const divider  = section?.querySelector('.case-section-divider');
  const toggle   = document.getElementById('case-toggle-' + key);
  if (!fields) return;
  const isHidden = fields.classList.toggle('hidden');
  if (toggle)   toggle.classList.toggle('collapsed', isHidden);
  if (divider)  divider.classList.toggle('hidden', isHidden);
  if (section)  section.classList.toggle('minimized', isHidden);
}

// ── Case section overflow menu ──
function toggleCaseSectionMenu(key, ev) {
  if (ev) ev.stopPropagation();
  document.querySelectorAll('.case-section-menu').forEach(m => {
    if (m.id !== 'case-section-menu-' + key) m.classList.add('hidden');
  });
  document.getElementById('case-section-menu-' + key)?.classList.toggle('hidden');
}
function _closeAllCaseSectionMenus() {
  document.querySelectorAll('.case-section-menu').forEach(m => m.classList.add('hidden'));
}
document.addEventListener('click', e => {
  if (!e.target.closest('.case-section-actions')) _closeAllCaseSectionMenus();
});
function collapseCaseSection(key, ev) { if (ev) ev.stopPropagation(); toggleCaseSection(key); _closeAllCaseSectionMenus(); }
function copyCaseSection(key, ev)     { if (ev) ev.stopPropagation(); _closeAllCaseSectionMenus(); /* prototype placeholder */ }
function resetCaseSection(key, ev)    { if (ev) ev.stopPropagation(); _closeAllCaseSectionMenus(); /* prototype placeholder */ }

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, { type = 'success', duration = 3800 } = {}) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  const _toastIcon = { success: 'task_alt', warning: 'warning', error: 'error' }[type] || 'task_alt';
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="material-symbols-outlined toast-icon">${_toastIcon}</span><span>${message}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('toast-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, duration);
}

function returnCase() {
  const id = sectionActiveTab[activeSection];
  if (id) delete _fetchedCases[String(id).replace(/^#\s*/, '')];
  if (id && id !== 'home') closeTab(null, id);
}

// Nav tab click — scroll to section + set active
document.addEventListener('click', e => {
  const tab = e.target.closest('.chf-tab');
  if (!tab) return;
  document.querySelectorAll('.chf-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const key = tab.dataset.tab;

  const section = document.getElementById('case-section-' + key);
  if (section) {
    // Expand if collapsed
    const fields = document.getElementById('case-fields-' + key);
    if (fields && fields.classList.contains('hidden')) toggleCaseSection(key);
    // Scroll into view
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// ── Document Case Rendering ─────────────────────────────────────────────────
const _DOC_CASE_TABS = [
  { key: 'general-details', label: 'General Details' },
  { key: 'doc-status',      label: 'Document Status' },
];
const _ORIGINAL_TABS = [
  { key: 'history',  label: 'History'  },
  { key: 'details',  label: 'Details'  },
  { key: 'research', label: 'Research' },
  { key: 'host',     label: 'Host'     },
  { key: 'general',  label: 'General'  },
  { key: 'payment',  label: 'Payment'  },
  { key: 'scmt',     label: 'SCMT'     },
  { key: 'tracking', label: 'Tracking' },
];
function _setCaseTabs(tabs) {
  const el = document.getElementById('chf-tabs');
  if (!el) return;
  el.innerHTML = tabs.map((t, i) =>
    `<button class="chf-tab${i === 0 ? ' active' : ''}" data-tab="${t.key}">${t.label}</button>`
  ).join('');
}
// ── Deduction case form ────────────────────────────────────────────────────────

const _DED_STAGE_KEY = {
  'Eyeball Review':          'eyeball',
  'Deduction Validation':    'validation',
  'Credit Memo / Billback':  'billback',
  'Document Collection':     'eyeball',
};

// ── Deduction case form state ──────────────────────────────────────────────────
let _dedActiveStageCaseId = null;

// ── Validation Summary box (shown in billback stage) ──────────────────────────
function _dedValidationSummarySection(row, wfEntry) {
  const amount   = wfEntry?.amount   || row?.amount   || '—';
  const dedType  = wfEntry?.deductionType || row?.client || '—';
  const retailer = wfEntry?.retailer  || row?.name    || '—';
  const invoiceNo= wfEntry?.invoiceNo || '—';
  const poNo     = wfEntry?.poNo      || '—';
  return `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
        <span class="material-symbols-outlined" style="font-size:20px;color:#16a34a;flex-shrink:0">check_circle</span>
        <div>
          <div style="font-size:13px;font-weight:600;color:#166534">Deduction Approved</div>
          <div style="font-size:12px;color:#4d7c5f;margin-top:1px">Analyst determination confirmed — proceeding to credit memo / billback.</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px 0">
        <div style="background:var(--bg-light);border-radius:6px;padding:10px 12px">
          <div style="font-size:11px;color:var(--text-muted);font-weight:500;margin-bottom:3px">Approved Amount</div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${amount}</div>
        </div>
        <div style="background:var(--bg-light);border-radius:6px;padding:10px 12px">
          <div style="font-size:11px;color:var(--text-muted);font-weight:500;margin-bottom:3px">Deduction Type</div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${dedType}</div>
        </div>
        <div style="background:var(--bg-light);border-radius:6px;padding:10px 12px">
          <div style="font-size:11px;color:var(--text-muted);font-weight:500;margin-bottom:3px">Retailer</div>
          <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${retailer}</div>
        </div>
        <div style="background:var(--bg-light);border-radius:6px;padding:10px 12px">
          <div style="font-size:11px;color:var(--text-muted);font-weight:500;margin-bottom:3px">Invoice / PO</div>
          <div style="font-size:12px;font-weight:500;color:var(--text-secondary)">${invoiceNo} · ${poNo}</div>
        </div>
      </div>
    </div>`;
}

function _renderDeductionCase(row, caseId) {
  _dedActiveStageCaseId = caseId;
  const stageKey  = _DED_STAGE_KEY[row?.stage] || 'eyeball';
  const isReadOnly = _readOnlyCaseIds.has(caseId);

  // Set tabs based on current stage — tabs are scroll anchors only
  let stageTabs;
  if (isReadOnly) {
    stageTabs = [
      { key: 'ded-general', label: 'General'   },
      { key: 'ded-docs',    label: 'Documents' },
      { key: 'ded-eyeball', label: 'Eyeball'   },
    ];
  } else if (stageKey === 'eyeball') {
    stageTabs = [
      { key: 'ded-general', label: 'General'        },
      { key: 'eyeball',     label: 'Eyeball Review' },
    ];
  } else if (stageKey === 'validation') {
    stageTabs = [
      { key: 'ded-general',    label: 'General'              },
      { key: 'qty-estimation', label: 'Qty Estimation'       },
      { key: 'validation',     label: 'Deduction Validation' },
    ];
  } else { // billback
    stageTabs = [
      { key: 'ded-general',  label: 'General'                  },
      { key: 'ded-summary',  label: 'Validation Decision'      },
      { key: 'billback',     label: 'Credit Memo / Billback'   },
    ];
  }
  _setCaseTabs(stageTabs);

  const wfEntry = _deductionWfData.find(d => d.id === caseId);
  const tasks   = _deductionWfTasks[caseId] || [];

  // ── Field helpers ───────────────────────────────────────────────────────────
  const _fld = (label, val, ro = false) =>
    `<div class="case-field${ro ? ' readonly' : ''}">
      <label>${label}</label>
      <input type="text"${ro ? ' readonly' : ''} value="${(val || '').replace(/"/g, '&quot;')}">
    </div>`;
  const _sel = (label, opts, cur, ro = false) =>
    `<div class="case-field${ro ? ' readonly' : ''}"><label>${label}</label>
      <select${ro ? ' disabled' : ''}>${opts.map(o => `<option${o === cur ? ' selected' : ''}>${o}</option>`).join('')}</select>
    </div>`;
  const _chk = (label, checked = false) =>
    `<div class="case-field readonly">
      <label>${label}</label>
      <div style="display:flex;align-items:center;height:34px">
        <input type="checkbox"${checked ? ' checked' : ''} disabled style="width:15px;height:15px;cursor:default;accent-color:#474747">
      </div>
    </div>`;

  // ── General section ─────────────────────────────────────────────────────────
  const generalSection = `
    <div class="case-section" id="case-section-ded-general">
      <div class="case-section-header" onclick="toggleCaseSection('ded-general')">
        <div class="case-section-toggle" id="case-toggle-ded-general">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
        <div class="case-section-labels">
          <div class="case-section-title">General</div>
          <div class="case-section-desc">Case details and assignment</div>
        </div>
      </div>
      <div class="case-section-divider"></div>
      <div class="case-fields" id="case-fields-ded-general">
        ${_fld('Customer ID',       row?.id || caseId,                                                                                true)}
        ${_fld('Customer Name',     row?.name   || wfEntry?.retailer                                                                || '', true)}
        ${_sel('Reason Type',       ['OS&D','Price Discrepancy','Duplicate Billing','Tax/Freight Mismatch','RTV','Wrong Product'],     row?.client || wfEntry?.deductionType || 'OS&D', true)}
        ${_sel('Validation Status', ['Invalid','Partial Valid','POD Support'],                                                         '', true)}
        ${_fld('POD ID',            wfEntry?.poNo                                                                                   || '', true)}
        ${_chk('Customer Sign', !!wfEntry?.customerSign)}
        ${_chk('Carrier Sign',  !!wfEntry?.carrierSign)}
        ${_chk('STC',           !!wfEntry?.stc)}
      </div>
    </div>`;

  // ── Mission sections based on the case's current stage ──────────────────────
  let missionSections = '';

  const _actionBadge  = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:8px;background:#fff7ed;color:#c2410c;font-size:11px;font-weight:600;margin-left:auto;flex-shrink:0">Action Required</span>`;
  const _doneBadge    = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:8px;background:#dcfce7;color:#166534;font-size:11px;font-weight:600;margin-left:auto;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:12px">check_circle</span>Completed</span>`;
  const _pendingBadge = `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:8px;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:600;margin-left:auto;flex-shrink:0">Pending</span>`;

  const _missionBox = (sectionKey, title, desc, badge, body) => `
    <div class="case-section" id="case-section-${sectionKey}">
      <div class="case-section-header" onclick="toggleCaseSection('${sectionKey}')">
        <div class="case-section-toggle" id="case-toggle-${sectionKey}">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
        <div class="case-section-labels">
          <div class="case-section-title">${title}</div>
          <div class="case-section-desc">${desc}</div>
        </div>
        ${badge}
      </div>
      <div class="case-section-divider"></div>
      <div class="case-fields" id="case-fields-${sectionKey}" style="padding:0">
        <div style="display:flex;flex-direction:column;gap:8px;padding:8px 0 0;min-width:0;grid-column:1/-1">
          ${body}
        </div>
      </div>
    </div>`;

  const _noTask = `<div style="padding:16px;color:var(--text-muted);font-size:13px">Task data is being prepared…</div>`;

  if (isReadOnly) {
    // Read-only view: General (already built) + Documents table + Eyeball viewer
    const eyeballTask = tasks.find(t => t.type === 'eyeball');
    const allDocs = eyeballTask?.docs || [];

    // ── Documents table ──────────────────────────────────────────────────────
    const _docRows = allDocs.map(doc => {
      const corrections = doc.fields.filter(f => f.flagged).length;
      const status = corrections > 0 ? 'Failed' : 'Valid';
      const eyeballTxt = corrections > 0 ? `${corrections} correction${corrections > 1 ? 's' : ''}` : 'All verified';
      return `<tr class="${status === 'Failed' ? 'doc-row-failed' : ''}">
        <td>${doc.docType}</td>
        <td style="color:var(--text-secondary)">${doc.docLabel}</td>
        <td><span class="doc-status-val ${status.toLowerCase()}">${status}</span></td>
        <td><span class="doc-eyeball-val">${eyeballTxt}</span></td>
      </tr>`;
    }).join('');
    const _docsTable = allDocs.length ? `
      <div class="doc-status-table-wrap">
        <table class="doc-status-table">
          <colgroup><col class="col-type"><col class="col-name"><col class="col-status"><col class="col-eye"></colgroup>
          <thead><tr><th>Document Type</th><th>Document Name</th><th>Status</th><th>Eyeball</th></tr></thead>
          <tbody>${_docRows}</tbody>
        </table>
      </div>` : _noTask;

    // ── Eyeball read-only cards ───────────────────────────────────────────────
    const _roCards = allDocs.map((doc, docIdx) => {
      const splitId = `ded-eyb-ro-${caseId}-${docIdx}`;
      const fieldsHtml = doc.fields.map(f => `
        <div style="display:flex;align-items:baseline;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-light)">
          <span style="font-size:11px;color:var(--text-muted);width:110px;flex-shrink:0;font-weight:500">${f.field}</span>
          <span style="font-size:13px;color:var(--text-primary);font-weight:500;flex:1">${f.verified}</span>
          ${f.flagged ? `<span style="font-size:10px;color:#c2410c;font-weight:600;background:#fff7ed;padding:1px 6px;border-radius:4px;flex-shrink:0">Corrected</span>` : ''}
        </div>`).join('');
      return `
        <div class="wf-form-card" style="overflow:hidden;margin-bottom:8px">
          <div class="wf-form-card-header" style="align-items:center">
            <span class="material-symbols-outlined" style="font-size:20px;color:var(--text-secondary);flex-shrink:0">description</span>
            <div style="flex:1;min-width:0">
              <div class="wf-form-card-vendor">${doc.docLabel}</div>
              <div class="wf-form-card-task-type">${doc.docType} · read only</div>
            </div>
          </div>
          <div class="ded-eyeball-split">
            <div class="ded-eyeball-left">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Verified field values</div>
              ${fieldsHtml}
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
        </div>`;
    }).join('');

    missionSections =
      _missionBox('ded-docs', 'Documents', `${allDocs.length} file${allDocs.length !== 1 ? 's' : ''}`, '',
        _docsTable) +
      _missionBox('ded-eyeball', 'Eyeball Review', 'Invoices and proofs of delivery', '',
        allDocs.length ? _roCards : _noTask);

  } else if (stageKey === 'eyeball') {
    const task = tasks.find(t => t.type === 'eyeball');
    missionSections = `
      <div class="case-section" id="case-section-eyeball">
        <div class="case-section-header" onclick="toggleCaseSection('eyeball')">
          <div class="case-section-toggle" id="case-toggle-eyeball">
            <span class="material-symbols-outlined">expand_more</span>
          </div>
          <div class="case-section-labels">
            <div class="case-section-title">Eyeball Review</div>
            <div class="case-section-desc">Action required</div>
          </div>
          ${_actionBadge}
        </div>
        <div class="case-section-divider"></div>
        <div class="case-fields" id="case-fields-eyeball" style="padding:0">
          ${task ? _dedEyeballFormCard(caseId, task, 'cp') : _noTask}
        </div>
      </div>`;
  } else if (stageKey === 'validation') {
    const task = tasks.find(t => t.type === 'deduction-validation');
    const _qtyCount = (task?.items || []).length;
    missionSections =
      _missionBox('validation', 'Deduction Validation', `${_qtyCount} item${_qtyCount !== 1 ? 's' : ''} — pre-filled`, _actionBadge,
        task ? _dedCombinedValidationCard(caseId, task) : _noTask);
  } else { // billback
    const task = tasks.find(t => t.type === 'billback');
    missionSections =
      _missionBox(
        'ded-summary', 'Validation Summary Decision',
        'Approved outcome from deduction validation', _doneBadge,
        _dedValidationSummarySection(row, wfEntry)
      ) +
      _missionBox(
        'billback', 'Credit Memo / Billback', 'Action required', _actionBadge,
        task ? _wfBillbackCard(caseId, task) : _noTask
      );
  }

  const area = document.getElementById('case-form-area');
  if (!area) return;
  area.innerHTML = generalSection + missionSections;
  if (stageKey === 'validation') setTimeout(() => _dedApplyInlinePins(`ded-val-tbl-${caseId}`), 0);
}

function _renderDocumentCase(row) {
  const area = document.getElementById('case-form-area');
  if (!area) return;
  _setCaseTabs(_DOC_CASE_TABS);
  area.innerHTML = `
    <div class="case-section" id="case-section-general-details">
      <div class="case-section-header" onclick="toggleCaseSection('general-details')">
        <div class="case-section-toggle" id="case-toggle-general-details" style="transform:rotate(-90deg)">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
        <div class="case-section-labels">
          <div class="case-section-title">General Details</div>
          <div class="case-section-desc">Core case information and assignment</div>
        </div>
      </div>
      <div class="case-section-divider"></div>
      <div class="case-fields" id="case-fields-general-details" style="display:none"></div>
    </div>
    <div class="case-section" id="case-section-doc-status">
      <div class="case-section-header" onclick="toggleCaseSection('doc-status')">
        <div class="case-section-toggle" id="case-toggle-doc-status">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
        <div class="case-section-labels">
          <div class="case-section-title">Document Status</div>
          <div class="case-section-desc">Core case information and assignment</div>
        </div>
      </div>
      <div class="case-section-divider"></div>
      <div class="case-fields" id="case-fields-doc-status" style="padding:0; display:block">
        ${_renderDocumentStatusTable(row.documents)}
      </div>
    </div>`;
}

function _renderDocumentStatusTable(docs) {
  const rows = docs.map(d => {
    const failed = d.status === 'Failed';
    return `<tr class="${failed ? 'doc-row-failed' : ''}">
      <td>${d.type}</td>
      <td style="color:var(--text-secondary)">${d.name}</td>
      <td><span class="doc-status-val ${d.status.toLowerCase()}">${d.status}</span></td>
      <td><span class="doc-eyeball-val">${d.eyeball}</span></td>
      <td style="text-align:right">${failed ? `<button class="doc-upload-btn" title="Upload document"><span class="material-symbols-outlined">upload</span></button>` : ''}</td>
    </tr>`;
  }).join('');
  return `<div class="doc-status-table-wrap">
    <table class="doc-status-table">
      <colgroup>
        <col class="col-type"><col class="col-name">
        <col class="col-status"><col class="col-eye"><col class="col-action">
      </colgroup>
      <thead><tr>
        <th>Document Type</th><th>Document Name</th>
        <th>Document Status</th><th>Eyeball status</th><th></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── AI Drawer ──────────────────────────────────────────────────────────────

// ── Dynamic footer renderer ─────────────────────────────────────────────────
function _renderAiFooter() {
  const footer = document.getElementById('ai-drawer-footer');
  if (!footer) return;

  // Work Feed mode — floating card with context pill + textarea + actions row
  if (_workFeedMode) {
    const _isViewerMode = _workFeedCaseId && activeWorkFeedTask[_workFeedCaseId] === 'comparison';
    footer.innerHTML = `
      <div class="ai-input-card">
        <div class="ai-input-card-ctx">
          <span class="ai-input-ctx-pill" id="ai-wf-ctx-pill" style="${_isViewerMode ? 'background:#f0f9ff;color:#0369a1;border-color:#bae6fd' : ''}">
            <span class="material-symbols-outlined" style="font-size:11px">${_isViewerMode ? 'visibility' : 'link'}</span>
            ${_isViewerMode ? 'Viewer' : 'Receiv…'}
            <button onclick="document.getElementById('ai-wf-ctx-pill').style.display='none'" title="Remove context">×</button>
          </span>
        </div>
        <textarea class="ai-input-textarea" id="ai-input" rows="2"
          placeholder="Ask, Search or Chat…"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendAiMessage()}"></textarea>
        <div class="ai-input-actions">
          <button class="ai-input-attach-btn" title="Attach file"><span class="material-symbols-outlined">attach_file</span></button>
          <span class="ai-input-spacer"></span>
          <button class="ai-input-case-btn" title="Switch case context">
            <span class="material-symbols-outlined">inventory_2</span>
            ${_workFeedCaseId || '—'}
            <span class="material-symbols-outlined">expand_more</span>
          </button>
          <button class="ai-input-send-btn" onclick="sendAiMessage()" title="Send">
            <span class="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>`;
    return;
  }

  // response / completed — buttons live inline in the chat body; footer is blank
  if (_aiFlowState === 'response' || _aiFlowState === 'completed') {
    footer.innerHTML = '';
    return;
  }

  // planning — plan card replaces the chat input box
  if (_aiFlowState === 'planning') {
    footer.innerHTML = `
      <div class="ai-footer-plan">
        <div class="ai-plan">
          <div class="ai-plan-allow">Allow actions on: <strong>ⓘ Vendor Document portal</strong></div>
          <div class="ai-plan-steps-label">Plan details:</div>
          <div class="ai-plan-step"><span class="ai-plan-step-num">1.</span><span>Navigate to document portal</span></div>
          <div class="ai-plan-step"><span class="ai-plan-step-num">2.</span><span>Search for the required document by locating its name and ID as appears in the ticket</span></div>
          <div class="ai-plan-step"><span class="ai-plan-step-num">3.</span><span>Open the document and read to verify its fit</span></div>
          <div class="ai-plan-step"><span class="ai-plan-step-num">4.</span><span>Download it and send it back here</span></div>
        </div>
        <div class="ai-plan-note">Casey will only access sites you're already connected to. You'll be asked for permission before accessing anything else.</div>
        <div class="ai-footer-plan-btns">
          <button class="ai-plan-btn approve" onclick="triggerAiFlowApprove()">Approve</button>
          <button class="ai-plan-btn edit">Edit plan</button>
        </div>
      </div>`;
    return;
  }

  // Login-required — replace footer with compact login form
  if (_aiFlowState === 'login-required') {
    footer.innerHTML = `
      <div class="ai-footer-login">
        <div class="ai-footer-login-title">Sign in to AmazonFresh Vendor Portal</div>
        <div class="ai-footer-login-fields">
          <input class="ai-login-input" type="text" placeholder="Username" id="ai-login-user" />
          <input class="ai-login-input" type="password" value="dcascadsaasd" id="ai-login-pass" />
        </div>
        <div class="ai-footer-login-row">
          <button class="ai-login-submit" onclick="triggerLoginSignIn()">Sign In</button>
          <button class="ai-login-forgot">Forgot password?</button>
        </div>
      </div>`;
    return;
  }

  // Default — floating card with context pill + textarea + attach + send/stop
  const _ctxPill = (() => {
    if (_aiCurrentCase && !_aiContextDismissed) {
      return `<div class="ai-input-card-ctx">
        <span class="ai-input-ctx-pill">
          <span class="material-symbols-outlined" style="font-size:11px">folder_open</span>
          ${_aiCurrentCase.id}
          <button onclick="_aiContextDismissed=true;_renderAiDrawerContext();_renderAiFooter()" title="Remove context">×</button>
        </span>
      </div>`;
    }
    if (activeSection === 'mywork' || activeSection === 'home') {
      return `<div class="ai-input-card-ctx">
        <span class="ai-input-ctx-pill">
          <span class="material-symbols-outlined" style="font-size:11px">home_work</span>
          Cases
        </span>
      </div>`;
    }
    if (activeSection === 'agentfleet') {
      const label = _activeAgentType ? `${_activeAgentType} Agent` : 'Agent Fleet';
      const icon = _activeAgentType ? 'smart_toy' : 'hub';
      return `<div class="ai-input-card-ctx">
        <span class="ai-input-ctx-pill">
          <span class="material-symbols-outlined" style="font-size:11px">${icon}</span>
          ${label}
        </span>
      </div>`;
    }
    return '';
  })();

  const _placeholder = (() => {
    if (activeSection === 'mywork' || activeSection === 'home') return 'Ask Casey about your cases…';
    if (activeSection === 'agentfleet') return _activeAgentType ? `Ask Casey about ${_activeAgentType}…` : 'Ask Casey about agent performance…';
    return 'Ask anything…';
  })();

  footer.innerHTML = `
    <div class="ai-input-card">
      ${_ctxPill}
      <textarea class="ai-input-textarea" id="ai-input" rows="2"
        placeholder="${_placeholder}"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendAiMessage()}"></textarea>
      <div class="ai-input-actions">
        <button class="ai-input-attach-btn" title="Attach file"><span class="material-symbols-outlined">attach_file</span></button>
        <span class="ai-input-spacer"></span>
        ${_aiProcessing
          ? `<button class="ai-input-send-btn processing" id="ai-send-btn" onclick="stopAiProcessing()" title="Stop"><span class="material-symbols-outlined">stop</span></button>`
          : `<button class="ai-input-send-btn" id="ai-send-btn" onclick="sendAiMessage()" title="Send"><span class="material-symbols-outlined">send</span></button>`}
      </div>
    </div>`;
}

// ── AI processing state (typing indicator + send→stop button) ───────────────
function _setAiProcessing(on) {
  _aiProcessing = on;

  // Re-render footer so send ↔ stop button reflects processing state
  _renderAiFooter();

  // Show/remove typing indicator at bottom of body
  const body = document.getElementById('ai-drawer-body');
  const existing = document.getElementById('ai-typing-indicator');
  if (on) {
    if (!existing && body) {
      const el = document.createElement('div');
      el.id = 'ai-typing-indicator';
      el.className = 'ai-typing-indicator';
      el.innerHTML = '<span></span><span></span><span></span>';
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
    }
  } else {
    if (existing) existing.remove();
  }
}

function stopAiProcessing() {
  if (_aiProcessingTimer) { clearTimeout(_aiProcessingTimer); _aiProcessingTimer = null; }
  _setAiProcessing(false);
  _aiFlowState = 'idle';
  _aiFlowUserMsg = '';
  _renderAiFlow();
  _renderAiDrawerContext();
}

// States where AI is waiting for user input — badge shown on button + case tab
const _AI_ATTENTION_STATES = ['response', 'planning', 'login-required', 'completed'];
let _aiBadgePrevAttention = false; // tracks last value to detect rising edge

// Synthesise a soft "blop" notification using Web Audio API (no asset needed)
function _playBlopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Pitch glide: 780 Hz → 520 Hz — feels like a soft notification pop
    osc.frequency.setValueAtTime(780, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.12);
    // Envelope: quick attack, smooth decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
    osc.onended = () => ctx.close();
  } catch (_) { /* audio not supported — silently ignore */ }
}

function _updateAiBadge() {
  const needsAttention = _AI_ATTENTION_STATES.includes(_aiFlowState);
  const drawerOpen = document.getElementById('ai-drawer')?.classList.contains('open');

  // Play blop on the rising edge — only once per new attention event, drawer closed
  if (needsAttention && !_aiBadgePrevAttention && !drawerOpen) _playBlopSound();
  _aiBadgePrevAttention = needsAttention;

  // Update AI button badge (only when drawer is closed)
  const btnBadge = document.getElementById('ai-btn-badge');
  if (btnBadge) btnBadge.style.display = (needsAttention && !drawerOpen) ? '' : 'none';

  // Track which case tab should show the dot
  const newAttnId = (needsAttention && _aiCurrentCase)
    ? String(_aiCurrentCase.id).replace(/^#\s*/, '')
    : null;

  if (newAttnId !== _aiAttentionCaseId) {
    _aiAttentionCaseId = newAttnId;
    renderTopbarTabs(); // re-render to add/remove badge dot on tabs
  } else if (!needsAttention && _aiAttentionCaseId) {
    _aiAttentionCaseId = null;
    renderTopbarTabs();
  }
}

// ── Casey drawer resize ──────────────────────────────────────────────────────
const AI_DRAWER_MIN_W = 260;
const AI_DRAWER_MAX_W = 700;

let _aiViewMode = 'docked';
let _aiCloseTimer = null;

function _aiToggleView() {
  _aiSetView(_aiViewMode === 'float' ? 'docked' : 'float');
}

function _aiSetView(mode) {
  _aiViewMode = mode;
  const drawer = document.getElementById('ai-drawer');
  const icon   = document.getElementById('ai-view-icon');
  const btn    = document.getElementById('ai-view-toggle-btn');
  if (!drawer) return;

  if (mode === 'float') {
    drawer.style.left = ''; drawer.style.top = '';
    drawer.style.display = '';
    drawer.classList.add('ai-float');
    drawer.classList.add('open');
    if (icon) icon.textContent = 'dock_to_right';
    if (btn)  btn.title = 'Switch to docked';
  } else {
    drawer.classList.remove('ai-float');
    drawer.style.left = ''; drawer.style.top = '';
    drawer.style.bottom = ''; drawer.style.right = '';
    if (icon) icon.textContent = 'dock_to_right';
    if (btn)  btn.title = 'Switch to floating';
  }
}

function _aiFloatToggleMin() {
  const drawer = document.getElementById('ai-drawer');
  const icon   = document.getElementById('ai-float-min-icon');
  if (!drawer) return;
  const isMin = drawer.classList.toggle('ai-float-min');
  if (icon) icon.textContent = isMin ? 'open_in_full' : 'remove';
  document.getElementById('ai-float-min-btn').title = isMin ? 'Restore' : 'Minimize';
}

function startAiDrawerResize(e) {
  e.preventDefault();
  const drawer  = document.getElementById('ai-drawer');
  const handle  = document.getElementById('ai-drawer-resize-handle');
  const startX  = e.clientX;
  const startW  = drawer.offsetWidth;

  // Disable the open/close transition so dragging feels instant
  drawer.style.transition = 'none';
  document.body.classList.add('ai-resizing');
  handle.classList.add('dragging');

  function onMove(ev) {
    // Drawer is on the right; dragging left (lower clientX) = wider
    const delta = startX - ev.clientX;
    const newW  = Math.max(AI_DRAWER_MIN_W, Math.min(AI_DRAWER_MAX_W, startW + delta));
    document.documentElement.style.setProperty('--ai-drawer-w', newW + 'px');
  }

  function onUp() {
    drawer.style.transition = '';          // restore CSS transition
    document.body.classList.remove('ai-resizing');
    handle.classList.remove('dragging');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup',   onUp);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup',   onUp);
}

function toggleAiDrawer() {
  const drawer = document.getElementById('ai-drawer');
  const btn    = document.getElementById('ai-btn');

  // Float-mode close → animate panel flying to the Casey button
  // Float-mode: handle open/close with animation
  if (_aiViewMode === 'float') {
    const isNowOpen = !drawer.classList.contains('open');
    if (!isNowOpen) {
      // CLOSE — animate to Casey button, then hide
      const drawerRect = drawer.getBoundingClientRect();
      const btnRect    = btn.getBoundingClientRect();
      const dx = (btnRect.left + btnRect.width  / 2) - (drawerRect.left + drawerRect.width  / 2);
      const dy = (btnRect.top  + btnRect.height / 2) - (drawerRect.top  + drawerRect.height / 2);
      const sx = Math.max(0.05, btnRect.width  / drawerRect.width);
      const sy = Math.max(0.05, btnRect.height / drawerRect.height);
      drawer.style.transformOrigin = 'center center';
      drawer.classList.add('ai-float-closing');
      // Apply transform in next frame so transition fires
      requestAnimationFrame(() => requestAnimationFrame(() => {
        drawer.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      }));
      _aiCloseTimer = setTimeout(() => {
        _aiCloseTimer = null;
        drawer.classList.remove('ai-float-closing');
        drawer.style.transform = '';
        drawer.style.transformOrigin = '';
        drawer.classList.remove('open');
        drawer.classList.remove('ai-float-min');
        drawer.style.display = 'none';  // fully hide the fixed panel
        const minIcon = document.getElementById('ai-float-min-icon');
        if (minIcon) minIcon.textContent = 'remove';
        btn.classList.remove('active');
      }, 280);
    } else {
      // OPEN — cancel any in-flight close animation first
      if (_aiCloseTimer) {
        clearTimeout(_aiCloseTimer);
        _aiCloseTimer = null;
      }
      drawer.classList.remove('ai-float-closing');
      drawer.style.transform = '';
      drawer.style.transformOrigin = '';
      drawer.classList.remove('ai-float-min');
      const minIcon = document.getElementById('ai-float-min-icon');
      if (minIcon) minIcon.textContent = 'remove';
      // Show and mark active
      drawer.style.display = '';
      drawer.classList.add('open');
      btn.classList.add('active');
      const btnBadge = document.getElementById('ai-btn-badge');
      if (btnBadge) btnBadge.style.display = 'none';
      _renderAiFooter();
      const caseId = sectionActiveTab[activeSection];
      if (caseId && caseId !== 'home') _setAiContext(caseId); else _clearAiContext();
      setTimeout(() => { const inp = document.getElementById('ai-input'); if (inp) inp.focus(); }, 50);
    }
    return;
  }

  const isOpen = drawer.classList.toggle('open');
  btn.classList.toggle('active', isOpen);
  if (isOpen) {
    // Clear button badge — user is now looking at the AI panel
    const btnBadge = document.getElementById('ai-btn-badge');
    if (btnBadge) btnBadge.style.display = 'none';
    if (_workFeedMode || activeSection === 'workfeed') {
      if (!_wfInitialized) {
        // Not yet seeded (e.g. user manually opened drawer before navSidebar ran)
        renderWorkFeedCasey(_workFeedCaseId || activeWorkFeedCase || '2947-5839');
      } else {
        // Already initialized — just refresh footer + pills without touching chat history
        _workFeedMode = true;
        _workFeedCaseId = _workFeedCaseId || activeWorkFeedCase || '2947-5839';
        _renderAiDrawerContext();
        _renderAiFooter();
      }
    } else {
      // Render footer for the current state
      _renderAiFooter();
      // Sync context with the currently open case (if any)
      const caseId = sectionActiveTab[activeSection];
      if (caseId && caseId !== 'home') {
        _setAiContext(caseId);
      } else {
        _clearAiContext();
      }
    }
    setTimeout(() => { const inp = document.getElementById('ai-input'); if (inp) inp.focus(); }, 220);
  }
}

function _setAiContext(caseId) {
  const all = [...(assignedData || []), ...(queueData || [])];
  _aiCurrentCase = all.find(r => String(r.id).replace(/^#\s*/, '') === String(caseId).replace(/^#\s*/, '')) || null;
  _aiContextDismissed = false;
  _renderAiDrawerContext();
}

function _clearAiContext() {
  _aiCurrentCase = null;
  _aiContextDismissed = false;
  _aiFlowState = 'idle';
  _aiFlowUserMsg = '';
  _renderAiDrawerContext();
}

function dismissAiContext() {
  _aiContextDismissed = true;
  _renderAiDrawerContext();
}

function _renderAiDrawerContext() {
  const banner = document.getElementById('ai-context-banner');
  const pills  = document.getElementById('ai-pills');
  if (!banner || !pills) return;

  // Work Feed mode — show work-feed specific suggested prompts
  if (_workFeedMode) {
    banner.style.display = 'none';
    pills.style.display = '';
    const wfPills = [
      { label: 'Why are you stuck?',  msg: 'Why are you stuck?' },
      { label: 'Show all missing',    msg: 'Show all missing invoices' },
      { label: "What's next?",        msg: "What's the next step?" },
      { label: 'Retry failed',        msg: 'Retry all failed retrievals' },
    ];
    pills.innerHTML =
      `<span style="font-size:11px;color:#555;font-weight:500;width:100%;padding:0 0 2px">Suggested prompts:</span>` +
      wfPills.map(p => `<button class="ai-pill" onclick="sendAiPill('${p.msg.replace(/'/g,"&#39;")}')">${p.label}</button>`).join('');
    return;
  }

  // Agent view — show agent-specific suggested prompts
  if (activeSection === 'agentfleet' && _activeAgentType) {
    banner.style.display = 'none';
    pills.style.display = '';
    const agentPills = [
      { label: `What are the most urgent pending assists?`,        msg: `What are the most urgent pending assists for ${_activeAgentType}?` },
      { label: `What is the most common assist type?`,            msg: `What is ${_activeAgentType}'s most common assist type?` },
      { label: `Open all pending assists as new tabs`,            msg: `Open all ${_activeAgentType} pending assists as new tabs` },
    ];
    pills.innerHTML =
      `<span style="font-size:11px;color:#555;font-weight:500;width:100%;padding:0 0 2px">Suggested prompts:</span>` +
      agentPills.map(p => `<button class="ai-pill" onclick="sendAiPill('${p.msg.replace(/'/g,"&#39;")}')">${p.label}</button>`).join('');
    return;
  }

  // Agent Fleet home — show fleet-context suggested prompts
  if (activeSection === 'agentfleet') {
    banner.style.display = 'none';
    pills.style.display = '';
    const fleetPills = [
      { label: 'Open 3 most urgent pending assists as new tabs', msg: 'Open 3 most urgent pending assists as new tabs' },
      { label: "Which agent has the lowest success rate and why?", msg: "Which agent has the lowest success rate and why?" },
      { label: 'Sort agent table by success rate', msg: 'Sort agent table by success rate' },
    ];
    pills.innerHTML =
      `<span style="font-size:11px;color:#555;font-weight:500;width:100%;padding:0 0 2px">Suggested prompts:</span>` +
      fleetPills.map(p => `<button class="ai-pill" onclick="sendAiPill('${p.msg.replace(/'/g,"&#39;")}')">${p.label}</button>`).join('');
    return;
  }

  const hasContext = !!(_aiCurrentCase && !_aiContextDismissed);

  // Context chip
  if (hasContext) {
    banner.style.display = '';
    document.getElementById('ai-ctx-id').textContent = _aiCurrentCase.id;
  } else {
    banner.style.display = 'none';
  }

  // Helping pills — visible in idle/analyzing/response (frames 1-4); hidden only in planning/approved + terminal states
  const _pillHideStates = ['planning', 'approved', 'login-required', 'success', 'completed', 'closing', 'case-done'];
  if (_aiMessages.length > 0 || _pillHideStates.includes(_aiFlowState)) { pills.style.display = 'none'; return; }
  pills.style.display = '';

  const isException = hasContext && _aiCurrentCase?.status === 'Exception';
  const exceptionPills = [
    { label: 'Summarize case history', flow: true },
    { label: 'Surface urgencies',      flow: true },
    { label: 'Case failure handling',  flow: true },
  ];
  const contextPills = [
    { label: 'Summarize case',  msg: `Summarize case ${_aiCurrentCase?.id}` },
    { label: 'Draft reply',     msg: `Help me draft a reply for ${_aiCurrentCase?.id}` },
    { label: 'Risk factors',    msg: `What are the risk factors for ${_aiCurrentCase?.id}?` },
    { label: 'Next steps',      msg: `What are the recommended next steps for ${_aiCurrentCase?.id}?` },
    { label: 'Similar cases',   msg: `Find cases similar to ${_aiCurrentCase?.id}` },
  ];
  const genericPills = [
    { label: 'Quick wins for today', quickWin: true },
    { label: 'What can you do?',     msg: 'What can you help me with?' },
    { label: 'Search cases',         msg: 'Help me search for cases' },
    { label: 'Help me write',        msg: 'Help me write a message' },
  ];
  const activePills = isException ? exceptionPills : (hasContext ? contextPills : genericPills);
  pills.innerHTML = activePills.map(p => {
    if (p.quickWin) return `
      <button class="ai-pill ai-pill-qw" onclick="applyAiQuickWin()">
        <span class="material-symbols-outlined">auto_awesome</span>${p.label}
      </button>`;
    if (p.flow) return `<button class="ai-pill" onclick="_startAiFlow('${p.label.replace(/'/g,"&#39;")}')">${p.label}</button>`;
    return `<button class="ai-pill" onclick="sendAiPill('${p.msg.replace(/'/g,"&#39;")}')">${p.label}</button>`;
  }).join('');
}

function sendAiPill(text) {
  const input = document.getElementById('ai-input');
  if (input) { input.value = text; }
  sendAiMessage();
}

// ── AI Guided Flow (scripted for document-failure cases) ──────────────────
function _startAiFlow(pillLabel) {
  _aiFlowUserMsg = pillLabel;
  _aiFlowState = 'analyzing';
  _renderAiFlow();
  _renderAiDrawerContext();
  _setAiProcessing(true);
  _aiProcessingTimer = setTimeout(() => {
    _setAiProcessing(false);
    _aiFlowState = 'response';
    _renderAiFlow();
    _renderAiDrawerContext();
  }, 2200);
}

function _renderAiFlow() {
  const body  = document.getElementById('ai-drawer-body');
  const empty = document.getElementById('ai-empty');
  if (empty) empty.style.display = 'none';

  // User message bubble
  const userBubble = _aiFlowUserMsg ? `
    <div class="ai-msg user" style="margin-bottom:12px">
      <div class="ai-bubble">${_aiFlowUserMsg}</div>
    </div>` : '';

  const missingCard = `
    <div class="ai-missing-card">
      <div class="ai-missing-card-body">
        <div class="ai-missing-title">POD File</div>
        <div class="ai-missing-req">Required: 251206811 pod.pdf</div>
      </div>
      <span class="ai-missing-badge">Missing</span>
    </div>`;

  if (_aiFlowState === 'analyzing') {
    body.innerHTML = userBubble + `
      <div class="ai-analyzing">
        <span class="material-symbols-outlined">autorenew</span>
        <span class="ai-analyzing-text">Summarizing current case failure statuses</span>
      </div>`;

  } else if (_aiFlowState === 'response') {
    // Action buttons rendered inline in the chat, right after the AI answer
    body.innerHTML = userBubble + `
      <div class="ai-response-msg">I noticed this case is in Exception status because the POD file is currently marked as Failed.</div>
      <div class="ai-response-msg" style="margin-top:8px">I can try to locate and retrieve the correct POD document from the carrier portal. Want me to start?</div>
      ${missingCard}
      <div class="ai-inline-actions">
        <button class="ai-flow-btn primary" onclick="triggerAiFlowYes()">Yes, Start</button>
        <button class="ai-flow-btn secondary">search again</button>
      </div>`;

  } else if (_aiFlowState === 'planning') {
    // Plan card goes to footer; body shows the conversation only
    body.innerHTML = userBubble + `
      ${missingCard}
      <div class="ai-msg user" style="margin-bottom:8px; margin-top:4px">
        <div class="ai-bubble">Yes please</div>
      </div>
      <div class="ai-analyzing">
        <span class="material-symbols-outlined">autorenew</span>
        <span class="ai-analyzing-text">Creating plan</span>
      </div>
      <div class="ai-analyzing" style="padding-top:0; opacity:0.6">
        <span class="material-symbols-outlined" style="animation:none;color:#555">pending</span>
        <span class="ai-analyzing-text">Pending feedback</span>
      </div>`;

  } else if (_aiFlowState === 'approved') {
    body.innerHTML = userBubble + `
      ${missingCard}
      <div class="ai-msg user" style="margin-bottom:8px; margin-top:4px">
        <div class="ai-bubble">Yes please</div>
      </div>
      <div class="ai-approved-msg">
        <span class="material-symbols-outlined" style="color:#a855f7">check_circle</span>
        <span class="ai-approved-text" style="color:#a855f7">Created plan</span>
      </div>
      <div class="ai-analyzing">
        <span class="material-symbols-outlined">autorenew</span>
        <span class="ai-analyzing-text">Navigate to https://vendor-portal.amazon.com</span>
      </div>
      <div class="ai-analyzing" style="padding-top:0">
        <span class="material-symbols-outlined">autorenew</span>
        <span class="ai-analyzing-text">Checking portals for customer 2001448</span>
      </div>`;

  } else if (_aiFlowState === 'login-required') {
    body.innerHTML = userBubble + `
      ${missingCard}
      <div class="ai-msg user" style="margin-bottom:8px; margin-top:4px">
        <div class="ai-bubble">Yes please</div>
      </div>
      <div class="ai-response-msg" style="margin-top:4px">Since you are not already logged in to the portal, I will need you to log in. Use the form below — after that I will continue the task.</div>`;
    body.scrollTop = body.scrollHeight;

  } else if (_aiFlowState === 'success') {
    body.innerHTML = userBubble + `
      ${missingCard}
      <div class="ai-msg user" style="margin-bottom:8px; margin-top:4px">
        <div class="ai-bubble">Yes please</div>
      </div>
      <div class="ai-approved-msg">
        <span class="material-symbols-outlined" style="color:#059669">check_circle</span>
        <span class="ai-approved-text" style="color:#059669">Sucess!</span>
      </div>
      <div class="ai-response-msg" style="margin-top:4px">POD file successfully retrieved and downloaded to your device. Here they are - I also updated the files table already.</div>
      <div class="ai-download-card">
        <div class="ai-download-card-info">
          <div class="ai-download-card-label">POD File</div>
          <div class="ai-download-card-name">251206811 pod.pdf</div>
        </div>
        <span class="material-symbols-outlined ai-download-icon">download</span>
      </div>`;
    body.scrollTop = body.scrollHeight;

  } else if (_aiFlowState === 'completed') {
    const validCard = `
      <div class="ai-missing-card" style="border-color:#d1fae5; background:#f0fdf4">
        <div class="ai-missing-card-body">
          <div class="ai-missing-title" style="color:#065f46">POD File</div>
          <div class="ai-missing-req">251206811 pod.pdf — retrieved &amp; verified</div>
        </div>
        <span class="ai-missing-badge" style="background:#059669">Valid</span>
      </div>`;
    // Action buttons rendered inline in the chat, right after the AI answer
    body.innerHTML = userBubble + `
      <div class="ai-approved-msg">
        <span class="material-symbols-outlined" style="color:#059669">check_circle</span>
        <span class="ai-approved-text" style="color:#059669">POD document retrieved and verified successfully.</span>
      </div>
      ${validCard}
      <div class="ai-response-msg" style="margin-top:10px">All documents are now valid. The case is ready to be completed — would you like me to close it?</div>
      <div class="ai-inline-actions">
        <button class="ai-flow-btn primary" onclick="triggerAiFlowComplete()">Complete Case</button>
        <button class="ai-flow-btn secondary">Review</button>
      </div>`;
    body.scrollTop = body.scrollHeight;

  } else if (_aiFlowState === 'closing') {
    body.innerHTML = userBubble + `
      <div class="ai-approved-msg">
        <span class="material-symbols-outlined" style="color:#059669">check_circle</span>
        <span class="ai-approved-text" style="color:#059669">POD document retrieved and verified successfully.</span>
      </div>
      <div class="ai-analyzing">
        <span class="material-symbols-outlined">autorenew</span>
        <span class="ai-analyzing-text">Closing the case and marking as completed…</span>
      </div>`;
    body.scrollTop = body.scrollHeight;

  } else if (_aiFlowState === 'case-done') {
    body.innerHTML = userBubble + `
      <div class="ai-approved-msg">
        <span class="material-symbols-outlined" style="color:#059669">task_alt</span>
        <span class="ai-approved-text" style="color:#059669">Case completed successfully.</span>
      </div>
      <div class="ai-response-msg" style="margin-top:8px; color:#6b7280">Case <strong>#2001448 AMAZONFRESH</strong> has been marked as complete. All documents were validated and the exception has been resolved.</div>`;
    body.scrollTop = body.scrollHeight;
  }

  // Render footer buttons / input for this state
  _renderAiFooter();

  // Update notification badges after every flow state change
  _updateAiBadge();
}

function triggerLoginSignIn() {
  _setAiProcessing(true);
  _aiProcessingTimer = setTimeout(() => {
    _setAiProcessing(false);
    _aiFlowState = 'success';
    _renderAiFlow();
    _renderAiDrawerContext();
    // Transition to completed after brief pause
    _aiProcessingTimer = setTimeout(() => {
      _updatePodRowToValid();
      _aiFlowState = 'completed';
      _renderAiFlow();
      _renderAiDrawerContext();
    }, 1500);
  }, 1200);
}

function triggerAiFlowYes() {
  _setAiProcessing(true);
  _aiProcessingTimer = setTimeout(() => {
    _setAiProcessing(false);
    _aiFlowState = 'planning';
    _renderAiFlow();
    _renderAiDrawerContext();
  }, 900);
}

function triggerAiFlowApprove() {
  _aiFlowState = 'approved';
  _renderAiFlow();
  _renderAiDrawerContext();
  _setAiProcessing(true);
  _aiProcessingTimer = setTimeout(() => {
    _setAiProcessing(false);
    _aiFlowState = 'login-required';
    _renderAiFlow();
    _renderAiDrawerContext();
  }, 2500);
}

function _updatePodRowToValid() {
  const failedRow = document.querySelector('.doc-status-table tr.doc-row-failed');
  if (!failedRow) return;
  // Remove red highlight
  failedRow.classList.remove('doc-row-failed');
  // Update status badge
  const statusVal = failedRow.querySelector('.doc-status-val');
  if (statusVal) { statusVal.className = 'doc-status-val valid'; statusVal.textContent = 'Valid'; }
  // Remove upload button
  const btn = failedRow.querySelector('.doc-upload-btn');
  if (btn) btn.parentElement.innerHTML = '';
  // Remove left border override on first cell
  const firstTd = failedRow.querySelector('td');
  if (firstTd) { firstTd.style.borderLeft = ''; firstTd.style.paddingLeft = ''; }
}

function triggerAiFlowComplete() {
  // Step 1 — show analyzing/closing spinner
  _aiFlowState = 'closing';
  _renderAiFlow();
  _renderAiDrawerContext();

  setTimeout(() => {
    // Step 2 — capture case ref before nulling, update data
    const caseRef = _aiCurrentCase;
    if (caseRef) {
      const row = assignedData.find(r => r.id === caseRef.id) || queueData.find(r => r.id === caseRef.id);
      if (row) { row.status = 'completed'; row.stage = 'Closed'; }
    }

    // Step 3 — reset AI state
    const closedCaseId = caseRef ? String(caseRef.id).replace(/^#\s*/, '') : null;
    _aiFlowState        = 'idle';
    _aiFlowUserMsg      = '';
    _aiCurrentCase      = null;
    _aiContextDismissed = false;

    // Step 4 — refresh table data
    applyAndRender();

    // Step 5 — close the utility panel
    closeUtility();

    // Step 6 — close the case tab and return to My Work
    const caseLabel = caseRef ? (caseRef.name ? `${caseRef.id} ${caseRef.name}` : caseRef.id) : (closedCaseId || 'case');
    if (closedCaseId) {
      closeTab(null, closedCaseId);
    } else {
      const activeId = sectionActiveTab[activeSection];
      if (activeId && activeId !== 'home') closeTab(null, activeId);
    }

    // Step 6b — toast confirmation on the My Work portal
    showToast(`Case ${caseLabel} completed`);

    // Step 7 — reset AI drawer body to idle empty state
    const aiBody = document.getElementById('ai-drawer-body');
    if (aiBody) {
      aiBody.innerHTML = `
        <div class="ai-empty" id="ai-empty">
          <span class="material-symbols-outlined">auto_awesome</span>
          <div class="ai-empty-title">Hi, I'm Casey</div>
          <div class="ai-empty-sub">Your AI assistant — ask me anything about this case or workspace.</div>
        </div>`;
    }
    _renderAiDrawerContext();
    _renderAiFooter();
  }, 1800);
}

function sendAiMessage() {
  if (_aiProcessing) return; // ignore while processing
  const input = document.getElementById('ai-input');
  if (!input) return; // footer may be in action-button mode
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';

  // ── Work Feed mode: append to existing conversation without wiping ──
  if (_workFeedMode) {
    const body = document.getElementById('ai-drawer-body');
    if (!body) return;

    // Hide pills
    const pills = document.getElementById('ai-pills');
    if (pills) pills.style.display = 'none';

    // Append user bubble
    _wfAppendMsg('user', text);

    // Typing indicator
    _setAiProcessing(true);
    _aiProcessingTimer = setTimeout(() => {
      _setAiProcessing(false);
      // Build a context-aware placeholder reply
      const cid   = _workFeedCaseId;
      const cData = _activeWfCases().find(c => c.id === cid);
      const stage = cData ? cData.stage : '';
      const reply = `[Case <strong>${cid}</strong>${stage ? ' · ' + stage : ''}] This is a placeholder response — connect an AI backend to make this live.`;
      _wfAppendMsg('assistant', reply);
      _renderAiDrawerContext(); // re-show suggested prompts
    }, 1400);
    return;
  }

  // ── Normal AI drawer mode ──
  _aiMessages.push({ role: 'user', text });
  _renderAiMessages();

  // Show typing indicator while "thinking"
  _setAiProcessing(true);
  _aiProcessingTimer = setTimeout(() => {
    _setAiProcessing(false);
    _aiMessages.push({ role: 'assistant', text: 'Got it! This is a placeholder response. Connect an AI backend to make this live.' });
    _renderAiMessages();
  }, 1400);
}

// Append a single message bubble to the work-feed chat without wiping history
function _wfAppendMsg(role, html) {
  const body = document.getElementById('ai-drawer-body');
  if (!body) return;
  const el = document.createElement('div');
  el.className = 'ai-msg ' + role + ' wf-ai-content';
  el.innerHTML = `<div class="ai-bubble">${html}</div>`;
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function _renderAiMessages() {
  const body  = document.getElementById('ai-drawer-body');
  const empty = document.getElementById('ai-empty');
  const pills = document.getElementById('ai-pills');
  if (empty) empty.style.display = 'none';
  if (pills) pills.style.display = 'none';

  const now  = new Date();
  const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  body.innerHTML = _aiMessages.map(m => `
    <div class="ai-msg ${m.role}">
      <div class="ai-bubble">${m.text}</div>
      <span class="ai-msg-time">${time}</span>
    </div>`).join('');

  body.scrollTop = body.scrollHeight;
}

// ── App init ────────────────────────────────────────────────────────────────
navSidebar(document.getElementById('nav-workfeed'), 'workfeed');
